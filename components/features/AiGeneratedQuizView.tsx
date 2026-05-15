import React, { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MotiView } from "moti";
import { Button } from "@/components/ui/Button";
import { Colors, Shadow } from "@/constants/theme";
import type { AiQuiz, AiQuizChoiceId } from "@/types/aiQuiz";

interface AiGeneratedQuizViewProps {
  quiz: AiQuiz;
  onComplete: (isPerfect: boolean) => void;
}

type AnswerMap = Partial<Record<number, AiQuizChoiceId>>;

export function AiGeneratedQuizView({
  quiz,
  onComplete,
}: AiGeneratedQuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitted, setSubmitted] = useState(false);

  const questions = quiz.questions;
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers[currentIndex];
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const answeredCount = questions.filter((_, index) => answers[index]).length;

  const correctCount = useMemo(
    () =>
      questions.reduce((total, question, index) => {
        return answers[index] === question.correct_answer ? total + 1 : total;
      }, 0),
    [answers, questions]
  );

  const scorePercent =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const progressPercent =
    totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  if (!currentQuestion) {
    return (
      <View className="gap-4 items-center py-8">
        <Text style={{ fontSize: 48 }}>📝</Text>
        <Text className="text-xl font-bold text-text text-center">
          Quiz chưa có câu hỏi
        </Text>
      </View>
    );
  }

  function handleSelect(choiceId: AiQuizChoiceId) {
    if (submitted) return;
    setAnswers((current) => ({
      ...current,
      [currentIndex]: choiceId,
    }));
  }

  function handleNext() {
    if (!selectedAnswer) return;
    setCurrentIndex((index) => Math.min(totalQuestions - 1, index + 1));
  }

  function handlePrevious() {
    setCurrentIndex((index) => Math.max(0, index - 1));
  }

  function handleSubmit() {
    if (!selectedAnswer) return;
    setSubmitted(true);
    setCurrentIndex(0);
  }

  function handleContinueAfterReview() {
    if (isLastQuestion) {
      onComplete(correctCount === totalQuestions);
      return;
    }
    setCurrentIndex((index) => Math.min(totalQuestions - 1, index + 1));
  }

  return (
    <View className="gap-5">
      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold text-text-muted">
            Câu {currentIndex + 1}/{totalQuestions}
          </Text>
          <Text className="text-base font-bold text-primary">
            {answeredCount}/{totalQuestions} đã chọn
          </Text>
        </View>
        <View className="h-3 rounded-full bg-border overflow-hidden">
          <MotiView
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: "timing", duration: 250 }}
            style={{ backgroundColor: Colors.primary.DEFAULT }}
            className="h-full rounded-full"
          />
        </View>
      </View>

      {submitted && (
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 20 }}
          style={[
            Shadow.md,
            {
              backgroundColor:
                scorePercent === 100
                  ? Colors.success.subtle
                  : Colors.warning.subtle,
              borderColor:
                scorePercent === 100
                  ? Colors.success.DEFAULT
                  : Colors.warning.DEFAULT,
              borderWidth: 2,
            },
          ]}
          className="rounded-2xl p-5 gap-2"
        >
          <Text className="text-2xl font-extrabold text-text text-center">
            Kết quả: {scorePercent}%
          </Text>
          <Text className="text-base text-text-muted text-center">
            Đúng {correctCount}/{totalQuestions} câu
          </Text>
        </MotiView>
      )}

      <MotiView
        key={`${currentIndex}-${submitted ? "review" : "answer"}`}
        from={{ opacity: 0, translateX: 16 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ type: "spring", damping: 22 }}
        style={[Shadow.md, { backgroundColor: Colors.bg.card }]}
        className="rounded-2xl p-5 gap-4"
      >
        <View className="gap-2">
          <Text className="text-sm font-bold text-text-muted uppercase">
            {currentQuestion.difficulty}
          </Text>
          <Text className="text-2xl font-extrabold text-text leading-8">
            {currentQuestion.question}
          </Text>
        </View>

        <View className="gap-3">
          {currentQuestion.choices.map((choice) => {
            const isSelected = selectedAnswer === choice.id;
            const isCorrect = currentQuestion.correct_answer === choice.id;
            const showWrong = submitted && isSelected && !isCorrect;
            const showCorrect = submitted && isCorrect;

            const bgColor = showCorrect
              ? Colors.success.subtle
              : showWrong
              ? Colors.error.subtle
              : isSelected
              ? Colors.primary.subtle
              : Colors.bg.muted;
            const borderColor = showCorrect
              ? Colors.success.DEFAULT
              : showWrong
              ? Colors.error.DEFAULT
              : isSelected
              ? Colors.primary.DEFAULT
              : Colors.border.DEFAULT;

            return (
              <TouchableOpacity
                key={choice.id}
                onPress={() => handleSelect(choice.id)}
                activeOpacity={submitted ? 1 : 0.82}
                style={[Shadow.sm, { backgroundColor: bgColor, borderColor, borderWidth: 2 }]}
                className="rounded-xl px-4 py-3 min-h-[56px] flex-row items-center gap-3"
              >
                <View
                  style={{
                    backgroundColor: borderColor,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text className="text-white font-extrabold">
                    {choice.id}
                  </Text>
                </View>
                <Text className="text-base font-semibold text-text flex-1">
                  {choice.text}
                </Text>
                {submitted && (showCorrect || showWrong) && (
                  <Text
                    className="text-xl font-extrabold"
                    style={{
                      color: showCorrect
                        ? Colors.success.dark
                        : Colors.error.dark,
                    }}
                  >
                    {showCorrect ? "✓" : "×"}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {submitted && (
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", damping: 20 }}
            style={{
              backgroundColor: Colors.info.subtle,
              borderColor: Colors.info.DEFAULT,
              borderWidth: 1.5,
            }}
            className="rounded-xl p-4 gap-3"
          >
            <Text className="text-base font-extrabold text-text">
              Giải thích
            </Text>
            <Text className="text-base text-text leading-6">
              {currentQuestion.explanation}
            </Text>
            {currentQuestion.source_reference && (
              <Text className="text-sm font-semibold" style={{ color: Colors.info.dark }}>
                Nguồn: {currentQuestion.source_reference}
              </Text>
            )}
            {currentQuestion.learning_objective && (
              <Text className="text-sm font-semibold text-text-muted">
                Mục tiêu: {currentQuestion.learning_objective}
              </Text>
            )}
          </MotiView>
        )}
      </MotiView>

      <View className="flex-row gap-3">
        {currentIndex > 0 && (
          <View className="flex-1">
            <Button
              label="Câu trước"
              variant="outline"
              size="md"
              fullWidth
              onPress={handlePrevious}
            />
          </View>
        )}
        <View className="flex-1">
          {submitted ? (
            <Button
              label={isLastQuestion ? "Hoàn thành" : "Câu tiếp theo"}
              rightEmoji={isLastQuestion ? "✓" : "→"}
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleContinueAfterReview}
            />
          ) : isLastQuestion ? (
            <Button
              label="Nộp bài"
              leftEmoji="📝"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!selectedAnswer}
              onPress={handleSubmit}
            />
          ) : (
            <Button
              label="Câu tiếp theo"
              rightEmoji="→"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!selectedAnswer}
              onPress={handleNext}
            />
          )}
        </View>
      </View>
    </View>
  );
}

export default AiGeneratedQuizView;
