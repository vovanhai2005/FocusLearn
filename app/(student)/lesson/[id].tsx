// filepath: app/(student)/lesson/[id].tsx
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { MotiView, AnimatePresence } from "moti";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Colors, Shadow, Animation } from "@/constants/theme";
import { useProgressStore } from "@/store/useProgressStore";
import { MOCK_LESSONS } from "@/constants/mockData";

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
    if (quiz.options.find((o) => o.id === selected)?.isCorrect) {
      setTimeout(() => onComplete(true), 1400);
    }
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

          let bgColor = Colors.bg.card;
          let borderColor = Colors.border.DEFAULT;

          if (showResult) {
            bgColor = optionCorrect ? Colors.success.subtle : Colors.error.subtle;
            borderColor = optionCorrect ? Colors.success.DEFAULT : Colors.error.DEFAULT;
          } else if (isSelected) {
            bgColor = Colors.primary.subtle;
            borderColor = Colors.primary.DEFAULT;
          }

          return (
            <MotiView
              key={option.id}
              from={{ opacity: 0, translateX: -12 }}
              animate={{
                opacity: 1,
                translateX: submitted && !isSelected ? 0 : 0,
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
// READING COMPONENT
// ─────────────────────────────────────────────────────────────

function ReadingView({
  content,
  onComplete,
}: {
  content: string;
  onComplete: () => void;
}) {
  return (
    <View className="gap-5">
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 400 }}
        style={[Shadow.sm, { backgroundColor: Colors.bg.card }]}
        className="rounded-2xl p-5"
      >
        <Text className="text-lg text-text leading-8">{content}</Text>
      </MotiView>
      <Button label="Đã đọc xong!" leftEmoji="✅" variant="primary" size="lg" fullWidth onPress={onComplete} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// VIDEO PLACEHOLDER COMPONENT
// ─────────────────────────────────────────────────────────────

function VideoView({ duration, onComplete }: { duration: number; onComplete: () => void }) {
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
        <Text className="text-base text-info-dark font-medium leading-6">
          💡 Hãy xem video từ giáo viên, sau đó nhấn hoàn thành nhé!
        </Text>
      </MotiView>
      <Button label="Tôi đã xem xong!" leftEmoji="✅" variant="primary" size="lg" fullWidth onPress={onComplete} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPLETION OVERLAY
// ─────────────────────────────────────────────────────────────

function CompletionOverlay({ xp, onContinue }: { xp: number; onContinue: () => void }) {
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
        <MotiView
          from={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ loop: false, type: "timing", duration: 600 }}
        >
          <Text style={{ fontSize: 72 }}>🎉</Text>
        </MotiView>

        <Text className="text-3xl font-extrabold text-text text-center">
          Hoàn thành!
        </Text>
        <Text className="text-lg text-text-muted text-center">
          Bạn đã làm rất tốt!
        </Text>

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
          <Text className="text-sm text-warning-dark font-semibold">đã nhận!</Text>
        </MotiView>

        <Button label="Tiếp tục" rightEmoji="→" variant="primary" size="lg" fullWidth onPress={onContinue} />
      </MotiView>
    </MotiView>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showCompletion, setShowCompletion] = useState(false);

  const markLessonComplete = useProgressStore((s) => s.markLessonComplete);
  const completedLessonIds = useProgressStore((s) => s.completedLessonIds);

  const lesson = id ? MOCK_LESSONS[id] : undefined;

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

  function handleComplete(isPerfect = false) {
    if (!isAlreadyCompleted) {
      const bonus = isPerfect ? 15 : 0;
      markLessonComplete(lesson!.id, lesson!.xpReward + bonus);
    }
    setShowCompletion(true);
  }

  const typeLabel: Record<string, string> = {
    video: "🎬 Video",
    quiz: "✏️ Quiz",
    reading: "📖 Đọc",
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* ── Header ───────────────────────────────────────── */}
        <View
          style={{ backgroundColor: Colors.primary.DEFAULT }}
          className="px-5 pt-4 pb-6 rounded-b-3xl gap-4"
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center gap-2 self-start min-h-[44px] items-center"
          >
            <Text className="text-xl text-white">←</Text>
            <Text className="text-base font-semibold text-white opacity-90">Quay lại</Text>
          </TouchableOpacity>

          <MotiView
            from={{ opacity: 0, translateY: -8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", damping: 22 }}
            className="flex-row items-center gap-4"
          >
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <Text style={{ fontSize: 32 }}>{lesson.emoji}</Text>
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-xl font-extrabold text-white" numberOfLines={2}>
                {lesson.title}
              </Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-sm text-white opacity-80">
                  {typeLabel[lesson.lessonType]}
                </Text>
                <Text className="text-white opacity-60">·</Text>
                <Text className="text-sm text-white opacity-80">
                  ⭐ +{lesson.xpReward} XP
                </Text>
              </View>
            </View>
          </MotiView>

          {isAlreadyCompleted && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-row items-center gap-2 bg-success rounded-xl px-4 py-2 self-start"
            >
              <Text className="text-white font-bold text-base">✅ Đã hoàn thành</Text>
            </MotiView>
          )}
        </View>

        {/* ── Lesson Content ───────────────────────────────── */}
        <View className="px-5 pt-6">
          {lesson.lessonType === "quiz" && lesson.quiz ? (
            <QuizView
              quiz={lesson.quiz}
              onComplete={(isPerfect) => handleComplete(isPerfect)}
            />
          ) : lesson.lessonType === "reading" && lesson.readingContent ? (
            <ReadingView content={lesson.readingContent} onComplete={() => handleComplete()} />
          ) : (
            <VideoView duration={lesson.duration} onComplete={() => handleComplete()} />
          )}
        </View>
      </ScrollView>

      {/* ── Completion overlay ───────────────────────────── */}
      {showCompletion && (
        <CompletionOverlay
          xp={lesson.xpReward}
          onContinue={() => {
            setShowCompletion(false);
            router.back();
          }}
        />
      )}
    </SafeAreaView>
  );
}
