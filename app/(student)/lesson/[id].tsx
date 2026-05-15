// filepath: app/(student)/lesson/[id].tsx
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useVideoPlayer, VideoView as ExpoVideoView } from "expo-video";
import { MotiView } from "moti";
import { Button } from "@/components/ui/Button";
import { AiGeneratedQuizView } from "@/components/features/AiGeneratedQuizView";
import { Colors, Shadow, XPConfig } from "@/constants/theme";
import { useProgressStore } from "@/store/useProgressStore";
import { useCoursesStore } from "@/store/useCoursesStore";
import { MOCK_LESSONS, MOCK_COURSES } from "@/constants/mockData";
import type { AiQuiz } from "@/types/aiQuiz";
import { isAiQuiz } from "@/types/aiQuiz";

// ─────────────────────────────────────────────────────────────
// QUIZ COMPONENT
// ─────────────────────────────────────────────────────────────

function QuizView({
  quiz,
  onComplete,
}: {
  quiz: NonNullable<(typeof MOCK_LESSONS)[string]["quiz"]>;
  onComplete: (isPerfect: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = submitted && selected
    ? quiz.options.find((o) => o.id === selected)?.isCorrect ?? false
    : false;

  function handleSubmit() {
    if (!selected) return;
    setSubmitted(true);
    // No auto-advance — child must press "Tiếp tục" after reading explanation
  }

  function handleRetry() {
    setSelected(null);
    setSubmitted(false);
  }

  return (
    <View className="gap-6">
      {/* Question */}
      <MotiView
        from={{ opacity: 0, translateY: -8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", damping: 22 }}
        style={[Shadow.md, { backgroundColor: Colors.primary.subtle }]}
        className="rounded-2xl p-5 items-center gap-3"
      >
        <Text style={{ fontSize: 48 }}>{quiz.questionEmoji}</Text>
        <Text className="text-2xl font-extrabold text-text text-center">
          {quiz.question}
        </Text>
      </MotiView>

      {/* Options */}
      <View className="gap-3">
        {quiz.options.map((option, i) => {
          const isSelected = selected === option.id;
          const showResult = submitted && isSelected;
          const optionCorrect = option.isCorrect;

          let bgColor: string = Colors.bg.card;
          let borderColor: string = Colors.border.DEFAULT;

          if (showResult) {
            bgColor = optionCorrect ? Colors.success.subtle : Colors.error.subtle;
            borderColor = optionCorrect ? Colors.success.DEFAULT : Colors.error.DEFAULT;
          } else if (isSelected) {
            bgColor = Colors.primary.subtle;
            borderColor = Colors.primary.DEFAULT;
          }

          // Also highlight the correct answer when submitted (even if not selected)
          const showCorrectHint = submitted && !isSelected && optionCorrect;
          if (showCorrectHint) {
            borderColor = Colors.success.light;
          }

          return (
            <MotiView
              key={option.id}
              from={{ opacity: 0, translateX: -12 }}
              animate={{
                opacity: 1,
                translateX: 0,
                scale: submitted && isSelected && !optionCorrect ? [1, 1.02, 0.98, 1] : 1,
              }}
              transition={{ delay: i * 60, type: "spring", damping: 20 }}
            >
              <TouchableOpacity
                onPress={() => !submitted && setSelected(option.id)}
                activeOpacity={submitted ? 1 : 0.8}
                style={[
                  Shadow.sm,
                  { backgroundColor: bgColor, borderColor, borderWidth: 2 },
                ]}
                className="rounded-2xl px-5 min-h-[64px] justify-center flex-row items-center gap-3"
              >
                <View
                  style={{
                    backgroundColor: isSelected ? borderColor : Colors.border.DEFAULT,
                    width: 28, height: 28, borderRadius: 14,
                    alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
                    {option.id.toUpperCase()}
                  </Text>
                </View>
                <Text className="text-lg font-semibold text-text flex-1">
                  {option.text}
                </Text>
                {showResult && (
                  <Text style={{ fontSize: 22 }}>
                    {optionCorrect ? "✅" : "❌"}
                  </Text>
                )}
              </TouchableOpacity>
            </MotiView>
          );
        })}
      </View>

      {/* Feedback / Submit */}
      {submitted ? (
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 20 }}
          style={{
            backgroundColor: isCorrect ? Colors.success.subtle : Colors.error.subtle,
            borderColor: isCorrect ? Colors.success.DEFAULT : Colors.error.DEFAULT,
            borderWidth: 2,
          }}
          className="rounded-2xl p-4 gap-3"
        >
          <Text className="text-xl font-extrabold text-text text-center">
            {isCorrect ? "🎉 Chính xác!" : "😅 Chưa đúng rồi!"}
          </Text>
          <Text className="text-base text-text-muted text-center leading-6">
            {quiz.explanation}
          </Text>
          {!isCorrect && (
            <Button label="Thử lại" leftEmoji="🔄" variant="outline" size="md" fullWidth onPress={handleRetry} />
          )}
          {isCorrect && (
            <Button label="Tiếp tục" rightEmoji="→" variant="primary" size="lg" fullWidth onPress={() => onComplete(true)} />
          )}
        </MotiView>
      ) : (
        <Button
          label="Kiểm tra"
          leftEmoji="✏️"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!selected}
          onPress={handleSubmit}
        />
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// READING COMPONENT — Step-by-step for ADHD
// ─────────────────────────────────────────────────────────────

function ReadingView({
  content,
  onComplete,
}: {
  content: string;
  onComplete: () => void;
}) {
  // Split content into manageable paragraphs/steps
  const paragraphs = content
    .split("\n\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = paragraphs.length;
  const isLastStep = currentStep >= totalSteps - 1;

  return (
    <View className="gap-5">
      {/* Step progress indicator */}
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold text-text-muted">
          📖 Phần {currentStep + 1}/{totalSteps}
        </Text>
        {/* Progress dots */}
        <View className="flex-row gap-1.5">
          {paragraphs.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === currentStep ? 20 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i <= currentStep
                  ? Colors.primary.DEFAULT
                  : Colors.border.DEFAULT,
              }}
            />
          ))}
        </View>
      </View>

      {/* Current paragraph card */}
      <MotiView
        key={currentStep}
        from={{ opacity: 0, translateX: 16 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ type: "spring", damping: 22 }}
        style={[Shadow.sm, { backgroundColor: Colors.bg.card }]}
        className="rounded-2xl p-5"
      >
        <Text
          className="text-lg text-text leading-8"
          accessibilityLabel={paragraphs[currentStep]}
        >
          {paragraphs[currentStep]}
        </Text>
      </MotiView>

      {/* Read-aloud placeholder (for future feature) */}
      <View className="flex-row items-center gap-2 opacity-50">
        <Text style={{ fontSize: 18 }}>🔊</Text>
        <Text className="text-sm text-text-muted">Đọc to (sắp có)</Text>
      </View>

      {/* Navigation buttons */}
      <View className="flex-row gap-3">
        {currentStep > 0 && (
          <View style={{ flex: 1 }}>
            <Button
              label="← Trước"
              variant="outline"
              size="md"
              fullWidth
              onPress={() => setCurrentStep((s) => s - 1)}
            />
          </View>
        )}
        <View style={{ flex: 1 }}>
          {isLastStep ? (
            <Button
              label="Hoàn thành"
              leftEmoji="✅"
              variant="primary"
              size="lg"
              fullWidth
              onPress={onComplete}
            />
          ) : (
            <Button
              label="Tiếp theo →"
              variant="primary"
              size="md"
              fullWidth
              onPress={() => setCurrentStep((s) => s + 1)}
            />
          )}
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// REAL VIDEO PLAYER COMPONENT
// ─────────────────────────────────────────────────────────────

function RealVideoPlayer({ videoUrl, onComplete }: { videoUrl: string; onComplete: () => void }) {
  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = false;
  });

  return (
    <View className="gap-4">
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 20 }}
        style={[Shadow.md, { borderRadius: 16, overflow: "hidden" }]}
        className="aspect-video bg-text"
      >
        <ExpoVideoView player={player} style={{ flex: 1 }} contentFit="contain" nativeControls />
      </MotiView>

      <Button
        label="Tôi đã xem xong!"
        leftEmoji="✅"
        variant="outline"
        size="md"
        fullWidth
        onPress={onComplete}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// VIDEO PLACEHOLDER COMPONENT
// ─────────────────────────────────────────────────────────────

function VideoPlaceholder({ duration, onComplete }: { duration: number; onComplete: () => void }) {
  const mins = Math.floor(duration / 60);
  return (
    <View className="gap-5">
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 20 }}
        style={[Shadow.md, { backgroundColor: Colors.text.DEFAULT }]}
        className="rounded-2xl overflow-hidden aspect-video items-center justify-center gap-3"
      >
        <Text style={{ fontSize: 56 }}>▶️</Text>
        <Text className="text-white text-base font-semibold opacity-80">
          ⏱️ {mins} phút
        </Text>
        <Text className="text-white text-sm opacity-60">Video đang được cập nhật</Text>
      </MotiView>
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 300, type: "spring", damping: 22 }}
        style={{ backgroundColor: Colors.info.subtle, borderColor: Colors.info.DEFAULT, borderWidth: 1.5 }}
        className="rounded-2xl p-4"
      >
        <Text className="text-base font-medium leading-6" style={{ color: Colors.info.dark }}>
          💡 Hãy xem video từ giáo viên, sau đó nhấn hoàn thành nhé!
        </Text>
      </MotiView>
      <Button label="Tôi đã xem xong!" leftEmoji="✅" variant="primary" size="lg" fullWidth onPress={onComplete} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// VIDEO VIEW (DISPATCHER)
// ─────────────────────────────────────────────────────────────

function VideoView({ videoUrl, duration, onComplete }: { videoUrl?: string; duration: number; onComplete: () => void }) {
  if (videoUrl) {
    return <RealVideoPlayer videoUrl={videoUrl} onComplete={onComplete} />;
  }
  return <VideoPlaceholder duration={duration} onComplete={onComplete} />;
}

// ─────────────────────────────────────────────────────────────
// QUIZ PLACEHOLDER COMPONENT
// ─────────────────────────────────────────────────────────────

function QuizPlaceholder({ onComplete }: { onComplete: () => void }) {
  return (
    <View className="gap-5 items-center py-8">
      <Text style={{ fontSize: 48 }}>📝</Text>
      <Text className="text-xl font-bold text-text text-center">Bài tập đang được cập nhật</Text>
      <Button label="Hoàn thành" variant="primary" size="lg" fullWidth onPress={onComplete} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPLETION OVERLAY
// ─────────────────────────────────────────────────────────────

function CompletionOverlay({
  xp,
  isReview,
  nextLessonId,
  courseId,
  onContinue,
}: {
  xp: number;
  isReview: boolean;
  nextLessonId: string | null;
  courseId: string | null;
  onContinue: () => void;
}) {
  // Effort-based feedback messages
  const reviewMessages = [
    "Bạn đã ôn lại bài, rất tốt!",
    "Ôn bài là cách học thông minh!",
    "Giỏi lắm, bạn đã quay lại xem bài!",
  ];
  const freshMessages = [
    "Bạn đã làm rất tốt!",
    "Một bước nhỏ cũng là tiến bộ!",
    "Bạn đã tập trung thêm một chút rồi!",
    "Mỗi ngày một chút, bạn đang làm rất tốt!",
  ];
  const messages = isReview ? reviewMessages : freshMessages;
  const message = messages[Math.floor(Math.random() * messages.length)];

  function handleNext() {
    if (nextLessonId) {
      router.replace(`/(student)/lesson/${nextLessonId}` as `/(student)/lesson/${string}`);
    } else if (courseId) {
      router.replace(`/(student)/course/${courseId}` as `/(student)/course/${string}`);
    } else {
      onContinue();
    }
  }

  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "timing", duration: 300 }}
      className="absolute inset-0 items-center justify-center px-8"
      style={{ backgroundColor: "rgba(108,99,255,0.92)" }}
    >
      <MotiView
        from={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 200 }}
        style={[Shadow.float, { backgroundColor: Colors.bg.card }]}
        className="rounded-3xl p-8 w-full items-center gap-5"
      >
        <Text style={{ fontSize: 72 }}>{isReview ? "📚" : "🎉"}</Text>

        <Text className="text-3xl font-extrabold text-text text-center">
          {isReview ? "Ôn lại xong rồi!" : "Hoàn thành!"}
        </Text>
        <Text className="text-lg text-text-muted text-center">
          {message}
        </Text>

        {/* Only show XP reward for first completion */}
        {!isReview && (
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 300, type: "spring", damping: 14 }}
            style={{ backgroundColor: Colors.warning.subtle, borderColor: Colors.warning.DEFAULT, borderWidth: 2 }}
            className="rounded-2xl px-8 py-4 items-center gap-1"
          >
            <Text style={{ fontSize: 32 }}>⭐</Text>
            <Text style={{ color: Colors.warning.dark, fontSize: 28, fontWeight: "800" }}>
              +{xp} XP
            </Text>
            <Text className="text-sm font-semibold" style={{ color: Colors.warning.dark }}>đã nhận!</Text>
          </MotiView>
        )}

        {/* Smart navigation — next lesson or back to course */}
        {nextLessonId ? (
          <Button label="Bài tiếp theo" rightEmoji="→" variant="primary" size="lg" fullWidth onPress={handleNext} />
        ) : courseId ? (
          <Button label="Quay lại khóa học" rightEmoji="→" variant="primary" size="lg" fullWidth onPress={handleNext} />
        ) : (
          <Button label="Tiếp tục" rightEmoji="→" variant="primary" size="lg" fullWidth onPress={onContinue} />
        )}

        {/* Always allow going back */}
        {(nextLessonId || courseId) && (
          <TouchableOpacity onPress={onContinue} className="min-h-[44px] justify-center">
            <Text className="text-base font-semibold text-text-muted">← Quay lại</Text>
          </TouchableOpacity>
        )}
      </MotiView>
    </MotiView>
  );
}

function parseAiQuizContent(content?: string): AiQuiz | null {
  if (!content) return null;

  try {
    const parsed: unknown = JSON.parse(content);
    return isAiQuiz(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionXp, setCompletionXp] = useState(0);

  const markLessonComplete = useProgressStore((s) => s.markLessonComplete);
  const unlockBadge = useProgressStore((s) => s.unlockBadge);
  const completedLessonIds = useProgressStore((s) => s.completedLessonIds);
  const lesson = useCoursesStore((s) => s.getLessonById(id || ""));
  const courseLessons = useCoursesStore((s) =>
    lesson ? s.getLessonsByCourseId(lesson.courseId) : []
  );
  const course = useCoursesStore((s) =>
    lesson ? s.getCourseById(lesson.courseId) : undefined
  );

  // Fallback to MOCK_LESSONS for quiz data (quiz content not in DB yet)
  const mockLesson = id ? MOCK_LESSONS[id] : undefined;
  const aiQuiz =
    lesson?.type === "quiz" ? parseAiQuizContent(lesson.content) : null;
  // Fallback to MOCK_COURSES for breadcrumb when DB courses aren't loaded
  const mockCourse = lesson
    ? MOCK_COURSES[lesson.courseId]
    : undefined;

  if (!lesson) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center gap-4">
        <Text style={{ fontSize: 48 }}>😕</Text>
        <Text className="text-xl font-bold text-text">Không tìm thấy bài học</Text>
        <TouchableOpacity onPress={() => router.back()} className="min-h-[48px] justify-center">
          <Text className="text-lg font-semibold text-primary">← Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isAlreadyCompleted = completedLessonIds.includes(lesson.id);

  // Lesson position and next lesson
  const lessonIndex = courseLessons.findIndex((l) => l.id === lesson.id);
  const totalLessons = courseLessons.length;
  const nextLesson = lessonIndex >= 0 && lessonIndex < totalLessons - 1
    ? courseLessons[lessonIndex + 1]
    : null;
  const courseTitle = course?.title ?? mockCourse?.title ?? "";

  function handleComplete(isPerfect = false) {
    if (!isAlreadyCompleted) {
      const bonus = isPerfect ? XPConfig.perfectBonus : 0;
      const xpReward = lesson!.xpReward + bonus;
      markLessonComplete(lesson!.id, xpReward);
      if (isPerfect) {
        unlockBadge("perfect_quiz");
      }
      setCompletionXp(xpReward);
    } else {
      setCompletionXp(lesson!.xpReward);
    }
    setShowCompletion(true);
  }

  const typeLabel: Record<string, string> = {
    video: "🎬 Video",
    quiz: "✏️ Quiz",
    reading: "📖 Đọc",
    interactive: "🎮 Tương tác",
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* ── Focus Mode Header — minimal, no XP during lesson ── */}
        <View
          style={{ backgroundColor: Colors.primary.DEFAULT }}
          className="px-5 pt-4 pb-6 rounded-b-3xl gap-3"
        >
          {/* Back + breadcrumb */}
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center gap-2 self-start min-h-[44px]"
            >
              <Text className="text-xl text-white">←</Text>
              <Text className="text-base font-semibold text-white opacity-90">Quay lại</Text>
            </TouchableOpacity>

            {/* Lesson position indicator */}
            {totalLessons > 0 && (
              <View className="rounded-badge px-3 py-1" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                <Text className="text-sm font-bold text-white">
                  Bài {lessonIndex + 1}/{totalLessons}
                </Text>
              </View>
            )}
          </View>

          {/* Breadcrumb */}
          {courseTitle ? (
            <Text className="text-sm text-white opacity-70" numberOfLines={1}>
              {courseTitle} › {lesson.title}
            </Text>
          ) : null}

          {/* Title + type (no XP in Focus Mode) */}
          <View className="flex-row items-center gap-4">
            <View
              className="w-14 h-14 rounded-2xl items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <Text style={{ fontSize: 28 }}>{lesson.emoji}</Text>
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-xl font-extrabold text-white" numberOfLines={2}>
                {lesson.title}
              </Text>
              <Text className="text-sm text-white opacity-80">
                {typeLabel[lesson.type]}
              </Text>
            </View>
          </View>

          {isAlreadyCompleted && (
            <View className="flex-row items-center gap-2 bg-success rounded-xl px-4 py-2 self-start">
              <Text className="text-white font-bold text-base">✅ Đã hoàn thành — đang ôn lại</Text>
            </View>
          )}
        </View>

        {/* ── Lesson Content ───────────────────────────────── */}
        <View className="px-5 pt-6">
          {lesson.type === "quiz" && aiQuiz ? (
            <AiGeneratedQuizView
              quiz={aiQuiz}
              onComplete={(isPerfect) => handleComplete(isPerfect)}
            />
          ) : lesson.type === "quiz" && mockLesson?.quiz ? (
            <QuizView
              quiz={mockLesson.quiz}
              onComplete={(isPerfect) => handleComplete(isPerfect)}
            />
          ) : lesson.type === "quiz" && !mockLesson?.quiz ? (
            <QuizPlaceholder onComplete={() => handleComplete()} />
          ) : lesson.type === "reading" && lesson.content ? (
            <ReadingView content={lesson.content} onComplete={() => handleComplete()} />
          ) : (
            <VideoView
              videoUrl={lesson.videoUrl}
              duration={lesson.durationSeconds}
              onComplete={() => handleComplete()}
            />
          )}
        </View>
      </ScrollView>

      {/* ── Completion overlay ───────────────────────────── */}
      {showCompletion && (
        <CompletionOverlay
          xp={completionXp || lesson.xpReward}
          isReview={isAlreadyCompleted}
          nextLessonId={nextLesson?.id ?? null}
          courseId={lesson.courseId}
          onContinue={() => {
            setShowCompletion(false);
            router.back();
          }}
        />
      )}
    </SafeAreaView>
  );
}
