// filepath: lib/supabase.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

// ─────────────────────────────────────────────────────────────
// ENV VALIDATION
// ─────────────────────────────────────────────────────────────

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "[FocusLearn] Missing Supabase credentials.\n" +
      "Copy .env.example → .env and fill in your Supabase project URL and anon key."
  );
}

// ─────────────────────────────────────────────────────────────
// DATABASE TYPES
// These mirror Supabase table schemas for full end-to-end typing.
// Run `npx supabase gen types typescript` to auto-generate from your schema.
// ─────────────────────────────────────────────────────────────

// ── Standalone Row types (avoid circular self-references) ───────────────────

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
  last_active_date: string;
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

// ── Database schema ──────────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UsersRow;
        Insert: Omit<UsersRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<UsersRow, "id" | "created_at" | "updated_at">>;
      };
      courses: {
        Row: CoursesRow;
        Insert: Omit<CoursesRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<CoursesRow, "id" | "created_at" | "updated_at">>;
      };
      lessons: {
        Row: LessonsRow;
        Insert: Omit<LessonsRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<LessonsRow, "id" | "created_at" | "updated_at">>;
      };
      progress: {
        Row: ProgressRow;
        Insert: Omit<ProgressRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ProgressRow, "id" | "created_at" | "updated_at">>;
      };
      lesson_progress: {
        Row: LessonProgressRow;
        Insert: Omit<LessonProgressRow, "id">;
        Update: Partial<Omit<LessonProgressRow, "id">>;
      };
      xp_logs: {
        Row: XPLogsRow;
        Insert: Omit<XPLogsRow, "id">;
        Update: never;
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
