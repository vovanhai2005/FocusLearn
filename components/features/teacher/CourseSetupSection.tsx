import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MotiView } from "moti";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Colors, Shadow } from "@/constants/theme";
import {
  COLOR_OPTIONS,
  DIFFICULTY_OPTIONS,
  EMOJI_OPTIONS,
  type CourseColorOption,
  type CourseDifficulty,
} from "@/components/features/teacher/teacherCreateOptions";

interface CourseSetupSectionProps {
  title: string;
  description: string;
  selectedEmoji: string;
  selectedColor: CourseColorOption;
  courseDifficulty: CourseDifficulty;
  canCreate: boolean;
  isCreating: boolean;
  createError: string | null;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onEmojiChange: (value: string) => void;
  onColorChange: (value: CourseColorOption) => void;
  onDifficultyChange: (value: CourseDifficulty) => void;
  onCreate: () => void;
}

function SectionHeader({ label }: { label: string }) {
  return <Text className="text-lg font-bold text-text mb-1">{label}</Text>;
}

function CoursePreviewCard({
  title,
  selectedEmoji,
  selectedColor,
  courseDifficulty,
}: Pick<
  CourseSetupSectionProps,
  "title" | "selectedEmoji" | "selectedColor" | "courseDifficulty"
>) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 100, type: "spring", damping: 20 }}
    >
      <View
        style={[
          Shadow.md,
          {
            backgroundColor: selectedColor.subtle,
            borderColor: selectedColor.value,
            borderWidth: 2,
          },
        ]}
        className="rounded-2xl p-5 flex-row items-center gap-4"
      >
        <Text style={{ fontSize: 40 }}>{selectedEmoji}</Text>
        <View className="flex-1">
          <Text className="text-xl font-extrabold text-text" numberOfLines={1}>
            {title.trim() || "Tên khóa học..."}
          </Text>
          <Text className="text-sm text-text-muted mt-0.5">
            {DIFFICULTY_OPTIONS.find((item) => item.value === courseDifficulty)
              ?.label}{" "}
            · {selectedColor.label}
          </Text>
        </View>
      </View>
    </MotiView>
  );
}

function CourseBasicsForm({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: Pick<
  CourseSetupSectionProps,
  "title" | "description" | "onTitleChange" | "onDescriptionChange"
>) {
  return (
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
        onChangeText={onTitleChange}
        maxLength={60}
        returnKeyType="next"
      />
      <Input
        label="Mô tả (không bắt buộc)"
        leftEmoji="💬"
        placeholder="Mô tả ngắn về khóa học..."
        value={description}
        onChangeText={onDescriptionChange}
        maxLength={200}
        multiline
      />
    </MotiView>
  );
}

function EmojiPicker({
  selectedEmoji,
  onEmojiChange,
}: Pick<CourseSetupSectionProps, "selectedEmoji" | "onEmojiChange">) {
  return (
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
            onPress={() => onEmojiChange(emoji)}
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
  );
}

function ColorPicker({
  selectedColor,
  onColorChange,
}: Pick<CourseSetupSectionProps, "selectedColor" | "onColorChange">) {
  return (
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
              onPress={() => onColorChange(color)}
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
  );
}

function DifficultyPicker({
  courseDifficulty,
  onDifficultyChange,
}: Pick<CourseSetupSectionProps, "courseDifficulty" | "onDifficultyChange">) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: 360, type: "spring", damping: 22 }}
      className="gap-3"
    >
      <SectionHeader label="📊 Độ khó" />
      <View className="flex-row gap-2.5">
        {DIFFICULTY_OPTIONS.map((option) => {
          const isSelected = courseDifficulty === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onDifficultyChange(option.value)}
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
                  {option.label}
                </Text>
              </MotiView>
            </TouchableOpacity>
          );
        })}
      </View>
    </MotiView>
  );
}

function CreateCourseAction({
  canCreate,
  isCreating,
  createError,
  onCreate,
}: Pick<
  CourseSetupSectionProps,
  "canCreate" | "isCreating" | "createError" | "onCreate"
>) {
  return (
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
        onPress={onCreate}
      />
      {!canCreate && (
        <Text className="text-sm text-text-muted text-center mt-2">
          Tên khóa học phải có ít nhất 3 ký tự
        </Text>
      )}
      {createError && (
        <Text className="text-sm text-error text-center mt-2">
          {createError}
        </Text>
      )}
    </MotiView>
  );
}

export function CourseSetupSection(props: CourseSetupSectionProps) {
  return (
    <>
      <CoursePreviewCard
        title={props.title}
        selectedEmoji={props.selectedEmoji}
        selectedColor={props.selectedColor}
        courseDifficulty={props.courseDifficulty}
      />
      <CourseBasicsForm
        title={props.title}
        description={props.description}
        onTitleChange={props.onTitleChange}
        onDescriptionChange={props.onDescriptionChange}
      />
      <EmojiPicker
        selectedEmoji={props.selectedEmoji}
        onEmojiChange={props.onEmojiChange}
      />
      <ColorPicker
        selectedColor={props.selectedColor}
        onColorChange={props.onColorChange}
      />
      <DifficultyPicker
        courseDifficulty={props.courseDifficulty}
        onDifficultyChange={props.onDifficultyChange}
      />
      <CreateCourseAction
        canCreate={props.canCreate}
        isCreating={props.isCreating}
        createError={props.createError}
        onCreate={props.onCreate}
      />
    </>
  );
}

export default CourseSetupSection;
