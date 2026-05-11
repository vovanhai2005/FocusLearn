// filepath: app/_layout.tsx
import "@/global.css";
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore, subscribeToAuthChanges } from "@/store/useAuthStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useCoursesStore } from "@/store/useCoursesStore";
import { useTeacherStore } from "@/store/useTeacherStore";

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const user = useAuthStore((s) => s.user);
  const resetProgress = useProgressStore((s) => s.reset);
  const hydrateProgress = useProgressStore((s) => s.hydrateProgress);
  const resetStreakIfNeeded = useProgressStore((s) => s.resetStreakIfNeeded);
  const syncProgressToSupabase = useProgressStore((s) => s.syncProgressToSupabase);
  const hydrateCourses = useCoursesStore((s) => s.hydrateCourses);
  const resetCourses = useCoursesStore((s) => s.reset);
  const hydrateTeacherData = useTeacherStore((s) => s.hydrateTeacherData);
  const resetTeacherData = useTeacherStore((s) => s.reset);

  useEffect(() => {
    // 1. Restore auth session from AsyncStorage
    hydrate();

    // 2. Listen for Supabase auth state changes (e.g. sign-out from another device)
    const unsubscribe = subscribeToAuthChanges();
    return unsubscribe;
  }, []);

  useEffect(() => {
    // When user logs in, load their progress and courses
    if (user?.id) {
      hydrateProgress(user.id);
      resetStreakIfNeeded();
      hydrateCourses();
      // Load teacher data if user is a teacher
      if (user.role === "teacher") {
        hydrateTeacherData(user.id);
      }
    } else {
      // Logged out — clear progress, courses, and teacher state
      resetProgress();
      resetCourses();
      resetTeacherData();
    }
  }, [user?.id, user?.role, hydrateProgress, resetStreakIfNeeded, hydrateCourses, hydrateTeacherData, resetProgress, resetCourses, resetTeacherData]);

  useEffect(() => {
    // Periodically sync progress to Supabase (every 5 minutes)
    if (!user?.id) return;

    const intervalId = setInterval(() => {
      syncProgressToSupabase(user.id);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(intervalId);
  }, [user?.id, syncProgressToSupabase]);

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
