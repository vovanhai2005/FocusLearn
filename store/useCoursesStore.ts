// filepath: store/useCoursesStore.ts
import { create } from "zustand";
import type { Course, Lesson, LessonType } from "@/types";
import { supabase, type Database } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";

type CoursesRow = Database["public"]["Tables"]["courses"]["Row"];
type LessonsRow = Database["public"]["Tables"]["lessons"]["Row"];
type LessonsInsert = Database["public"]["Tables"]["lessons"]["Insert"];

export interface LessonFormData {
  title: string;
  emoji: string;
  type: LessonType;
  durationSeconds: number;
  xpReward: number;
  videoUrl?: string | null;
}

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
    grade: row.grade as Course["grade"],
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
    cfVideoId: row.cf_video_id ?? undefined,
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
  hasHydrated: boolean;
  error: string | null;

  hydrateCourses: () => Promise<void>;
  getCourseById: (courseId: string) => Course | undefined;
  getLessonsByCourseId: (courseId: string) => Lesson[];
  getLessonById: (lessonId: string) => Lesson | undefined;
  reset: () => void;

  // Teacher lesson CRUD — fetch all (including unpublished) for a course
  fetchTeacherLessons: (courseId: string) => Promise<Lesson[]>;
  addLesson: (courseId: string, data: LessonFormData, currentCount: number) => Promise<Lesson | null>;
  updateLesson: (lessonId: string, data: Partial<LessonFormData>) => Promise<boolean>;
  deleteLesson: (lessonId: string) => Promise<boolean>;
}

// ─────────────────────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────────────────────

export const useCoursesStore = create<CoursesState>((set, get) => ({
  courses: [],
  lessons: [],
  isLoading: false,
  hasHydrated: false,
  error: null,

  hydrateCourses: async () => {
    set({ isLoading: true, hasHydrated: false, error: null });

    try {
      const user = useAuthStore.getState().user;

      let coursesQuery = supabase
        .from("courses")
        .select("*")
        .eq("is_published", true);

      if (user?.role === "student") {
        if (!user.grade) {
          set({
            courses: [],
            lessons: [],
            isLoading: false,
            hasHydrated: true,
          });
          return;
        }

        coursesQuery = coursesQuery.eq("grade", user.grade);
      } else if (user?.role === "teacher") {
        coursesQuery = coursesQuery.eq("teacher_id", user.id);
      }

      const { data: coursesData, error: coursesError } = await coursesQuery
        .order("created_at", { ascending: false });

      if (coursesError) throw coursesError;

      const convertedCourses = (coursesData || []).map(rowToCourse);
      const courseIds = convertedCourses.map((course) => course.id);

      let convertedLessons: Lesson[] = [];
      if (courseIds.length > 0) {
        const { data: lessonsData, error: lessonsError } = await supabase
          .from("lessons")
          .select("*")
          .eq("is_published", true)
          .in("course_id", courseIds)
          .order("order", { ascending: true });

        if (lessonsError) throw lessonsError;

        convertedLessons = (lessonsData || []).map(rowToLesson);
      }

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
        hasHydrated: true,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch courses";
      set({ error: message, isLoading: false, hasHydrated: true });
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
      hasHydrated: false,
      error: null,
    });
  },

  fetchTeacherLessons: async (courseId: string) => {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("order", { ascending: true });

    if (error || !data) return [];
    return (data as LessonsRow[]).map(rowToLesson);
  },

  addLesson: async (courseId: string, formData: LessonFormData, currentCount: number) => {
    const payload: LessonsInsert = {
      course_id: courseId,
      title: formData.title.trim(),
      emoji: formData.emoji.trim() || "📖",
      type: formData.type,
      duration_seconds: formData.durationSeconds,
      xp_reward: formData.xpReward,
      order: currentCount + 1,
      content: null,
      video_url: formData.videoUrl ?? null,
      cf_video_id: null,
      is_published: true,
    };

    const { data, error } = await supabase
      .from("lessons")
      .insert(payload)
      .select()
      .single();

    if (error || !data) {
      console.error("[CoursesStore] addLesson failed:", error?.message);
      return null;
    }

    const newLesson = rowToLesson(data as LessonsRow);
    set((s) => ({ lessons: [...s.lessons, newLesson] }));
    return newLesson;
  },

  updateLesson: async (lessonId: string, formData: Partial<LessonFormData>) => {
    type LessonsUpdate = Database["public"]["Tables"]["lessons"]["Update"];
    const payload: LessonsUpdate = {
      ...(formData.title !== undefined && { title: formData.title.trim() }),
      ...(formData.emoji !== undefined && { emoji: formData.emoji.trim() || "📖" }),
      ...(formData.type !== undefined && { type: formData.type }),
      ...(formData.durationSeconds !== undefined && { duration_seconds: formData.durationSeconds }),
      ...(formData.xpReward !== undefined && { xp_reward: formData.xpReward }),
      ...("videoUrl" in formData && { video_url: formData.videoUrl ?? null }),
    };

    const { error } = await supabase
      .from("lessons")
      .update(payload)
      .eq("id", lessonId);

    if (error) {
      console.error("[CoursesStore] updateLesson failed:", error.message);
      return false;
    }

    set((s) => ({
      lessons: s.lessons.map((l) =>
        l.id === lessonId
          ? {
              ...l,
              ...(formData.title !== undefined && { title: formData.title.trim() }),
              ...(formData.emoji !== undefined && { emoji: formData.emoji.trim() || "📖" }),
              ...(formData.type !== undefined && { type: formData.type }),
              ...(formData.durationSeconds !== undefined && { durationSeconds: formData.durationSeconds }),
              ...(formData.xpReward !== undefined && { xpReward: formData.xpReward }),
              ...("videoUrl" in formData && { videoUrl: formData.videoUrl ?? undefined }),
            }
          : l
      ),
    }));
    return true;
  },

  deleteLesson: async (lessonId: string) => {
    const { error } = await supabase
      .from("lessons")
      .delete()
      .eq("id", lessonId);

    if (error) {
      console.error("[CoursesStore] deleteLesson failed:", error.message);
      return false;
    }

    set((s) => ({ lessons: s.lessons.filter((l) => l.id !== lessonId) }));
    return true;
  },
}));
