// filepath: lib/supabase.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

// ─────────────────────────────────────────────────────────────
// ENV VALIDATION
// ─────────────────────────────────────────────────────────────

const rawSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const rawSupabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  rawSupabaseUrl &&
    rawSupabaseAnonKey &&
    !rawSupabaseUrl.includes("your-project") &&
    rawSupabaseAnonKey !== "your-anon-key"
);

const supabaseUrl = isSupabaseConfigured
  ? rawSupabaseUrl!
  : "https://placeholder.supabase.co";
const supabaseAnonKey = isSupabaseConfigured
  ? rawSupabaseAnonKey!
  : "placeholder-anon-key";

// ─────────────────────────────────────────────────────────────
// DATABASE TYPES
// These mirror Supabase table schemas for full end-to-end typing.
// Run `npx supabase gen types typescript` to auto-generate from your schema.
// ─────────────────────────────────────────────────────────────

// ── Standalone Row types (avoid circular self-references) ───────────────────

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type UsersRow = {
  id: string;
  name: string;
  role: "student" | "teacher" | "parent";
  avatar_emoji: string;
  access_code: string;
  grade: number | null;
  teacher_id: string | null;
  school: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

type CoursesRow = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color_key: string;
  teacher_id: string;
  grade: number;             // Lớp học (1–12)
  total_lessons: number;
  estimated_minutes: number;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type LessonsRow = {
  id: string;
  course_id: string;
  title: string;
  emoji: string;
  type: "video" | "quiz" | "reading" | "interactive";
  duration_seconds: number;
  xp_reward: number;
  order: number;
  content: string | null;
  video_url: string | null;
  cf_video_id: string | null;   // Cloudflare Stream video UID
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type ProgressRow = {
  id: string;
  user_id: string;
  xp: number;
  xp_today: number;
  xp_daily_goal: number;
  level: number;
  streak: number;
  longest_streak: number;
  last_active_date: string | null;  // nullable — empty on first sync before any activity
  created_at: string;
  updated_at: string;
};

type LessonProgressRow = {
  id: string;
  user_id: string;
  lesson_id: string;
  is_completed: boolean;
  completed_at: string | null;
  score: number | null;
  attempts: number;
};

type XPLogsRow = {
  id: string;
  user_id: string;
  amount: number;
  source: "lesson" | "quiz" | "streak" | "bonus";
  source_id: string | null;
  earned_at: string;
};

type SourceDocumentsRow = {
  id: string;
  teacher_id: string;
  file_name: string;
  mime_type: string | null;
  file_size_bytes: number | null;
  storage_path: string | null;
  public_url: string | null;
  created_at: string;
};

type AiQuizzesRow = {
  id: string;
  lesson_id: string;
  course_id: string;
  teacher_id: string;
  source_document_id: string | null;
  title: string;
  summary: string;
  generated_from: string;
  subject: string | null;
  language: "vi" | "en";
  requested_difficulty: "easy" | "medium" | "hard" | "mixed";
  requested_question_count: number;
  validation_warnings: string[];
  raw_payload: Json;
  created_at: string;
  updated_at: string;
};

type AiQuizQuestionsRow = {
  id: string;
  quiz_id: string;
  order_index: number;
  question_text: string;
  correct_choice_id: "A" | "B" | "C" | "D";
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  source_reference: string | null;
  learning_objective: string | null;
  created_at: string;
};

type AiQuizChoicesRow = {
  id: string;
  question_id: string;
  choice_id: "A" | "B" | "C" | "D";
  order_index: number;
  choice_text: string;
  is_correct: boolean;
  created_at: string;
};

type AiQuizAttemptsRow = {
  id: string;
  quiz_id: string;
  lesson_id: string;
  user_id: string;
  total_questions: number;
  correct_count: number;
  score: number;
  started_at: string;
  completed_at: string | null;
};

type AiQuizAnswersRow = {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_choice_id: "A" | "B" | "C" | "D";
  is_correct: boolean;
  answered_at: string;
};

// ── Database schema ──────────────────────────────────────────────────────────

type ClassesRow = {
  id: string;
  name: string;
  grade: number | null;
  teacher_id: string;
  school: string | null;
  academic_year: string;
  access_code: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

type ClassStudentsRow = {
  id: string;
  class_id: string;
  student_id: string;
  joined_at: string;
  status: "active" | "inactive" | "transferred";
};

type CourseEnrollmentsRow = {
  id: string;
  course_id: string;
  student_id: string;
  class_id: string | null;
  assigned_by: string | null;
  status: "active" | "completed" | "paused";
  assigned_at: string;
  completed_at: string | null;
  target_due_date: string | null;
  progress_percent: number;
  last_activity_at: string | null;
};

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UsersRow;
        Insert: Omit<UsersRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<UsersRow, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      courses: {
        Row: CoursesRow;
        Insert: Omit<CoursesRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<CoursesRow, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      lessons: {
        Row: LessonsRow;
        Insert: Omit<LessonsRow, "id" | "created_at" | "updated_at" | "cf_video_id"> & {
          cf_video_id?: string | null;
        };
        Update: Partial<Omit<LessonsRow, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      progress: {
        Row: ProgressRow;
        Insert: Omit<ProgressRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ProgressRow, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      lesson_progress: {
        Row: LessonProgressRow;
        Insert: Omit<LessonProgressRow, "id">;
        Update: Partial<Omit<LessonProgressRow, "id">>;
        Relationships: [];
      };
      xp_logs: {
        Row: XPLogsRow;
        Insert: Omit<XPLogsRow, "id">;
        Update: never;
        Relationships: [];
      };
      source_documents: {
        Row: SourceDocumentsRow;
        Insert: Omit<SourceDocumentsRow, "id" | "created_at">;
        Update: Partial<Omit<SourceDocumentsRow, "id" | "created_at">>;
        Relationships: [];
      };
      ai_quizzes: {
        Row: AiQuizzesRow;
        Insert: Omit<AiQuizzesRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<AiQuizzesRow, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      ai_quiz_questions: {
        Row: AiQuizQuestionsRow;
        Insert: Omit<AiQuizQuestionsRow, "id" | "created_at">;
        Update: Partial<Omit<AiQuizQuestionsRow, "id" | "created_at">>;
        Relationships: [];
      };
      ai_quiz_choices: {
        Row: AiQuizChoicesRow;
        Insert: Omit<AiQuizChoicesRow, "id" | "created_at">;
        Update: Partial<Omit<AiQuizChoicesRow, "id" | "created_at">>;
        Relationships: [];
      };
      ai_quiz_attempts: {
        Row: AiQuizAttemptsRow;
        Insert: Omit<AiQuizAttemptsRow, "id">;
        Update: Partial<Omit<AiQuizAttemptsRow, "id">>;
        Relationships: [];
      };
      ai_quiz_answers: {
        Row: AiQuizAnswersRow;
        Insert: Omit<AiQuizAnswersRow, "id">;
        Update: Partial<Omit<AiQuizAnswersRow, "id">>;
        Relationships: [];
      };
      classes: {
        Row: ClassesRow;
        Insert: Omit<ClassesRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ClassesRow, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      class_students: {
        Row: ClassStudentsRow;
        Insert: Omit<ClassStudentsRow, "id">;
        Update: Partial<Omit<ClassStudentsRow, "id">>;
        Relationships: [];
      };
      course_enrollments: {
        Row: CourseEnrollmentsRow;
        Insert: Omit<CourseEnrollmentsRow, "id">;
        Update: Partial<Omit<CourseEnrollmentsRow, "id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "student" | "teacher" | "parent";
      lesson_type: "video" | "quiz" | "reading" | "interactive";
      difficulty_level: "easy" | "medium" | "hard";
    };
  };
}

// ─────────────────────────────────────────────────────────────
// CLIENT
// ─────────────────────────────────────────────────────────────

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      // Persist session across app restarts using AsyncStorage
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        "x-app-name": "FocusLearn",
      },
    },
  }
);

// ─────────────────────────────────────────────────────────────
// HELPER: typed table accessor
// Usage: db("users").select("*")
// ─────────────────────────────────────────────────────────────

export function db<T extends keyof Database["public"]["Tables"]>(table: T) {
  return supabase.from(table);
}

export default supabase;
