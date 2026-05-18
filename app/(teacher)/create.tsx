// filepath: app/(teacher)/create.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AiQuizGeneratorSection } from "@/components/features/teacher/AiQuizGeneratorSection";
import { CourseSetupSection } from "@/components/features/teacher/CourseSetupSection";
import {
  COLOR_OPTIONS,
  EMOJI_OPTIONS,
  type CourseColorOption,
  type CourseDifficulty,
} from "@/components/features/teacher/teacherCreateOptions";
import { Colors, Shadow, XPConfig } from "@/constants/theme";
import { supabase, type Database } from "@/lib/supabase";
import { useAiQuizStore } from "@/store/useAiQuizStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useCoursesStore } from "@/store/useCoursesStore";
import type { Grade } from "@/types";

type CourseInsert = Database["public"]["Tables"]["courses"]["Insert"];
type LessonInsert = Database["public"]["Tables"]["lessons"]["Insert"];
type SourceDocumentInsert =
  Database["public"]["Tables"]["source_documents"]["Insert"];
type AiQuizInsert = Database["public"]["Tables"]["ai_quizzes"]["Insert"];
type AiQuizQuestionInsert =
  Database["public"]["Tables"]["ai_quiz_questions"]["Insert"];
type AiQuizChoiceInsert =
  Database["public"]["Tables"]["ai_quiz_choices"]["Insert"];
type CreateMode = "course" | "quiz";

const CREATE_MODE_TABS: readonly {
  mode: CreateMode;
  label: string;
  emoji: string;
  description: string;
}[] = [
  {
    mode: "course",
    label: "Tạo khóa học",
    emoji: "📚",
    description: "Tạo khóa mới để giao bài cho học sinh",
  },
  {
    mode: "quiz",
    label: "Tạo quiz AI",
    emoji: "✨",
    description: "Upload tài liệu và lưu quiz vào lesson",
  },
];

function dbErrorMessage(
  action: string,
  error: { code?: string; message?: string } | null
): string {
  if (!error?.message) return action;
  return `${action}: ${error.message}`;
}

function CreateModeHeader({
  mode,
  onModeChange,
}: {
  mode: CreateMode;
  onModeChange: (mode: CreateMode) => void;
}) {
  const activeTab = CREATE_MODE_TABS.find((tab) => tab.mode === mode);

  return (
    <View className="px-5 pt-6 gap-4">
      <View className="gap-1">
        <Text className="text-4xl font-extrabold text-text">Tạo nội dung</Text>
        <Text className="text-base text-text-muted">
          {activeTab?.description}
        </Text>
      </View>

      <View
        style={[Shadow.sm, { backgroundColor: Colors.bg.card }]}
        className="flex-row rounded-2xl border border-border p-1.5"
      >
        {CREATE_MODE_TABS.map((tab) => {
          const isActive = tab.mode === mode;

          return (
            <TouchableOpacity
              key={tab.mode}
              onPress={() => onModeChange(tab.mode)}
              activeOpacity={0.85}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              className="flex-1 min-h-[52px] rounded-xl items-center justify-center px-2"
              style={{
                backgroundColor: isActive
                  ? Colors.primary.DEFAULT
                  : "transparent",
              }}
            >
              <Text
                className="text-base font-extrabold text-center"
                numberOfLines={1}
                style={{
                  color: isActive ? Colors.text.inverse : Colors.text.muted,
                }}
              >
                {tab.emoji} {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function CreateScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const user = useAuthStore((state) => state.user);
  const courses = useCoursesStore((state) => state.courses);
  const hydrateCourses = useCoursesStore((state) => state.hydrateCourses);
  const selectedAsset = useAiQuizStore((state) => state.selectedAsset);
  const numQuestions = useAiQuizStore((state) => state.numQuestions);
  const aiDifficulty = useAiQuizStore((state) => state.difficulty);
  const language = useAiQuizStore((state) => state.language);
  const subject = useAiQuizStore((state) => state.subject);
  const isGenerating = useAiQuizStore((state) => state.isGenerating);
  const aiError = useAiQuizStore((state) => state.error);
  const aiResult = useAiQuizStore((state) => state.result);
  const pickDocument = useAiQuizStore((state) => state.pickDocument);
  const clearDocument = useAiQuizStore((state) => state.clearDocument);
  const setNumQuestions = useAiQuizStore((state) => state.setNumQuestions);
  const setAiDifficulty = useAiQuizStore((state) => state.setDifficulty);
  const setLanguage = useAiQuizStore((state) => state.setLanguage);
  const setSubject = useAiQuizStore((state) => state.setSubject);
  const generateQuiz = useAiQuizStore((state) => state.generate);
  const resetAiQuiz = useAiQuizStore((state) => state.reset);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState<string>(EMOJI_OPTIONS[0]);
  const [selectedColor, setSelectedColor] =
    useState<CourseColorOption>(COLOR_OPTIONS[0]);
  const [courseDifficulty, setCourseDifficulty] =
    useState<CourseDifficulty>("easy");
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);
  const [saveQuizError, setSaveQuizError] = useState<string | null>(null);
  const [createMode, setCreateMode] = useState<CreateMode>("course");

  useEffect(() => {
    if (params.mode === "course" || params.mode === "quiz") {
      setCreateMode(params.mode);
    }
  }, [params.mode]);

  const canCreate = title.trim().length >= 3 && selectedGrade !== null;
  const teacherCourses = useMemo(
    () => courses.filter((course) => course.teacherId === user?.id),
    [courses, user?.id]
  );
  const canSaveAiQuiz = Boolean(
    aiResult &&
      user &&
      !isGenerating &&
      !isSavingQuiz &&
      selectedCourseId
  );

  async function insertCourse(
    difficultyForCourse: CourseDifficulty
  ): Promise<string> {
    if (!user) {
      throw new Error("Bạn cần đăng nhập bằng tài khoản giáo viên.");
    }
    if (!selectedGrade) {
      throw new Error("Vui lòng chọn lớp cho khóa học.");
    }

    const payload: CourseInsert = {
      title: title.trim(),
      description: description.trim(),
      emoji: selectedEmoji,
      color_key: selectedColor.key,
      teacher_id: user.id,
      grade: selectedGrade,
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
      throw new Error(dbErrorMessage("Không thể tạo khóa học", error));
    }

    return data.id;
  }

  async function getNextLessonOrder(courseId: string): Promise<number> {
    const { count, error } = await supabase
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .eq("course_id", courseId);

    if (error) {
      throw new Error(dbErrorMessage("Không thể kiểm tra số bài học hiện có", error));
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
      throw new Error(dbErrorMessage("Quiz đã lưu, nhưng chưa cập nhật được thống kê khóa học", error));
    }
  }

  async function insertSourceDocument(): Promise<string | null> {
    if (!user || !selectedAsset) return null;

    const payload: SourceDocumentInsert = {
      teacher_id: user.id,
      file_name: selectedAsset.name,
      mime_type: selectedAsset.mimeType ?? null,
      file_size_bytes: selectedAsset.size ?? null,
      storage_path: null,
      public_url: null,
    };

    const { data, error } = await supabase
      .from("source_documents")
      .insert(payload)
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(dbErrorMessage("Không thể lưu thông tin tài liệu tạo quiz", error));
    }

    return data.id;
  }

  async function insertAiQuizRecords(
    courseId: string,
    lessonId: string
  ): Promise<void> {
    if (!aiResult || !user) return;

    const sourceDocumentId = await insertSourceDocument();
    const rawPayload = JSON.parse(
      JSON.stringify(aiResult.quiz)
    ) as AiQuizInsert["raw_payload"];
    const quizPayload: AiQuizInsert = {
      lesson_id: lessonId,
      course_id: courseId,
      teacher_id: user.id,
      source_document_id: sourceDocumentId,
      title: aiResult.quiz.title,
      summary: aiResult.quiz.summary,
      generated_from: aiResult.quiz.generated_from,
      subject: subject.trim() || null,
      language,
      requested_difficulty: aiDifficulty,
      requested_question_count: numQuestions,
      validation_warnings: aiResult.validation_warnings,
      raw_payload: rawPayload,
    };

    const { data: quizData, error: quizError } = await supabase
      .from("ai_quizzes")
      .insert(quizPayload)
      .select("id")
      .single();

    if (quizError || !quizData) {
      throw new Error(dbErrorMessage("Không thể lưu bộ câu hỏi AI", quizError));
    }

    const questionRows: AiQuizQuestionInsert[] = aiResult.quiz.questions.map(
      (question, index) => ({
        quiz_id: quizData.id,
        order_index: index + 1,
        question_text: question.question,
        correct_choice_id: question.correct_answer,
        explanation: question.explanation,
        difficulty: question.difficulty,
        source_reference: question.source_reference,
        learning_objective: question.learning_objective,
      })
    );

    const { data: savedQuestions, error: questionError } = await supabase
      .from("ai_quiz_questions")
      .insert(questionRows)
      .select("id, order_index");

    if (questionError || !savedQuestions || savedQuestions.length === 0) {
      throw new Error(dbErrorMessage("Không thể lưu danh sách câu hỏi", questionError));
    }

    const questionIdByOrder = new Map<number, string>();
    savedQuestions.forEach((question) => {
      questionIdByOrder.set(question.order_index, question.id);
    });

    const choiceRows: AiQuizChoiceInsert[] = aiResult.quiz.questions.flatMap(
      (question, questionIndex) => {
        const questionId = questionIdByOrder.get(questionIndex + 1);
        if (!questionId) return [];

        return question.choices.map((choice, choiceIndex) => ({
          question_id: questionId,
          choice_id: choice.id,
          order_index: choiceIndex + 1,
          choice_text: choice.text,
          is_correct: choice.id === question.correct_answer,
        }));
      }
    );

    const { error: choiceError } = await supabase
      .from("ai_quiz_choices")
      .insert(choiceRows);

    if (choiceError) {
      throw new Error(dbErrorMessage("Không thể lưu đáp án của quiz", choiceError));
    }
  }

  async function handleCreate() {
    if (!canCreate || !user) return;
    setIsCreating(true);
    setCreateError(null);

    try {
      const courseTitle = title.trim();
      const newCourseId = await insertCourse(courseDifficulty);
      setSelectedCourseId(newCourseId);
      await hydrateCourses();
      setTitle("");
      setDescription("");
      setCreateError(null);

      Alert.alert(
        "Tạo khóa học thành công",
        `Khóa học "${courseTitle}" đã được tạo. Bạn có thể chuyển sang Tạo quiz AI để thêm bài quiz vào khóa này.`,
        [
          {
            text: "Ở lại",
          },
          {
            text: "Tạo quiz",
            onPress: () => setCreateMode("quiz"),
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
    if (!aiResult || !user || !selectedCourseId || !canSaveAiQuiz) return;

    setIsSavingQuiz(true);
    setSaveQuizError(null);

    try {
      const courseId = selectedCourseId;
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

      const { data: lessonData, error } = await supabase
        .from("lessons")
        .insert(payload)
        .select("id")
        .single();
      if (error || !lessonData) {
        throw new Error(dbErrorMessage("Không thể lưu quiz thành bài học", error));
      }

      await insertAiQuizRecords(courseId, lessonData.id);
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

  function handleCreateModeChange(nextMode: CreateMode) {
    setCreateMode(nextMode);
    setCreateError(null);
    setSaveQuizError(null);
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
          <CreateModeHeader
            mode={createMode}
            onModeChange={handleCreateModeChange}
          />
          <View className="px-5 pt-5 gap-5">
            {createMode === "course" ? (
              <CourseSetupSection
                title={title}
                description={description}
                selectedEmoji={selectedEmoji}
                selectedColor={selectedColor}
                courseDifficulty={courseDifficulty}
                selectedGrade={selectedGrade}
                canCreate={canCreate}
                isCreating={isCreating}
                createError={createError}
                onTitleChange={setTitle}
                onDescriptionChange={setDescription}
                onEmojiChange={setSelectedEmoji}
                onColorChange={setSelectedColor}
                onDifficultyChange={setCourseDifficulty}
                onGradeChange={setSelectedGrade}
                onCreate={handleCreate}
              />
            ) : (
              <AiQuizGeneratorSection
                teacherCourses={teacherCourses}
                selectedCourseId={selectedCourseId}
                selectedAsset={selectedAsset}
                numQuestions={numQuestions}
                aiDifficulty={aiDifficulty}
                language={language}
                subject={subject}
                isGenerating={isGenerating}
                aiError={aiError}
                aiResult={aiResult}
                canCreateCourseFromForm={false}
                canSaveAiQuiz={canSaveAiQuiz}
                isSavingQuiz={isSavingQuiz}
                saveQuizError={saveQuizError}
                onSelectCourse={handleSelectCourse}
                onPickDocument={handlePickDocument}
                onClearDocument={handleClearDocument}
                onQuestionCountChange={handleQuestionCountChange}
                onDifficultyChange={setAiDifficulty}
                onLanguageChange={setLanguage}
                onSubjectChange={setSubject}
                onGenerateQuiz={handleGenerateQuiz}
                onSaveAiQuiz={handleSaveAiQuiz}
                onResetAiQuiz={handleResetAiQuiz}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
