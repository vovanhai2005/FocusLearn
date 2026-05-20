// filepath: app/(auth)/select-grade.tsx
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MotiView } from "moti";
import { Button } from "@/components/ui/Button";
import { Colors, Shadow } from "@/constants/theme";
import { GRADE_OPTIONS, type Grade } from "@/types";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";

export default function SelectGradeScreen() {
  const user = useAuthStore((s) => s.user);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center gap-4 px-5">
        <Text className="text-xl font-bold text-text">Vui lòng đăng nhập</Text>
        <Button
          label="Quay lại"
          variant="primary"
          fullWidth
          onPress={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  async function handleSelectGrade() {
    if (!selectedGrade || !user) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập và chọn lớp.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("users")
        .update({ grade: selectedGrade })
        .eq("id", user.id);

      if (error) throw error;

      // Update local auth state with grade
      useAuthStore.setState((s) => ({
        user: s.user ? { ...s.user, grade: selectedGrade } : null,
      }));

      // Navigate to student home
      router.replace("/(student)/home");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Có lỗi xảy ra";
      Alert.alert("Lỗi", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
      >
        <View className="flex-1 px-5 pt-8 pb-6 justify-between">
          {/* Header */}
          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", damping: 22 }}
            className="gap-4"
          >
            <View className="items-center gap-3">
              <Text style={{ fontSize: 64 }}>🎓</Text>
              <Text className="text-3xl font-extrabold text-text text-center">
                Bạn học lớp nào?
              </Text>
              <Text className="text-base text-text-muted text-center leading-6">
                Chọn lớp của bạn để xem các khóa học phù hợp với trình độ.
              </Text>
            </View>
          </MotiView>

          {/* Grade grid */}
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 200, type: "spring", damping: 20 }}
            className="gap-4"
          >
            <View className="flex-row flex-wrap gap-3 justify-center">
              {GRADE_OPTIONS.map((option, i) => {
                const isSelected = selectedGrade === option.value;
                return (
                  <MotiView
                    key={option.value}
                    from={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 250 + i * 30, type: "spring", damping: 18 }}
                  >
                    <TouchableOpacity
                      onPress={() => setSelectedGrade(option.value)}
                      activeOpacity={0.75}
                      style={[
                        Shadow.sm,
                        {
                          backgroundColor: isSelected
                            ? Colors.primary.DEFAULT
                            : Colors.bg.card,
                          borderColor: isSelected
                            ? Colors.primary.DEFAULT
                            : Colors.border.DEFAULT,
                          borderWidth: 2,
                          width: "30%",
                          minHeight: 96,
                          borderRadius: 16,
                        },
                      ]}
                      className="items-center justify-center gap-2"
                    >
                      <MotiView
                        animate={{ scale: isSelected ? 1.15 : 1 }}
                        transition={{ type: "spring", damping: 15 }}
                      >
                        <Text style={{ fontSize: 32 }}>{option.emoji}</Text>
                      </MotiView>
                      <Text
                        style={{
                          color: isSelected ? "#FFFFFF" : Colors.text.DEFAULT,
                          fontSize: 14,
                          fontWeight: "700",
                          textAlign: "center",
                        }}
                        numberOfLines={2}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  </MotiView>
                );
              })}
            </View>
          </MotiView>

          {/* CTA */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400, type: "spring", damping: 22 }}
            className="gap-3"
          >
            <Button
              label={isSubmitting ? "Đang xử lý..." : "Vào học thôi! 🚀"}
              variant="primary"
              size="lg"
              fullWidth
              disabled={!selectedGrade || isSubmitting}
              onPress={handleSelectGrade}
            />
            {selectedGrade && (
              <Text className="text-sm text-text-muted text-center">
                Đã chọn: {GRADE_OPTIONS.find((o) => o.value === selectedGrade)?.label}
              </Text>
            )}
          </MotiView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
