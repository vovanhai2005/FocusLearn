// filepath: app/(teacher)/reports.tsx
import React, { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { Colors, Shadow } from "@/constants/theme";
import { useAuthStore } from "@/store/useAuthStore";
import { useCoursesStore } from "@/store/useCoursesStore";
import { useTeacherStore } from "@/store/useTeacherStore";

function MetricTile({
  label,
  value,
  emoji,
  color,
  index,
}: {
  label: string;
  value: string | number;
  emoji: string;
  color: string;
  index: number;
}) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 120 + index * 60, type: "spring", damping: 20 }}
      style={[Shadow.sm, { width: "48%" }]}
      className="min-h-[118px] rounded-2xl bg-bg-card p-4 border border-border"
    >
      <View className="flex-row items-start justify-between">
        <Text style={{ fontSize: 26 }}>{emoji}</Text>
        <Text className="text-2xl font-extrabold" style={{ color }}>
          {value}
        </Text>
      </View>
      <Text className="mt-4 text-sm font-bold text-text-muted">{label}</Text>
    </MotiView>
  );
}

function InsightCard({
  title,
  body,
  color,
  index,
}: {
  title: string;
  body: string;
  color: string;
  index: number;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: 380 + index * 80, type: "spring", damping: 20 }}
      style={[Shadow.sm, { borderColor: color }]}
      className="rounded-2xl border bg-bg-card p-4 gap-2"
    >
      <Text className="text-base font-extrabold text-text">{title}</Text>
      <Text className="text-sm leading-5 text-text-muted">{body}</Text>
    </MotiView>
  );
}

export default function TeacherReportsScreen() {
  const user = useAuthStore((state) => state.user);
  const stats = useTeacherStore((state) => state.stats);
  const courses = useCoursesStore((state) => state.courses);

  const teacherCourses = useMemo(
    () => courses.filter((course) => course.teacherId === user?.id),
    [courses, user?.id]
  );

  const totalLessons = teacherCourses.reduce(
    (sum, course) => sum + course.totalLessons,
    0
  );
  const activeRate =
    stats.totalStudents > 0
      ? Math.round((stats.activeToday / stats.totalStudents) * 100)
      : 0;
  const attentionCount = stats.studentsNeedingAttention.length;

  const insights = [
    {
      title: "Hoạt động hôm nay",
      body:
        stats.totalStudents === 0
          ? "Lớp chưa có học sinh, hãy chia sẻ mã lớp để bắt đầu theo dõi."
          : `${activeRate}% học sinh đã hoạt động trong ngày hôm nay.`,
      color: Colors.info.DEFAULT,
    },
    {
      title: "Tiến độ trung bình",
      body:
        stats.avgCompletionRate >= 70
          ? "Lớp đang giữ nhịp học tốt, có thể thêm bài nâng cao."
          : "Nên chia nhỏ bài học hoặc tạo thêm quiz ngắn để tăng hoàn thành.",
      color: Colors.success.DEFAULT,
    },
    {
      title: "Học sinh cần hỗ trợ",
      body:
        attentionCount > 0
          ? `${attentionCount} học sinh có streak thấp hoặc ít hoạt động.`
          : "Chưa có học sinh nào cần chú ý đặc biệt trong dữ liệu hiện tại.",
      color: Colors.error.DEFAULT,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        <View className="px-5 pt-6 gap-5">
          <View className="gap-1">
            <Text className="text-4xl font-extrabold text-text">Báo cáo</Text>
            <Text className="text-base text-text-muted">
              Tổng quan nhanh về lớp học của bạn
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-3">
            <MetricTile
              label="Học sinh"
              value={stats.totalStudents}
              emoji="👥"
              color={Colors.primary.DEFAULT}
              index={0}
            />
            <MetricTile
              label="Hoạt động hôm nay"
              value={`${activeRate}%`}
              emoji="⚡"
              color={Colors.success.DEFAULT}
              index={1}
            />
            <MetricTile
              label="Hoàn thành TB"
              value={`${stats.avgCompletionRate}%`}
              emoji="📈"
              color={Colors.info.DEFAULT}
              index={2}
            />
            <MetricTile
              label="Bài học"
              value={totalLessons}
              emoji="📚"
              color={Colors.secondary.DEFAULT}
              index={3}
            />
          </View>

          <View className="gap-3">
            <Text className="text-2xl font-extrabold text-text">Nhận định</Text>
            {insights.map((insight, index) => (
              <InsightCard
                key={insight.title}
                title={insight.title}
                body={insight.body}
                color={insight.color}
                index={index}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
