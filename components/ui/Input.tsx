// filepath: components/ui/Input.tsx
import React, { useState, useRef } from "react";
import {
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { MotiView } from "moti";
import { Colors } from "@/constants/theme";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  hint?: string;
  leftEmoji?: string;
  /** Show/hide password toggle handled internally when true */
  secureText?: boolean;
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export function Input({
  label,
  error,
  hint,
  leftEmoji,
  secureText = false,
  value,
  onChangeText,
  placeholder,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureText);

  const hasError = Boolean(error);

  // Border color logic:
  //   error → red | focused → primary | default → border
  const borderColor = hasError
    ? Colors.error.DEFAULT
    : isFocused
    ? Colors.primary.DEFAULT
    : Colors.border.DEFAULT;

  return (
    <View className="w-full gap-1.5">
      {/* Label */}
      {label ? (
        <Text className="text-lg font-semibold text-text">
          {label}
        </Text>
      ) : null}

      {/* Input container with animated border */}
      <MotiView
        animate={{
          borderColor,
          // Subtle background highlight when focused
          backgroundColor: isFocused
            ? Colors.primary.subtle
            : Colors.bg.card,
        }}
        transition={{ type: "timing", duration: 200 }}
        className="flex-row items-center rounded-input border-2 px-4 min-h-[52px] gap-3"
      >
        {/* Left emoji icon */}
        {leftEmoji ? (
          <Text className="text-2xl">{leftEmoji}</Text>
        ) : null}

        {/* Text input */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.light}
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 text-lg text-text font-medium"
          style={{ fontSize: 18 }}   // explicit — NativeWind size may vary
          {...rest}
        />

        {/* Secure toggle */}
        {secureText ? (
          <Text
            onPress={() => setIsSecure((v) => !v)}
            className="text-2xl"
            accessibilityRole="button"
            accessibilityLabel={isSecure ? "Hiện mật khẩu" : "Ẩn mật khẩu"}
          >
            {isSecure ? "🙈" : "👁️"}
          </Text>
        ) : null}
      </MotiView>

      {/* Error message */}
      {hasError ? (
        <MotiView
          from={{ opacity: 0, translateY: -4 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 200 }}
        >
          <Text className="text-base text-error font-medium">
            ⚠️ {error}
          </Text>
        </MotiView>
      ) : null}

      {/* Hint */}
      {hint && !hasError ? (
        <Text className="text-sm text-text-muted">{hint}</Text>
      ) : null}
    </View>
  );
}

export default Input;
