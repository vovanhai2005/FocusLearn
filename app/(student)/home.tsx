// filepath: app/(student)/home.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MotiView } from "moti";
import { LessonCard } from "@/components/features/LessonCard";
import { StreakBadge } from "@/components/features/StreakBadge";
import { useAuthStore } from "@/store/useAuthStore";
import { useProgressStore, selectDailyProgress } from "@/store/useProgressStore";
import { useCoursesStore } from "@/store/useCoursesStore";
import { Colors, Shadow } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import type { LessonType } from "@/types";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface ContinueLesson {
  id: string;
  title: string;
  emoji: string;
  type: LessonType;
  durationSeconds: number;
  xpReward: number;
}

// ─────────────────────────────────────────────────────────────
// COLOR MAP
// ─────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, { bg: string; border: string }> = {
  primary:   { bg: Colors.primary.subtle,   border: Colors.primary.DEFAULT },
  success:   { bg: Colors.success.subtle,   border: Colors.success.DEFAULT },
  secondary: { bg: Colors.secondary.subtle, border: Colors.secondary.DEFAULT },
  warning:   { bg: Colors.warning.subtle,   border: Colors.warning.DEFAULT },
  info:      { bg: Colors.info.subtle,      border: Colors.info.DEFAULT },
  error:     { bg: Colors.error.subtle,     border: Colors.error.DEFAULT },
};

// ─────────────────────────────────────────────────────────────
// SKELETON BLOCK
// ─────────────────────────────────────────────────────────────

function Skeleton({
  height = 80,
  borderRadius = 16,
  width = "100%" as number | `${number}%`,
}: {
  height?: number;
  borderRadius?: number;
  width?: number | `${number}%`;
}) {
  return (
    <MotiView
      from={{ opacity: 0.2 }}
      animate={{ opacity: 0.65 }}
      transition={{ loop: true, type: "timing", duration: 700 }}
      style={{
        height,
        borderRadius,
        width,
        backgroundColor: Colors.border.DEFAULT,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// XP BAR
// ─────────────────────────────────────────────────────────────

function XPBar({ progress }: { progress: number }) {
  return (
    <View className="gap-2">
      <View className="flex-row justify-between items-center">
        <Text className="text-base font-semibold text-text-muted">
          ⭐ Mục tiêu hôm nay
        </Text>
        <Text className="text-base font-bold text-warning-dark">
          {Math.round(progress * 50)}/50 XP
        </Text>
      </View>
      <View className="h-3 rounded-full bg-border overflow-hidden">
        <MotiView
          from={{ width: "0%" }}
          animate={{ width: `${Math.min(100, progress * 100)}%` }}
          transition={{ type: "timing", duration: 800, delay: 300 }}
          style={{ backgroundColor: Colors.warning.DEFAULT }}
          className="h-full rounded-full"
        />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const streak = useProgressStore((s) => s.streak);
  const xp = useProgressStore((s) => s.xp);
  const level = useProgressStore((s) => s.level);
  const dailyProgress = useProgressStore(selectDailyProgress);

  const { courses, isLoading: coursesLoading, error: coursesError, hydrateCourses } =
    useCoursesStore((s) => ({
      courses: s.courses,
      isLoading: s.isLoading,
      error: s.error,
      hydrateCourses: s.hydrateCourses,
    }));

  const [continueLessons, setContinueLessons] = useState<ContinueLesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [lessonsError, setLessonsError] = useState<string | null>(null);

  const firstName = user?.name?.split(" ").at(-1) ?? "bạn";

  // ── Fetch incomplete lessons from Supabase ─────────────────
  const fetchContinueLessons = useCallback(async () => {
    setLessonsLoading(true);
    setLessonsError(null);

    try {
      // 1. Get completed lesson IDs for this student
      let completedIds: string[] = [];
      if (user?.id) {
        const { data: progressRows } = await supabase
          .from("lesson_progress")
          .select("lesson_id")
          .eq("user_id", user.id)
          .eq("is_completed", true);

        completedIds = progressRows?.map((r) => r.lesson_id) ?? [];
      }

      // 2. Query published lessons not yet completed
      type LessonSelect = {
        id: string;
        title: string;
        emoji: string;
        type: string;
        duration_seconds: number;
        xp_reward: number;
      };

      let query = supabase
        .from("lessons")
        .select("id, title, emoji, type, duration_seconds, xp_reward")
        .eq("is_published", true)
        .order("order", { ascending: true })
        .limit(6);

      if (completedIds.length > 0) {
        query = query.not("id", "in", `(${completedIds.join(",")})`);
      }

      const { data, error } = await query;
      if (error) throw error;

      setContinueLessons(
        ((data ?? []) as LessonSelect[]).map((row) => ({
          id: row.id,
          title: row.title,
          emoji: row.emoji,
          type: row.type as LessonType,
          durationSeconds: row.duration_seconds,
          xpReward: row.xp_reward,
        }))
      );
    } catch {
      setLessonsError("Không tải được bài học. Thử lại nhé!");
    } finally {
      setLessonsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchContinueLessons();
    hydrateCourses();
  }, [fetchContinueLessons, hydrateCourses]);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* ── HEADER ─────────────────────────────────────────── */}
        <View
          style={[{ backgroundColor: Colors.primary.DEFAULT }, Shadow.md]}
          className="px-5 pt-5 pb-7 rounded-b-3xl gap-4"
        >
          <View className="flex-row justify-between items-center">
            <MotiView
              from={{ opacity: 0, translateX: -12 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: "spring", damping: 22 }}
            >
              <Text className="text-2xl font-extrabold text-white">
                Xin chào, {firstName}! 👋
              </Text>
              <Text className="text-base text-white opacity-80 mt-0.5">
                Cấp độ {level} · {xp} XP
              </Text>
            </MotiView>

            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 150, type: "spring", damping: 18 }}
            >
              <StreakBadge streak={streak} compact />
            </MotiView>
          </View>

          <View className="bg-white bg-opacity-20 rounded-2xl p-4">
            <XPBar progress={dailyProgress} />
          </View>
        </View>

        <View className="px-5 pt-6 gap-7">
          {/* ── TIẾP TỤC HỌC ──────────────────────────────────── */}
          <View className="gap-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-2xl font-extrabold text-text">
                📖 Tiếp tục học
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(student)/courses")}
                className="min-h-[36px] justify-center px-2"
                accessibilityLabel="Xem tất cả khóa học"
                accessibilityRole="button"
              >
                <Text className="text-base font-semibold text-primary">
                  Xem tất cả →
                </Text>
              </TouchableOpacity>
            </View>

            {/* Loading skeleton */}
            {lessonsLoading ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingRight: 4 }}
                scrollEnabled={false}
              >
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} height={100} width={260} borderRadius={16} />
                ))}
              </ScrollView>
            ) : lessonsError ? (
              /* Error state */
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={[
                  Shadow.sm,
                  { backgroundColor: Colors.error.subtle, borderColor: Colors.error.DEFAULT },
                ]}
                className="rounded-2xl border-2 p-4 gap-3"
              >
                <View className="flex-row items-start gap-2">
                  <Text style={{ fontSize: 20 }}>⚠️</Text>
                  <Text
                    className="flex-1 text-base font-semibold"
                    style={{ color: Colors.error.dark }}
                  >
                    {lessonsError}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={fetchContinueLessons}
                  className="self-start rounded-xl px-5 min-h-[48px] justify-center"
                  style={{ backgroundColor: Colors.error.DEFAULT }}
                  accessibilityLabel="Thử lại tải bài học"
                  accessibilityRole="button"
                >
                  <Text className="text-white font-bold">🔄 Thử lại</Text>
                </TouchableOpacity>
              </MotiView>
            ) : continueLessons.length === 0 ? (
              /* Empty state */
              <MotiView
                from={{ opacity: 0, translateY: 8 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "spring", damping: 22 }}
                style={[
                  Shadow.sm,
                  { backgroundColor: Colors.success.subtle, borderColor: Colors.success.DEFAULT },
                ]}
                className="rounded-2xl border-2 p-5 items-center gap-2"
              >
                <Text style={{ fontSize: 40 }}>🎉</Text>
                <Text className="text-lg font-bold text-text text-center">
                  Bạn đã hoàn thành tất cả bài học!
                </Text>
                <Text className="text-sm text-text-muted text-center">
                  Giáo viên sẽ sớm thêm bài học mới nhé.
                </Text>
              </MotiView>
            ) : (
              /* Horizontal lesson list */
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingRight: 4 }}
              >
                {continueLessons.map((lesson, i) => (
                  <MotiView
                    key={lesson.id}
                    from={{ opacity: 0, translateX: 20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ delay: i * 70, type: "spring", damping: 20 }}
                    style={{ width: 260 }}
                  >
                    <LessonCard
                      title={lesson.title}
                      duration={lesson.durationSeconds}
                      xpReward={lesson.xpReward}
                      emoji={lesson.emoji}
                      lessonType={lesson.type}
                      isCompleted={false}
                      onPress={() =>
                        router.push(
                          `/(student)/lesson/${lesson.id}` as `/(student)/lesson/${string}`
                        )
                      }
                    />
                  </MotiView>
                ))}
              </ScrollView>
            )}
          </View>

          {/* ── KHÓA HỌC CỦA BẠN ──────────────────────────────── */}
          <View className="gap-4">
            <Text className="text-2xl font-extrabold text-text">
              🎯 Khóa học của bạn
            </Text>

            {/* Loading skeleton */}
            {coursesLoading ? (
              <View className="flex-row flex-wrap gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} height={110} width={"47%"} borderRadius={16} />
                ))}
              </View>
            ) : coursesError ? (
              /* Error state */
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={[
                  Shadow.sm,
                  { backgroundColor: Colors.error.subtle, borderColor: Colors.error.DEFAULT },
                ]}
                className="rounded-2xl border-2 p-5 gap-3"
              >
                <View className="flex-row items-start gap-3">
                  <Text style={{ fontSize: 24 }}>⚠️</Text>
                  <Text
                    className="flex-1 text-base font-semibold"
                    style={{ color: Colors.error.dark }}
                  >
                    Chưa tải được môn học. Kiểm tra mạng và thử lại nhé!
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={hydrateCourses}
                  className="self-start rounded-xl px-5 min-h-[48px] justify-center"
                  style={{ backgroundColor: Colors.primary.DEFAULT }}
                  accessibilityLabel="Thử lại tải khóa học"
                  accessibilityRole="button"
                >
                  <Text className="text-white font-bold text-base">🔄 Thử lại</Text>
                </TouchableOpacity>
              </MotiView>
            ) : courses.length === 0 ? (
              /* Empty state */
              <View className="items-center py-8 gap-2">
                <Text style={{ fontSize: 40 }}>📭</Text>
                <Text className="text-base text-text-muted text-center px-4">
                  Chưa có khóa học nào. Hãy nhờ giáo viên thêm khóa học nhé!
                </Text>
              </View>
            ) : (
              /* 2-column course grid */
              <View className="flex-row flex-wrap gap-3">
                {courses.slice(0, 4).map((course, i) => {
                  const colors =
                    COLOR_MAP[course.colorKey] ?? COLOR_MAP.primary;
                  return (
                    <MotiView
                      key={course.id}
                      from={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 350 + i * 60,
                        type: "spring",
                        damping: 18,
                      }}
                      style={{ width: "47%" }}
                    >
                      <TouchableOpacity
                        activeOpacity={0.82}
                        onPress={() =>
                          router.push(
                            `/(student)/course/${course.id}` as `/(student)/course/${string}`
                          )
                        }
                        style={{
                          backgroundColor: colors.bg,
                          borderColor: colors.border,
                          borderWidth: 2,
                          ...Shadow.sm,
                        }}
                        className="rounded-2xl p-5 items-center gap-2 min-h-[110px] justify-center"
                        accessibilityLabel={course.title}
                        accessibilityRole="button"
                      >
                        <Text style={{ fontSize: 36 }}>{course.emoji}</Text>
                        <Text
                          className="text-base font-bold text-text text-center"
                          numberOfLines={2}
                        >
                          {course.title}
                        </Text>
                      </TouchableOpacity>
                    </MotiView>
                  );
                })}
              </View>
            )}
          </View>

          {/* ── MOTIVATION CARD ────────────────────────────────── */}
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 600, type: "spring", damping: 22 }}
            style={[
              Shadow.sm,
              { backgroundColor: Colors.warning.subtle, borderColor: Colors.warning.DEFAULT },
            ]}
            className="rounded-2xl border-2 p-4 flex-row items-center gap-4"
          >
            <Text style={{ fontSize: 36 }}>🏆</Text>
            <View className="flex-1">
              <Text className="text-base font-bold text-text">
                Thử 1 bài ngắn hôm nay nhé!
              </Text>
              <Text className="text-sm text-text-muted mt-0.5">
                Một chút mỗi ngày cũng là tiến bộ ⭐
              </Text>
            </View>
          </MotiView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
