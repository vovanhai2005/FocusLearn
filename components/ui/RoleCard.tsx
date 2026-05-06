// filepath: components/ui/RoleCard.tsx
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MotiView } from "moti";
import type { Role } from "@/types";
import { Colors, Shadow } from "@/constants/theme";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface RoleCardProps {
  role: Role;
  icon: string;           // Emoji icon
  label: string;          // Display name, e.g. "Học sinh"
  description: string;    // Short line, e.g. "Xem bài học & làm quiz"
  selected: boolean;
  onPress: () => void;
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export function RoleCard({
  icon,
  label,
  description,
  selected,
  onPress,
}: RoleCardProps) {
  return (
    <MotiView
      animate={{
        scale: selected ? 1.05 : 1,
        borderColor: selected ? Colors.primary.DEFAULT : Colors.border.DEFAULT,
        backgroundColor: selected ? Colors.primary.subtle : Colors.bg.card,
      }}
      transition={{ type: "spring", damping: 18, stiffness: 280 }}
      style={selected ? Shadow.lg : Shadow.sm}
      className="rounded-xl border-2 overflow-hidden"
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        accessibilityLabel={label}
        className="items-center justify-center p-6 gap-3 min-h-[160px] min-w-[140px]"
      >
        {/* Large emoji icon */}
        <MotiView
          animate={{ scale: selected ? 1.15 : 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 250 }}
        >
          <Text style={{ fontSize: 52 }}>{icon}</Text>
        </MotiView>

        {/* Label */}
        <Text
          className={`text-2xl font-bold text-center ${
            selected ? "text-primary" : "text-text"
          }`}
        >
          {label}
        </Text>

        {/* Description */}
        <Text className="text-sm text-text-muted text-center leading-5">
          {description}
        </Text>

        {/* Selected indicator dot */}
        {selected ? (
          <MotiView
            from={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary items-center justify-center"
          >
            <Text className="text-white text-xs font-bold">✓</Text>
          </MotiView>
        ) : null}
      </TouchableOpacity>
    </MotiView>
  );
}

export default RoleCard;
