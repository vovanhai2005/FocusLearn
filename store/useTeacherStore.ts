// filepath: store/useTeacherStore.ts
import { create } from "zustand";
import type { User } from "@/types";
import { supabase, type Database } from "@/lib/supabase";

type UsersRow = Database["public"]["Tables"]["users"]["Row"];
type ProgressRow = Database["public"]["Tables"]["progress"]["Row"];
type LessonProgressRow = Database["public"]["Tables"]["lesson_progress"]["Row"];
type CoursesRow = Database["public"]["Tables"]["courses"]["Row"];
type LessonsRow = Database["public"]["Tables"]["lessons"]["Row"];

// ─────────────────────────────────────────────────────────────
// TYPE HELPERS
// ─────────────────────────────────────────────────────────────

interface StudentWithStats {
  user: User;
  xp: number;
  streak: number;
  completionRate: number;
  lastActiveDate: string;
}

interface TeacherStats {
  totalStudents: number;
  activeToday: number;
  avgCompletionRate: number;
  coursesPublished: number;
  allStudents: StudentWithStats[];
  topStudents: StudentWithStats[];
  studentsNeedingAttention: StudentWithStats[];
}

function rowToUser(row: UsersRow): User {
  return {
    id: row.id,
    name: row.name,
    role: row.role as "student" | "teacher" | "parent",
    avatarEmoji: row.avatar_emoji,
    accessCode: row.access_code,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─────────────────────────────────────────────────────────────
// STATE INTERFACE
// ─────────────────────────────────────────────────────────────

interface TeacherState {
  stats: TeacherStats;
  isLoading: boolean;
  error: string | null;

  hydrateTeacherData: (teacherId: string) => Promise<void>;
  reset: () => void;
}

// ─────────────────────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────────────────────

const initialStats: TeacherStats = {
  totalStudents: 0,
  activeToday: 0,
  avgCompletionRate: 0,
  coursesPublished: 0,
  allStudents: [],
  topStudents: [],
  studentsNeedingAttention: [],
};

export const useTeacherStore = create<TeacherState>((set) => ({
  stats: initialStats,
  isLoading: false,
  error: null,

  hydrateTeacherData: async (teacherId: string) => {
    if (!teacherId) {
      console.warn("[TeacherStore] Teacher ID is missing");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // 1. Fetch all students assigned to this teacher
      const { data: studentsData, error: studentsError } = await supabase
        .from("users")
        .select("*")
        .eq("teacher_id", teacherId)
        .eq("role", "student");

      if (studentsError) throw studentsError;

      const students = (studentsData || []).map(rowToUser);
      const studentIds = students.map((s) => s.id);

      // 2. Fetch all courses created by this teacher
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .eq("teacher_id", teacherId);

      if (coursesError) throw coursesError;

      const courses = (coursesData || []) as CoursesRow[];
      const courseIds = courses.map((c) => c.id);

      // If no students, return early with 0 stats
      if (studentIds.length === 0) {
        set({
          stats: {
            ...initialStats,
            totalStudents: 0,
            coursesPublished: courses.length,
          },
          isLoading: false,
        });
        return;
      }

      // 3. Fetch progress for all students
      const { data: progressData, error: progressError } = await supabase
        .from("progress")
        .select("*")
        .in("user_id", studentIds);

      if (progressError) throw progressError;

      const progressMap = new Map<string, ProgressRow>();
      (progressData || []).forEach((p) => progressMap.set(p.user_id, p));

      // 4. Fetch lesson completions for all students
      const { data: lessonProgressData, error: lessonProgressError } =
        await supabase
          .from("lesson_progress")
          .select("*")
          .in("user_id", studentIds)
          .eq("is_completed", true);

      if (lessonProgressError) throw lessonProgressError;

      const lessonProgressMap = new Map<string, LessonProgressRow[]>();
      (lessonProgressData || []).forEach((lp) => {
        const key = lp.user_id;
        if (!lessonProgressMap.has(key)) {
          lessonProgressMap.set(key, []);
        }
        lessonProgressMap.get(key)!.push(lp);
      });

      // 5. Fetch all lessons for teacher's courses
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("*")
        .in("course_id", courseIds.length > 0 ? courseIds : ["invalid"]);

      if (lessonsError) throw lessonsError;

      const lessons = (lessonsData || []) as LessonsRow[];
      const totalLessons = lessons.length;

      // 6. Calculate stats
      const today = new Date().toISOString().split("T")[0];
      let activeCount = 0;
      let completionSum = 0;

      const studentsWithStats: StudentWithStats[] = students
        .map((student) => {
          const progress = progressMap.get(student.id);
          const isActive = progress?.last_active_date === today ? 1 : 0;
          activeCount += isActive;

          const completedLessons =
            lessonProgressMap.get(student.id)?.length || 0;
          const completionRate =
            totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
          completionSum += completionRate;

          return {
            user: student,
            xp: progress?.xp || 0,
            streak: progress?.streak || 0,
            completionRate,
            lastActiveDate: progress?.last_active_date || "",
          };
        })
        .sort((a, b) => b.xp - a.xp); // Sort by XP descending

      const avgCompletionRate =
        students.length > 0 ? completionSum / students.length : 0;

      // Top 3 students (already sorted by XP)
      const topStudents = studentsWithStats.slice(0, 3);

      // Students needing attention: streak = 0 AND xp_today = 0
      const studentsNeedingAttention = studentsWithStats.filter((s) => {
        const progress = progressMap.get(s.user.id);
        return progress && progress.streak === 0;
      });

      set({
        stats: {
          totalStudents: students.length,
          activeToday: activeCount,
          avgCompletionRate: Math.round(avgCompletionRate),
          coursesPublished: courses.length,
          allStudents: studentsWithStats,
          topStudents,
          studentsNeedingAttention,
        },
        isLoading: false,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch teacher data";
      console.error("[TeacherStore]", message);
      set({ error: message, isLoading: false });
    }
  },

  reset: () => {
    set({
      stats: initialStats,
      isLoading: false,
      error: null,
    });
  },
}));
