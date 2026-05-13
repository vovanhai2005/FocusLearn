// filepath: store/useSettingsStore.ts
import { create } from "zustand";
import { AccessibilityInfo, Platform } from "react-native";

// ─────────────────────────────────────────────────────────────
// STATE INTERFACE
// ─────────────────────────────────────────────────────────────

interface SettingsState {
  /** When true, disable looping/pulse animations for ADHD focus */
  reduceMotion: boolean;

  // Actions
  setReduceMotion: (value: boolean) => void;
  hydrateSettings: () => void;
}

// ─────────────────────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────────────────────

export const useSettingsStore = create<SettingsState>((set) => ({
  reduceMotion: false,

  setReduceMotion: (value: boolean) => {
    set({ reduceMotion: value });
  },

  /**
   * Hydrate from OS accessibility settings on app start.
   * User can override via the profile toggle.
   */
  hydrateSettings: () => {
    if (Platform.OS !== "web") {
      AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
        if (enabled) {
          set({ reduceMotion: true });
        }
      });
    }
  },
}));

// ─────────────────────────────────────────────────────────────
// SELECTORS
// ─────────────────────────────────────────────────────────────

export const selectReduceMotion = (s: SettingsState) => s.reduceMotion;
