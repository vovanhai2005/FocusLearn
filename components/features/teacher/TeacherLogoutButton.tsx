import React from "react";
import { Alert, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Colors, Shadow } from "@/constants/theme";
import { useAuthStore } from "@/store/useAuthStore";

interface TeacherLogoutButtonProps {
  variant?: "light" | "outline";
}

export function TeacherLogoutButton({
  variant = "outline",
}: TeacherLogoutButtonProps) {
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất tài khoản này không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/onboarding");
        },
      },
    ]);
  }

  const isLight = variant === "light";

  return (
    <TouchableOpacity
      onPress={handleLogout}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel="Đăng xuất tài khoản"
      style={[
        Shadow.sm,
        {
          backgroundColor: isLight ? Colors.bg.card : Colors.error.subtle,
          borderColor: isLight ? "transparent" : Colors.error.DEFAULT,
          borderWidth: isLight ? 0 : 1.5,
        },
      ]}
      className="min-h-[42px] flex-row items-center justify-center gap-2 rounded-xl px-3"
    >
      <Text style={{ fontSize: 18 }}>↪</Text>
      <Text
        className="text-sm font-extrabold"
        style={{ color: isLight ? Colors.primary.DEFAULT : Colors.error.dark }}
        numberOfLines={1}
      >
        Đăng xuất
      </Text>
    </TouchableOpacity>
  );
}

export default TeacherLogoutButton;
