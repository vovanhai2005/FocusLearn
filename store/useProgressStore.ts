// filepath: store/useProgressStore.ts
import { create } from "zustand";
import type { Badge, CourseProgress, XPLog } from "@/types";
import { XPConfig, BadgeDefinitions } from "@/constants/theme";
import { supabase, type Database } from "@/lib/supabase";

type ProgressRow = Database["public"]["Tables"]["progress"]["Row"];
type ProgressInsert = Database["public"]["Tables"]["progress"]["Insert"];
type ProgressQueryBuilder = {
  upsert(
    values: ProgressInsert,
    options: { onConflict: string }
  ): Promise<{ error: { message: string } | null }>;
};

// ─────────────────────────────────────────────────────────────
// STATE INTERFACE
// ─────────────────────────────────────────────────────────────

interface ProgressState {
  // ── State ──────────────────────────────────────────────────
  xp: number;
  xpToday: number;
  xpDailyGoal: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string;         // YYYY-MM-DD
  completedLessonIds: string[];
  courseProgress: CourseProgress[];
  badges: Badge[];
  xpLogs: XPLog[];
  isLoading: boolean;

  // ── Computed (derived, not stored) ─────────────────────────
  // Use selectors below instead of storing these

  // ── Actions ────────────────────────────────────────────────
  addXP: (amount: number, source: XPLog["source"], sourceId?: string) => void;
  incrementStreak: () => void;
  resetStreakIfNeeded: () => void;
  markLessonComplete: (lessonId: string, xpReward: number) => void;
  updateCourseProgress: (courseId: string, totalLessons: number) => void;
  unlockBadge: (badgeId: string) => void;
  hydrateProgress: (userId: string) => Promise<void>;
  syncProgressToSupabase: (userId: string) => Promise<void>;
  reset: () => void;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function todayString(): string {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
}

function calcLevel(xp: number): number {
  return Math.floor(xp / XPConfig.levelThreshold) + 1;
}

/** Initialise all badges as locked */
function initBadges(): Badge[] {
  return BadgeDefinitions.map((def) => ({
    ...def,
    isUnlocked: false,
    unlockedAt: undefined,
  }));
}

// ─────────────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────────────

const initialState: Omit<
  ProgressState,
  | "addXP"
  | "incrementStreak"
  | "resetStreakIfNeeded"
  | "markLessonComplete"
  | "updateCourseProgress"
  | "unlockBadge"
  | "hydrateProgress"
  | "syncProgressToSupabase"
  | "reset"
> = {
  xp: 0,
  xpToday: 0,
  xpDailyGoal: XPConfig.dailyGoal,
  level: 1,
  streak: 0,
  longestStreak: 0,
  lastActiveDate: "",
  completedLessonIds: [],
  courseProgress: [],
  badges: initBadges(),
  xpLogs: [],
  isLoading: false,
};

// ─────────────────────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────────────────────

export const useProgressStore = create<ProgressState>((set, get) => ({
  ...initialState,

  // ─────────────────────────────────────────────────────────
  // addXP
  // ─────────────────────────────────────────────────────────
  addXP: (amount: number, source: XPLog["source"], sourceId?: string) => {
    const state = get();
    const newXP = state.xp + amount;
    const newXPToday = state.xpToday + amount;
    const newLevel = calcLevel(newXP);

    const log: XPLog = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      userId: "",              // filled when syncing to Supabase
      amount,
      source,
      sourceId,
      earnedAt: new Date().toISOString(),
    };

    set({
      xp: newXP,
      xpToday: newXPToday,
      level: newLevel,
      xpLogs: [log, ...state.xpLogs].slice(0, 50), // keep last 50 logs
    });

    // Check XP-based badges
    if (newXP >= 100) get().unlockBadge("xp_100");
  },

  // ─────────────────────────────────────────────────────────
  // incrementStreak
  // ─────────────────────────────────────────────────────────
  incrementStreak: () => {
    const state = get();
    const today = todayString();

    // Already incremented today — skip
    if (state.lastActiveDate === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const isConsecutive = state.lastActiveDate === yesterdayStr;
    const newStreak = isConsecutive ? state.streak + 1 : 1;
    const newLongest = Math.max(newStreak, state.longestStreak);

    set({
      streak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: today,
      xpToday: 0,           // Reset daily XP at new streak day
    });

    // Streak bonus XP (capped at 5 days × streakBonus)
    const bonusXP = Math.min(newStreak, 5) * XPConfig.streakBonus;
    if (bonusXP > 0) get().addXP(bonusXP, "streak");

    // Streak badges
    if (newStreak >= 3) get().unlockBadge("streak_3");
    if (newStreak >= 7) get().unlockBadge("streak_7");
  },

  // ─────────────────────────────────────────────────────────
  // resetStreakIfNeeded — call on app start
  // ─────────────────────────────────────────────────────────
  resetStreakIfNeeded: () => {
    const { lastActiveDate, streak } = get();
    if (!lastActiveDate || streak === 0) return;

    const today = todayString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Missed more than 1 day → reset streak
    if (lastActiveDate !== today && lastActiveDate !== yesterdayStr) {
      set({ streak: 0 });
    }
  },

  // ─────────────────────────────────────────────────────────
  // markLessonComplete
  // ─────────────────────────────────────────────────────────
  markLessonComplete: (lessonId: string, xpReward: number) => {
    const state = get();

    // Already completed — skip
    if (state.completedLessonIds.includes(lessonId)) return;

    set({
      completedLessonIds: [...state.completedLessonIds, lessonId],
    });

    // Award XP
    get().addXP(xpReward, "lesson", lessonId);

    // Increment streak (first activity of the day)
    get().incrementStreak();

    // First lesson badge
    if (state.completedLessonIds.length === 0) {
      get().unlockBadge("first_lesson");
    }
  },

  // ─────────────────────────────────────────────────────────
  // updateCourseProgress
  // ─────────────────────────────────────────────────────────
  updateCourseProgress: (courseId: string, totalLessons: number) => {
    const state = get();

    const completedInCourse = state.completedLessonIds.filter((id) =>
      // NOTE: in a real app, filter by actual course membership
      // For MVP we count all completed lessons
      Boolean(id)
    ).length;

    const percentComplete =
      totalLessons > 0
        ? Math.min(100, Math.round((completedInCourse / totalLessons) * 100))
        : 0;

    const existing = state.courseProgress.find((c) => c.courseId === courseId);
    const updated: CourseProgress = {
      courseId,
      userId: "",
      completedLessons: completedInCourse,
      totalLessons,
      percentComplete,
      lastAccessedAt: new Date().toISOString(),
    };

    set({
      courseProgress: existing
        ? state.courseProgress.map((c) =>
            c.courseId === courseId ? updated : c
          )
        : [...state.courseProgress, updated],
    });
  },

  // ─────────────────────────────────────────────────────────
  // unlockBadge
  // ─────────────────────────────────────────────────────────
  unlockBadge: (badgeId: string) => {
    const { badges } = get();
    const badge = badges.find((b) => b.id === badgeId);
    if (!badge || badge.isUnlocked) return;

    set({
      badges: badges.map((b) =>
        b.id === badgeId
          ? { ...b, isUnlocked: true, unlockedAt: new Date().toISOString() }
          : b
      ),
    });
  },

  // ─────────────────────────────────────────────────────────
  // hydrateProgress — load from Supabase on login
  // ─────────────────────────────────────────────────────────
  hydrateProgress: async (userId: string) => {
    set({ isLoading: true });
    try {
      const result = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", userId)
        .limit(1);
      const data = result.data as unknown as ProgressRow[] | null;
      const error = result.error;

      if (error || !data || data.length === 0) {
        set({ isLoading: false });
        return;
      }

      const row = data[0];
      set({
        xp: row.xp,
        xpToday: row.xp_today,
        xpDailyGoal: row.xp_daily_goal,
        level: row.level,
        streak: row.streak,
        longestStreak: row.longest_streak,
        lastActiveDate: row.last_active_date,
        isLoading: false,
      });

      // Check streak validity after hydration
      get().resetStreakIfNeeded();
    } catch {
      set({ isLoading: false });
    }
  },

  // ─────────────────────────────────────────────────────────
  // syncProgressToSupabase — upsert current state to DB
  // ─────────────────────────────────────────────────────────
  syncProgressToSupabase: async (userId: string) => {
    if (!userId) {
      console.warn("[syncProgress] User ID is missing, skipping sync");
      return;
    }

    try {
      const state = get();
      const insertPayload: ProgressInsert = {
        user_id: userId,
        xp: state.xp,
        xp_today: state.xpToday,
        xp_daily_goal: state.xpDailyGoal,
        level: state.level,
        streak: state.streak,
        longest_streak: state.longestStreak,
        last_active_date: state.lastActiveDate,
      };
      const { error } = await (supabase.from("progress") as unknown as ProgressQueryBuilder).upsert(
        insertPayload,
        { onConflict: "user_id" }
      );

      if (error) {
        console.error("[syncProgress] Upsert failed:", error.message);
      } else {
        console.log("[syncProgress] Progress synced for user", userId);
      }
    } catch (err) {
      console.error("[syncProgress] Exception during sync:", err instanceof Error ? err.message : String(err));
    }
  },

  // ─────────────────────────────────────────────────────────
  // reset — called on logout
  // ─────────────────────────────────────────────────────────
  reset: () => set({ ...initialState, badges: initBadges() }),
}));

// ─────────────────────────────────────────────────────────────
// SELECTORS
// ─────────────────────────────────────────────────────────────

export const selectXP = (s: ProgressState) => s.xp;
export const selectXPToday = (s: ProgressState) => s.xpToday;
export const selectLevel = (s: ProgressState) => s.level;
export const selectStreak = (s: ProgressState) => s.streak;
export const selectBadges = (s: ProgressState) => s.badges;
export const selectCompletedLessons = (s: ProgressState) =>
  s.completedLessonIds;

/** Returns XP progress to next level (0–1) */
export const selectLevelProgress = (s: ProgressState): number =>
  (s.xp % XPConfig.levelThreshold) / XPConfig.levelThreshold;

/** Returns daily XP progress (0–1) */
export const selectDailyProgress = (s: ProgressState): number =>
  Math.min(1, s.xpToday / s.xpDailyGoal);
