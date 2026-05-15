import { create } from "zustand";
import * as DocumentPicker from "expo-document-picker";
import type { DocumentPickerAsset } from "expo-document-picker";
import { generateAiQuiz } from "@/lib/aiQuizApi";
import type {
  GenerateQuizDifficulty,
  GenerateQuizLanguage,
  GenerateQuizResponse,
} from "@/types/aiQuiz";

const SUPPORTED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown",
  "text/x-markdown",
] as const;

interface AiQuizState {
  selectedAsset: DocumentPickerAsset | null;
  numQuestions: number;
  difficulty: GenerateQuizDifficulty;
  language: GenerateQuizLanguage;
  subject: string;
  isGenerating: boolean;
  error: string | null;
  result: GenerateQuizResponse | null;

  pickDocument: () => Promise<void>;
  clearDocument: () => void;
  setNumQuestions: (numQuestions: number) => void;
  setDifficulty: (difficulty: GenerateQuizDifficulty) => void;
  setLanguage: (language: GenerateQuizLanguage) => void;
  setSubject: (subject: string) => void;
  generate: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  selectedAsset: null,
  numQuestions: 10,
  difficulty: "mixed" as GenerateQuizDifficulty,
  language: "vi" as GenerateQuizLanguage,
  subject: "",
  isGenerating: false,
  error: null,
  result: null,
};

function clampQuestionCount(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(50, Math.max(1, Math.round(value)));
}

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Khong the tao quiz. Vui long thu lai.";
}

export const useAiQuizStore = create<AiQuizState>((set, get) => ({
  ...initialState,

  pickDocument: async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [...SUPPORTED_DOCUMENT_TYPES],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const [asset] = result.assets;
      if (!asset) return;

      set({
        selectedAsset: asset,
        error: null,
        result: null,
      });
    } catch (error) {
      set({ error: errorMessage(error) });
    }
  },

  clearDocument: () => {
    set({
      selectedAsset: null,
      error: null,
      result: null,
    });
  },

  setNumQuestions: (numQuestions) => {
    set({ numQuestions: clampQuestionCount(numQuestions), result: null });
  },

  setDifficulty: (difficulty) => {
    set({ difficulty, result: null });
  },

  setLanguage: (language) => {
    set({ language, result: null });
  },

  setSubject: (subject) => {
    set({ subject, result: null });
  },

  generate: async () => {
    const { selectedAsset, numQuestions, difficulty, language, subject } = get();
    if (!selectedAsset) {
      set({ error: "Hay chon tai lieu truoc khi tao quiz." });
      return;
    }

    set({ isGenerating: true, error: null });

    try {
      const result = await generateAiQuiz({
        asset: selectedAsset,
        numQuestions,
        difficulty,
        language,
        subject,
      });

      set({
        result,
        isGenerating: false,
        error: null,
      });
    } catch (error) {
      set({
        error: errorMessage(error),
        isGenerating: false,
      });
    }
  },

  reset: () => set(initialState),
}));
