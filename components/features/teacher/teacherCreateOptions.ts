import { Colors } from "@/constants/theme";
import type {
  GenerateQuizDifficulty,
  GenerateQuizLanguage,
} from "@/types/aiQuiz";

export const EMOJI_OPTIONS = [
  "🔢",
  "🌿",
  "📖",
  "🎨",
  "🎵",
  "🔬",
  "🌍",
  "💡",
  "🏃",
  "🖥️",
  "🎭",
  "🚀",
] as const;

export const COLOR_OPTIONS = [
  {
    key: "primary",
    label: "Tím",
    value: Colors.primary.DEFAULT,
    subtle: Colors.primary.subtle,
  },
  {
    key: "success",
    label: "Xanh lá",
    value: Colors.success.DEFAULT,
    subtle: Colors.success.subtle,
  },
  {
    key: "secondary",
    label: "Cam",
    value: Colors.secondary.DEFAULT,
    subtle: Colors.secondary.subtle,
  },
  {
    key: "warning",
    label: "Vàng",
    value: Colors.warning.DEFAULT,
    subtle: Colors.warning.subtle,
  },
  {
    key: "info",
    label: "Xanh dương",
    value: Colors.info.DEFAULT,
    subtle: Colors.info.subtle,
  },
  {
    key: "error",
    label: "Đỏ",
    value: Colors.error.DEFAULT,
    subtle: Colors.error.subtle,
  },
] as const;

export const DIFFICULTY_OPTIONS = [
  { label: "😊 Dễ", value: "easy" },
  { label: "🤔 Vừa", value: "medium" },
  { label: "🔥 Khó", value: "hard" },
] as const;

export const AI_DIFFICULTY_OPTIONS: readonly {
  label: string;
  value: GenerateQuizDifficulty;
}[] = [
  { label: "Dễ", value: "easy" },
  { label: "Vừa", value: "medium" },
  { label: "Khó", value: "hard" },
  { label: "Trộn", value: "mixed" },
];

export const LANGUAGE_OPTIONS: readonly {
  label: string;
  value: GenerateQuizLanguage;
}[] = [
  { label: "Tiếng Việt", value: "vi" },
  { label: "English", value: "en" },
];

export type CourseColorOption = (typeof COLOR_OPTIONS)[number];
export type CourseDifficulty = (typeof DIFFICULTY_OPTIONS)[number]["value"];
