// filepath: app/(auth)/onboarding.tsx
import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MotiView } from "moti";
import { RoleCard } from "@/components/ui/RoleCard";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/useAuthStore";
import type { Role } from "@/types";

// ─────────────────────────────────────────────────────────────
// ROLE DATA
// ─────────────────────────────────────────────────────────────

const ROLES: {
  role: Role;
  icon: string;
  label: string;
  description: string;
}[] = [
  {
    role: "student",
    icon: "🎒",
    label: "Học sinh",
    description: "Xem bài học\n& làm quiz",
  },
  {
    role: "teacher",
    icon: "👩‍🏫",
    label: "Giáo viên",
    description: "Tạo khóa học\n& theo dõi lớp",
  },
];

// ─────────────────────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const setRole = useAuthStore((s) => s.setRole);

  function handleContinue() {
    if (!selectedRole) return;
    setRole(selectedRole);
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

          {/* ── Question heading ─────────────────────────────── */}
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 250, type: "spring", damping: 22 }}
          >
            <Text className="text-3xl font-extrabold text-text text-center">
              Bạn là ai? 🤔
            </Text>
            <Text className="text-base text-text-muted text-center mt-2">
              Chọn vai trò của bạn để bắt đầu
            </Text>
          </MotiView>

          {/* ── Role cards — stagger animation ──────────────── */}
          <View className="flex-row justify-center gap-5">
            {ROLES.map(({ role, icon, label, description }, i) => (
              <MotiView
                key={role}
                from={{ opacity: 0, translateY: 24 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  delay: 350 + i * 100,
                  type: "spring",
                  damping: 20,
                  stiffness: 220,
                }}
              >
                <RoleCard
                  role={role}
                  icon={icon}
                  label={label}
                  description={description}
                  selected={selectedRole === role}
                  onPress={() => setSelectedRole(role)}
                />
              </MotiView>
            ))}
          </View>

          {/* ── Spacer ──────────────────────────────────────── */}
          <View className="flex-1" />

          {/* ── Continue button ─────────────────────────────── */}
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 550, type: "spring", damping: 22 }}
          >
            <Button
              label="Tiếp tục"
              rightEmoji="→"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!selectedRole}
              onPress={handleContinue}
            />

            {!selectedRole && (
              <Text className="text-sm text-text-muted text-center mt-3">
                Chọn một vai trò để tiếp tục
              </Text>
            )}
          </MotiView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
