import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import type { DocumentPickerAsset } from "expo-document-picker";
import { MotiView } from "moti";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Colors, Shadow } from "@/constants/theme";
import type { Course } from "@/types";
import type {
  GenerateQuizDifficulty,
  GenerateQuizLanguage,
  GenerateQuizResponse,
} from "@/types/aiQuiz";
import {
  AI_DIFFICULTY_OPTIONS,
  LANGUAGE_OPTIONS,
} from "@/components/features/teacher/teacherCreateOptions";

interface AiQuizGeneratorSectionProps {
  teacherCourses: Course[];
  selectedCourseId: string | null;
  selectedAsset: DocumentPickerAsset | null;
  numQuestions: number;
  aiDifficulty: GenerateQuizDifficulty;
  language: GenerateQuizLanguage;
  subject: string;
  isGenerating: boolean;
  aiError: string | null;
  aiResult: GenerateQuizResponse | null;
  canCreateCourseFromForm: boolean;
  canSaveAiQuiz: boolean;
  isSavingQuiz: boolean;
  saveQuizError: string | null;
  onSelectCourse: (courseId: string) => void;
  onPickDocument: () => void;
  onClearDocument: () => void;
  onQuestionCountChange: (value: string) => void;
  onDifficultyChange: (value: GenerateQuizDifficulty) => void;
  onLanguageChange: (value: GenerateQuizLanguage) => void;
  onSubjectChange: (value: string) => void;
  onGenerateQuiz: () => void;
  onSaveAiQuiz: () => void;
  onResetAiQuiz: () => void;
}

function SectionHeader({ label }: { label: string }) {
  return <Text className="text-lg font-bold text-text mb-1">{label}</Text>;
}

function AiQuizIntro() {
  return (
    <View className="gap-1">
      <Text className="text-2xl font-extrabold text-text">
        Tạo quiz AI từ tài liệu
      </Text>
      <Text className="text-base text-text-muted">
        Upload PDF, DOCX, PPTX, TXT hoặc MD để tạo bài quiz trắc nghiệm.
      </Text>
    </View>
  );
}

function CourseTargetPicker({
  teacherCourses,
  selectedCourseId,
  canCreateCourseFromForm,
  onSelectCourse,
}: Pick<
  AiQuizGeneratorSectionProps,
  | "teacherCourses"
  | "selectedCourseId"
  | "canCreateCourseFromForm"
  | "onSelectCourse"
>) {
  return (
    <View className="gap-3">
      <SectionHeader label="Lưu vào khóa học" />
      {teacherCourses.length > 0 ? (
        <View className="gap-2">
          {teacherCourses.map((course) => {
            const isSelected = selectedCourseId === course.id;
            return (
              <TouchableOpacity
                key={course.id}
                onPress={() => onSelectCourse(course.id)}
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
                  <Text
                    className="text-base font-bold text-text"
                    numberOfLines={1}
                  >
                    {course.title}
                  </Text>
                  <Text className="text-sm text-text-muted">
                    {course.totalLessons} bài học
                  </Text>
                </View>
                {isSelected && (
                  <Text className="text-lg font-extrabold text-primary">
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <Text className="text-sm text-text-muted">
          {canCreateCourseFromForm
            ? "Chưa có khóa học nào. Quiz sẽ được lưu vào khóa học mới từ form phía trên."
            : "Chưa có khóa học nào. Hãy tạo khóa học trước, rồi quay lại tab Tạo quiz AI để lưu bài quiz."}
        </Text>
      )}
    </View>
  );
}

function DocumentPickerField({
  selectedAsset,
  onPickDocument,
  onClearDocument,
}: Pick<
  AiQuizGeneratorSectionProps,
  "selectedAsset" | "onPickDocument" | "onClearDocument"
>) {
  return (
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
            onPress={onPickDocument}
          />
        </View>
        {selectedAsset && (
          <TouchableOpacity
            onPress={onClearDocument}
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
        <Text className="text-base font-semibold text-text" numberOfLines={2}>
          {selectedAsset?.name ?? "Chưa chọn tài liệu"}
        </Text>
      </View>
    </View>
  );
}

function AiQuizSettings({
  numQuestions,
  aiDifficulty,
  language,
  subject,
  onQuestionCountChange,
  onDifficultyChange,
  onLanguageChange,
  onSubjectChange,
}: Pick<
  AiQuizGeneratorSectionProps,
  | "numQuestions"
  | "aiDifficulty"
  | "language"
  | "subject"
  | "onQuestionCountChange"
  | "onDifficultyChange"
  | "onLanguageChange"
  | "onSubjectChange"
>) {
  return (
    <View className="gap-4">
      <Input
        label="Số câu hỏi"
        leftEmoji="🔢"
        placeholder="10"
        value={String(numQuestions)}
        onChangeText={onQuestionCountChange}
        keyboardType="number-pad"
        maxLength={2}
      />

      <View className="gap-3">
        <SectionHeader label="Độ khó quiz" />
        <View className="flex-row flex-wrap gap-2.5">
          {AI_DIFFICULTY_OPTIONS.map((option) => {
            const isSelected = aiDifficulty === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => onDifficultyChange(option.value)}
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
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View className="gap-3">
        <SectionHeader label="Ngôn ngữ" />
        <View className="flex-row gap-2.5">
          {LANGUAGE_OPTIONS.map((option) => {
            const isSelected = language === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => onLanguageChange(option.value)}
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
                    color: isSelected ? Colors.info.dark : Colors.text.muted,
                  }}
                >
                  {option.label}
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
        onChangeText={onSubjectChange}
        maxLength={80}
      />
    </View>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <View
      style={{
        backgroundColor: Colors.error.subtle,
        borderColor: Colors.error.DEFAULT,
        borderWidth: 1.5,
      }}
      className="rounded-xl p-4"
    >
      <Text className="text-base font-semibold" style={{ color: Colors.error.dark }}>
        {message}
      </Text>
    </View>
  );
}

function SaveHint({
  aiResult,
  selectedCourseId,
  canCreateCourseFromForm,
}: Pick<
  AiQuizGeneratorSectionProps,
  "aiResult" | "selectedCourseId" | "canCreateCourseFromForm"
>) {
  if (!aiResult || selectedCourseId) return null;

  if (canCreateCourseFromForm) {
    return (
      <Text className="text-sm text-text-muted text-center">
        Chưa chọn khóa học có sẵn, quiz sẽ được lưu vào khóa học mới từ form
        phía trên.
      </Text>
    );
  }

  return (
    <Text className="text-sm text-error text-center">
      {canCreateCourseFromForm
        ? "Nhập tên khóa học phía trên hoặc chọn một khóa học có sẵn để lưu quiz."
        : "Chọn một khóa học có sẵn hoặc tạo khóa học trước ở tab Tạo khóa học để lưu quiz."}
    </Text>
  );
}

function AiQuizResultPreview({
  aiResult,
  selectedCourseId,
  canCreateCourseFromForm,
  canSaveAiQuiz,
  isSavingQuiz,
  isGenerating,
  onSaveAiQuiz,
  onResetAiQuiz,
}: Pick<
  AiQuizGeneratorSectionProps,
  | "aiResult"
  | "selectedCourseId"
  | "canCreateCourseFromForm"
  | "canSaveAiQuiz"
  | "isSavingQuiz"
  | "isGenerating"
  | "onSaveAiQuiz"
  | "onResetAiQuiz"
>) {
  if (!aiResult) return null;

  return (
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
              {aiResult.quiz.questions.length} câu ·{" "}
              {aiResult.quiz.generated_from}
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
              <Text key={choice.id} className="text-sm text-text-muted">
                {choice.id}. {choice.text}
              </Text>
            ))}
          </View>
        ))}
      </View>

      <SaveHint
        aiResult={aiResult}
        selectedCourseId={selectedCourseId}
        canCreateCourseFromForm={canCreateCourseFromForm}
      />

      <View className="gap-3">
        <Button
          label="Lưu quiz thành lesson"
          leftEmoji="💾"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canSaveAiQuiz}
          loading={isSavingQuiz}
          onPress={onSaveAiQuiz}
        />
        <Button
          label="Tạo lại"
          leftEmoji="🔄"
          variant="outline"
          size="md"
          fullWidth
          disabled={isSavingQuiz || isGenerating}
          onPress={onResetAiQuiz}
        />
      </View>
    </MotiView>
  );
}

export function AiQuizGeneratorSection(props: AiQuizGeneratorSectionProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: 500, type: "spring", damping: 22 }}
      style={[Shadow.md, { backgroundColor: Colors.bg.card }]}
      className="rounded-2xl p-5 gap-5"
    >
      <AiQuizIntro />
      <CourseTargetPicker
        teacherCourses={props.teacherCourses}
        selectedCourseId={props.selectedCourseId}
        canCreateCourseFromForm={props.canCreateCourseFromForm}
        onSelectCourse={props.onSelectCourse}
      />
      <DocumentPickerField
        selectedAsset={props.selectedAsset}
        onPickDocument={props.onPickDocument}
        onClearDocument={props.onClearDocument}
      />
      <AiQuizSettings
        numQuestions={props.numQuestions}
        aiDifficulty={props.aiDifficulty}
        language={props.language}
        subject={props.subject}
        onQuestionCountChange={props.onQuestionCountChange}
        onDifficultyChange={props.onDifficultyChange}
        onLanguageChange={props.onLanguageChange}
        onSubjectChange={props.onSubjectChange}
      />
      <Button
        label="Tạo quiz AI"
        leftEmoji="✨"
        variant="secondary"
        size="lg"
        fullWidth
        disabled={!props.selectedAsset}
        loading={props.isGenerating}
        onPress={props.onGenerateQuiz}
      />
      {props.aiError && <ErrorBox message={props.aiError} />}
      <AiQuizResultPreview
        aiResult={props.aiResult}
        selectedCourseId={props.selectedCourseId}
        canCreateCourseFromForm={props.canCreateCourseFromForm}
        canSaveAiQuiz={props.canSaveAiQuiz}
        isSavingQuiz={props.isSavingQuiz}
        isGenerating={props.isGenerating}
        onSaveAiQuiz={props.onSaveAiQuiz}
        onResetAiQuiz={props.onResetAiQuiz}
      />
      {props.saveQuizError && (
        <Text className="text-sm text-error text-center">
          {props.saveQuizError}
        </Text>
      )}
    </MotiView>
  );
}

export default AiQuizGeneratorSection;
