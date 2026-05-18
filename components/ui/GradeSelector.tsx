// filepath: components/ui/GradeSelector.tsx
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { MotiView } from "moti";
import { Colors } from "@/constants/theme";
import { GRADE_OPTIONS, type Grade } from "@/types";

interface GradeSelectorProps {
  selectedGrade: Grade | null;
  onGradeChange: (grade: Grade) => void;
}

export function GradeSelector({ selectedGrade, onGradeChange }: GradeSelectorProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: 190, type: "spring", damping: 22 }}
      className="gap-3"
    >
      <Text className="text-lg font-bold text-text">🎓 Dành cho lớp nào? *</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}
      >
        {GRADE_OPTIONS.map((option) => {
          const isSelected = selectedGrade === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onGradeChange(option.value)}
              activeOpacity={0.75}
              style={{
                backgroundColor: isSelected
                  ? Colors.primary.DEFAULT
                  : Colors.bg.card,
                borderColor: Colors.primary.DEFAULT,
                borderWidth: 2,
                borderRadius: 24,
                minHeight: 48,
                paddingHorizontal: 16,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MotiView
                animate={{ scale: isSelected ? 1 : 0.95 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                style={{ alignItems: "center" }}
              >
                <Text style={{ fontSize: 18 }}>{option.emoji}</Text>
                <Text
                  style={{
                    color: isSelected ? "#FFFFFF" : Colors.primary.DEFAULT,
                    fontSize: 13,
                    fontWeight: "700",
                    marginTop: 1,
                  }}
                >
                  {option.label}
                </Text>
              </MotiView>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </MotiView>
  );
}

export default GradeSelector;
