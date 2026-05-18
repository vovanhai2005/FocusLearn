// filepath: app/(teacher)/dashboard.tsx
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { router } from "expo-router";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TeacherFeatureGrid } from "@/components/features/teacher/TeacherFeatureGrid";
import { useAuthStore } from "@/store/useAuthStore";
import { useTeacherStore } from "@/store/useTeacherStore";
import { Colors, Shadow } from "@/constants/theme";


// ─────────────────────────────────────────────────────────────
// STAT TILE
// ─────────────────────────────────────────────────────────────

function StatTile({
  emoji,
  value,
  label,
  color,
  index,
}: {
  emoji: string;
  value: string | number;
  label: string;
  color: string;
  index: number;
}) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 150 + index * 70, type: "spring", damping: 18 }}
      style={[Shadow.sm, { backgroundColor: Colors.bg.card, flex: 1 }]}
      className="rounded-2xl p-4 items-center gap-1.5 border border-border"
    >
      <Text style={{ fontSize: 26 }}>{emoji}</Text>
      <Text style={{ color, fontSize: 24, fontWeight: "800" }}>{value}</Text>
      <Text className="text-xs text-text-muted font-medium text-center leading-4">{label}</Text>
    </MotiView>
  );
}

// ─────────────────────────────────────────────────────────────
// STUDENT ROW
// ─────────────────────────────────────────────────────────────

function StudentRow({
  name,
  avatar,
  xp,
  streak,
  completion,
  variant,
  index,
}: {
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  completion: number;
  variant: "attention" | "top";
  index: number;
}) {
  const isAttention = variant === "attention";

  return (
    <MotiView
      from={{ opacity: 0, translateX: isAttention ? -12 : 12 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ delay: 400 + index * 70, type: "spring", damping: 20 }}
      style={[
        Shadow.sm,
        {
          backgroundColor: isAttention ? Colors.error.subtle : Colors.success.subtle,
          borderColor: isAttention ? Colors.error.DEFAULT : Colors.success.DEFAULT,
        },
      ]}
      className="rounded-2xl border p-3 flex-row items-center gap-3"
    >
      <Text style={{ fontSize: 28 }}>{avatar}</Text>

      <View className="flex-1">
        <Text className="text-base font-bold text-text">{name}</Text>
        <Text className="text-sm text-text-muted">
          {completion}% hoàn thành · {xp} XP
        </Text>
      </View>

      <View className="items-end gap-1">
        <Badge
          label={`🔥 ${streak}`}
          variant={streak > 0 ? "streak" : "default"}
          size="sm"
        />
        {isAttention && (
          <Text className="text-xs text-error-dark font-semibold">⚠️ Cần chú ý</Text>
        )}
      </View>
    </MotiView>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { stats, isLoading: isTeacherLoading, error, hydrateTeacherData } = useTeacherStore((s) => ({
    stats: s.stats,
    isLoading: s.isLoading,
    error: s.error,
    hydrateTeacherData: s.hydrateTeacherData,
  }));

  const firstName = user?.name?.split(" ").at(-1) ?? "giáo viên";

  function handleLogout() {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/onboarding");
        },
      },
    ]);
  }

  const teacherFeatures = [
    {
      title: "Khóa học",
      description: "Quản lý nội dung lớp",
      emoji: "📚",
      color: Colors.primary.DEFAULT,
      subtleColor: Colors.primary.subtle,
      metric: String(stats.coursesPublished),
      onPress: () => router.push("/(teacher)/courses"),
    },
    {
      title: "Học sinh",
      description: "Theo dõi từng em",
      emoji: "👥",
      color: Colors.success.DEFAULT,
      subtleColor: Colors.success.subtle,
      metric: String(stats.totalStudents),
      onPress: () => router.push("/(teacher)/students"),
    },
    {
      title: "Báo cáo",
      description: "Xem tiến độ lớp",
      emoji: "📈",
      color: Colors.info.DEFAULT,
      subtleColor: Colors.info.subtle,
      metric: `${stats.avgCompletionRate}%`,
      onPress: () => router.push("/(teacher)/reports"),
    },
    {
      title: "Tạo khóa",
      description: "Thêm bài học mới",
      emoji: "➕",
      color: Colors.secondary.DEFAULT,
      subtleColor: Colors.secondary.subtle,
      onPress: () =>
        router.push({
          pathname: "/(teacher)/create",
          params: { mode: "course" },
        }),
    },
    {
      title: "Quiz AI",
      description: "Sinh câu hỏi nhanh",
      emoji: "✨",
      color: Colors.warning.DEFAULT,
      subtleColor: Colors.warning.subtle,
      onPress: () =>
        router.push({
          pathname: "/(teacher)/create",
          params: { mode: "quiz" },
        }),
    },
    {
      title: "Mã lớp",
      description: user?.accessCode ?? "Chưa có mã",
      emoji: "🔑",
      color: Colors.error.DEFAULT,
      subtleColor: Colors.error.subtle,
      onPress: () => router.push("/(teacher)/students"),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* ── Header ───────────────────────────────────────── */}
        <MotiView
          from={{ opacity: 0, translateY: -14 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 22 }}
          style={[{ backgroundColor: Colors.primary.DEFAULT }, Shadow.md]}
          className="px-5 pt-6 pb-7 rounded-b-3xl gap-3"
        >
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="text-2xl font-extrabold text-white">
                Xin chào, {firstName}! 👩‍🏫
              </Text>
              <Text className="text-base text-white opacity-80 mt-0.5">
                Đây là lớp học của bạn hôm nay
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.84}
              style={[Shadow.sm, { backgroundColor: Colors.error.DEFAULT }]}
              className="rounded-xl px-3 py-2 min-h-[42px] justify-center"
              accessibilityLabel="Sign out"
              accessibilityRole="button"
            >
              <Text className="text-sm font-semibold text-white">Thoát 👋</Text>
            </TouchableOpacity>
          </View>

          {/* Active today pill */}
          <View className="flex-row items-center gap-2 bg-white bg-opacity-15 rounded-xl px-4 py-2 self-start">
            <View className="w-2 h-2 rounded-full bg-success" />
            <Text className="text-sm font-semibold text-white">
              {stats.activeToday}/{stats.totalStudents} học sinh đang học hôm nay
            </Text>
          </View>
        </MotiView>

        <View className="px-5 pt-6">
          <TeacherFeatureGrid items={teacherFeatures} />
        </View>

        {error ? (
          <View className="px-5 pt-6">
            <View style={[Shadow.sm, { backgroundColor: Colors.error.subtle, borderColor: Colors.error.DEFAULT }]} className="rounded-2xl border-2 p-4 gap-3">
              <View className="flex-row items-start gap-3">
                <Text style={{ fontSize: 24 }}>⚠️</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-error">{error}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => hydrateTeacherData(user?.id || "")}
                className="bg-error rounded-lg py-2 px-4 self-start min-h-[44px] justify-center"
                accessibilityLabel="Retry loading teacher data"
                accessibilityRole="button"
              >
                <Text className="text-white font-semibold text-sm">Thử lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : isTeacherLoading ? (
          <View className="flex-1 items-center justify-center py-12">
            <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
          </View>
        ) : stats.totalStudents === 0 ? (
          <View className="px-5 pt-6 items-center gap-3 py-12">
            <Text style={{ fontSize: 48 }}>📚</Text>
            <Text className="text-lg font-bold text-text">Chưa có học sinh nào</Text>
            <Text className="text-sm text-text-muted text-center">
              Chia sẻ mã truy cập để học sinh của bạn tham gia lớp học
            </Text>
          </View>
        ) : (
          <View className="px-5 pt-6 gap-6 pb-6">
            {/* ── Stats grid ──────────────────────────────────── */}
            <View className="gap-3">
              <Text className="text-2xl font-extrabold text-text">📊 Tổng quan</Text>
              <View className="flex-row gap-3">
                <StatTile emoji="👩‍🎓" value={stats.totalStudents} label="Học sinh"        color={Colors.primary.DEFAULT} index={0} />
                <StatTile emoji="⚡"   value={`${stats.avgCompletionRate}%`} label="Tỷ lệ hoàn thành" color={Colors.success.DEFAULT} index={1} />
                <StatTile emoji="📚"   value={stats.coursesPublished}    label="Khóa học"         color={Colors.warning.DEFAULT} index={2} />
              </View>
            </View>

            {/* ── Students needing attention ──────────────────── */}
            {stats.studentsNeedingAttention.length > 0 && (
              <View className="gap-3">
                <View className="flex-row items-center gap-2">
                  <Text className="text-2xl font-extrabold text-text">⚠️ Cần chú ý</Text>
                  <Badge label={`${stats.studentsNeedingAttention.length}`} variant="error" size="sm" />
                </View>
                <Text className="text-sm text-text-muted -mt-1">
                  Học sinh có tiến độ thấp hoặc chưa học hôm nay
                </Text>
                <View className="gap-2.5">
                  {stats.studentsNeedingAttention.map((s, i) => (
                    <StudentRow
                      key={s.user.id}
                      name={s.user.name}
                      avatar={s.user.avatarEmoji}
                      xp={s.xp}
                      streak={s.streak}
                      completion={Math.round(s.completionRate)}
                      variant="attention"
                      index={i}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* ── Top students ────────────────────────────────── */}
            {stats.topStudents.length > 0 && (
              <View className="gap-3">
                <Text className="text-2xl font-extrabold text-text">🏆 Học sinh xuất sắc</Text>
                <View className="gap-2.5">
                  {stats.topStudents.map((s, i) => (
                    <StudentRow
                      key={s.user.id}
                      name={s.user.name}
                      avatar={s.user.avatarEmoji}
                      xp={s.xp}
                      streak={s.streak}
                      completion={Math.round(s.completionRate)}
                      variant="top"
                      index={i}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* ── Quick action ────────────────────────────────── */}
            <MotiView
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 650, type: "spring", damping: 22 }}
            >
              <Button
                label="Tạo khóa học mới"
                leftEmoji="➕"
                variant="primary"
                size="lg"
                fullWidth
                onPress={() => router.push("/(teacher)/create")}
              />
            </MotiView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
