// filepath: tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4: scan all app source files
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // ─── Calm Bright Palette (ADHD-friendly) ───────────────────────
      // Principles: vibrant but not overwhelming, high contrast,
      // distinct hues to aid focus, warm bg to reduce eye strain
      colors: {
        primary: {
          DEFAULT: "#6C63FF", // Soft indigo – main CTA, active states
          light: "#9D97FF",
          dark: "#4A42D4",
          subtle: "#EEEEFF",
        },
        secondary: {
          DEFAULT: "#FF8C42", // Warm orange – streak, reward moments
          light: "#FFB07A",
          dark: "#D96B20",
          subtle: "#FFF0E6",
        },
        success: {
          DEFAULT: "#3DD68C", // Mint green – completed, XP gain
          light: "#78E8B2",
          dark: "#22A865",
          subtle: "#E6FBF2",
        },
        warning: {
          DEFAULT: "#FFD166", // Sunflower yellow – XP bar, badges
          light: "#FFE29D",
          dark: "#D4A017",
          subtle: "#FFFBEB",
        },
        info: {
          DEFAULT: "#56CFE1", // Sky blue – subject tags, info states
          light: "#90E3EF",
          dark: "#2AAFC3",
          subtle: "#E8FAFD",
        },
        error: {
          DEFAULT: "#FF6B6B", // Soft red – errors (not harsh)
          light: "#FF9E9E",
          dark: "#D94545",
          subtle: "#FFF0F0",
        },
        // Backgrounds & surfaces
        bg: {
          DEFAULT: "#F8F7FF", // Very light lavender – main background
          card: "#FFFFFF",
          muted: "#F0EFF9",
        },
        // Text scale
        text: {
          DEFAULT: "#2D2B55", // Deep indigo – primary text
          muted: "#7A7899",   // Secondary text
          light: "#B5B3D0",   // Placeholder / disabled
          inverse: "#FFFFFF",
        },
        // Neutral grays
        border: {
          DEFAULT: "#E8E7F5",
          strong: "#C8C6E8",
        },
      },

      // ─── Typography ─────────────────────────────────────────────────
      fontFamily: {
        sans: ["System"], // Will use Expo Font to load custom font
        heading: ["System"],
      },
      fontSize: {
        // ADHD-friendly: minimum 16px body, 22px+ headings
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],   // Min body size
        lg: ["18px", { lineHeight: "28px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["22px", { lineHeight: "32px" }],  // Min heading size
        "3xl": ["26px", { lineHeight: "36px" }],
        "4xl": ["30px", { lineHeight: "40px" }],
        "5xl": ["36px", { lineHeight: "44px" }],
      },

      // ─── Spacing ────────────────────────────────────────────────────
      spacing: {
        // Custom tokens for consistent spacing
        "tap": "48px",   // Minimum tap target size
        "18": "72px",
        "22": "88px",
      },

      // ─── Border Radius ──────────────────────────────────────────────
      borderRadius: {
        sm: "8px",
        DEFAULT: "12px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        card: "16px",
        button: "12px",
        badge: "999px",
      },

      // ─── Box Shadow ──────────────────────────────────────────────────
      boxShadow: {
        sm: "0 1px 4px rgba(108, 99, 255, 0.08)",
        DEFAULT: "0 4px 16px rgba(108, 99, 255, 0.12)",
        md: "0 4px 16px rgba(108, 99, 255, 0.12)",
        lg: "0 8px 32px rgba(108, 99, 255, 0.18)",
        card: "0 2px 12px rgba(45, 43, 85, 0.08)",
        float: "0 8px 24px rgba(108, 99, 255, 0.20)",
      },
    },
  },
  plugins: [],
};
