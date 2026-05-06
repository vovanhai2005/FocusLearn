// filepath: app/(auth)/_layout.tsx
import React from "react";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Slide up animation for auth screens — feels like a bottom sheet flow
        animation: "slide_from_bottom",
        contentStyle: { backgroundColor: "#F8F7FF" },
      }}
    >
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" />
    </Stack>
  );
}
