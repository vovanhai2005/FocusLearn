// filepath: constants/theme.ts
//
// FocusLearn Design System — "Calm Bright" Palette
// Designed for children 8–14 with ADHD:
//   • Vibrant but not overwhelming (mid saturation)
//   • High contrast for readability (WCAG AA)
//   • Distinct hues to aid category recognition
//   • Warm off-white background reduces eye strain

// ─────────────────────────────────────────────────────────────
// COLORS
// ─────────────────────────────────────────────────────────────

export const Colors = {
  // Primary – Soft Indigo (CTA, active, navigation)
  primary: {
    DEFAULT: "#6C63FF",
    light: "#9D97FF",
    dark: "#4A42D4",
    subtle: "#EEEEFF",
  },

  // Secondary – Warm Orange (streak 🔥, rewards)
  secondary: {
    DEFAULT: "#FF8C42",
    light: "#FFB07A",
    dark: "#D96B20",
    subtle: "#FFF0E6",
  },

  // Success – Mint Green (completed ✅, XP earned)
  success: {
    DEFAULT: "#3DD68C",
    light: "#78E8B2",
    dark: "#22A865",
    subtle: "#E6FBF2",
  },

  // Warning – Sunflower Yellow (XP bar ⭐, badges)
  warning: {
    DEFAULT: "#FFD166",
    light: "#FFE29D",
    dark: "#D4A017",
    subtle: "#FFFBEB",
  },

  // Info – Sky Blue (subject tags, info states)
  info: {
    DEFAULT: "#56CFE1",
    light: "#90E3EF",
    dark: "#2AAFC3",
    subtle: "#E8FAFD",
  },

  // Error – Soft Red (errors, not harsh)
  error: {
    DEFAULT: "#FF6B6B",
    light: "#FF9E9E",
    dark: "#D94545",
    subtle: "#FFF0F0",
  },

  // Background
  bg: {
    DEFAULT: "#F8F7FF",  // Very light lavender
    card: "#FFFFFF",
    muted: "#F0EFF9",
  },

  // Text
  text: {
    DEFAULT: "#2D2B55",  // Deep indigo – primary text
    muted: "#7A7899",    // Secondary / caption
    light: "#B5B3D0",    // Placeholder / disabled
    inverse: "#FFFFFF",
  },

  // Border
  border: {
    DEFAULT: "#E8E7F5",
    strong: "#C8C6E8",
  },

  // Subject colors — used for course cards
  subjects: {
    math: "#6C63FF",      // Indigo
    science: "#3DD68C",   // Green
    language: "#FF8C42",  // Orange
    art: "#FF6B6B",       // Coral
    history: "#FFD166",   // Yellow
    music: "#56CFE1",     // Blue
  },
} as const;

// Flat string map for use in Tailwind className strings
// Usage: Colors.flat.primary → "#6C63FF"
export const ColorFlat = {
  primary: Colors.primary.DEFAULT,
  primaryLight: Colors.primary.light,
  primaryDark: Colors.primary.dark,
  primarySubtle: Colors.primary.subtle,
  secondary: Colors.secondary.DEFAULT,
  secondaryLight: Colors.secondary.light,
  secondaryDark: Colors.secondary.dark,
  secondarySubtle: Colors.secondary.subtle,
  success: Colors.success.DEFAULT,
  successLight: Colors.success.light,
  successDark: Colors.success.dark,
  successSubtle: Colors.success.subtle,
  warning: Colors.warning.DEFAULT,
  warningLight: Colors.warning.light,
  warningDark: Colors.warning.dark,
  warningSubtle: Colors.warning.subtle,
  info: Colors.info.DEFAULT,
  infoLight: Colors.info.light,
  infoDark: Colors.info.dark,
  infoSubtle: Colors.info.subtle,
  error: Colors.error.DEFAULT,
  errorLight: Colors.error.light,
  bg: Colors.bg.DEFAULT,
  bgCard: Colors.bg.card,
  bgMuted: Colors.bg.muted,
  textDefault: Colors.text.DEFAULT,
  textMuted: Colors.text.muted,
  textLight: Colors.text.light,
  textInverse: Colors.text.inverse,
  border: Colors.border.DEFAULT,
  borderStrong: Colors.border.strong,
} as const;

// ─────────────────────────────────────────────────────────────
// TYPOGRAPHY
// ─────────────────────────────────────────────────────────────

export const FontSize = {
  xs: 12,
  sm: 14,
  base: 16,    // Minimum body text size
  lg: 18,      // Preferred body text for ADHD
  xl: 20,
  "2xl": 22,   // Minimum heading size
  "3xl": 26,
  "4xl": 30,
  "5xl": 36,
} as const;

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export const FontWeight = {
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,
} as const;

// ─────────────────────────────────────────────────────────────
// SPACING
// ─────────────────────────────────────────────────────────────

export const Spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,     // Minimum tap target size
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

// Named semantic aliases
export const Space = {
  xs: Spacing[1],     // 4
  sm: Spacing[2],     // 8
  md: Spacing[4],     // 16
  lg: Spacing[6],     // 24
  xl: Spacing[8],     // 32
  "2xl": Spacing[12], // 48
  tapTarget: 48,      // Minimum accessible tap target
  screenPadding: Spacing[5], // 20 — standard screen horizontal padding
} as const;

// ─────────────────────────────────────────────────────────────
// BORDER RADIUS
// ─────────────────────────────────────────────────────────────

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
  // Semantic
  button: 12,
  card: 16,
  badge: 9999,
  input: 12,
  avatar: 9999,
} as const;

// ─────────────────────────────────────────────────────────────
// SHADOWS
// ─────────────────────────────────────────────────────────────
// React Native shadow properties (cross-platform via elevation + shadow*)

export const Shadow = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: "#2D2B55",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  float: {
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

// ─────────────────────────────────────────────────────────────
// ANIMATION
// ─────────────────────────────────────────────────────────────

export const Animation = {
  // Duration guidelines (ADHD-friendly: not too flashy)
  duration: {
    fast: 150,    // Micro interactions (press feedback)
    normal: 250,  // Standard transitions
    slow: 400,    // Entry/exit animations, rewards
    stagger: 80,  // Stagger delay between list items
  },
  // Spring configs for Moti
  spring: {
    gentle: {
      type: "spring" as const,
      damping: 20,
      stiffness: 200,
    },
    snappy: {
      type: "spring" as const,
      damping: 15,
      stiffness: 300,
    },
    bouncy: {
      type: "spring" as const,
      damping: 10,
      stiffness: 250,
    },
  },
  // Scale values for press animations
  scale: {
    pressed: 0.96,
    selected: 1.05,
    reward: 1.15,
  },
} as const;

// ─────────────────────────────────────────────────────────────
// ICON SIZES
// ─────────────────────────────────────────────────────────────

export const IconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  "2xl": 48,
} as const;

// ─────────────────────────────────────────────────────────────
// AVATAR EMOJIS — used for student profile customization
// ─────────────────────────────────────────────────────────────

export const AvatarEmojis = [
  "🦊", "🐸", "🐼", "🦁", "🐯", "🦄",
  "🐧", "🦋", "🐙", "🦖", "🚀", "⭐",
] as const;

export type AvatarEmoji = typeof AvatarEmojis[number];

// ─────────────────────────────────────────────────────────────
// XP CONFIG
// ─────────────────────────────────────────────────────────────

export const XPConfig = {
  dailyGoal: 50,        // XP to earn per day
  lessonBase: 20,       // Base XP per lesson
  quizBonus: 10,        // Bonus XP for quiz
  perfectBonus: 15,     // Extra XP for 100% quiz score
  streakBonus: 5,       // Extra XP per streak day (capped at 25)
  levelThreshold: 100,  // XP per level
} as const;

// ─────────────────────────────────────────────────────────────
// BADGE DEFINITIONS
// ─────────────────────────────────────────────────────────────

export const BadgeDefinitions = [
  {
    id: "first_lesson",
    name: "Học sinh mới",
    description: "Hoàn thành bài học đầu tiên",
    emoji: "🌟",
    category: "completion" as const,
  },
  {
    id: "streak_3",
    name: "Học 3 ngày liên tiếp",
    description: "Duy trì streak 3 ngày",
    emoji: "🔥",
    category: "streak" as const,
  },
  {
    id: "streak_7",
    name: "Tuần lễ học tập",
    description: "Duy trì streak 7 ngày",
    emoji: "🏆",
    category: "streak" as const,
  },
  {
    id: "xp_100",
    name: "Nhà thám tử XP",
    description: "Tích lũy 100 XP",
    emoji: "💎",
    category: "xp" as const,
  },
  {
    id: "perfect_quiz",
    name: "Thiên tài",
    description: "Trả lời đúng tất cả câu quiz",
    emoji: "🧠",
    category: "perfect" as const,
  },
] as const;

// ─────────────────────────────────────────────────────────────
// COMBINED EXPORT (convenience)
// ─────────────────────────────────────────────────────────────

export const Theme = {
  colors: Colors,
  colorFlat: ColorFlat,
  fontSize: FontSize,
  lineHeight: LineHeight,
  fontWeight: FontWeight,
  spacing: Spacing,
  space: Space,
  radius: Radius,
  shadow: Shadow,
  animation: Animation,
  iconSize: IconSize,
  xpConfig: XPConfig,
} as const;

export default Theme;
