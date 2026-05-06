// filepath: app/(student)/courses.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MotiView } from "moti";
import { Colors, Shadow } from "@/constants/theme";
import { useProgressStore } from "@/store/useProgressStore";
import { MOCK_COURSES } from "@/constants/mockData";

// ─────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────


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
  subject,
  totalLessons,
  completedLessons,
  color,
  subtleColor,
  difficulty,
  index,
}: {
  id: string; emoji: string; title: string; subject: string;
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
              <Text className="text-lg font-bold text-text flex-1" numberOfLines={1}>{title}</Text>
              {isDone && <Text style={{ fontSize: 20 }}>✅</Text>}
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-sm text-text-muted">{subject}</Text>
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
  const completedLessonIds = useProgressStore((s) => s.completedLessonIds);

  // Build courses list with real completion counts from store
  const courses = Object.values(MOCK_COURSES).map((c) => ({
    ...c,
    totalLessons: c.lessons.length,
    completedLessons: c.lessons.filter((l) => completedLessonIds.includes(l.id)).length,
  }));

  const filtered = courses.filter((c) => {
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
          <Text className="text-base text-text-muted">
            {MOCK_COURSES.length} khóa học của bạn
          </Text>
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
          {filtered.length === 0 ? (
            <View className="items-center py-12 gap-3">
              <Text style={{ fontSize: 48 }}>🔍</Text>
              <Text className="text-lg font-semibold text-text-muted text-center">
                Chưa có khóa học nào ở đây
              </Text>
            </View>
          ) : (
            filtered.map((course, i) => (
              <CourseItem key={course.id} {...course} index={i} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
