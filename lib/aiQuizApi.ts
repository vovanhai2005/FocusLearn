import type { DocumentPickerAsset } from "expo-document-picker";
import type {
  GenerateQuizDifficulty,
  GenerateQuizLanguage,
  GenerateQuizResponse,
} from "@/types/aiQuiz";
import { isGenerateQuizResponse } from "@/types/aiQuiz";

const DEFAULT_BASE_URL = "https://vankhoa2110-ai-quiz-agent.hf.space";
const AI_QUIZ_API_BASE_URL = (
  process.env.EXPO_PUBLIC_AI_QUIZ_API_BASE_URL || DEFAULT_BASE_URL
).replace(/\/$/, "");

const HEALTH_TIMEOUT_MS = 15_000;
const GENERATE_TIMEOUT_MS = 180_000;

type AiQuizErrorKind =
  | "bad_request"
  | "payload_too_large"
  | "validation"
  | "server"
  | "timeout"
  | "network"
  | "invalid_response";

export class AiQuizApiError extends Error {
  readonly kind: AiQuizErrorKind;
  readonly status?: number;

  constructor(message: string, kind: AiQuizErrorKind, status?: number) {
    super(message);
    this.name = "AiQuizApiError";
    this.kind = kind;
    this.status = status;
  }
}

export interface GenerateAiQuizParams {
  asset: DocumentPickerAsset;
  numQuestions: number;
  difficulty: GenerateQuizDifficulty;
  language: GenerateQuizLanguage;
  subject?: string;
}

export interface AiQuizHealthResult {
  ok: boolean;
  status: number;
  data: unknown;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractServerMessage(data: unknown, fallback: string): string {
  if (typeof data === "string") return data || fallback;
  if (!isRecord(data)) return fallback;

  const detail = data.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (isRecord(item) && typeof item.msg === "string") return item.msg;
        return null;
      })
      .filter((item): item is string => Boolean(item));
    if (messages.length > 0) return messages.join("\n");
  }

  const message = data.message;
  if (typeof message === "string") return message;

  const error = data.error;
  if (typeof error === "string") return error;

  return fallback;
}

async function readJsonOrText(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const requestInit: RequestInit = {
      ...init,
      signal: controller.signal as unknown as RequestInit["signal"],
    };
    return await fetch(url, requestInit);
  } finally {
    clearTimeout(timeoutId);
  }
}

function toHttpError(status: number, body: unknown): AiQuizApiError {
  if (status === 400) {
    return new AiQuizApiError(
      extractServerMessage(
        body,
        "Tai lieu khong hop le hoac dinh dang file chua duoc ho tro."
      ),
      "bad_request",
      status
    );
  }

  if (status === 413) {
    return new AiQuizApiError(
      extractServerMessage(body, "File qua lon. Hay thu tai lieu ngan hon."),
      "payload_too_large",
      status
    );
  }

  if (status === 422) {
    return new AiQuizApiError(
      extractServerMessage(
        body,
        "Thong tin tao quiz chua hop le. Hay kiem tra so cau hoi va tuy chon."
      ),
      "validation",
      status
    );
  }

  if (status === 500 || status === 502) {
    return new AiQuizApiError(
      extractServerMessage(
        body,
        "May chu AI dang loi hoac qua tai. Hay thu lai sau."
      ),
      "server",
      status
    );
  }

  return new AiQuizApiError(
    extractServerMessage(body, `Khong the tao quiz. Ma loi ${status}.`),
    status >= 500 ? "server" : "bad_request",
    status
  );
}

function assertGenerateParams(params: GenerateAiQuizParams): void {
  if (!params.asset.uri) {
    throw new AiQuizApiError("Chua chon tai lieu de tao quiz.", "validation");
  }

  if (!Number.isInteger(params.numQuestions) || params.numQuestions < 1) {
    throw new AiQuizApiError("So cau hoi phai tu 1 den 50.", "validation");
  }

  if (params.numQuestions > 50) {
    throw new AiQuizApiError("So cau hoi toi da la 50.", "validation");
  }
}

export async function checkAiQuizHealth(): Promise<AiQuizHealthResult> {
  try {
    const response = await fetchWithTimeout(
      `${AI_QUIZ_API_BASE_URL}/api/health`,
      { method: "GET" },
      HEALTH_TIMEOUT_MS
    );
    const data = await readJsonOrText(response);

    if (!response.ok) {
      throw toHttpError(response.status, data);
    }

    return {
      ok: true,
      status: response.status,
      data,
    };
  } catch (error) {
    if (error instanceof AiQuizApiError) throw error;
    if (isAbortError(error)) {
      throw new AiQuizApiError(
        "Ket noi toi AI Quiz Agent qua thoi gian cho.",
        "timeout"
      );
    }
    throw new AiQuizApiError(
      "Khong ket noi duoc AI Quiz Agent. Hay kiem tra mang va thu lai.",
      "network"
    );
  }
}

export async function generateAiQuiz(
  params: GenerateAiQuizParams
): Promise<GenerateQuizResponse> {
  assertGenerateParams(params);

  const formData = new FormData();
  formData.append("file", {
    uri: params.asset.uri,
    name: params.asset.name,
    type: params.asset.mimeType ?? "application/octet-stream",
  } as unknown as Blob);
  formData.append("num_questions", String(params.numQuestions));
  formData.append("difficulty", params.difficulty);
  formData.append("language", params.language);

  const subject = params.subject?.trim();
  if (subject) {
    formData.append("subject", subject);
  }

  try {
    const response = await fetchWithTimeout(
      `${AI_QUIZ_API_BASE_URL}/api/generate-quiz`,
      {
        method: "POST",
        body: formData as unknown as RequestInit["body"],
      },
      GENERATE_TIMEOUT_MS
    );
    const data = await readJsonOrText(response);

    if (!response.ok) {
      throw toHttpError(response.status, data);
    }

    if (!isGenerateQuizResponse(data)) {
      throw new AiQuizApiError(
        "AI Quiz Agent tra ve du lieu khong dung dinh dang.",
        "invalid_response",
        response.status
      );
    }

    return data;
  } catch (error) {
    if (error instanceof AiQuizApiError) throw error;
    if (isAbortError(error)) {
      throw new AiQuizApiError(
        "Tao quiz mat qua nhieu thoi gian. Hay thu file ngan hon hoac thu lai.",
        "timeout"
      );
    }
    throw new AiQuizApiError(
      "Khong gui duoc tai lieu toi AI Quiz Agent. Hay kiem tra mang va thu lai.",
      "network"
    );
  }
}
