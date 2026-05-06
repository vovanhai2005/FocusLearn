// filepath: components/features/LessonCard.tsx
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MotiView } from "moti";
import { Badge } from "@/components/ui/Badge";
import { Colors, Shadow } from "@/constants/theme";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface LessonCardProps {
  title: string;
  duration: number;        // seconds
  xpReward: number;
  emoji: string;
  isCompleted?: boolean;
  lessonType?: string;     // "video" | "quiz" | "reading"
  onPress?: () => void;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m} phút` : `${m}:${String(s).padStart(2, "0")}`;
}

const typeEmoji: Record<string, string> = {
  video:       "🎬",
  quiz:        "✏️",
  reading:     "📖",
  interactive: "🎮",
};

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export function LessonCard({
  title,
  duration,
  xpReward,
  emoji,
  isCompleted = false,
  lessonType = "video",
  onPress,
}: LessonCardProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 220 }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.82}
        disabled={isCompleted}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${formatDuration(duration)}, ${xpReward} XP${isCompleted ? ", đã hoàn thành" : ""}`}
      >
        <MotiView
          animate={{
            opacity: isCompleted ? 0.72 : 1,
            backgroundColor: isCompleted
              ? Colors.success.subtle
              : Colors.bg.card,
          }}
          transition={{ type: "timing", duration: 200 }}
          style={isCompleted ? Shadow.sm : Shadow.md}
          className="flex-row items-center rounded-card p-4 gap-4 border border-border"
        >
          {/* ── Left: Emoji icon ──────────────────────────── */}
          <MotiView
            animate={{ scale: isCompleted ? 0.92 : 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="w-14 h-14 rounded-xl items-center justify-center"
            style={{
              backgroundColor: isCompleted
                ? Colors.success.light
                : Colors.primary.subtle,
            }}
          >
            <Text style={{ fontSize: 28 }}>{emoji}</Text>
          </MotiView>

          {/* ── Middle: Info ──────────────────────────────── */}
          <View className="flex-1 gap-1">
            <Text
              className="text-lg font-bold text-text"
              numberOfLines={2}
            >
              {title}
            </Text>

            <View className="flex-row items-center gap-3">
              {/* Duration */}
              <Text className="text-sm text-text-muted font-medium">
                ⏱️ {formatDuration(duration)}
              </Text>

              {/* Lesson type */}
              <Text className="text-sm text-text-muted">
                {typeEmoji[lessonType] ?? "📄"} {lessonType}
              </Text>
            </View>
          </View>

          {/* ── Right: XP badge / Done ────────────────────── */}
          <View className="items-end gap-2">
            {isCompleted ? (
              <MotiView
                from={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 12 }}
              >
                <Text style={{ fontSize: 28 }}>✅</Text>
              </MotiView>
            ) : (
              <Badge
                label={`+${xpReward} XP`}
                variant="xp"
                emoji="⭐"
                size="sm"
              />
            )}
          </View>
        </MotiView>
      </TouchableOpacity>
    </MotiView>
  );
}

export default LessonCard;
