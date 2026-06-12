import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FeedbackItem {
  question: string;
  points: string;
  content: string;
  deduction: string;
  reasoning: string;
}

interface GradeResult {
  studentName: string;
  score: number;
  feedback: FeedbackItem[];
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

    const systemPrompt = `You are an expert teacher grading student exams from photos of handwritten work.
Analyze the exam page images carefully. Handwriting may be unclear — interpret it as best you can and note uncertainty in reasoning when needed.
Grade against the provided answer key and rubric. Apply partial credit fairly.

Respond ONLY with valid JSON:
{
  "studentName": "string (from paper if visible, else 'Unknown Student')",
  "score": number,
  "feedback": [
    {
      "question": "Question label and point total",
      "points": "earned / total",
      "content": "content assessment",
      "deduction": "deduction or 'None.'",
      "reasoning": "detailed explanation"
    }
  ]
}`;

    const userPrompt = `Exam: ${exam.name}
Grade Level: ${exam.grade_level}

Answer Key:
${exam.answer_key || "No answer key — grade from visible questions."}

Rubric:
${exam.rubric || "Standard partial credit and grammar deductions."}

Grade the ${storagePaths.length} attached page(s).`;

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
            temperature: 0.2,
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

    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        user_id: user.id,
        exam_id: examId,
        student_name: gradeResult.studentName || "Unknown Student",
        score: gradeResult.score,
        page_count: storagePaths.length,
        feedback: gradeResult.feedback || [],
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
