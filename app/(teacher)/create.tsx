// filepath: app/(teacher)/create.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView } from "moti";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Colors, Shadow } from "@/constants/theme";

// ─────────────────────────────────────────────────────────────
// MOCK OPTIONS
// ─────────────────────────────────────────────────────────────

const EMOJI_OPTIONS = [
  "🔢", "🌿", "📖", "🎨", "🎵", "🔬",
  "🌍", "💡", "🏃", "🖥️", "🎭", "🚀",
];

const COLOR_OPTIONS = [
  { label: "Tím",    value: Colors.primary.DEFAULT,   subtle: Colors.primary.subtle   },
  { label: "Xanh lá", value: Colors.success.DEFAULT,  subtle: Colors.success.subtle   },
  { label: "Cam",    value: Colors.secondary.DEFAULT,  subtle: Colors.secondary.subtle },
  { label: "Vàng",   value: Colors.warning.DEFAULT,   subtle: Colors.warning.subtle   },
  { label: "Xanh dương", value: Colors.info.DEFAULT,  subtle: Colors.info.subtle      },
  { label: "Đỏ",    value: Colors.error.DEFAULT,      subtle: Colors.error.subtle     },
];

const DIFFICULTY_OPTIONS = [
  { label: "😊 Dễ",   value: "easy"   },
  { label: "🤔 Vừa",  value: "medium" },
  { label: "🔥 Khó",  value: "hard"   },
] as const;

type Difficulty = "easy" | "medium" | "hard";

// ─────────────────────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <Text className="text-lg font-bold text-text mb-1">{label}</Text>
  );
}

// ─────────────────────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────────────────────

export default function CreateScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [isCreating, setIsCreating] = useState(false);

  const canCreate = title.trim().length >= 3;

  // Preview card derived state
  const previewBg = selectedColor.subtle;
  const previewBorder = selectedColor.value;

  async function handleCreate() {
    if (!canCreate) return;
    setIsCreating(true);

    // TODO: replace with Supabase insert
    await new Promise((res) => setTimeout(res, 1200));
    setIsCreating(false);

    Alert.alert(
      "🎉 Tạo thành công!",
      `Khóa học "${title}" đã được tạo. Bạn có thể thêm bài học ngay bây giờ.`,
      [{ text: "Tuyệt!", onPress: () => { setTitle(""); setDescription(""); } }]
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ──────────────────────────────────────── */}
          <MotiView
            from={{ opacity: 0, translateY: -12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", damping: 22 }}
            className="px-5 pt-6 pb-4 gap-1"
          >
            <Text className="text-4xl font-extrabold text-text">➕ Tạo khóa học</Text>
            <Text className="text-base text-text-muted">
              Tạo micro-lecture cho học sinh của bạn
            </Text>
          </MotiView>

          {/* ── Live preview card ────────────────────────────── */}
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 100, type: "spring", damping: 20 }}
            className="mx-5 mb-5"
          >
            <View
              style={[
                Shadow.md,
                { backgroundColor: previewBg, borderColor: previewBorder, borderWidth: 2 },
              ]}
              className="rounded-2xl p-5 flex-row items-center gap-4"
            >
              <Text style={{ fontSize: 40 }}>{selectedEmoji}</Text>
              <View className="flex-1">
                <Text className="text-xl font-extrabold text-text" numberOfLines={1}>
                  {title.trim() || "Tên khóa học..."}
                </Text>
                <Text className="text-sm text-text-muted mt-0.5">
                  {DIFFICULTY_OPTIONS.find((d) => d.value === difficulty)?.label} ·{" "}
                  {selectedColor.label}
                </Text>
              </View>
            </View>
          </MotiView>

          <View className="px-5 gap-5">
            {/* ── Title & description ─────────────────────────── */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 150, type: "spring", damping: 22 }}
              className="gap-4"
            >
              <Input
                label="Tên khóa học *"
                leftEmoji="📝"
                placeholder="VD: Toán lớp 3 - Phép nhân"
                value={title}
                onChangeText={setTitle}
                maxLength={60}
                returnKeyType="next"
              />
              <Input
                label="Mô tả (không bắt buộc)"
                leftEmoji="💬"
                placeholder="Mô tả ngắn về khóa học..."
                value={description}
                onChangeText={setDescription}
                maxLength={200}
                multiline
              />
            </MotiView>

            {/* ── Emoji picker ────────────────────────────────── */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 220, type: "spring", damping: 22 }}
              className="gap-3"
            >
              <SectionHeader label="🎭 Chọn biểu tượng" />
              <View className="flex-row flex-wrap gap-2.5">
                {EMOJI_OPTIONS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => setSelectedEmoji(emoji)}
                    activeOpacity={0.75}
                    style={{
                      backgroundColor:
                        selectedEmoji === emoji
                          ? Colors.primary.subtle
                          : Colors.bg.muted,
                      borderColor:
                        selectedEmoji === emoji
                          ? Colors.primary.DEFAULT
                          : Colors.border.DEFAULT,
                      borderWidth: 2,
                    }}
                    className="w-14 h-14 rounded-xl items-center justify-center"
                  >
                    <MotiView
                      animate={{ scale: selectedEmoji === emoji ? 1.2 : 1 }}
                      transition={{ type: "spring", damping: 15 }}
                    >
                      <Text style={{ fontSize: 26 }}>{emoji}</Text>
                    </MotiView>
                  </TouchableOpacity>
                ))}
              </View>
            </MotiView>

            {/* ── Color picker ────────────────────────────────── */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 290, type: "spring", damping: 22 }}
              className="gap-3"
            >
              <SectionHeader label="🎨 Màu sắc" />
              <View className="flex-row flex-wrap gap-2.5">
                {COLOR_OPTIONS.map((color) => {
                  const isSelected = selectedColor.value === color.value;
                  return (
                    <TouchableOpacity
                      key={color.value}
                      onPress={() => setSelectedColor(color)}
                      activeOpacity={0.8}
                      style={{
                        borderColor: isSelected ? color.value : Colors.border.DEFAULT,
                        borderWidth: isSelected ? 3 : 1.5,
                        ...Shadow.sm,
                      }}
                      className="rounded-xl overflow-hidden"
                    >
                      <MotiView
                        animate={{ scale: isSelected ? 1.06 : 1 }}
                        transition={{ type: "spring", damping: 15 }}
                        style={{ backgroundColor: color.subtle }}
                        className="px-4 py-2.5 items-center gap-1"
                      >
                        <View
                          style={{
                            backgroundColor: color.value,
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                          }}
                        />
                        <Text className="text-xs font-semibold text-text-muted">
                          {color.label}
                        </Text>
                      </MotiView>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </MotiView>

            {/* ── Difficulty ──────────────────────────────────── */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 360, type: "spring", damping: 22 }}
              className="gap-3"
            >
              <SectionHeader label="📊 Độ khó" />
              <View className="flex-row gap-2.5">
                {DIFFICULTY_OPTIONS.map((opt) => {
                  const isSelected = difficulty === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setDifficulty(opt.value)}
                      activeOpacity={0.8}
                      style={{
                        flex: 1,
                        backgroundColor: isSelected
                          ? Colors.primary.subtle
                          : Colors.bg.muted,
                        borderColor: isSelected
                          ? Colors.primary.DEFAULT
                          : Colors.border.DEFAULT,
                        borderWidth: 2,
                      }}
                      className="rounded-xl py-3 items-center min-h-[48px] justify-center"
                    >
                      <MotiView
                        animate={{ scale: isSelected ? 1.05 : 1 }}
                        transition={{ type: "spring", damping: 15 }}
                      >
                        <Text
                          style={{
                            color: isSelected
                              ? Colors.primary.DEFAULT
                              : Colors.text.muted,
                            fontSize: 14,
                            fontWeight: isSelected ? "700" : "500",
                          }}
                        >
                          {opt.label}
                        </Text>
                      </MotiView>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </MotiView>

            {/* ── Create button ────────────────────────────────── */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 430, type: "spring", damping: 22 }}
            >
              <Button
                label="Tạo khóa học"
                leftEmoji="🚀"
                variant="primary"
                size="lg"
                fullWidth
                disabled={!canCreate}
                loading={isCreating}
                onPress={handleCreate}
              />
              {!canCreate && (
                <Text className="text-sm text-text-muted text-center mt-2">
                  Tên khóa học phải có ít nhất 3 ký tự
                </Text>
              )}
            </MotiView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
