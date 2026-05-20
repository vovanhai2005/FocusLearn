// filepath: app/(student)/courses.tsx
import React, { useState } from "react";
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
import { Colors, Shadow } from "@/constants/theme";
import { GRADE_OPTIONS } from "@/types";
import { useProgressStore } from "@/store/useProgressStore";
import { useCoursesStore } from "@/store/useCoursesStore";
import { useAuthStore } from "@/store/useAuthStore";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, { color: string; subtle: string }> = {
  primary: { color: Colors.primary.DEFAULT, subtle: Colors.primary.subtle },
  success: { color: Colors.success.DEFAULT, subtle: Colors.success.subtle },
  secondary: { color: Colors.secondary.DEFAULT, subtle: Colors.secondary.subtle },
  warning: { color: Colors.warning.DEFAULT, subtle: Colors.warning.subtle },
  info: { color: Colors.info.DEFAULT, subtle: Colors.info.subtle },
  error: { color: Colors.error.DEFAULT, subtle: Colors.error.subtle },
};

const FILTERS = ["Tất cả", "Đang học", "Hoàn thành"] as const;
type Filter = typeof FILTERS[number];

// ─────────────────────────────────────────────────────────────
// PROGRESS BAR
// ─────────────────────────────────────────────────────────────

function CourseProgressBar({
  progress,
  color,
}: {
  progress: number;
  color: string;
}) {
  return (
    <View className="h-2.5 rounded-full bg-border overflow-hidden">
      <MotiView
        from={{ width: "0%" }}
        animate={{ width: `${Math.round(progress * 100)}%` }}
        transition={{ type: "timing", duration: 700, delay: 400 }}
        style={{ backgroundColor: color }}
        className="h-full rounded-full"
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// COURSE ITEM
// ─────────────────────────────────────────────────────────────

function CourseItem({
  id,
  emoji,
  title,
  description,
  totalLessons,
  completedLessons,
  color,
  subtleColor,
  difficulty,
  index,
}: {
  id: string; emoji: string; title: string; description: string;
  totalLessons: number; completedLessons: number;
  color: string; subtleColor: string; difficulty: string; index: number;
}) {
  const progress = totalLessons > 0 ? completedLessons / totalLessons : 0;
  const isDone = completedLessons === totalLessons && totalLessons > 0;

  return (
    <MotiView
      from={{ opacity: 0, translateX: -16 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ delay: index * 80, type: "spring", damping: 22 }}
    >
      <TouchableOpacity
        activeOpacity={0.84}
        onPress={() => router.push(`/(student)/course/${id}` as `/(student)/course/${string}`)}
        style={Shadow.md}
        className="bg-bg-card rounded-2xl border border-border overflow-hidden"
        accessibilityLabel={`${title} course, ${completedLessons} of ${totalLessons} lessons completed`}
        accessibilityRole="button"
        accessibilityHint={`${difficulty} difficulty`}
      >
        <View className="flex-row items-center gap-4 p-4">
          <View
            style={{ backgroundColor: subtleColor, borderColor: color, borderWidth: 2 }}
            className="w-16 h-16 rounded-xl items-center justify-center"
          >
            <Text style={{ fontSize: 30 }}>{emoji}</Text>
          </View>
          <View className="flex-1 gap-2">
            <View className="flex-row items-start justify-between gap-2">
              <Text className="text-lg font-bold text-text flex-1" numberOfLines={2}>{title}</Text>
              {isDone && <Text style={{ fontSize: 20 }}>✅</Text>}
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-sm text-text-muted" numberOfLines={1}>{description || "—"}</Text>
              <Text className="text-text-muted">·</Text>
              <Text className="text-sm text-text-muted">{difficulty}</Text>
            </View>
            <View className="gap-1">
              <CourseProgressBar progress={progress} color={color} />
              <Text className="text-xs text-text-muted font-medium">
                {completedLessons}/{totalLessons} bài hoàn thành
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────────────────────

export default function CoursesScreen() {
  const [activeFilter, setActiveFilter] = useState<Filter>("Tất cả");
  const user = useAuthStore((s) => s.user);
  const completedLessonIds = useProgressStore((s) => s.completedLessonIds);
  const { courses, isLoading, error, hydrateCourses } = useCoursesStore((s) => ({ courses: s.courses, isLoading: s.isLoading, error: s.error, hydrateCourses: s.hydrateCourses }));

  const gradeLabel = user?.grade
    ? GRADE_OPTIONS.find((g) => g.value === user.grade)?.label || "Không xác định"
    : "Không xác định";

  // Build display list with real completion counts from store
  const displayCourses = courses.map((c) => ({
    ...c,
    completedLessons: c.lessonIds.filter((id) => completedLessonIds.includes(id)).length,
    color: COLOR_MAP[c.colorKey as keyof typeof COLOR_MAP]?.color || Colors.primary.DEFAULT,
    subtleColor: COLOR_MAP[c.colorKey as keyof typeof COLOR_MAP]?.subtle || Colors.primary.subtle,
  }));

  const filtered = displayCourses.filter((c) => {
    if (activeFilter === "Hoàn thành") return c.completedLessons === c.totalLessons;
    if (activeFilter === "Đang học") return c.completedLessons > 0 && c.completedLessons < c.totalLessons;
    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* ── Header ───────────────────────────────────────── */}
        <MotiView
          from={{ opacity: 0, translateY: -12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 22 }}
          className="px-5 pt-6 pb-2 gap-1"
        >
          <Text className="text-4xl font-extrabold text-text">📚 Khóa học</Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-base text-text-muted">
              {isLoading ? "Đang tải..." : `${courses.length} khóa học`}
            </Text>
            <View
              style={{ backgroundColor: Colors.info.subtle, borderColor: Colors.info.DEFAULT, borderWidth: 1 }}
              className="px-3 py-1 rounded-full"
            >
              <Text style={{ color: Colors.info.dark, fontSize: 13, fontWeight: "600" }}>
                {gradeLabel}
              </Text>
            </View>
          </View>
        </MotiView>

        {/* ── Filter chips ─────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-5 py-3"
          contentContainerStyle={{ gap: 8 }}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(f)}
              style={{
                backgroundColor:
                  activeFilter === f ? Colors.primary.DEFAULT : Colors.bg.muted,
                borderColor:
                  activeFilter === f ? Colors.primary.DEFAULT : Colors.border.DEFAULT,
                borderWidth: 1.5,
              }}
              className="px-4 py-2 rounded-badge min-h-[36px] justify-center"
              accessibilityLabel={`Filter courses by ${f}`}
              accessibilityRole="button"
              accessibilityState={{ selected: activeFilter === f }}
            >
              <Text
                style={{
                  color:
                    activeFilter === f
                      ? Colors.text.inverse
                      : Colors.text.muted,
                  fontWeight: activeFilter === f ? "700" : "500",
                  fontSize: 14,
                }}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Course list ──────────────────────────────────── */}
        <View className="px-5 gap-3">
          {error ? (
            <View style={[Shadow.sm, { backgroundColor: Colors.error.subtle, borderColor: Colors.error.DEFAULT }]} className="rounded-2xl border-2 p-5 gap-3">
              <View className="flex-row items-start gap-3">
                <Text style={{ fontSize: 24 }}>⚠️</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold" style={{ color: Colors.error.dark }}>
                    Chưa kết nối được. Kiểm tra mạng và thử lại nhé!
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => hydrateCourses()}
                className="bg-primary rounded-lg py-3 px-5 self-start min-h-[48px] justify-center"
              >
                <Text className="text-white font-bold text-base">🔄 Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : isLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
            </View>
          ) : filtered.length === 0 ? (
            <View className="items-center py-12 gap-4">
              <Text style={{ fontSize: 48 }}>📚</Text>
              <Text className="text-xl font-bold text-text text-center">
                Chưa có khóa học nào
              </Text>
              <Text className="text-base text-text-muted text-center leading-6">
                Hỏi giáo viên để nhận mã lớp nhé!
              </Text>
              <TouchableOpacity
                onPress={() => hydrateCourses()}
                className="bg-primary rounded-xl py-3 px-6 min-h-[48px] justify-center mt-2"
              >
                <Text className="text-white font-bold text-base">🔄 Tải lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filtered.map((course, i) => (
              <CourseItem
                key={course.id}
                id={course.id}
                emoji={course.emoji}
                title={course.title}
                description={course.description}
                totalLessons={course.totalLessons}
                completedLessons={course.completedLessons}
                color={course.color}
                subtleColor={course.subtleColor}
                difficulty={course.difficulty}
                index={i}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
