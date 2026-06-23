export type GradingType =
  | "standard"
  | "moe_english_reading"
  | "moe_english_writing"
  | "moe_english_vocabulary"
  | "moe_english_mixed";

const MOE_ENGLISH_BASE = `ISRAEL MINISTRY OF EDUCATION — ENGLISH INSPECTORATE (BAGRUT) CONTEXT:
- Exams follow the English Inspectorate Bagrut framework (Modules A–G, 3–5 units).
- Official criteria emphasize: understanding, evidence from text, clear organization, appropriate register, and language accuracy.
- When content is correct but language has errors, partial credit and grammar deductions are normal — especially on writing tasks.
- Do not invent point values; use the answer key for max points per question.`;

const READING_RULES = `${MOE_ENGLISH_BASE}

READING / SHORT-ANSWER GRADING (Modules C–G style):
- Factual questions: accept paraphrases that preserve the exact meaning of the model answer.
- Inference / "why" / "how do you know": student must show logical support; partial credit if idea is right but unsupported.
- Vocabulary-in-context: accept synonyms only if meaning matches the key; reject wrong sense of a word.
- Open-ended but key-based items: reward complete, relevant answers; deduct for irrelevant or contradictory content.
- Spelling/grammar on short answers: minor deduction only if meaning stays clear; heavier deduction if errors obscure meaning.`;

const WRITING_RULES = `${MOE_ENGLISH_BASE}

WRITING / COMPOSITION GRADING (Bagrut writing tasks):
Apply these dimensions when the question is an essay, letter, opinion, or extended response:
- W1 Content: relevance, depth, task completion (e.g. 120–140 words if stated).
- W2 Structure: paragraphing, introduction/body/conclusion, logical flow.
- W3 Vocabulary & sentence variety: range and precision; reward varied structures when appropriate.
- W4 Register & tone: formal/informal fit for audience and purpose.
- W5 Language accuracy: grammar, spelling, punctuation — deduct progressively; content-correct answers may still lose points for persistent errors (common Bagrut practice).
- Compare to the model/sample in the answer key for content expectations, but use W1–W5 for partial credit when the student is partially on track.`;

const VOCABULARY_RULES = `${MOE_ENGLISH_BASE}

VOCABULARY GRADING (Module E style):
- Require precise meaning: definitions, synonyms, antonyms, or sentence completion must match the key sense.
- Reject vague or wrong-word-family answers unless the key allows them.
- Partial credit only when the response shows partial understanding (e.g. related but imprecise synonym).`;

const MIXED_RULES = `${MOE_ENGLISH_BASE}

MIXED BAGRUT PAPER:
- Identify each question type from labels and format on the student's pages.
- Short factual / comprehension items → use reading/short-answer rules.
- Extended writing (essay, composition, letter) → use W1–W5 writing rules.
- Vocabulary sections → use Module E vocabulary rules.
- If type is unclear, default to answer-key comparison with standard partial credit.`;

export function getGradingTypeInstructions(
  gradingType: string | null | undefined,
): string {
  switch (gradingType) {
    case "moe_english_reading":
      return READING_RULES;
    case "moe_english_writing":
      return WRITING_RULES;
    case "moe_english_vocabulary":
      return VOCABULARY_RULES;
    case "moe_english_mixed":
      return MIXED_RULES;
    default:
      return "";
  }
}

export function getGradingTypeLabel(gradingType: string | null | undefined): string {
  switch (gradingType) {
    case "moe_english_reading":
      return "MoE English — Reading & short answers";
    case "moe_english_writing":
      return "MoE English — Writing / composition";
    case "moe_english_vocabulary":
      return "MoE English — Vocabulary (Module E)";
    case "moe_english_mixed":
      return "MoE English — Full Bagrut paper";
    default:
      return "Standard";
  }
}
