// filepath: app/_layout.tsx
import "@/global.css";
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore, subscribeToAuthChanges } from "@/store/useAuthStore";
import { useProgressStore } from "@/store/useProgressStore";

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const user = useAuthStore((s) => s.user);
  const resetProgress = useProgressStore((s) => s.reset);
  const hydrateProgress = useProgressStore((s) => s.hydrateProgress);
  const resetStreakIfNeeded = useProgressStore((s) => s.resetStreakIfNeeded);

  useEffect(() => {
    // 1. Restore auth session from AsyncStorage
    hydrate();

    // 2. Listen for Supabase auth state changes (e.g. sign-out from another device)
    const unsubscribe = subscribeToAuthChanges();
    return unsubscribe;
  }, []);

  useEffect(() => {
    // When user logs in, load their progress
    if (user?.id) {
      hydrateProgress(user.id);
      resetStreakIfNeeded();
    } else {
      // Logged out — clear progress state
      resetProgress();
    }
  }, [user?.id]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#F8F7FF" />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(student)" />
        <Stack.Screen name="(teacher)" />
      </Stack>
    </SafeAreaProvider>
  );
}
