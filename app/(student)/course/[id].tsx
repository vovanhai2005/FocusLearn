// filepath: app/(student)/course/[id].tsx
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { MotiView } from "moti";
import { LessonCard } from "@/components/features/LessonCard";
import { Colors, Shadow } from "@/constants/theme";
import { useProgressStore } from "@/store/useProgressStore";
import { useCoursesStore } from "@/store/useCoursesStore";

const COLOR_MAP: Record<string, string> = {
  primary: Colors.primary.DEFAULT,
  success: Colors.success.DEFAULT,
  secondary: Colors.secondary.DEFAULT,
  warning: Colors.warning.DEFAULT,
  info: Colors.info.DEFAULT,
  error: Colors.error.DEFAULT,
};

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showLoading, setShowLoading] = useState(false);
  const completedLessonIds = useProgressStore((s) => s.completedLessonIds);
  const { isLoading } = useCoursesStore((s) => ({ isLoading: s.isLoading }));
  const course = useCoursesStore((s) => s.getCourseById(id || ""));
  const lessons = useCoursesStore((s) => s.getLessonsByCourseId(id || ""));

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isLoading) {
      timeout = setTimeout(() => setShowLoading(true), 500);
    } else {
      setShowLoading(false);
    }
    return () => clearTimeout(timeout);
  }, [isLoading]);

  if (!course) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center gap-4 px-5">
        <Text style={{ fontSize: 48 }}>😕</Text>
        <Text className="text-xl font-bold text-text text-center">Không tìm thấy khóa học</Text>
        <Text className="text-base text-text-muted text-center">Khóa học này có thể đã bị xóa hoặc chưa được công bố</Text>
        <TouchableOpacity onPress={() => router.back()} className="min-h-[48px] justify-center px-6" accessibilityLabel="Go back" accessibilityRole="button">
          <Text className="text-lg font-semibold text-primary">← Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const completedCount = lessons.filter((l) =>
    completedLessonIds.includes(l.id)
  ).length;
  const progress = lessons.length > 0 ? completedCount / lessons.length : 0;
  const courseColor = course ? COLOR_MAP[course.colorKey as keyof typeof COLOR_MAP] : Colors.primary.DEFAULT;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* ── Hero header ──────────────────────────────────── */}
        <View
          style={{ backgroundColor: courseColor }}
          className="px-5 pt-4 pb-8 rounded-b-3xl"
        >
          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center gap-2 mb-5 self-start min-h-[44px] items-center"
            accessibilityLabel="Go back to courses list"
            accessibilityRole="button"
          >
            <Text className="text-2xl text-white">←</Text>
            <Text className="text-base font-semibold text-white opacity-90">Quay lại</Text>
          </TouchableOpacity>

          <MotiView
            from={{ opacity: 0, translateY: -12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", damping: 22 }}
            className="items-center gap-3"
          >
            <Text style={{ fontSize: 64 }}>{course.emoji}</Text>
            <Text className="text-3xl font-extrabold text-white text-center">
              {course.title}
            </Text>
            <Text className="text-base text-white opacity-80 text-center">
              {course.description}
            </Text>
          </MotiView>

          {/* Progress bar */}
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 150, type: "spring", damping: 22 }}
            className="mt-5 rounded-2xl p-4 gap-2"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <View className="flex-row justify-between">
              <Text className="text-sm font-semibold text-white">Tiến độ</Text>
              <Text className="text-sm font-bold text-white">
                {completedCount}/{lessons.length} bài
              </Text>
            </View>
            <View className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.3)" }}>
              <MotiView
                from={{ width: "0%" }}
                animate={{ width: `${Math.round(progress * 100)}%` }}
                transition={{ type: "timing", duration: 800, delay: 400 }}
                style={{ backgroundColor: "rgba(255,255,255,0.95)" }}
                className="h-full rounded-full"
              />
            </View>
            {progress === 1 && (
              <Text className="text-center text-white font-bold">
                🏆 Hoàn thành! Xuất sắc!
              </Text>
            )}
          </MotiView>
        </View>

        {/* ── Lesson list ──────────────────────────────────── */}
        <View className="px-5 pt-6 gap-3">
          <Text className="text-2xl font-extrabold text-text">📋 Bài học</Text>

          {showLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
            </View>
          ) : lessons.length === 0 ? (
            <View className="items-center py-12 gap-3">
              <Text style={{ fontSize: 48 }}>📚</Text>
              <Text className="text-lg font-semibold text-text-muted">Chưa có bài học nào</Text>
            </View>
          ) : (
            lessons.map((lesson, i) => (
              <MotiView
                key={lesson.id}
                from={{ opacity: 0, translateY: 16 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 200 + i * 70, type: "spring", damping: 20 }}
              >
                <LessonCard
                  title={`Bài ${i + 1}: ${lesson.title}`}
                  duration={lesson.durationSeconds}
                  xpReward={lesson.xpReward}
                  emoji={lesson.emoji}
                  lessonType={lesson.type}
                  isCompleted={completedLessonIds.includes(lesson.id)}
                  onPress={() =>
                    router.push(
                      `/(student)/lesson/${lesson.id}` as `/(student)/lesson/${string}`
                    )
                  }
                />
              </MotiView>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
