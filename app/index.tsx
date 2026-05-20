// filepath: app/index.tsx
import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { Colors } from "@/constants/theme";

/**
 * Entry point — acts as a router guard.
 *
 * Decision tree:
 *  isLoading          → show spinner (hydrating session)
 *  isAuthenticated    → redirect to role-based home
 *  else               → redirect to onboarding
 */
export default function Index() {
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);
  const user = useAuthStore((s) => s.user);

  // Loading state while restoring session from AsyncStorage
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
      </View>
    );
  }

  if (isAuthenticated) {
    // Route to the correct home based on role
    if (role === "teacher") {
      return <Redirect href="/(teacher)/dashboard" />;
    }
    // Student/parent: check if grade is set
    if ((role === "student" || role === "parent") && user?.grade === null) {
      return <Redirect href="/(auth)/select-grade" />;
    }
    // student or parent with grade go to student home
    return <Redirect href="/(student)/home" />;
  }

  // Not authenticated → onboarding
  return <Redirect href="/(auth)/onboarding" />;
}
