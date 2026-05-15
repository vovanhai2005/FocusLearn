export type GenerateQuizDifficulty = "easy" | "medium" | "hard" | "mixed";

export type GenerateQuizLanguage = "vi" | "en";

export type AiQuizChoiceId = "A" | "B" | "C" | "D";

export interface AiQuizChoice {
  id: AiQuizChoiceId;
  text: string;
}

export interface AiQuizQuestion {
  question: string;
  choices: AiQuizChoice[];
  correct_answer: AiQuizChoiceId;
  explanation: string;
  difficulty: Exclude<GenerateQuizDifficulty, "mixed">;
  source_reference: string | null;
  learning_objective: string | null;
}

export interface AiQuiz {
  title: string;
  summary: string;
  generated_from: string;
  questions: AiQuizQuestion[];
}

export interface GenerateQuizResponse {
  quiz: AiQuiz;
  validation_warnings: string[];
}

const choiceIds: readonly AiQuizChoiceId[] = ["A", "B", "C", "D"];
const questionDifficulties: readonly AiQuizQuestion["difficulty"][] = [
  "easy",
  "medium",
  "hard",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isChoiceId(value: unknown): value is AiQuizChoiceId {
  return typeof value === "string" && choiceIds.includes(value as AiQuizChoiceId);
}

function isQuestionDifficulty(
  value: unknown
): value is AiQuizQuestion["difficulty"] {
  return (
    typeof value === "string" &&
    questionDifficulties.includes(value as AiQuizQuestion["difficulty"])
  );
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isAiQuizChoice(value: unknown): value is AiQuizChoice {
  if (!isRecord(value)) return false;
  return isChoiceId(value.id) && typeof value.text === "string";
}

function isAiQuizQuestion(value: unknown): value is AiQuizQuestion {
  if (!isRecord(value)) return false;
  return (
    typeof value.question === "string" &&
    Array.isArray(value.choices) &&
    value.choices.length === 4 &&
    value.choices.every(isAiQuizChoice) &&
    isChoiceId(value.correct_answer) &&
    typeof value.explanation === "string" &&
    isQuestionDifficulty(value.difficulty) &&
    isNullableString(value.source_reference) &&
    isNullableString(value.learning_objective)
  );
}

export function isAiQuiz(value: unknown): value is AiQuiz {
  if (!isRecord(value)) return false;
  return (
    typeof value.title === "string" &&
    typeof value.summary === "string" &&
    typeof value.generated_from === "string" &&
    Array.isArray(value.questions) &&
    value.questions.length > 0 &&
    value.questions.every(isAiQuizQuestion)
  );
}

export function isGenerateQuizResponse(
  value: unknown
): value is GenerateQuizResponse {
  if (!isRecord(value)) return false;
  return isAiQuiz(value.quiz) && isStringArray(value.validation_warnings);
}
