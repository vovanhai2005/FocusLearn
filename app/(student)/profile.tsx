// filepath: app/(student)/profile.tsx
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { router } from "expo-router";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StreakBadge } from "@/components/features/StreakBadge";
import { useAuthStore } from "@/store/useAuthStore";
import { useProgressStore } from "@/store/useProgressStore";
import { Colors, Shadow } from "@/constants/theme";

// ─────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────

function StatCard({
  emoji,
  label,
  value,
  color,
  index,
}: {
  emoji: string;
  label: string;
  value: string | number;
  color: string;
  index: number;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: 300 + index * 80, type: "spring", damping: 20 }}
      style={[Shadow.sm, { backgroundColor: Colors.bg.card, borderColor: color, flex: 1 }]}
      className="rounded-2xl border-2 p-4 items-center gap-1.5 min-w-[90px]"
    >
      <Text style={{ fontSize: 28 }}>{emoji}</Text>
      <Text style={{ color, fontSize: 22, fontWeight: "800" }}>{value}</Text>
      <Text className="text-xs text-text-muted font-medium text-center">{label}</Text>
    </MotiView>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isLoading = useAuthStore((s) => s.isLoading);

  const xp = useProgressStore((s) => s.xp);
  const level = useProgressStore((s) => s.level);
  const streak = useProgressStore((s) => s.streak);
  const longestStreak = useProgressStore((s) => s.longestStreak);
  const completedLessons = useProgressStore((s) => s.completedLessonIds.length);
  const badges = useProgressStore((s) => s.badges.filter((b) => b.isUnlocked));

  function handleLogout() {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc muốn đăng xuất không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/(auth)/onboarding");
          },
        },
      ]
    );
  }

  const stats = [
    { emoji: "⭐", label: "Tổng XP",     value: xp,             color: Colors.warning.DEFAULT },
    { emoji: "🔥", label: "Streak hiện tại", value: streak,      color: Colors.secondary.DEFAULT },
    { emoji: "🏆", label: "Streak dài nhất", value: longestStreak, color: Colors.error.DEFAULT },
    { emoji: "✅", label: "Bài đã xong",  value: completedLessons, color: Colors.success.DEFAULT },
  ];

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* ── Profile card ───────────────────────────────── */}
        <MotiView
          from={{ opacity: 0, translateY: -16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 22 }}
          style={[Shadow.lg, { backgroundColor: Colors.primary.DEFAULT }]}
          className="mx-5 mt-6 rounded-3xl p-6 items-center gap-4"
        >
          {/* Avatar */}
          <MotiView
            from={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 150, type: "spring", damping: 14 }}
            className="w-24 h-24 rounded-full bg-white items-center justify-center"
            style={Shadow.md}
          >
            <Text style={{ fontSize: 48 }}>{user?.avatarEmoji ?? "🦊"}</Text>
          </MotiView>

          {/* Name + Role */}
          <View className="items-center gap-1">
            <Text className="text-3xl font-extrabold text-white text-center">
              {user?.name ?? "Học sinh"}
            </Text>
            <View className="flex-row items-center gap-2 bg-white bg-opacity-20 rounded-badge px-3 py-1">
              <Text className="text-base font-semibold text-white">
                🎒 Học sinh · Cấp {level}
              </Text>
            </View>
          </View>
        </MotiView>

        <View className="px-5 pt-6 gap-6">
          {/* ── Stats grid ──────────────────────────────── */}
          <View className="gap-3">
            <Text className="text-2xl font-extrabold text-text">📊 Thành tích</Text>
            <View className="flex-row gap-3 flex-wrap">
              {stats.map((stat, i) => (
                <StatCard key={stat.label} {...stat} index={i} />
              ))}
            </View>
          </View>

          {/* ── Streak full card ─────────────────────────── */}
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 500, type: "spring", damping: 22 }}
            className="items-center"
          >
            <StreakBadge streak={streak} />
          </MotiView>

          {/* ── Badges ───────────────────────────────────── */}
          <View className="gap-3">
            <Text className="text-2xl font-extrabold text-text">🏅 Huy hiệu</Text>
            {badges.length === 0 ? (
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 550, type: "timing", duration: 300 }}
                style={[Shadow.sm, { backgroundColor: Colors.bg.muted }]}
                className="rounded-2xl p-5 items-center gap-2"
              >
                <Text style={{ fontSize: 36 }}>🎁</Text>
                <Text className="text-base text-text-muted font-medium text-center">
                  Chưa có huy hiệu — bắt đầu học để nhận!
                </Text>
              </MotiView>
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {badges.map((badge, i) => (
                  <MotiView
                    key={badge.id}
                    from={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 550 + i * 60, type: "spring", damping: 14 }}
                  >
                    <Badge
                      label={badge.name}
                      emoji={badge.emoji}
                      variant="success"
                      size="md"
                    />
                  </MotiView>
                ))}
              </View>
            )}
          </View>

          {/* ── Logout button ─────────────────────────────── */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 650, type: "timing", duration: 300 }}
          >
            <Button
              label="Đăng xuất"
              leftEmoji="👋"
              variant="outline"
              size="md"
              fullWidth
              loading={isLoading}
              onPress={handleLogout}
            />
          </MotiView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
