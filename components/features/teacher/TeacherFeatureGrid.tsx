// filepath: components/features/teacher/TeacherFeatureGrid.tsx
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MotiView } from "moti";
import { Colors, Shadow } from "@/constants/theme";

export interface TeacherFeatureItem {
  title: string;
  description: string;
  emoji: string;
  color: string;
  subtleColor: string;
  metric?: string;
  onPress: () => void;
}

interface TeacherFeatureGridProps {
  items: TeacherFeatureItem[];
}

export function TeacherFeatureGrid({ items }: TeacherFeatureGridProps) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-2xl font-extrabold text-text">Khu vực giáo viên</Text>
        <Text className="text-sm font-semibold text-text-muted">{items.length} mục</Text>
      </View>

      <View className="flex-row flex-wrap gap-3">
        {items.map((item, index) => (
          <MotiView
            key={item.title}
            from={{ opacity: 0, translateY: 10, scale: 0.96 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ delay: 120 + index * 55, type: "spring", damping: 20 }}
            style={[Shadow.sm, { width: "48%" }]}
          >
            <TouchableOpacity
              activeOpacity={0.84}
              onPress={item.onPress}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              className="min-h-[132px] rounded-2xl border border-border bg-bg-card p-3"
            >
              <View className="flex-row items-start justify-between gap-2">
                <View
                  className="h-12 w-12 items-center justify-center rounded-xl border"
                  style={{ backgroundColor: item.subtleColor, borderColor: item.color }}
                >
                  <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
                </View>
                {item.metric ? (
                  <View
                    className="rounded-full px-2 py-1"
                    style={{ backgroundColor: Colors.bg.muted }}
                  >
                    <Text className="text-xs font-extrabold" style={{ color: item.color }}>
                      {item.metric}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View className="mt-3 gap-1">
                <Text className="text-base font-extrabold text-text" numberOfLines={1}>
                  {item.title}
                </Text>
                <Text className="text-xs font-medium leading-4 text-text-muted" numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
            </TouchableOpacity>
          </MotiView>
        ))}
      </View>
    </View>
  );
}

export default TeacherFeatureGrid;
