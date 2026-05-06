// filepath: app/(auth)/login.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MotiView } from "moti";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/useAuthStore";

// ─────────────────────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const role = useAuthStore((s) => s.role);
  const loginWithCode = useAuthStore((s) => s.loginWithCode);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const isTeacher = role === "teacher";
  const roleEmoji = isTeacher ? "👩‍🏫" : "🎒";
  const roleLabel = isTeacher ? "Giáo viên" : "Học sinh";

  async function handleLogin() {
    if (!name.trim() || !code.trim()) return;
    clearError();
    const success = await loginWithCode(name.trim(), code.trim());
    if (success) {
      // Navigate to the correct home based on role
      if (isTeacher) {
        router.replace("/(teacher)/dashboard");
      } else {
        router.replace("/(student)/home");
      }
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-10 pb-8 gap-6">
            {/* ── Back button ──────────────────────────────── */}
            <MotiView
              from={{ opacity: 0, translateX: -12 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: "spring", damping: 22 }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex-row items-center gap-2 self-start min-h-[48px] min-w-[48px] items-center"
                accessibilityLabel="Quay lại"
              >
                <Text className="text-2xl">←</Text>
                <Text className="text-lg font-semibold text-text-muted">
                  Quay lại
                </Text>
              </TouchableOpacity>
            </MotiView>

            {/* ── Header ───────────────────────────────────── */}
            <MotiView
              from={{ opacity: 0, translateY: -16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 100, type: "spring", damping: 22 }}
              className="items-center gap-3"
            >
              <Text style={{ fontSize: 56 }}>{roleEmoji}</Text>
              <Text className="text-4xl font-extrabold text-text text-center">
                Xin chào, {roleLabel}!
              </Text>
              <View className="flex-row items-center gap-2 bg-primary-subtle rounded-badge px-4 py-2">
                <Text className="text-base font-semibold text-primary">
                  Đăng nhập bằng mã số
                </Text>
              </View>
            </MotiView>

            {/* ── Form ─────────────────────────────────────── */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 200, type: "spring", damping: 22 }}
              className="gap-5"
            >
              <Input
                label="Tên của bạn"
                leftEmoji="✏️"
                placeholder="Nhập tên của bạn..."
                value={name}
                onChangeText={(t) => { setName(t); clearError(); }}
                autoCapitalize="words"
                returnKeyType="next"
                maxLength={50}
              />

              <Input
                label="Mã số"
                leftEmoji="🔑"
                placeholder="Nhập mã số 6 chữ số..."
                value={code}
                onChangeText={(t) => { setCode(t); clearError(); }}
                keyboardType="number-pad"
                maxLength={6}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                error={error ?? undefined}
              />
            </MotiView>

            {/* ── Hint ─────────────────────────────────────── */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 350, type: "timing", duration: 300 }}
              className="bg-info-subtle rounded-xl p-4 border border-info"
            >
              <Text className="text-base text-info-dark font-medium leading-6">
                💡 {isTeacher
                  ? "Giáo viên nhận mã số từ quản trị viên nhà trường."
                  : "Học sinh nhận mã số từ giáo viên của mình."}
              </Text>
            </MotiView>

            {/* ── Spacer ───────────────────────────────────── */}
            <View className="flex-1" />

            {/* ── Login button ─────────────────────────────── */}
            <MotiView
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 400, type: "spring", damping: 22 }}
            >
              <Button
                label="Đăng nhập"
                leftEmoji="🚀"
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
                disabled={!name.trim() || !code.trim()}
                onPress={handleLogin}
              />
            </MotiView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
