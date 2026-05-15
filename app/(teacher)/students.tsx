// filepath: app/(teacher)/students.tsx
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { Badge } from "@/components/ui/Badge";
import { Colors, Shadow } from "@/constants/theme";
import { useAuthStore } from "@/store/useAuthStore";
import { useTeacherStore } from "@/store/useTeacherStore";

interface StudentStatsItem {
  user: {
    id: string;
    name: string;
    avatarEmoji: string;
  };
  xp: number;
  streak: number;
  completionRate: number;
}

function StudentCard({
  student,
  variant,
  index,
}: {
  student: StudentStatsItem;
  variant: "attention" | "top";
  index: number;
}) {
  const isAttention = variant === "attention";
  const color = isAttention ? Colors.error.DEFAULT : Colors.success.DEFAULT;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 70, type: "spring", damping: 20 }}
      style={[
        Shadow.sm,
        {
          backgroundColor: isAttention ? Colors.error.subtle : Colors.bg.card,
          borderColor: isAttention ? Colors.error.DEFAULT : Colors.border.DEFAULT,
        },
      ]}
      className="rounded-2xl border p-4"
    >
      <View className="flex-row items-center gap-3">
        <View
          className="h-14 w-14 items-center justify-center rounded-xl"
          style={{ backgroundColor: isAttention ? Colors.bg.card : Colors.success.subtle }}
        >
          <Text style={{ fontSize: 30 }}>{student.user.avatarEmoji}</Text>
        </View>

        <View className="flex-1 gap-1">
          <Text className="text-lg font-extrabold text-text" numberOfLines={1}>
            {student.user.name}
          </Text>
          <Text className="text-sm text-text-muted">
            {Math.round(student.completionRate)}% hoàn thành · {student.xp} XP
          </Text>
        </View>

        <View className="items-end gap-2">
          <Badge
            label={`🔥 ${student.streak}`}
            variant={student.streak > 0 ? "streak" : "default"}
            size="sm"
          />
          <Text className="text-xs font-extrabold" style={{ color }}>
            {isAttention ? "Cần chú ý" : "Tích cực"}
          </Text>
        </View>
      </View>
    </MotiView>
  );
}

export default function TeacherStudentsScreen() {
  const user = useAuthStore((state) => state.user);
  const { stats, isLoading, error, hydrateTeacherData } = useTeacherStore((state) => ({
    stats: state.stats,
    isLoading: state.isLoading,
    error: state.error,
    hydrateTeacherData: state.hydrateTeacherData,
  }));

  const visibleStudents = useMemo(() => {
    const attentionIds = new Set(
      stats.studentsNeedingAttention.map((student) => student.user.id)
    );

    return stats.allStudents.map((student) => ({
      student,
      variant: attentionIds.has(student.user.id)
        ? ("attention" as const)
        : ("top" as const),
    }));
  }, [stats.allStudents, stats.studentsNeedingAttention]);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        <View className="px-5 pt-6 gap-5">
          <View className="gap-1">
            <Text className="text-4xl font-extrabold text-text">Học sinh</Text>
            <Text className="text-base text-text-muted">
              Theo dõi hoạt động và tiến độ của lớp
            </Text>
          </View>

          <View
            style={[Shadow.md, { backgroundColor: Colors.primary.DEFAULT }]}
            className="rounded-2xl p-5 gap-3"
          >
            <Text className="text-sm font-semibold text-white opacity-80">Mã lớp</Text>
            <Text className="text-4xl font-extrabold text-white">
              {user?.accessCode ?? "------"}
            </Text>
            <Text className="text-sm font-medium leading-5 text-white opacity-85">
              Học sinh dùng mã này để tham gia lớp của bạn.
            </Text>
          </View>

          <View className="flex-row gap-3">
            <View style={Shadow.sm} className="flex-1 rounded-2xl bg-bg-card p-4">
              <Text className="text-2xl font-extrabold text-primary">
                {stats.totalStudents}
              </Text>
              <Text className="text-xs font-semibold text-text-muted">Tổng số</Text>
            </View>
            <View style={Shadow.sm} className="flex-1 rounded-2xl bg-bg-card p-4">
              <Text className="text-2xl font-extrabold text-success">
                {stats.activeToday}
              </Text>
              <Text className="text-xs font-semibold text-text-muted">Hôm nay</Text>
            </View>
            <View style={Shadow.sm} className="flex-1 rounded-2xl bg-bg-card p-4">
              <Text className="text-2xl font-extrabold text-error">
                {stats.studentsNeedingAttention.length}
              </Text>
              <Text className="text-xs font-semibold text-text-muted">Cần chú ý</Text>
            </View>
          </View>

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
                Chưa tải được danh sách học sinh.
              </Text>
              <TouchableOpacity
                onPress={() => hydrateTeacherData(user?.id || "")}
                className="self-start rounded-xl bg-primary px-4 py-3"
              >
                <Text className="font-bold text-white">Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : isLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
            </View>
          ) : stats.totalStudents === 0 ? (
            <View className="items-center gap-3 py-12">
              <Text style={{ fontSize: 48 }}>👥</Text>
              <Text className="text-xl font-extrabold text-text">
                Chưa có học sinh nào
              </Text>
              <Text className="text-center text-base leading-6 text-text-muted">
                Chia sẻ mã lớp ở trên để học sinh bắt đầu tham gia.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              <Text className="text-2xl font-extrabold text-text">
                Nổi bật hôm nay
              </Text>
              {visibleStudents.map(({ student, variant }, index) => (
                <StudentCard
                  key={student.user.id}
                  student={student}
                  variant={variant}
                  index={index}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
