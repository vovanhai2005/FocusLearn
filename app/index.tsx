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
    // student or parent both go to student home for MVP
    return <Redirect href="/(student)/home" />;
  }

  // Not authenticated → onboarding
  return <Redirect href="/(auth)/onboarding" />;
}
