// filepath: hooks/useVideoUpload.ts
import { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { supabase } from "@/lib/supabase";

// ─── CONSTANTS ────────────────────────────────────────────────

const MAX_FILE_BYTES = 500 * 1024 * 1024; // 500 MB
const BUCKET = "Videos"; // Matches Supabase bucket name (case-sensitive)

const FRIENDLY_ERRORS: Record<string, string> = {
  TOO_LARGE: "Video quá lớn. Vui lòng chọn video dưới 500MB.",
  INVALID_TYPE: "Định dạng không được hỗ trợ. Vui lòng chọn file video.",
  UPLOAD_FAILED: "Upload thất bại. Kiểm tra kết nối mạng và thử lại.",
  NETWORK_ERROR: "Mất kết nối mạng trong khi upload. Vui lòng thử lại.",
  UPDATE_FAILED: "Video đã upload nhưng không lưu được. Vui lòng liên hệ hỗ trợ.",
};

function friendlyMessage(raw: string): string {
  // Specific Supabase Storage errors → actionable Vietnamese messages
  if (/bucket not found/i.test(raw)) {
    return 'Bucket "videos" chưa được tạo trong Supabase. Liên hệ quản trị viên.';
  }
  if (/new row violates row-level security|unauthorized/i.test(raw)) {
    return "Không có quyền upload. Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.";
  }
  if (/duplicate|already exists/i.test(raw)) {
    return "File đã tồn tại. Vui lòng thử lại.";
  }
  for (const [key, msg] of Object.entries(FRIENDLY_ERRORS)) {
    if (raw.includes(key)) return msg;
  }
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
}

// ─── XHR UPLOAD ───────────────────────────────────────────────
// Uses React Native FormData { uri, name, type } pattern which handles
// both file:// and content:// URIs natively — avoiding the fetch().blob()
// approach that fails on Android with content:// URIs from expo-document-picker.

function xhrUploadToSupabase(
  localUri: string,
  fileName: string,
  mimeType: string,
  storagePath: string,
  token: string,
  supabaseUrl: string,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("", {
      uri: localUri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${supabaseUrl}/storage/v1/object/${BUCKET}/${storagePath}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.timeout = 10 * 60 * 1000; // 10 min

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        let detail = String(xhr.status);
        try {
          const body = JSON.parse(xhr.responseText) as { message?: string };
          detail = body.message ?? detail;
        } catch { /* ignore */ }
        console.error("[useVideoUpload] XHR failed:", xhr.status, detail);
        reject(new Error(`UPLOAD_FAILED:${detail}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("NETWORK_ERROR")));
    xhr.addEventListener("timeout", () => reject(new Error("NETWORK_ERROR")));

    xhr.send(formData);
  });
}

// ─── HOOK ─────────────────────────────────────────────────────

export interface VideoUploadState {
  isUploading: boolean;
  progress: number; // 0–100
  error: string | null;
}

export interface UseVideoUploadResult extends VideoUploadState {
  pickVideo: () => Promise<{ uri: string; name: string; mimeType: string } | null>;
  uploadVideo: (
    localUri: string,
    fileName: string,
    mimeType: string,
    lessonId: string | null
  ) => Promise<string | null>; // returns public video URL or null on failure
  clearError: () => void;
  reset: () => void;
}

export function useVideoUpload(): UseVideoUploadResult {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // ── pickVideo ──────────────────────────────────────────────
  async function pickVideo() {
    setError(null);

    let result: DocumentPicker.DocumentPickerResult;
    try {
      result = await DocumentPicker.getDocumentAsync({
        type: "video/*",
        copyToCacheDirectory: true,
        multiple: false,
      });
    } catch {
      return null;
    }

    if (result.canceled || !result.assets?.length) return null;

    const asset = result.assets[0];
    const mime = asset.mimeType ?? "video/mp4";

    if (!mime.startsWith("video/")) {
      setError(FRIENDLY_ERRORS.INVALID_TYPE);
      return null;
    }
    if (asset.size && asset.size > MAX_FILE_BYTES) {
      setError(FRIENDLY_ERRORS.TOO_LARGE);
      return null;
    }

    return { uri: asset.uri, name: asset.name ?? "video.mp4", mimeType: mime };
  }

  // ── uploadVideo ────────────────────────────────────────────
  async function uploadVideo(
    localUri: string,
    fileName: string,
    mimeType: string,
    lessonId: string | null
  ): Promise<string | null> {
    setIsUploading(true);
    setProgress(5);
    setError(null);

    try {
      // 1. Get auth token (falls back to anon key for anonymous sessions)
      const { data: sessionData } = await supabase.auth.getSession();
      const token =
        sessionData.session?.access_token ??
        (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string);
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;

      setProgress(10);

      // 2. Build a unique storage path
      const ext = fileName.split(".").pop() ?? "mp4";
      const storagePath = `lessons/${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`;

      // 3. Upload via XHR — handles file:// and content:// URIs on both platforms
      await xhrUploadToSupabase(
        localUri,
        fileName,
        mimeType,
        storagePath,
        token,
        supabaseUrl,
        (xhrPct) => {
          // Map XHR 0–100 → overall 10–85%
          setProgress(10 + Math.round(xhrPct * 0.75));
        }
      );

      setProgress(90);

      // 4. Get the public URL (synchronous — no network call)
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(storagePath);
      const publicUrl = urlData.publicUrl;

      // 5. Persist URL to the lesson row when editing an existing lesson
      if (lessonId) {
        const { error: dbError } = await supabase
          .from("lessons")
          .update({ video_url: publicUrl })
          .eq("id", lessonId);
        if (dbError) throw new Error("UPDATE_FAILED");
      }

      setProgress(100);
      return publicUrl;
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      setError(friendlyMessage(raw));
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  function clearError() {
    setError(null);
  }

  function reset() {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }

  return { isUploading, progress, error, pickVideo, uploadVideo, clearError, reset };
}
