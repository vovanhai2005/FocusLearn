// filepath: components/features/StreakBadge.tsx
import React from "react";
import { Text, View } from "react-native";
import { MotiView } from "moti";
import { Colors, Shadow } from "@/constants/theme";
import { useSettingsStore } from "@/store/useSettingsStore";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface StreakBadgeProps {
  streak: number;
  /** Compact mode — used inline in headers */
  compact?: boolean;
}

// ─────────────────────────────────────────────────────────────
// HELPERS — ADHD-friendly, no pressure language
// ─────────────────────────────────────────────────────────────

function streakLabel(streak: number): string {
  if (streak === 0) return "Hôm nay mình thử 1 bước nhỏ nhé!";
  if (streak === 1) return "1 ngày — bắt đầu tốt lắm!";
  return `${streak} ngày — mỗi ngày một chút!`;
}

function streakColor(streak: number): string {
  if (streak === 0) return Colors.border.DEFAULT;
  if (streak < 3)  return Colors.warning.DEFAULT;
  if (streak < 7)  return Colors.secondary.DEFAULT;
  return Colors.secondary.dark;  // warm color for 7+ days (not error red)
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export function StreakBadge({ streak, compact = false }: StreakBadgeProps) {
  const isActive = streak > 0;
  const color = streakColor(streak);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  if (compact) {
    // ── Inline / header mode ──────────────────────────────────
    return (
      <View className="flex-row items-center gap-1.5 bg-secondary-subtle rounded-badge px-3 py-1.5 border border-secondary">
        {/* Flame icon — no loop animation when reduceMotion is on */}
        {reduceMotion ? (
          <Text style={{ fontSize: 18 }}>🔥</Text>
        ) : (
          <MotiView
            from={isActive ? { scale: 1, rotate: "-3deg" } : undefined}
            animate={isActive ? { scale: 1.1, rotate: "3deg" } : { scale: 1, rotate: "0deg" }}
            transition={
              isActive
                ? { loop: true, type: "timing", duration: 1200 }
                : { type: "timing", duration: 200 }
            }
          >
            <Text style={{ fontSize: 18 }}>🔥</Text>
          </MotiView>
        )}

        <Text
          className="text-base font-bold text-secondary-dark"
          accessibilityLabel={`Ngày học liên tiếp: ${streak}`}
        >
          {streak}
        </Text>
      </View>
    );
  }

  // ── Full / card mode ────────────────────────────────────────
  return (
    <MotiView
      from={reduceMotion ? undefined : { scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={reduceMotion
        ? { type: "timing", duration: 0 }
        : { type: "spring", damping: 18, stiffness: 260 }
      }
      style={[
        Shadow.md,
        {
          borderColor: color,
          backgroundColor: isActive ? Colors.secondary.subtle : Colors.bg.muted,
        },
      ]}
      className="rounded-2xl border-2 p-4 items-center gap-2 min-w-[100px]"
    >
      {/* Flame / growth emoji — static when reduceMotion */}
      {reduceMotion ? (
        <Text style={{ fontSize: 40 }}>{isActive ? "🔥" : "🌱"}</Text>
      ) : (
        <MotiView
          from={isActive ? { scale: 1, rotate: "-5deg" } : undefined}
          animate={isActive ? { scale: 1.15, rotate: "5deg" } : { scale: 1, rotate: "0deg" }}
          transition={
            isActive
              ? { loop: true, type: "timing", duration: 1200 }
              : { type: "timing", duration: 200 }
          }
        >
          <Text style={{ fontSize: 40 }}>{isActive ? "🔥" : "🌱"}</Text>
        </MotiView>
      )}

      {/* Streak number */}
      <Text
        style={{ color, fontSize: 28, fontWeight: "800" }}
        accessibilityLabel={`Ngày học liên tiếp: ${streak}`}
      >
        {streak}
      </Text>

      {/* Label */}
      <Text className="text-sm font-semibold text-text-muted text-center">
        {streakLabel(streak)}
      </Text>

      {/* Gentle nudge when streak is 0 — no pressure */}
      {streak === 0 ? (
        <Text className="text-xs text-text-muted text-center">
          Một bước nhỏ mỗi ngày cũng là tiến bộ
        </Text>
      ) : null}
    </MotiView>
  );
}

export default StreakBadge;
