// filepath: app/(teacher)/create.tsx
import React, { useMemo, useState } from "react";
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
import { Colors, Shadow, XPConfig } from "@/constants/theme";
import { supabase, type Database } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useAiQuizStore } from "@/store/useAiQuizStore";
import { useCoursesStore } from "@/store/useCoursesStore";
import type {
  GenerateQuizDifficulty,
  GenerateQuizLanguage,
} from "@/types/aiQuiz";

type CourseInsert = Database["public"]["Tables"]["courses"]["Insert"];
type LessonInsert = Database["public"]["Tables"]["lessons"]["Insert"];

// ─────────────────────────────────────────────────────────────
// MOCK OPTIONS
// ─────────────────────────────────────────────────────────────

const EMOJI_OPTIONS = [
  "🔢", "🌿", "📖", "🎨", "🎵", "🔬",
  "🌍", "💡", "🏃", "🖥️", "🎭", "🚀",
];

const COLOR_OPTIONS = [
  { key: "primary",   label: "Tím",        value: Colors.primary.DEFAULT,   subtle: Colors.primary.subtle   },
  { key: "success",   label: "Xanh lá",    value: Colors.success.DEFAULT,   subtle: Colors.success.subtle   },
  { key: "secondary", label: "Cam",        value: Colors.secondary.DEFAULT,  subtle: Colors.secondary.subtle },
  { key: "warning",   label: "Vàng",       value: Colors.warning.DEFAULT,   subtle: Colors.warning.subtle   },
  { key: "info",      label: "Xanh dương", value: Colors.info.DEFAULT,      subtle: Colors.info.subtle      },
  { key: "error",     label: "Đỏ",         value: Colors.error.DEFAULT,     subtle: Colors.error.subtle     },
];

const DIFFICULTY_OPTIONS = [
  { label: "😊 Dễ",   value: "easy"   },
  { label: "🤔 Vừa",  value: "medium" },
  { label: "🔥 Khó",  value: "hard"   },
] as const;

const AI_DIFFICULTY_OPTIONS: readonly {
  label: string;
  value: GenerateQuizDifficulty;
}[] = [
  { label: "Dễ", value: "easy" },
  { label: "Vừa", value: "medium" },
  { label: "Khó", value: "hard" },
  { label: "Trộn", value: "mixed" },
];

const LANGUAGE_OPTIONS: readonly {
  label: string;
  value: GenerateQuizLanguage;
}[] = [
  { label: "Tiếng Việt", value: "vi" },
  { label: "English", value: "en" },
];

type CourseDifficulty = "easy" | "medium" | "hard";

// ─────────────────────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <Text className="text-lg font-bold text-text mb-1">{label}</Text>
  );
}

function mapAiDifficultyToCourseDifficulty(
  value: GenerateQuizDifficulty
): CourseDifficulty {
  return value === "mixed" ? "medium" : value;
}

// ─────────────────────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────────────────────

export default function CreateScreen() {
  const user = useAuthStore((s) => s.user);
  const courses = useCoursesStore((s) => s.courses);
  const hydrateCourses = useCoursesStore((s) => s.hydrateCourses);
  const selectedAsset = useAiQuizStore((s) => s.selectedAsset);
  const numQuestions = useAiQuizStore((s) => s.numQuestions);
  const aiDifficulty = useAiQuizStore((s) => s.difficulty);
  const language = useAiQuizStore((s) => s.language);
  const subject = useAiQuizStore((s) => s.subject);
  const isGenerating = useAiQuizStore((s) => s.isGenerating);
  const aiError = useAiQuizStore((s) => s.error);
  const aiResult = useAiQuizStore((s) => s.result);
  const pickDocument = useAiQuizStore((s) => s.pickDocument);
  const clearDocument = useAiQuizStore((s) => s.clearDocument);
  const setNumQuestions = useAiQuizStore((s) => s.setNumQuestions);
  const setAiDifficulty = useAiQuizStore((s) => s.setDifficulty);
  const setLanguage = useAiQuizStore((s) => s.setLanguage);
  const setSubject = useAiQuizStore((s) => s.setSubject);
  const generateQuiz = useAiQuizStore((s) => s.generate);
  const resetAiQuiz = useAiQuizStore((s) => s.reset);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [courseDifficulty, setCourseDifficulty] =
    useState<CourseDifficulty>("easy");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);
  const [saveQuizError, setSaveQuizError] = useState<string | null>(null);

  const canCreate = title.trim().length >= 3;
  const teacherCourses = useMemo(
    () => courses.filter((course) => course.teacherId === user?.id),
    [courses, user?.id]
  );
  const canSaveAiQuiz = Boolean(
    aiResult &&
      user &&
      !isGenerating &&
      !isSavingQuiz &&
      (selectedCourseId || canCreate)
  );

  // Preview card derived state
  const previewBg = selectedColor.subtle;
  const previewBorder = selectedColor.value;

  async function insertCourse(
    difficultyForCourse: CourseDifficulty
  ): Promise<string> {
    if (!user) {
      throw new Error("Bạn cần đăng nhập bằng tài khoản giáo viên.");
    }

    const payload: CourseInsert = {
      title: title.trim(),
      description: description.trim(),
      emoji: selectedEmoji,
      color_key: selectedColor.key,
      teacher_id: user.id,
      difficulty: difficultyForCourse,
      total_lessons: 0,
      estimated_minutes: 0,
      tags: [],
      is_published: true,
    };
    const { data, error } = await supabase
      .from("courses")
      .insert(payload)
      .select("id")
      .single();

    if (error || !data) {
      throw new Error("Không thể tạo khóa học. Vui lòng thử lại.");
    }

    return data.id;
  }

  async function getNextLessonOrder(courseId: string): Promise<number> {
    const { count, error } = await supabase
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .eq("course_id", courseId);

    if (error) {
      throw new Error("Không thể kiểm tra số bài học hiện có.");
    }

    return (count ?? 0) + 1;
  }

  async function updateCourseStats(
    courseId: string,
    lessonOrder: number,
    durationSeconds: number
  ): Promise<void> {
    const existingCourse = courses.find((course) => course.id === courseId);
    const existingMinutes = existingCourse?.estimatedMinutes ?? 0;
    const estimatedMinutes = existingMinutes + Math.ceil(durationSeconds / 60);
    const totalLessons = Math.max(existingCourse?.totalLessons ?? 0, lessonOrder);

    const { error } = await supabase
      .from("courses")
      .update({
        total_lessons: totalLessons,
        estimated_minutes: estimatedMinutes,
      })
      .eq("id", courseId);

    if (error) {
      throw new Error("Quiz đã lưu, nhưng chưa cập nhật được thống kê khóa học.");
    }
  }

  async function handleCreate() {
    if (!canCreate || !user) return;
    setIsCreating(true);
    setCreateError(null);

    try {
      await insertCourse(courseDifficulty);
      await hydrateCourses();
      Alert.alert(
        "🎉 Tạo thành công!",
        `Khóa học "${title.trim()}" đã được tạo. Bạn có thể thêm bài học ngay bây giờ.`,
        [
          {
            text: "Tuyệt!",
            onPress: () => {
              setTitle("");
              setDescription("");
              setCreateError(null);
            },
          },
        ]
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tạo khóa học. Vui lòng thử lại.";
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSaveAiQuiz() {
    if (!aiResult || !user || !canSaveAiQuiz) return;

    setIsSavingQuiz(true);
    setSaveQuizError(null);

    const createdNewCourse = !selectedCourseId;

    try {
      const courseId =
        selectedCourseId ??
        (await insertCourse(mapAiDifficultyToCourseDifficulty(aiDifficulty)));
      const lessonOrder = await getNextLessonOrder(courseId);
      const durationSeconds = aiResult.quiz.questions.length * 60;
      const xpReward = XPConfig.lessonBase + XPConfig.quizBonus;
      const payload: LessonInsert = {
        course_id: courseId,
        title: aiResult.quiz.title,
        emoji: "",
        type: "quiz",
        duration_seconds: durationSeconds,
        xp_reward: xpReward,
        order: lessonOrder,
        content: JSON.stringify(aiResult.quiz),
        video_url: null,
        is_published: true,
      };

      const { error } = await supabase.from("lessons").insert(payload);
      if (error) {
        throw new Error("Không thể lưu quiz thành bài học. Vui lòng thử lại.");
      }

      await updateCourseStats(courseId, lessonOrder, durationSeconds);
      await hydrateCourses();
      setSelectedCourseId(courseId);

      Alert.alert(
        "Đã lưu quiz",
        `Quiz "${aiResult.quiz.title}" đã được thêm vào khóa học.`,
        [
          {
            text: "Xong",
            onPress: () => {
              resetAiQuiz();
              setSaveQuizError(null);
              if (createdNewCourse) {
                setTitle("");
                setDescription("");
              }
            },
          },
        ]
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể lưu quiz thành bài học. Vui lòng thử lại.";
      setSaveQuizError(message);
    } finally {
      setIsSavingQuiz(false);
    }
  }

  async function handleGenerateQuiz() {
    setSaveQuizError(null);
    await generateQuiz();
  }

  function handleQuestionCountChange(value: string) {
    const parsed = Number.parseInt(value, 10);
    setNumQuestions(Number.isNaN(parsed) ? 1 : parsed);
  }

  function handleSelectCourse(courseId: string) {
    setSelectedCourseId((current) => (current === courseId ? null : courseId));
    setSaveQuizError(null);
  }

  function handleClearDocument() {
    clearDocument();
    setSaveQuizError(null);
  }

  function handlePickDocument() {
    setSaveQuizError(null);
    pickDocument();
  }

  function handleResetAiQuiz() {
    resetAiQuiz();
    setSaveQuizError(null);
  }

  function renderSaveHint() {
    if (!aiResult || selectedCourseId) return null;
    if (canCreate) {
      return (
        <Text className="text-sm text-text-muted text-center">
          Chưa chọn khóa học có sẵn, quiz sẽ được lưu vào khóa học mới từ form phía trên.
        </Text>
      );
    }

    return (
      <Text className="text-sm text-error text-center">
        Nhập tên khóa học phía trên hoặc chọn một khóa học có sẵn để lưu quiz.
      </Text>
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
                  {DIFFICULTY_OPTIONS.find((d) => d.value === courseDifficulty)?.label} ·{" "}
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
                  const isSelected = courseDifficulty === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setCourseDifficulty(opt.value)}
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
              {createError && (
                <Text className="text-sm text-error text-center mt-2">{createError}</Text>
              )}
            </MotiView>

            {/* ── AI quiz generator ─────────────────────────────── */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 500, type: "spring", damping: 22 }}
              style={[Shadow.md, { backgroundColor: Colors.bg.card }]}
              className="rounded-2xl p-5 gap-5"
            >
              <View className="gap-1">
                <Text className="text-2xl font-extrabold text-text">
                  Tạo quiz AI từ tài liệu
                </Text>
                <Text className="text-base text-text-muted">
                  Upload PDF, DOCX, PPTX, TXT hoặc MD để tạo bài quiz trắc nghiệm.
                </Text>
              </View>

              <View className="gap-3">
                <SectionHeader label="Lưu vào khóa học" />
                {teacherCourses.length > 0 ? (
                  <View className="gap-2">
                    {teacherCourses.map((course) => {
                      const isSelected = selectedCourseId === course.id;
                      return (
                        <TouchableOpacity
                          key={course.id}
                          onPress={() => handleSelectCourse(course.id)}
                          activeOpacity={0.8}
                          style={{
                            backgroundColor: isSelected
                              ? Colors.primary.subtle
                              : Colors.bg.muted,
                            borderColor: isSelected
                              ? Colors.primary.DEFAULT
                              : Colors.border.DEFAULT,
                            borderWidth: 2,
                          }}
                          className="rounded-xl px-4 py-3 min-h-[48px] flex-row items-center gap-3"
                        >
                          <Text className="text-2xl">{course.emoji}</Text>
                          <View className="flex-1">
                            <Text className="text-base font-bold text-text" numberOfLines={1}>
                              {course.title}
                            </Text>
                            <Text className="text-sm text-text-muted">
                              {course.totalLessons} bài học
                            </Text>
                          </View>
                          {isSelected && (
                            <Text className="text-lg font-extrabold text-primary">✓</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <Text className="text-sm text-text-muted">
                    Chưa có khóa học nào. Quiz sẽ được lưu vào khóa học mới từ form phía trên.
                  </Text>
                )}
              </View>

              <View className="gap-3">
                <SectionHeader label="Tài liệu bài giảng" />
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Button
                      label="Chọn tài liệu"
                      leftEmoji="📎"
                      variant="outline"
                      size="md"
                      fullWidth
                      onPress={handlePickDocument}
                    />
                  </View>
                  {selectedAsset && (
                    <TouchableOpacity
                      onPress={handleClearDocument}
                      activeOpacity={0.8}
                      className="min-h-[48px] px-4 rounded-xl bg-error-subtle items-center justify-center"
                    >
                      <Text className="text-error font-bold">Xóa</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View
                  style={{
                    backgroundColor: selectedAsset
                      ? Colors.success.subtle
                      : Colors.bg.muted,
                    borderColor: selectedAsset
                      ? Colors.success.DEFAULT
                      : Colors.border.DEFAULT,
                    borderWidth: 1.5,
                  }}
                  className="rounded-xl px-4 py-3 min-h-[48px] justify-center"
                >
                  <Text
                    className="text-base font-semibold text-text"
                    numberOfLines={2}
                  >
                    {selectedAsset?.name ?? "Chưa chọn tài liệu"}
                  </Text>
                </View>
              </View>

              <View className="gap-4">
                <Input
                  label="Số câu hỏi"
                  leftEmoji="🔢"
                  placeholder="10"
                  value={String(numQuestions)}
                  onChangeText={handleQuestionCountChange}
                  keyboardType="number-pad"
                  maxLength={2}
                />

                <View className="gap-3">
                  <SectionHeader label="Độ khó quiz" />
                  <View className="flex-row flex-wrap gap-2.5">
                    {AI_DIFFICULTY_OPTIONS.map((opt) => {
                      const isSelected = aiDifficulty === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          onPress={() => setAiDifficulty(opt.value)}
                          activeOpacity={0.8}
                          style={{
                            backgroundColor: isSelected
                              ? Colors.primary.subtle
                              : Colors.bg.muted,
                            borderColor: isSelected
                              ? Colors.primary.DEFAULT
                              : Colors.border.DEFAULT,
                            borderWidth: 2,
                          }}
                          className="rounded-xl px-4 py-3 min-h-[48px] items-center justify-center"
                        >
                          <Text
                            className="text-base font-bold"
                            style={{
                              color: isSelected
                                ? Colors.primary.DEFAULT
                                : Colors.text.muted,
                            }}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View className="gap-3">
                  <SectionHeader label="Ngôn ngữ" />
                  <View className="flex-row gap-2.5">
                    {LANGUAGE_OPTIONS.map((opt) => {
                      const isSelected = language === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          onPress={() => setLanguage(opt.value)}
                          activeOpacity={0.8}
                          style={{
                            flex: 1,
                            backgroundColor: isSelected
                              ? Colors.info.subtle
                              : Colors.bg.muted,
                            borderColor: isSelected
                              ? Colors.info.DEFAULT
                              : Colors.border.DEFAULT,
                            borderWidth: 2,
                          }}
                          className="rounded-xl px-4 py-3 min-h-[48px] items-center justify-center"
                        >
                          <Text
                            className="text-base font-bold"
                            style={{
                              color: isSelected
                                ? Colors.info.dark
                                : Colors.text.muted,
                            }}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <Input
                  label="Chủ đề (không bắt buộc)"
                  leftEmoji="🏷️"
                  placeholder="VD: Phân số, quang hợp, lịch sử Việt Nam..."
                  value={subject}
                  onChangeText={setSubject}
                  maxLength={80}
                />
              </View>

              <Button
                label="Tạo quiz AI"
                leftEmoji="✨"
                variant="secondary"
                size="lg"
                fullWidth
                disabled={!selectedAsset}
                loading={isGenerating}
                onPress={handleGenerateQuiz}
              />

              {aiError && (
                <View
                  style={{
                    backgroundColor: Colors.error.subtle,
                    borderColor: Colors.error.DEFAULT,
                    borderWidth: 1.5,
                  }}
                  className="rounded-xl p-4"
                >
                  <Text className="text-base font-semibold" style={{ color: Colors.error.dark }}>
                    {aiError}
                  </Text>
                </View>
              )}

              {aiResult && (
                <MotiView
                  from={{ opacity: 0, translateY: 10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: "spring", damping: 20 }}
                  className="gap-4"
                >
                  <View
                    style={{
                      backgroundColor: Colors.primary.subtle,
                      borderColor: Colors.primary.DEFAULT,
                      borderWidth: 1.5,
                    }}
                    className="rounded-2xl p-4 gap-3"
                  >
                    <View className="flex-row items-start gap-3">
                      <Text className="text-3xl">📝</Text>
                      <View className="flex-1 gap-1">
                        <Text className="text-xl font-extrabold text-text">
                          {aiResult.quiz.title}
                        </Text>
                        <Text className="text-sm text-text-muted">
                          {aiResult.quiz.questions.length} câu • {aiResult.quiz.generated_from}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-base text-text leading-6">
                      {aiResult.quiz.summary}
                    </Text>
                  </View>

                  {aiResult.validation_warnings.length > 0 && (
                    <View
                      style={{
                        backgroundColor: Colors.warning.subtle,
                        borderColor: Colors.warning.DEFAULT,
                        borderWidth: 1.5,
                      }}
                      className="rounded-xl p-4 gap-2"
                    >
                      {aiResult.validation_warnings.map((warning) => (
                        <Text
                          key={warning}
                          className="text-sm font-semibold"
                          style={{ color: Colors.warning.dark }}
                        >
                          {warning}
                        </Text>
                      ))}
                    </View>
                  )}

                  <View className="gap-3">
                    <SectionHeader label="Preview câu hỏi" />
                    {aiResult.quiz.questions.slice(0, 3).map((question, index) => (
                      <View
                        key={`${question.question}-${index}`}
                        style={[Shadow.sm, { backgroundColor: Colors.bg.muted }]}
                        className="rounded-xl p-4 gap-2"
                      >
                        <Text className="text-base font-bold text-text">
                          Câu {index + 1}: {question.question}
                        </Text>
                        {question.choices.map((choice) => (
                          <Text
                            key={choice.id}
                            className="text-sm text-text-muted"
                          >
                            {choice.id}. {choice.text}
                          </Text>
                        ))}
                      </View>
                    ))}
                  </View>

                  {renderSaveHint()}

                  <View className="gap-3">
                    <Button
                      label="Lưu quiz thành lesson"
                      leftEmoji="💾"
                      variant="primary"
                      size="lg"
                      fullWidth
                      disabled={!canSaveAiQuiz}
                      loading={isSavingQuiz}
                      onPress={handleSaveAiQuiz}
                    />
                    <Button
                      label="Tạo lại"
                      leftEmoji="🔄"
                      variant="outline"
                      size="md"
                      fullWidth
                      disabled={isSavingQuiz || isGenerating}
                      onPress={handleResetAiQuiz}
                    />
                  </View>
                </MotiView>
              )}

              {saveQuizError && (
                <Text className="text-sm text-error text-center">
                  {saveQuizError}
                </Text>
              )}
            </MotiView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
