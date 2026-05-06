// filepath: components/features/StreakBadge.tsx
import React from "react";
import { Text, View } from "react-native";
import { MotiView } from "moti";
import { Colors, Shadow } from "@/constants/theme";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface StreakBadgeProps {
  streak: number;
  /** Compact mode — used inline in headers */
  compact?: boolean;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function streakLabel(streak: number): string {
  if (streak === 0) return "Bắt đầu streak!";
  if (streak === 1) return "1 ngày 🎉";
  return `${streak} ngày`;
}

function streakColor(streak: number): string {
  if (streak === 0) return Colors.border.DEFAULT;
  if (streak < 3)  return Colors.warning.DEFAULT;
  if (streak < 7)  return Colors.secondary.DEFAULT;
  return Colors.error.DEFAULT;   // hot red for 7+ days
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export function StreakBadge({ streak, compact = false }: StreakBadgeProps) {
  const isActive = streak > 0;
  const color = streakColor(streak);

  if (compact) {
    // ── Inline / header mode ──────────────────────────────────
    return (
      <View className="flex-row items-center gap-1.5 bg-secondary-subtle rounded-badge px-3 py-1.5 border border-secondary">
        {/* Flame icon with pulse when active */}
        <MotiView
          from={isActive ? { scale: 1, rotate: "-5deg" } : undefined}
          animate={isActive ? { scale: 1.18, rotate: "5deg" } : { scale: 1, rotate: "0deg" }}
          transition={
            isActive
              ? { loop: true, type: "timing", duration: 700 }
              : { type: "timing", duration: 200 }
          }
        >
          <Text style={{ fontSize: 18 }}>🔥</Text>
        </MotiView>

        <Text
          className="text-base font-bold text-secondary-dark"
          accessibilityLabel={`Streak ${streakLabel(streak)}`}
        >
          {streak}
        </Text>
      </View>
    );
  }

  // ── Full / card mode ────────────────────────────────────────
  return (
    <MotiView
      from={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 18, stiffness: 260 }}
      style={[
        Shadow.md,
        {
          borderColor: color,
          backgroundColor: isActive ? Colors.secondary.subtle : Colors.bg.muted,
        },
      ]}
      className="rounded-2xl border-2 p-4 items-center gap-2 min-w-[100px]"
    >
      {/* Animated flame */}
      <MotiView
        from={isActive ? { scale: 1, rotate: "-8deg" } : undefined}
        animate={isActive ? { scale: 1.2, rotate: "8deg" } : { scale: 1, rotate: "0deg" }}
        transition={
          isActive
            ? { loop: true, type: "timing", duration: 700 }
            : { type: "timing", duration: 200 }
        }
      >
        <Text style={{ fontSize: 40 }}>{isActive ? "🔥" : "❄️"}</Text>
      </MotiView>

      {/* Streak number */}
      <Text
        style={{ color, fontSize: 28, fontWeight: "800" }}
        accessibilityLabel={`Streak ${streak} ngày`}
      >
        {streak}
      </Text>

      {/* Label */}
      <Text className="text-sm font-semibold text-text-muted text-center">
        {streakLabel(streak)}
      </Text>

      {/* "Hôm nay học chưa?" nudge when streak is 0 */}
      {streak === 0 ? (
        <Text className="text-xs text-text-light text-center">
          Học hôm nay nhé!
        </Text>
      ) : null}
    </MotiView>
  );
}

export default StreakBadge;
