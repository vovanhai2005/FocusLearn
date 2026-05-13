// filepath: components/ui/Badge.tsx
import React from "react";
import { Text, View } from "react-native";
import { MotiView } from "moti";
import { useSettingsStore } from "@/store/useSettingsStore";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type BadgeVariant = "xp" | "streak" | "success" | "info" | "error" | "default";
type BadgeSize   = "sm" | "md" | "lg";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  emoji?: string;
  /** Pulse animation — used for streak badge */
  pulse?: boolean;
}

// ─────────────────────────────────────────────────────────────
// STYLE MAPS
// ─────────────────────────────────────────────────────────────

const containerVariant: Record<BadgeVariant, string> = {
  xp:      "bg-warning-subtle border border-warning",
  streak:  "bg-secondary-subtle border border-secondary",
  success: "bg-success-subtle border border-success",
  info:    "bg-info-subtle border border-info",
  error:   "bg-error-subtle border border-error",
  default: "bg-bg-muted border border-border",
};

const textVariant: Record<BadgeVariant, string> = {
  xp:      "text-warning-dark",
  streak:  "text-secondary-dark",
  success: "text-success-dark",
  info:    "text-info-dark",
  error:   "text-error-dark",
  default: "text-text-muted",
};

const containerSize: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 rounded-badge",
  md: "px-3 py-1 rounded-badge",
  lg: "px-4 py-1.5 rounded-badge",
};

const textSize: Record<BadgeSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export function Badge({
  label,
  variant = "default",
  size = "md",
  emoji,
  pulse = false,
}: BadgeProps) {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  // When reduceMotion is on or no pulse requested, render without animation wrapper
  const shouldAnimate = pulse && !reduceMotion;

  const content = (
    <View
      className={[
        "flex-row items-center gap-1 self-start",
        containerVariant[variant],
        containerSize[size],
      ].join(" ")}
    >
      {emoji ? (
        <Text className={textSize[size]}>{emoji}</Text>
      ) : null}
      <Text
        className={`${textVariant[variant]} ${textSize[size]} font-bold`}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );

  if (!shouldAnimate) {
    return content;
  }

  return (
    <MotiView
      from={{ scale: 1 }}
      animate={{ scale: 1.06 }}
      transition={{ loop: true, type: "timing", duration: 1200 }}
    >
      {content}
    </MotiView>
  );
}

export default Badge;
