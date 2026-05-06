// filepath: app/(student)/course/[id].tsx
import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { MotiView } from "moti";
import { LessonCard } from "@/components/features/LessonCard";
import { Colors, Shadow } from "@/constants/theme";
import { useProgressStore } from "@/store/useProgressStore";
import { MOCK_COURSES } from "@/constants/mockData";

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const completedLessonIds = useProgressStore((s) => s.completedLessonIds);

  const course = id ? MOCK_COURSES[id] : undefined;

  if (!course) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center gap-4">
        <Text style={{ fontSize: 48 }}>😕</Text>
        <Text className="text-xl font-bold text-text">Không tìm thấy khóa học</Text>
        <TouchableOpacity onPress={() => router.back()} className="min-h-[48px] justify-center px-6">
          <Text className="text-lg font-semibold text-primary">← Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const completedCount = course.lessons.filter((l) =>
    completedLessonIds.includes(l.id)
  ).length;
  const progress = course.lessons.length > 0 ? completedCount / course.lessons.length : 0;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* ── Hero header ──────────────────────────────────── */}
        <View
          style={{ backgroundColor: course.color }}
          className="px-5 pt-4 pb-8 rounded-b-3xl"
        >
          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center gap-2 mb-5 self-start min-h-[44px] items-center"
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
                {completedCount}/{course.lessons.length} bài
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

          {course.lessons.map((lesson, i) => (
            <MotiView
              key={lesson.id}
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 200 + i * 70, type: "spring", damping: 20 }}
            >
              <LessonCard
                title={lesson.title}
                duration={lesson.duration}
                xpReward={lesson.xpReward}
                emoji={lesson.emoji}
                lessonType={lesson.lessonType}
                isCompleted={completedLessonIds.includes(lesson.id)}
                onPress={() =>
                  router.push(
                    `/(student)/lesson/${lesson.id}` as `/(student)/lesson/${string}`
                  )
                }
              />
            </MotiView>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
