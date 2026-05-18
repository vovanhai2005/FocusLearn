// filepath: components/features/VideoUploadButton.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { MotiView } from "moti";
import { Colors, Shadow } from "@/constants/theme";
import { useVideoUpload } from "@/hooks/useVideoUpload";

// ─── TYPES ────────────────────────────────────────────────────

interface VideoUploadButtonProps {
  // If provided, video_url is written to this lesson row after upload.
  // If null/undefined (create mode), URL is only returned via callback.
  lessonId?: string | null;
  // Existing video URL — shows "already uploaded" state on mount
  initialVideoUrl?: string | null;
  // Called whenever a video URL is successfully obtained
  onUploadComplete: (videoUrl: string) => void;
  // Called if user removes the current video
  onRemove?: () => void;
}

// ─── PROGRESS BAR ─────────────────────────────────────────────

function ProgressBar({ value }: { value: number }) {
  return (
    <View className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: Colors.bg.muted }}>
      <MotiView
        animate={{ width: `${value}%` }}
        transition={{ type: "timing", duration: 200 }}
        className="h-full rounded-full"
        style={{ backgroundColor: Colors.primary.DEFAULT }}
      />
    </View>
  );
}

// ─── COMPONENT ────────────────────────────────────────────────

export function VideoUploadButton({
  lessonId,
  initialVideoUrl,
  onUploadComplete,
  onRemove,
}: VideoUploadButtonProps) {
  const { isUploading, progress, error, pickVideo, uploadVideo, clearError } =
    useVideoUpload();

  const [videoUrl, setVideoUrl] = useState<string | null>(initialVideoUrl ?? null);
  const [pendingFile, setPendingFile] = useState<{
    uri: string;
    name: string;
    mimeType: string;
  } | null>(null);

  // ── Handlers ───────────────────────────────────────────────

  async function handlePick() {
    clearError();
    const file = await pickVideo();
    if (!file) return;

    setPendingFile(file);
    await handleUpload(file.uri, file.name, file.mimeType);
  }

  async function handleUpload(uri: string, name: string, mime: string) {
    const url = await uploadVideo(uri, name, mime, lessonId ?? null);
    if (!url) return;

    setVideoUrl(url);
    setPendingFile(null);
    onUploadComplete(url);
  }

  function handleRetry() {
    if (!pendingFile) {
      handlePick();
      return;
    }
    clearError();
    handleUpload(pendingFile.uri, pendingFile.name, pendingFile.mimeType);
  }

  function handleRemove() {
    Alert.alert("Xóa video?", "Video này sẽ bị gỡ khỏi bài học.", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          setVideoUrl(null);
          setPendingFile(null);
          clearError();
          onRemove?.();
        },
      },
    ]);
  }

  // ── Render: uploading ───────────────────────────────────────

  if (isUploading) {
    return (
      <MotiView
        from={{ opacity: 0, translateY: 4 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", damping: 22 }}
        style={[
          Shadow.sm,
          { backgroundColor: Colors.primary.subtle, borderColor: Colors.primary.DEFAULT },
        ]}
        className="rounded-2xl border p-4 gap-3"
      >
        <View className="flex-row items-center gap-2">
          <Text style={{ fontSize: 20 }}>📹</Text>
          <Text className="flex-1 text-base font-bold text-primary">
            Đang tải lên...
          </Text>
          <Text className="text-sm font-extrabold text-primary">{progress}%</Text>
        </View>

        <ProgressBar value={progress} />

        <Text className="text-xs text-text-muted text-center">
          Giữ ứng dụng mở cho đến khi hoàn tất
        </Text>
      </MotiView>
    );
  }

  // ── Render: error ───────────────────────────────────────────

  if (error) {
    return (
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "spring", damping: 22 }}
        style={[
          Shadow.sm,
          { backgroundColor: Colors.error.subtle, borderColor: Colors.error.DEFAULT },
        ]}
        className="rounded-2xl border p-4 gap-3"
      >
        <View className="flex-row items-start gap-2">
          <Text style={{ fontSize: 20 }}>⚠️</Text>
          <Text className="flex-1 text-sm font-semibold" style={{ color: Colors.error.dark }}>
            {error}
          </Text>
        </View>

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={handleRetry}
            className="flex-1 min-h-[48px] items-center justify-center rounded-xl"
            style={{ backgroundColor: Colors.error.DEFAULT }}
            accessibilityLabel="Thử lại upload video"
            accessibilityRole="button"
          >
            <Text className="text-white font-bold text-sm">🔄 Thử lại</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePick}
            className="flex-1 min-h-[48px] items-center justify-center rounded-xl border-2"
            style={{ borderColor: Colors.error.DEFAULT }}
            accessibilityLabel="Chọn video khác"
            accessibilityRole="button"
          >
            <Text className="text-sm font-bold" style={{ color: Colors.error.dark }}>
              📁 Chọn khác
            </Text>
          </TouchableOpacity>
        </View>
      </MotiView>
    );
  }

  // ── Render: uploaded ────────────────────────────────────────

  if (videoUrl) {
    const fileName = videoUrl.split("/").pop() ?? "video";
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 20 }}
        style={[
          Shadow.sm,
          { backgroundColor: Colors.success.subtle, borderColor: Colors.success.DEFAULT },
        ]}
        className="rounded-2xl border p-4 flex-row items-center gap-3"
      >
        <Text style={{ fontSize: 28 }}>✅</Text>

        <View className="flex-1 gap-0.5">
          <Text className="text-base font-extrabold" style={{ color: Colors.success.dark }}>
            Video đã tải lên
          </Text>
          <Text className="text-xs text-text-muted" numberOfLines={1}>
            {fileName}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleRemove}
          className="min-h-[48px] min-w-[48px] items-center justify-center rounded-xl"
          style={{ backgroundColor: Colors.error.subtle }}
          accessibilityLabel="Xóa video"
          accessibilityRole="button"
        >
          <Text style={{ fontSize: 18 }}>🗑️</Text>
        </TouchableOpacity>
      </MotiView>
    );
  }

  // ── Render: idle ────────────────────────────────────────────

  return (
    <TouchableOpacity
      onPress={handlePick}
      activeOpacity={0.82}
      style={[
        Shadow.sm,
        { borderColor: Colors.border.DEFAULT, borderStyle: "dashed" },
      ]}
      className="rounded-2xl border-2 p-5 items-center gap-2 min-h-[80px] justify-center"
      accessibilityLabel="Chọn video để tải lên"
      accessibilityRole="button"
    >
      <Text style={{ fontSize: 32 }}>📹</Text>
      <Text className="text-base font-bold text-primary">Chọn video</Text>
      <Text className="text-xs text-text-muted text-center">
        Tối đa 500MB · MP4, MOV, AVI...
      </Text>
    </TouchableOpacity>
  );
}
