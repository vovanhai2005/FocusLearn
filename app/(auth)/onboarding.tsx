// filepath: app/(auth)/onboarding.tsx
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MotiView } from "moti";
import { RoleCard } from "@/components/ui/RoleCard";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/useAuthStore";
import type { Role } from "@/types";

// ─────────────────────────────────────────────────────────────
// SCREEN — Student-first onboarding
// ─────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  // Default to student — the primary user of this app
  const [selectedRole, setSelectedRole] = useState<Role>("student");
  const setRole = useAuthStore((s) => s.setRole);

  function handleContinue() {
    if (!selectedRole) return;
    setRole(selectedRole);
    router.push("/(auth)/login");
  }

  function handleTeacherLogin() {
    setRole("teacher");
    router.push("/(auth)/login");
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-12 pb-8 gap-8">
          {/* ── Logo + App name ─────────────────────────────── */}
          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 200 }}
            className="items-center gap-3"
          >
            <Text style={{ fontSize: 64 }}>🚀</Text>
            <Text className="text-4xl font-extrabold text-primary text-center">
              FocusLearn
            </Text>
            <Text className="text-lg text-text-muted text-center leading-relaxed">
              Học vui — học đúng cách
            </Text>
          </MotiView>

          {/* ── Divider ─────────────────────────────────────── */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 200, type: "timing", duration: 300 }}
            className="items-center"
          >
            <View className="w-16 h-1 rounded-full bg-border" />
          </MotiView>

          {/* ── Student-first hero card ─────────────────────── */}
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 250, type: "spring", damping: 22 }}
            className="items-center gap-5"
          >
            <Text className="text-2xl font-extrabold text-text text-center">
              Chào mừng bạn! 👋
            </Text>

            {/* Primary student card — large and prominent */}
            <MotiView
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 350, type: "spring", damping: 20 }}
              style={{ width: "100%" }}
            >
              <RoleCard
                role="student"
                icon="🎒"
                label="Học sinh"
                description="Xem bài học & làm quiz"
                selected={selectedRole === "student"}
                onPress={() => setSelectedRole("student")}
              />
            </MotiView>
          </MotiView>

          {/* ── Spacer ──────────────────────────────────────── */}
          <View className="flex-1" />

          {/* ── Continue button ─────────────────────────────── */}
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 450, type: "spring", damping: 22 }}
            className="gap-4"
          >
            <Button
              label="Bắt đầu học"
              rightEmoji="→"
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleContinue}
            />

            {/* Teacher link — secondary, smaller */}
            <TouchableOpacity
              onPress={handleTeacherLogin}
              className="items-center min-h-[44px] justify-center"
              accessibilityLabel="Đăng nhập với vai trò giáo viên"
            >
              <Text className="text-base text-text-muted">
                Bạn là giáo viên? <Text className="text-primary font-semibold">Nhấn vào đây</Text>
              </Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
