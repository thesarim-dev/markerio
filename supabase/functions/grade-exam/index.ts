import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  getGradingTypeInstructions,
  getGradingTypeLabel,
} from "./gradingTypes.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FeedbackItem {
  question: string;
  points: string;
  studentAnswer?: string;
  correctAnswer?: string;
  content: string;
  deduction: string;
  reasoning: string;
}

function hasPointDeduction(item: FeedbackItem): boolean {
  const match = item.points.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (match) {
    const earned = parseFloat(match[1]);
    const total = parseFloat(match[2]);
    if (earned < total) return true;
  }
  const d = item.deduction?.trim().toLowerCase();
  if (!d) return false;
  return d !== "none." && d !== "none" && d !== "0" && d !== "n/a" && d !== "-";
}

function filterDeductionFeedback(items: FeedbackItem[]): FeedbackItem[] {
  return items.filter(hasPointDeduction);
}

interface GradeResult {
  studentName: string;
  score: number;
  feedback: FeedbackItem[];
}

interface TokenUsage {
  prompt: number;
  output: number;
  total: number;
}

function parseGeminiUsage(metadata: unknown): TokenUsage | null {
  if (!metadata || typeof metadata !== "object") return null;
  const m = metadata as Record<string, number | undefined>;
  const prompt = m.promptTokenCount ?? 0;
  const output = m.candidatesTokenCount ?? 0;
  const total = m.totalTokenCount ?? prompt + output;
  if (total <= 0 && prompt <= 0 && output <= 0) return null;
  return { prompt, output, total: total > 0 ? total : prompt + output };
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function mimeFromPath(path: string): string {
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

function parseGeminiError(body: string): string {
  try {
    const json = JSON.parse(body);
    return json.error?.message || json.message || body;
  } catch {
    return body.slice(0, 500);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { examId, storagePaths } = await req.json();
    if (!examId || !Array.isArray(storagePaths) || storagePaths.length === 0) {
      return new Response(
        JSON.stringify({ error: "examId and storagePaths are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    for (const path of storagePaths) {
      if (!path.startsWith(`${user.id}/`)) {
        return new Response(JSON.stringify({ error: "Invalid storage path" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { data: exam, error: examError } = await supabase
      .from("exams")
      .select("*")
      .eq("id", examId)
      .single();

    if (examError || !exam) {
      return new Response(JSON.stringify({ error: "Exam not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!exam.answer_key?.trim()) {
      return new Response(
        JSON.stringify({
          error: "Exam has no answer key",
          detail: "Edit the exam master and add an official answer key before grading.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const imageParts: { inline_data: { mime_type: string; data: string } }[] =
      [];
    for (const path of storagePaths) {
      const { data, error } = await supabase.storage
        .from("exam-captures")
        .download(path);
      if (error || !data) {
        return new Response(
          JSON.stringify({ error: `Failed to download ${path}` }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      imageParts.push({
        inline_data: {
          mime_type: mimeFromPath(path),
          data: arrayBufferToBase64(await data.arrayBuffer()),
        },
      });
    }

    const geminiKey = Deno.env.get("GEMINI_API_KEY")?.trim();
    if (!geminiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured on server" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const model = (() => {
      const requested = Deno.env.get("GEMINI_MODEL")?.trim();
      // Pro / 1.5 models often have zero quota on free API keys
      if (
        requested &&
        !requested.includes("1.5-pro") &&
        !requested.includes("2.5-pro") &&
        !requested.includes("3.5-pro")
      ) {
        return requested;
      }
      return "gemini-2.5-flash";
    })();

    const systemPrompt = `You are an exam grader. The OFFICIAL ANSWER KEY is the sole source of truth for what is correct.
The rubric is secondary — use it ONLY for partial credit rules, grammar deductions, or formatting penalties AFTER comparing to the answer key.
Never mark an answer correct if it contradicts the answer key. Never ignore the answer key in favor of the rubric.

GRADING STEPS (follow for every question on the student's pages):
1. Identify the question number/label on the student's paper.
2. Find the matching entry in the OFFICIAL ANSWER KEY below.
3. Read the student's handwritten answer from the image (note uncertainty if illegible).
4. Compare student answer vs answer key: CORRECT, PARTIALLY CORRECT, or INCORRECT.
5. Award points based on answer key match and point values in the key.
6. Apply rubric deductions only where the rubric explicitly applies (e.g. grammar on otherwise-correct content).

If a question on the paper has no matching answer key entry, state that in reasoning and grade from visible content only.

Calculate score as: (total points earned / total points possible) × 100.

FEEDBACK OUTPUT (save teacher time):
- Include ONLY questions where the student lost points (partial or full loss).
- Omit fully correct questions entirely.
- Keep each item short and scannable — no long paragraphs.

Respond ONLY with valid JSON:
{
  "studentName": "string",
  "score": number,
  "feedback": [
    {
      "question": "Q3 (5 pts)",
      "studentAnswer": "short reading from image",
      "correctAnswer": "short expected answer from key",
      "points": "earned / total",
      "content": "One sentence: what was wrong vs the answer key (max ~15 words)",
      "deduction": "-N pts",
      "reasoning": ""
    }
  ]
}`;

    const gradingInstructions = getGradingTypeInstructions(exam.grading_type);
    const rubricFallback = gradingInstructions
      ? "Apply the official grading framework below together with any teacher rubric notes."
      : "Standard partial credit. Deduct only for clear errors vs answer key.";

    const userPrompt = `=== OFFICIAL ANSWER KEY (PRIMARY — grade against this) ===
${exam.answer_key}

${gradingInstructions ? `=== GRADING FRAMEWORK (${getGradingTypeLabel(exam.grading_type)}) ===\n${gradingInstructions}\n\n` : ""}=== GRADING RUBRIC (SECONDARY — teacher notes & partial credit) ===
${exam.rubric || rubricFallback}

=== EXAM INFO ===
Name: ${exam.name}
${exam.grade_level?.trim() ? `Grade Level: ${exam.grade_level.trim()}` : ""}
Grading Type: ${getGradingTypeLabel(exam.grading_type)}
Pages to grade: ${storagePaths.length}

Grade every question visible on the attached exam page images. Compare each student answer to the answer key above.${gradingInstructions ? " Apply the grading framework for partial credit and language deductions where relevant." : ""}`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }, ...imageParts],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
            maxOutputTokens: 8192,
          },
        }),
      },
    );

    if (!geminiResponse.ok) {
      const detail = parseGeminiError(await geminiResponse.text());
      console.error("Gemini API error:", detail);
      return new Response(
        JSON.stringify({ error: "AI grading failed", detail }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const geminiData = await geminiResponse.json();
    const candidate = geminiData.candidates?.[0];
    const content = candidate?.content?.parts?.[0]?.text ?? "";

    if (!content) {
      const reason = candidate?.finishReason ?? "unknown";
      return new Response(
        JSON.stringify({
          error: "AI returned no content",
          detail: `Finish reason: ${reason}`,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let gradeResult: GradeResult;
    try {
      gradeResult = JSON.parse(content);
    } catch {
      return new Response(
        JSON.stringify({
          error: "Failed to parse AI response",
          detail: content.slice(0, 200),
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    gradeResult.feedback = filterDeductionFeedback(gradeResult.feedback || []);
    const tokenUsage = parseGeminiUsage(geminiData.usageMetadata);

    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        user_id: user.id,
        exam_id: examId,
        student_name: gradeResult.studentName || "Unknown Student",
        score: gradeResult.score,
        page_count: storagePaths.length,
        feedback: gradeResult.feedback || [],
        token_usage: tokenUsage,
      })
      .select()
      .single();

    if (reportError || !report) {
      return new Response(
        JSON.stringify({
          error: "Failed to save report",
          detail: reportError?.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { error: deleteError } = await supabase.storage
      .from("exam-captures")
      .remove(storagePaths);
    if (deleteError) console.error("Failed to delete captures:", deleteError);

    return new Response(
      JSON.stringify({
        report: {
          id: report.id,
          examId: report.exam_id,
          studentName: report.student_name,
          score: Number(report.score),
          pageCount: report.page_count,
          feedback: report.feedback,
          tokenUsage: report.token_usage ?? tokenUsage,
          createdAt: new Date(report.created_at).getTime(),
        },
        usage: geminiData.usageMetadata ?? null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("grade-exam error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
