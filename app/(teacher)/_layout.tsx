// filepath: app/(teacher)/_layout.tsx
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Tabs } from "expo-router";
import { MotiView } from "moti";
import { Colors, Shadow } from "@/constants/theme";

const TABS = [
  { name: "dashboard", emoji: "📊", label: "Tổng quan" },
  { name: "courses", emoji: "📚", label: "Khóa học" },
  { name: "students", emoji: "👥", label: "Học sinh" },
  { name: "reports", emoji: "📈", label: "Báo cáo" },
  { name: "create", emoji: "➕", label: "Tạo" },
] as const;

function TeacherTabBar({
  state,
  navigation,
}: {
  state: { index: number; routes: { name: string; key: string }[] };
  navigation: {
    emit: (event: object) => { defaultPrevented: boolean };
    dispatch: (action: object) => void;
  };
}) {
  return (
    <View
      style={[
        Shadow.float,
        { backgroundColor: Colors.bg.card, borderTopColor: Colors.border.DEFAULT },
      ]}
      className="flex-row border-t pb-safe pt-2 px-2 gap-0.5"
    >
      {TABS.map((tab, index) => {
        const route = state.routes[index];
        if (!route) return null;

        const isFocused = state.index === index;

        function onPress() {
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
                scale: isFocused ? 1.06 : 1,
                backgroundColor: isFocused ? Colors.primary.subtle : "transparent",
              }}
              transition={{ type: "spring", damping: 18, stiffness: 300 }}
              className="items-center px-2 py-2 rounded-xl gap-0.5"
            >
              <Text style={{ fontSize: isFocused ? 22 : 20 }}>{tab.emoji}</Text>
              <Text
                style={{
                  color: isFocused ? Colors.primary.DEFAULT : Colors.text.muted,
                  fontSize: 11,
                  fontWeight: isFocused ? "700" : "500",
                }}
                numberOfLines={1}
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

export default function TeacherLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TeacherTabBar {...(props as Parameters<typeof TeacherTabBar>[0])} />}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="courses" />
      <Tabs.Screen name="students" />
      <Tabs.Screen name="reports" />
      <Tabs.Screen name="create" />
    </Tabs>
  );
}
