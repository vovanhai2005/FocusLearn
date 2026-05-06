// filepath: app/(teacher)/_layout.tsx
import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Tabs } from "expo-router";
import { MotiView } from "moti";
import { Colors, Shadow } from "@/constants/theme";

// ─────────────────────────────────────────────────────────────
// TAB CONFIG
// ─────────────────────────────────────────────────────────────

const TABS = [
  { name: "dashboard", emoji: "📊", label: "Dashboard" },
  { name: "create",    emoji: "➕", label: "Tạo mới"   },
] as const;

// ─────────────────────────────────────────────────────────────
// CUSTOM TAB BAR
// ─────────────────────────────────────────────────────────────

function TeacherTabBar({
  state,
  navigation,
}: {
  state: { index: number; routes: { name: string; key: string }[] };
  navigation: { emit: (e: object) => { defaultPrevented: boolean }; dispatch: (a: object) => void };
}) {
  return (
    <View
      style={[
        Shadow.float,
        { backgroundColor: Colors.bg.card, borderTopColor: Colors.border.DEFAULT },
      ]}
      className="flex-row border-t pb-safe pt-2 px-4 gap-1"
    >
      {TABS.map((tab, i) => {
        const isFocused = state.index === i;

        function onPress() {
          const route = state.routes[i];
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.dispatch({ type: "NAVIGATE", payload: { name: route.name } });
          }
        }

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={tab.label}
            className="flex-1 items-center py-2 min-h-[48px] justify-center"
          >
            <MotiView
              animate={{
                scale: isFocused ? 1.12 : 1,
                backgroundColor: isFocused
                  ? Colors.primary.subtle
                  : "transparent",
              }}
              transition={{ type: "spring", damping: 18, stiffness: 300 }}
              className="items-center px-4 py-2 rounded-xl gap-0.5"
            >
              <Text style={{ fontSize: isFocused ? 26 : 22 }}>{tab.emoji}</Text>
              <Text
                style={{
                  color: isFocused ? Colors.primary.DEFAULT : Colors.text.muted,
                  fontSize: 12,
                  fontWeight: isFocused ? "700" : "500",
                }}
              >
                {tab.label}
              </Text>
            </MotiView>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// LAYOUT
// ─────────────────────────────────────────────────────────────

export default function TeacherLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TeacherTabBar {...(props as Parameters<typeof TeacherTabBar>[0])} />}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="create" />
    </Tabs>
  );
}
