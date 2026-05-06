// filepath: components/ui/Card.tsx
import React from "react";
import { View, type ViewProps } from "react-native";
import { MotiView } from "moti";
import { Shadow, Colors } from "@/constants/theme";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type CardVariant = "default" | "elevated" | "colored";

interface CardProps extends Omit<ViewProps, "style"> {
  variant?: CardVariant;
  /** Background color override — used with `colored` variant */
  color?: string;
  /** Extra padding preset */
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────
// STYLE MAPS
// ─────────────────────────────────────────────────────────────

const paddingClass: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "p-0",
  sm:   "p-3",
  md:   "p-4",
  lg:   "p-5",
};

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export function Card({
  variant = "default",
  color,
  padding = "md",
  className = "",
  children,
  ...rest
}: CardProps) {
  const shadowStyle =
    variant === "elevated" ? Shadow.lg : variant === "default" ? Shadow.md : Shadow.sm;

  const bgColor =
    variant === "colored" && color
      ? color
      : Colors.bg.card;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 250 }}
      style={[{ backgroundColor: bgColor }, shadowStyle]}
      className={[
        "rounded-card overflow-hidden",
        paddingClass[padding],
        className,
      ].join(" ")}
      {...(rest as object)}
    >
      {children}
    </MotiView>
  );
}

export default Card;
