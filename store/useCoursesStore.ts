// filepath: store/useCoursesStore.ts
import { create } from "zustand";
import type { Course, Lesson } from "@/types";
import { supabase, type Database } from "@/lib/supabase";

type CoursesRow = Database["public"]["Tables"]["courses"]["Row"];
type LessonsRow = Database["public"]["Tables"]["lessons"]["Row"];

// ─────────────────────────────────────────────────────────────
// TYPE CONVERSION HELPERS
// ─────────────────────────────────────────────────────────────

function rowToCourse(row: CoursesRow): Course {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    emoji: row.emoji,
    colorKey: row.color_key,
    teacherId: row.teacher_id,
    lessonIds: [],
    totalLessons: row.total_lessons,
    estimatedMinutes: row.estimated_minutes,
    difficulty: row.difficulty,
    tags: row.tags,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToLesson(row: LessonsRow): Lesson {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    emoji: row.emoji,
    type: row.type,
    durationSeconds: row.duration_seconds,
    xpReward: row.xp_reward,
    order: row.order,
    content: row.content ?? undefined,
    videoUrl: row.video_url ?? undefined,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─────────────────────────────────────────────────────────────
// STATE INTERFACE
// ─────────────────────────────────────────────────────────────

interface CoursesState {
  courses: Course[];
  lessons: Lesson[];
  isLoading: boolean;
  error: string | null;

  hydrateCourses: () => Promise<void>;
  getCourseById: (courseId: string) => Course | undefined;
  getLessonsByCourseId: (courseId: string) => Lesson[];
  getLessonById: (lessonId: string) => Lesson | undefined;
  reset: () => void;
}

// ─────────────────────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────────────────────

export const useCoursesStore = create<CoursesState>((set, get) => ({
  courses: [],
  lessons: [],
  isLoading: false,
  error: null,

  hydrateCourses: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (coursesError) throw coursesError;

      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("*")
        .eq("is_published", true)
        .order("order", { ascending: true });

      if (lessonsError) throw lessonsError;

      const convertedCourses = (coursesData || []).map(rowToCourse);
      const convertedLessons = (lessonsData || []).map(rowToLesson);

      // Populate lessonIds for each course
      const coursesWithLessons = convertedCourses.map((course) => ({
        ...course,
        lessonIds: convertedLessons
          .filter((lesson) => lesson.courseId === course.id)
          .map((lesson) => lesson.id),
      }));

      set({
        courses: coursesWithLessons,
        lessons: convertedLessons,
        isLoading: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch courses";
      set({ error: message, isLoading: false });
    }
  },

  getCourseById: (courseId: string) => {
    return get().courses.find((c) => c.id === courseId);
  },

  getLessonsByCourseId: (courseId: string) => {
    return get().lessons.filter((l) => l.courseId === courseId);
  },

  getLessonById: (lessonId: string) => {
    return get().lessons.find((l) => l.id === lessonId);
  },

  reset: () => {
    set({
      courses: [],
      lessons: [],
      isLoading: false,
      error: null,
    });
  },
}));
