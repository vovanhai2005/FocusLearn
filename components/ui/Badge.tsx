// filepath: components/ui/Badge.tsx
import React from "react";
import { Text, View } from "react-native";
import { MotiView } from "moti";

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
  return (
    <MotiView
      from={pulse ? { scale: 1 } : undefined}
      animate={pulse ? { scale: 1.06 } : { scale: 1 }}
      transition={
        pulse
          ? { loop: true, type: "timing", duration: 600 }
          : { type: "spring", damping: 20 }
      }
    >
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
    </MotiView>
  );
}

export default Badge;
