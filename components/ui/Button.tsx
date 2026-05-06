// filepath: components/ui/Button.tsx
import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";
import { MotiView } from "moti";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<TouchableOpacityProps, "style"> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftEmoji?: string;
  rightEmoji?: string;
  fullWidth?: boolean;
}

// ─────────────────────────────────────────────────────────────
// STYLE MAPS
// ─────────────────────────────────────────────────────────────

const containerVariant: Record<ButtonVariant, string> = {
  primary:   "bg-primary items-center justify-center rounded-button",
  secondary: "bg-secondary items-center justify-center rounded-button",
  outline:   "bg-transparent border-2 border-primary items-center justify-center rounded-button",
  ghost:     "bg-transparent items-center justify-center rounded-button",
};

const containerSize: Record<ButtonSize, string> = {
  sm: "px-4 py-2 min-h-[40px]",
  md: "px-6 py-3 min-h-[48px]",
  lg: "px-8 py-4 min-h-[56px]",
};

const labelVariant: Record<ButtonVariant, string> = {
  primary:   "text-text-inverse font-bold",
  secondary: "text-text-inverse font-bold",
  outline:   "text-primary font-bold",
  ghost:     "text-primary font-semibold",
};

const labelSize: Record<ButtonSize, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
};

const spinnerColor: Record<ButtonVariant, string> = {
  primary:   "#FFFFFF",
  secondary: "#FFFFFF",
  outline:   "#6C63FF",
  ghost:     "#6C63FF",
};

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export function Button({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  leftEmoji,
  rightEmoji,
  fullWidth = false,
  disabled,
  onPress,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <MotiView
      animate={{ scale: isDisabled ? 0.98 : 1, opacity: isDisabled ? 0.6 : 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
    >
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.82}
        className={[
          containerVariant[variant],
          containerSize[size],
          fullWidth ? "w-full" : "self-start",
          "flex-row gap-2",
        ].join(" ")}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={spinnerColor[variant]}
          />
        ) : (
          <>
            {leftEmoji ? (
              <Text className={`${labelSize[size]}`}>{leftEmoji}</Text>
            ) : null}
            <Text className={`${labelVariant[variant]} ${labelSize[size]}`}>
              {label}
            </Text>
            {rightEmoji ? (
              <Text className={`${labelSize[size]}`}>{rightEmoji}</Text>
            ) : null}
          </>
        )}
      </TouchableOpacity>
    </MotiView>
  );
}

export default Button;
