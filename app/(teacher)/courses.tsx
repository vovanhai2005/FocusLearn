// filepath: app/(teacher)/courses.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MotiView } from "moti";
import { Button } from "@/components/ui/Button";
import { Colors, Shadow } from "@/constants/theme";
import { supabase, type Database } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useCoursesStore } from "@/store/useCoursesStore";
import type { Course } from "@/types";

type CourseEnrollmentRow =
  Database["public"]["Tables"]["course_enrollments"]["Row"];
type UserRow = Database["public"]["Tables"]["users"]["Row"];

interface CourseStudent {
  id: string;
  name: string;
  avatarEmoji: string;
  progressPercent: number;
  status: CourseEnrollmentRow["status"];
}

const COLOR_MAP: Record<string, { color: string; subtle: string }> = {
  primary: { color: Colors.primary.DEFAULT, subtle: Colors.primary.subtle },
  success: { color: Colors.success.DEFAULT, subtle: Colors.success.subtle },
  secondary: { color: Colors.secondary.DEFAULT, subtle: Colors.secondary.subtle },
  warning: { color: Colors.warning.DEFAULT, subtle: Colors.warning.subtle },
  info: { color: Colors.info.DEFAULT, subtle: Colors.info.subtle },
  error: { color: Colors.error.DEFAULT, subtle: Colors.error.subtle },
};

const DIFFICULTY_LABEL: Record<Course["difficulty"], string> = {
  easy: "Dễ",
  medium: "Vừa",
  hard: "Khó",
};

function CourseCard({
  course,
  index,
  students,
}: {
  course: Course;
  index: number;
  students: CourseStudent[];
}) {
  const palette = COLOR_MAP[course.colorKey] ?? COLOR_MAP.primary;
  const previewStudents = students.slice(0, 5);
  const avgProgress =
    students.length > 0
      ? Math.round(
          students.reduce((sum, student) => sum + student.progressPercent, 0) /
            students.length
        )
      : 0;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 70, type: "spring", damping: 20 }}
      style={Shadow.sm}
      className="rounded-2xl border border-border bg-bg-card overflow-hidden"
    >
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={() => router.push(`/(teacher)/course/${course.id}` as `/(teacher)/course/${string}`)}
      accessibilityLabel={`Quản lý khóa học ${course.title}`}
      accessibilityRole="button"
      className="p-4"
    >
      <View className="flex-row gap-3">
        <View
          className="h-14 w-14 items-center justify-center rounded-xl border-2"
          style={{ backgroundColor: palette.subtle, borderColor: palette.color }}
        >
          <Text style={{ fontSize: 28 }}>{course.emoji || "📘"}</Text>
        </View>

        <View className="flex-1 gap-2">
          <View className="flex-row items-start justify-between gap-2">
            <Text className="flex-1 text-lg font-extrabold text-text" numberOfLines={2}>
              {course.title}
            </Text>
            <Text className="rounded-full bg-bg-muted px-2 py-1 text-xs font-bold text-text-muted">
              {DIFFICULTY_LABEL[course.difficulty]}
            </Text>
          </View>

          <Text className="text-sm leading-5 text-text-muted" numberOfLines={2}>
            {course.description || "Chưa có mô tả"}
          </Text>

          <View className="flex-row flex-wrap gap-2">
            <Text className="rounded-full bg-primary-subtle px-3 py-1 text-xs font-bold text-primary">
              {course.totalLessons} bài
            </Text>
            <Text className="rounded-full bg-success-subtle px-3 py-1 text-xs font-bold text-success-dark">
              {course.estimatedMinutes} phút
            </Text>
            <Text className="rounded-full bg-info-subtle px-3 py-1 text-xs font-bold text-info-dark">
              {students.length} học sinh
            </Text>
            {students.length > 0 ? (
              <Text className="rounded-full bg-warning-subtle px-3 py-1 text-xs font-bold text-warning-dark">
                {avgProgress}% TB
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      {students.length > 0 ? (
        <View className="mt-4 gap-2">
          <Text className="text-sm font-extrabold text-text">
            Học sinh đang học
          </Text>
          {previewStudents.map((student) => (
            <View
              key={student.id}
              className="flex-row items-center gap-2 rounded-xl bg-bg-muted px-3 py-2"
            >
              <Text style={{ fontSize: 20 }}>{student.avatarEmoji}</Text>
              <Text className="flex-1 text-sm font-bold text-text" numberOfLines={1}>
                {student.name}
              </Text>
              <Text className="text-xs font-extrabold text-primary">
                {student.progressPercent}%
              </Text>
            </View>
          ))}
          {students.length > previewStudents.length ? (
            <Text className="text-xs font-semibold text-text-muted">
              +{students.length - previewStudents.length} học sinh khác
            </Text>
          ) : null}
        </View>
      ) : null}

      {/* Manage hint */}
      <View className="mt-3 flex-row items-center gap-1">
        <Text className="text-xs font-semibold text-primary">Nhấn để quản lý bài học</Text>
        <Text className="text-xs text-primary">→</Text>
      </View>
    </TouchableOpacity>
    </MotiView>
  );
}

export default function TeacherCoursesScreen() {
  const user = useAuthStore((state) => state.user);
  const { courses, isLoading, error, hydrateCourses } = useCoursesStore((state) => ({
    courses: state.courses,
    isLoading: state.isLoading,
    error: state.error,
    hydrateCourses: state.hydrateCourses,
  }));
  const [courseStudentsById, setCourseStudentsById] = useState<
    Record<string, CourseStudent[]>
  >({});

  const teacherCourses = useMemo(
    () => courses.filter((course) => course.teacherId === user?.id),
    [courses, user?.id]
  );

  useEffect(() => {
    let isMounted = true;
    const courseIds = teacherCourses.map((course) => course.id);

    async function hydrateCourseStudents() {
      if (courseIds.length === 0) {
        setCourseStudentsById({});
        return;
      }

      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from("course_enrollments")
        .select("*")
        .in("course_id", courseIds);

      if (enrollmentsError) return;

      const enrollments = (enrollmentsData || []) as CourseEnrollmentRow[];
      const studentIds = Array.from(
        new Set(enrollments.map((enrollment) => enrollment.student_id))
      );

      if (studentIds.length === 0) {
        if (isMounted) setCourseStudentsById({});
        return;
      }

      const { data: studentsData, error: studentsError } = await supabase
        .from("users")
        .select("*")
        .in("id", studentIds);

      if (studentsError) return;

      const studentsById = new Map<string, UserRow>();
      (studentsData || []).forEach((student) => {
        studentsById.set(student.id, student);
      });

      const next: Record<string, CourseStudent[]> = {};
      enrollments.forEach((enrollment) => {
        const student = studentsById.get(enrollment.student_id);
        if (!student) return;

        const list = next[enrollment.course_id] || [];
        list.push({
          id: student.id,
          name: student.name,
          avatarEmoji: student.avatar_emoji,
          progressPercent: enrollment.progress_percent,
          status: enrollment.status,
        });
        next[enrollment.course_id] = list;
      });

      Object.values(next).forEach((students) => {
        students.sort((a, b) => b.progressPercent - a.progressPercent);
      });

      if (isMounted) setCourseStudentsById(next);
    }

    hydrateCourseStudents();

    return () => {
      isMounted = false;
    };
  }, [teacherCourses]);

  const totalLessons = teacherCourses.reduce(
    (sum, course) => sum + course.totalLessons,
    0
  );
  const totalMinutes = teacherCourses.reduce(
    (sum, course) => sum + course.estimatedMinutes,
    0
  );

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        <View className="px-5 pt-6 gap-5">
          <View className="gap-1">
            <Text className="text-4xl font-extrabold text-text">Khóa học</Text>
            <Text className="text-base text-text-muted">
              Nội dung bạn đang dùng cho lớp học
            </Text>
          </View>

          <View className="flex-row gap-3">
            <View style={Shadow.sm} className="flex-1 rounded-2xl bg-bg-card p-4">
              <Text className="text-2xl font-extrabold text-primary">
                {teacherCourses.length}
              </Text>
              <Text className="text-xs font-semibold text-text-muted">Khóa học</Text>
            </View>
            <View style={Shadow.sm} className="flex-1 rounded-2xl bg-bg-card p-4">
              <Text className="text-2xl font-extrabold text-success">
                {totalLessons}
              </Text>
              <Text className="text-xs font-semibold text-text-muted">Bài học</Text>
            </View>
            <View style={Shadow.sm} className="flex-1 rounded-2xl bg-bg-card p-4">
              <Text className="text-2xl font-extrabold text-secondary">
                {totalMinutes}
              </Text>
              <Text className="text-xs font-semibold text-text-muted">Phút</Text>
            </View>
          </View>

          <Button
            label="Tạo khóa học"
            leftEmoji="➕"
            variant="primary"
            fullWidth
            onPress={() => router.push("/(teacher)/create")}
          />

          {error ? (
            <View
              style={[
                Shadow.sm,
                {
                  backgroundColor: Colors.error.subtle,
                  borderColor: Colors.error.DEFAULT,
                },
              ]}
              className="rounded-2xl border p-4 gap-3"
            >
              <Text className="text-base font-bold" style={{ color: Colors.error.dark }}>
                Chưa tải được danh sách khóa học.
              </Text>
              <TouchableOpacity
                onPress={() => hydrateCourses()}
                className="self-start rounded-xl bg-primary px-4 py-3"
              >
                <Text className="font-bold text-white">Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : isLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
            </View>
          ) : teacherCourses.length === 0 ? (
            <View className="items-center gap-3 py-12">
              <Text style={{ fontSize: 48 }}>📚</Text>
              <Text className="text-xl font-extrabold text-text">
                Chưa có khóa học nào
              </Text>
              <Text className="text-center text-base leading-6 text-text-muted">
                Tạo khóa đầu tiên để học sinh có nội dung học.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {teacherCourses.map((course, index) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  index={index}
                  students={courseStudentsById[course.id] || []}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
