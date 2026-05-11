// filepath: app/(student)/home.tsx
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
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

// ─────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────

// Continue lessons — placeholder until enrollment system is built
const CONTINUE_LESSONS = [
  {
    id: "c1l1",
    title: "Phép cộng và trừ có nhớ",
    duration: 300,
    xpReward: 20,
    emoji: "➕",
    lessonType: "video" as const,
  },
  {
    id: "c2l2",
    title: "Quiz: Nhận biết động vật",
    duration: 150,
    xpReward: 15,
    emoji: "🐾",
    lessonType: "quiz" as const,
  },
];

// Color map for subject cards
const COLOR_MAP: Record<string, { color: string; border: string }> = {
  primary: { color: Colors.primary.subtle, border: Colors.primary.DEFAULT },
  success: { color: Colors.success.subtle, border: Colors.success.DEFAULT },
  secondary: { color: Colors.secondary.subtle, border: Colors.secondary.DEFAULT },
  warning: { color: Colors.warning.subtle, border: Colors.warning.DEFAULT },
  info: { color: Colors.info.subtle, border: Colors.info.DEFAULT },
  error: { color: Colors.error.subtle, border: Colors.error.DEFAULT },
};

// ─────────────────────────────────────────────────────────────
// XP BAR COMPONENT
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
  const completedLessonIds = useProgressStore((s) => s.completedLessonIds);
  const { courses, isLoading } = useCoursesStore((s) => ({ courses: s.courses, isLoading: s.isLoading }));

  const firstName = user?.name?.split(" ").at(-1) ?? "bạn";

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* ── HEADER ─────────────────────────────────────── */}
        <View
          style={[{ backgroundColor: Colors.primary.DEFAULT }, Shadow.md]}
          className="px-5 pt-5 pb-7 rounded-b-3xl gap-4"
        >
          {/* Greeting row */}
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

            {/* Compact streak badge */}
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 150, type: "spring", damping: 18 }}
            >
              <StreakBadge streak={streak} compact />
            </MotiView>
          </View>

          {/* XP progress bar */}
          <View className="bg-white bg-opacity-20 rounded-2xl p-4">
            <XPBar progress={dailyProgress} />
          </View>
        </View>

        <View className="px-5 pt-6 gap-7">
          {/* ── CONTINUE LESSONS ──────────────────────────── */}
          <View className="gap-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-2xl font-extrabold text-text">
                📖 Tiếp tục học
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(student)/courses")}
                className="min-h-[36px] justify-center px-2"
              >
                <Text className="text-base font-semibold text-primary">
                  Xem tất cả →
                </Text>
              </TouchableOpacity>
            </View>

            <View className="gap-3">
              {CONTINUE_LESSONS.map((lesson, i) => (
                <MotiView
                  key={lesson.id}
                  from={{ opacity: 0, translateY: 12 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{
                    delay: 200 + i * 80,
                    type: "spring",
                    damping: 20,
                  }}
                >
                  <LessonCard
                    title={lesson.title}
                    duration={lesson.duration}
                    xpReward={lesson.xpReward}
                    emoji={lesson.emoji}
                    lessonType={lesson.lessonType}
                    isCompleted={completedLessonIds.includes(lesson.id)}
                    onPress={() =>
                      router.push(`/(student)/lesson/${lesson.id}` as `/(student)/lesson/${string}`)
                    }
                  />
                </MotiView>
              ))}
            </View>
          </View>

          {/* ── SUBJECTS GRID ─────────────────────────────── */}
          <View className="gap-4">
            <Text className="text-2xl font-extrabold text-text">
              🎯 Môn học
            </Text>

            {isLoading ? (
              <View className="items-center py-6">
                <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
              </View>
            ) : (
              <View className="flex-row flex-wrap gap-3">
                {courses.slice(0, 4).map((course, i) => {
                  const colorConfig = COLOR_MAP[course.colorKey as keyof typeof COLOR_MAP] || { color: Colors.primary.subtle, border: Colors.primary.DEFAULT };
                  return (
                    <MotiView
                      key={course.id}
                      from={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 350 + i * 60, type: "spring", damping: 18 }}
                      style={{ width: "47%" }}
                    >
                      <TouchableOpacity
                        activeOpacity={0.82}
                        onPress={() => router.push(`/(student)/course/${course.id}` as `/(student)/course/${string}`)}
                        style={{ backgroundColor: colorConfig.color, borderColor: colorConfig.border, borderWidth: 2, ...Shadow.sm }}
                        className="rounded-2xl p-5 items-center gap-2 min-h-[100px] justify-center"
                      >
                        <Text style={{ fontSize: 36 }}>{course.emoji}</Text>
                        <Text className="text-lg font-bold text-text text-center" numberOfLines={1}>{course.title}</Text>
                      </TouchableOpacity>
                    </MotiView>
                  );
                })}
              </View>
            )}
          </View>

          {/* ── BADGE HINT ──────────────────────────────────── */}
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
                Hoàn thành 1 bài hôm nay!
              </Text>
              <Text className="text-sm text-text-muted mt-0.5">
                Nhận huy hiệu "Học sinh mới" ⭐
              </Text>
            </View>
          </MotiView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
