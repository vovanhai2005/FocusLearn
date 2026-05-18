// filepath: app/(teacher)/course/[id].tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { MotiView } from "moti";
import { Colors, Shadow } from "@/constants/theme";
import { useCoursesStore, type LessonFormData } from "@/store/useCoursesStore";
import { VideoUploadButton } from "@/components/features/VideoUploadButton";
import type { Lesson, LessonType } from "@/types";

// ─── CONSTANTS ────────────────────────────────────────────────

const COLOR_MAP: Record<string, string> = {
  primary: Colors.primary.DEFAULT,
  success: Colors.success.DEFAULT,
  secondary: Colors.secondary.DEFAULT,
  warning: Colors.warning.DEFAULT,
  info: Colors.info.DEFAULT,
  error: Colors.error.DEFAULT,
};

const LESSON_TYPE_OPTIONS: { type: LessonType; label: string; emoji: string }[] = [
  { type: "video", label: "Video", emoji: "🎬" },
  { type: "quiz", label: "Quiz", emoji: "❓" },
  { type: "reading", label: "Đọc", emoji: "📖" },
];

const EMPTY_FORM: LessonFormData = {
  title: "",
  emoji: "📖",
  type: "reading",
  durationSeconds: 300,
  xpReward: 20,
};

// ─── LESSON ROW ───────────────────────────────────────────────

function LessonRow({
  lesson,
  index,
  onEdit,
  onDelete,
}: {
  lesson: Lesson;
  index: number;
  onEdit: (lesson: Lesson) => void;
  onDelete: (lesson: Lesson) => void;
}) {
  const mins = Math.floor(lesson.durationSeconds / 60);
  const secs = lesson.durationSeconds % 60;
  const durationLabel = mins > 0 ? `${mins}p${secs > 0 ? ` ${secs}s` : ""}` : `${secs}s`;

  return (
    <MotiView
      from={{ opacity: 0, translateX: -12 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ delay: index * 60, type: "spring", damping: 20 }}
      style={[Shadow.sm, { backgroundColor: Colors.bg.card, borderColor: Colors.border.DEFAULT }]}
      className="rounded-2xl border p-4 flex-row items-center gap-3"
    >
      {/* Order + emoji */}
      <View
        className="h-12 w-12 items-center justify-center rounded-xl"
        style={{ backgroundColor: Colors.primary.subtle }}
      >
        <Text style={{ fontSize: 22 }}>{lesson.emoji}</Text>
      </View>

      {/* Info */}
      <View className="flex-1 gap-1">
        <Text className="text-base font-bold text-text" numberOfLines={2}>
          Bài {index + 1}: {lesson.title}
        </Text>
        <View className="flex-row gap-2 flex-wrap">
          <Text className="text-xs font-semibold text-text-muted bg-bg-muted rounded-full px-2 py-0.5">
            ⏱ {durationLabel}
          </Text>
          <Text className="text-xs font-semibold text-warning-dark bg-warning-subtle rounded-full px-2 py-0.5">
            ⭐ {lesson.xpReward} XP
          </Text>
          <Text className="text-xs font-semibold text-info-dark bg-info-subtle rounded-full px-2 py-0.5">
            {LESSON_TYPE_OPTIONS.find((o) => o.type === lesson.type)?.emoji}{" "}
            {LESSON_TYPE_OPTIONS.find((o) => o.type === lesson.type)?.label}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row gap-1">
        <TouchableOpacity
          onPress={() => onEdit(lesson)}
          className="min-h-[48px] min-w-[48px] items-center justify-center rounded-xl"
          style={{ backgroundColor: Colors.primary.subtle }}
          accessibilityLabel={`Sửa bài ${index + 1}`}
          accessibilityRole="button"
        >
          <Text style={{ fontSize: 20 }}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(lesson)}
          className="min-h-[48px] min-w-[48px] items-center justify-center rounded-xl"
          style={{ backgroundColor: Colors.error.subtle }}
          accessibilityLabel={`Xóa bài ${index + 1}`}
          accessibilityRole="button"
        >
          <Text style={{ fontSize: 20 }}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </MotiView>
  );
}

// ─── LESSON FORM MODAL ────────────────────────────────────────

interface LessonFormModalProps {
  visible: boolean;
  editingLesson: Lesson | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: LessonFormData) => void;
}

function LessonFormModal({
  visible,
  editingLesson,
  isSubmitting,
  onClose,
  onSubmit,
}: LessonFormModalProps) {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("📖");
  const [type, setType] = useState<LessonType>("reading");
  const [durationInput, setDurationInput] = useState("300");
  const [xpInput, setXpInput] = useState("20");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Sync form when editing lesson changes
  useEffect(() => {
    if (editingLesson) {
      setTitle(editingLesson.title);
      setEmoji(editingLesson.emoji);
      setType(editingLesson.type);
      setDurationInput(String(editingLesson.durationSeconds));
      setXpInput(String(editingLesson.xpReward));
      setVideoUrl(editingLesson.videoUrl ?? null);
    } else {
      setTitle(EMPTY_FORM.title);
      setEmoji(EMPTY_FORM.emoji);
      setType(EMPTY_FORM.type);
      setDurationInput(String(EMPTY_FORM.durationSeconds));
      setXpInput(String(EMPTY_FORM.xpReward));
      setVideoUrl(null);
    }
  }, [editingLesson, visible]);

  function handleSubmit() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tiêu đề bài học.");
      return;
    }

    const durationSeconds = parseInt(durationInput, 10);
    const xpReward = parseInt(xpInput, 10);

    if (isNaN(durationSeconds) || durationSeconds <= 0) {
      Alert.alert("Thời lượng không hợp lệ", "Vui lòng nhập số giây > 0.");
      return;
    }
    if (isNaN(xpReward) || xpReward < 0) {
      Alert.alert("XP không hợp lệ", "Vui lòng nhập số XP >= 0.");
      return;
    }

    onSubmit({
      title: trimmedTitle,
      emoji: emoji.trim() || "📖",
      type,
      durationSeconds,
      xpReward,
      videoUrl,
    });
  }

  const isEditing = Boolean(editingLesson);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Overlay */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="flex-1"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        />

        {/* Sheet */}
        <MotiView
          from={{ translateY: 400, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          exit={{ translateY: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 260 }}
          style={{ backgroundColor: Colors.bg.card, maxHeight: "92%" }}
          className="rounded-t-3xl pt-5"
        >
          {/* Handle */}
          <View className="self-center h-1 w-12 rounded-full bg-border mb-4" />

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 20 }}
          >
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-extrabold text-text">
              {isEditing ? "✏️ Sửa bài học" : "➕ Thêm bài học"}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="min-h-[44px] min-w-[44px] items-center justify-center rounded-xl"
              style={{ backgroundColor: Colors.bg.muted }}
              accessibilityLabel="Đóng"
              accessibilityRole="button"
            >
              <Text className="text-lg font-bold text-text-muted">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Title + Emoji row */}
          <View className="gap-2">
            <Text className="text-sm font-bold text-text-muted">Tiêu đề *</Text>
            <View className="flex-row gap-2">
              <TextInput
                value={emoji}
                onChangeText={setEmoji}
                maxLength={2}
                className="min-h-[52px] w-16 rounded-xl border border-border text-center text-2xl"
                style={{ backgroundColor: Colors.bg.muted, color: Colors.text.DEFAULT }}
                placeholder="📖"
                accessibilityLabel="Emoji bài học"
              />
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Nhập tiêu đề bài học..."
                className="flex-1 min-h-[52px] rounded-xl border border-border px-4 text-base font-medium"
                style={{ backgroundColor: Colors.bg.muted, color: Colors.text.DEFAULT }}
                returnKeyType="next"
                accessibilityLabel="Tiêu đề bài học"
              />
            </View>
          </View>

          {/* Lesson type chips */}
          <View className="gap-2">
            <Text className="text-sm font-bold text-text-muted">Loại bài học</Text>
            <View className="flex-row gap-2">
              {LESSON_TYPE_OPTIONS.map((opt) => {
                const isSelected = type === opt.type;
                return (
                  <TouchableOpacity
                    key={opt.type}
                    onPress={() => setType(opt.type)}
                    className="flex-1 min-h-[48px] items-center justify-center rounded-xl border-2"
                    style={{
                      backgroundColor: isSelected ? Colors.primary.subtle : Colors.bg.muted,
                      borderColor: isSelected ? Colors.primary.DEFAULT : Colors.border.DEFAULT,
                    }}
                    accessibilityLabel={opt.label}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                  >
                    <Text style={{ fontSize: 18 }}>{opt.emoji}</Text>
                    <Text
                      className="text-xs font-bold"
                      style={{ color: isSelected ? Colors.primary.dark : Colors.text.muted }}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Duration + XP row */}
          <View className="flex-row gap-3">
            <View className="flex-1 gap-2">
              <Text className="text-sm font-bold text-text-muted">Thời lượng (giây)</Text>
              <TextInput
                value={durationInput}
                onChangeText={setDurationInput}
                keyboardType="number-pad"
                className="min-h-[52px] rounded-xl border border-border px-4 text-base font-medium"
                style={{ backgroundColor: Colors.bg.muted, color: Colors.text.DEFAULT }}
                placeholder="300"
                accessibilityLabel="Thời lượng bài học tính bằng giây"
              />
            </View>
            <View className="flex-1 gap-2">
              <Text className="text-sm font-bold text-text-muted">XP thưởng</Text>
              <TextInput
                value={xpInput}
                onChangeText={setXpInput}
                keyboardType="number-pad"
                className="min-h-[52px] rounded-xl border border-border px-4 text-base font-medium"
                style={{ backgroundColor: Colors.bg.muted, color: Colors.text.DEFAULT }}
                placeholder="20"
                accessibilityLabel="XP thưởng khi hoàn thành bài học"
              />
            </View>
          </View>

          {/* Video upload — only shown when lesson type is video */}
          {type === "video" && (
            <View className="gap-2">
              <Text className="text-sm font-bold text-text-muted">Video bài học</Text>
              <VideoUploadButton
                lessonId={editingLesson?.id ?? null}
                initialVideoUrl={videoUrl}
                onUploadComplete={(url) => setVideoUrl(url)}
                onRemove={() => setVideoUrl(null)}
              />
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className="min-h-[56px] items-center justify-center rounded-2xl"
            style={{ backgroundColor: isSubmitting ? Colors.primary.light : Colors.primary.DEFAULT }}
            accessibilityLabel={isEditing ? "Lưu thay đổi" : "Thêm bài học"}
            accessibilityRole="button"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-lg font-extrabold text-white">
                {isEditing ? "💾 Lưu thay đổi" : "➕ Thêm bài học"}
              </Text>
            )}
          </TouchableOpacity>
          </ScrollView>
        </MotiView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── SCREEN ───────────────────────────────────────────────────

export default function TeacherCourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseId = id ?? "";

  const course = useCoursesStore((s) => s.getCourseById(courseId));
  const fetchTeacherLessons = useCoursesStore((s) => s.fetchTeacherLessons);
  const addLesson = useCoursesStore((s) => s.addLesson);
  const updateLesson = useCoursesStore((s) => s.updateLesson);
  const deleteLesson = useCoursesStore((s) => s.deleteLesson);

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const courseColor = COLOR_MAP[course?.colorKey ?? "primary"] ?? Colors.primary.DEFAULT;

  const loadLessons = useCallback(async () => {
    if (!courseId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTeacherLessons(courseId);
      setLessons(data);
    } catch {
      setError("Không tải được danh sách bài học.");
    } finally {
      setIsLoading(false);
    }
  }, [courseId, fetchTeacherLessons]);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  function openAdd() {
    setEditingLesson(null);
    setModalVisible(true);
  }

  function openEdit(lesson: Lesson) {
    setEditingLesson(lesson);
    setModalVisible(true);
  }

  function handleDelete(lesson: Lesson) {
    Alert.alert(
      "Xóa bài học?",
      `Bài "${lesson.title}" sẽ bị xóa vĩnh viễn.`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            const ok = await deleteLesson(lesson.id);
            if (ok) {
              setLessons((prev) => prev.filter((l) => l.id !== lesson.id));
            } else {
              Alert.alert("Lỗi", "Không thể xóa bài học. Vui lòng thử lại.");
            }
          },
        },
      ]
    );
  }

  async function handleSubmit(data: LessonFormData) {
    setIsSubmitting(true);
    try {
      if (editingLesson) {
        const ok = await updateLesson(editingLesson.id, data);
        if (ok) {
          setLessons((prev) =>
            prev.map((l) =>
              l.id === editingLesson.id
                ? { ...l, ...data, videoUrl: data.videoUrl ?? undefined }
                : l
            )
          );
          setModalVisible(false);
        } else {
          Alert.alert("Lỗi", "Không thể lưu thay đổi. Vui lòng thử lại.");
        }
      } else {
        const newLesson = await addLesson(courseId, data, lessons.length);
        if (newLesson) {
          setLessons((prev) => [...prev, newLesson]);
          setModalVisible(false);
        } else {
          Alert.alert("Lỗi", "Không thể thêm bài học. Vui lòng thử lại.");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!course) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center gap-4 px-5">
        <Text style={{ fontSize: 48 }}>😕</Text>
        <Text className="text-xl font-bold text-text text-center">Không tìm thấy khóa học</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="min-h-[48px] justify-center px-6"
          accessibilityLabel="Quay lại"
          accessibilityRole="button"
        >
          <Text className="text-lg font-semibold text-primary">← Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Hero header ──────────────────────────────── */}
        <View style={{ backgroundColor: courseColor }} className="px-5 pt-4 pb-8 rounded-b-3xl">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center gap-2 mb-5 self-start min-h-[48px] items-center"
            accessibilityLabel="Quay lại danh sách khóa học"
            accessibilityRole="button"
          >
            <Text className="text-2xl text-white">←</Text>
            <Text className="text-base font-semibold text-white opacity-90">Quay lại</Text>
          </TouchableOpacity>

          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", damping: 22 }}
            className="items-center gap-3"
          >
            <Text style={{ fontSize: 60 }}>{course.emoji}</Text>
            <Text className="text-3xl font-extrabold text-white text-center">{course.title}</Text>
            {Boolean(course.description) && (
              <Text className="text-sm text-white opacity-80 text-center">{course.description}</Text>
            )}
          </MotiView>

          {/* Stats pill */}
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 120, type: "spring", damping: 22 }}
            className="mt-5 flex-row gap-3 justify-center"
          >
            <View className="rounded-xl px-4 py-2" style={{ backgroundColor: "rgba(255,255,255,0.22)" }}>
              <Text className="text-sm font-bold text-white">{lessons.length} bài học</Text>
            </View>
            <View className="rounded-xl px-4 py-2" style={{ backgroundColor: "rgba(255,255,255,0.22)" }}>
              <Text className="text-sm font-bold text-white">{course.estimatedMinutes} phút</Text>
            </View>
          </MotiView>
        </View>

        {/* ── Lesson list ──────────────────────────────── */}
        <View className="px-5 pt-6 gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-extrabold text-text">📋 Danh sách bài học</Text>
            <TouchableOpacity
              onPress={openAdd}
              className="min-h-[44px] px-4 items-center justify-center rounded-xl flex-row gap-1"
              style={{ backgroundColor: Colors.primary.DEFAULT }}
              accessibilityLabel="Thêm bài học mới"
              accessibilityRole="button"
            >
              <Text className="text-white font-bold text-sm">＋ Thêm</Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={[Shadow.sm, { backgroundColor: Colors.error.subtle, borderColor: Colors.error.DEFAULT }]}
              className="rounded-2xl border p-4 gap-3"
            >
              <Text className="text-base font-semibold" style={{ color: Colors.error.dark }}>
                {error}
              </Text>
              <TouchableOpacity
                onPress={loadLessons}
                className="self-start min-h-[44px] px-4 justify-center rounded-xl"
                style={{ backgroundColor: Colors.error.DEFAULT }}
                accessibilityLabel="Thử lại"
                accessibilityRole="button"
              >
                <Text className="text-white font-bold">Thử lại</Text>
              </TouchableOpacity>
            </MotiView>
          ) : isLoading ? (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
            </View>
          ) : lessons.length === 0 ? (
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "spring", damping: 22 }}
              className="items-center py-16 gap-3"
            >
              <Text style={{ fontSize: 52 }}>📭</Text>
              <Text className="text-lg font-bold text-text">Chưa có bài học nào</Text>
              <Text className="text-sm text-text-muted text-center px-4">
                Nhấn "＋ Thêm" để tạo bài học đầu tiên cho khóa học này.
              </Text>
            </MotiView>
          ) : (
            <View className="gap-3">
              {lessons.map((lesson, i) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  index={i}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── FAB ─────────────────────────────────────── */}
      {!isLoading && (
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 300, type: "spring", damping: 18 }}
          style={[
            Shadow.float,
            {
              position: "absolute",
              bottom: 28,
              right: 20,
            },
          ]}
        >
          <TouchableOpacity
            onPress={openAdd}
            className="h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: Colors.primary.DEFAULT }}
            accessibilityLabel="Thêm bài học mới"
            accessibilityRole="button"
          >
            <Text style={{ fontSize: 32, color: "#fff", lineHeight: 38 }}>＋</Text>
          </TouchableOpacity>
        </MotiView>
      )}

      {/* ── Form modal ──────────────────────────────── */}
      <LessonFormModal
        visible={modalVisible}
        editingLesson={editingLesson}
        isSubmitting={isSubmitting}
        onClose={() => !isSubmitting && setModalVisible(false)}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}
