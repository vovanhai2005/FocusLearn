// filepath: types/index.ts

// ─────────────────────────────────────────────────────────────
// ENUMS & UNION TYPES
// ─────────────────────────────────────────────────────────────

export type Role = "student" | "teacher" | "parent";

export type DifficultyLevel = "easy" | "medium" | "hard";

export type LessonType = "video" | "quiz" | "reading" | "interactive";

export type Grade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export const GRADE_OPTIONS = [
  { value: 1  as Grade, label: "Lớp 1",  emoji: "🌱" },
  { value: 2  as Grade, label: "Lớp 2",  emoji: "🌱" },
  { value: 3  as Grade, label: "Lớp 3",  emoji: "🌱" },
  { value: 4  as Grade, label: "Lớp 4",  emoji: "📚" },
  { value: 5  as Grade, label: "Lớp 5",  emoji: "📚" },
  { value: 6  as Grade, label: "Lớp 6",  emoji: "📚" },
  { value: 7  as Grade, label: "Lớp 7",  emoji: "🎯" },
  { value: 8  as Grade, label: "Lớp 8",  emoji: "🎯" },
  { value: 9  as Grade, label: "Lớp 9",  emoji: "🎯" },
  { value: 10 as Grade, label: "Lớp 10", emoji: "🚀" },
  { value: 11 as Grade, label: "Lớp 11", emoji: "🚀" },
  { value: 12 as Grade, label: "Lớp 12", emoji: "🚀" },
] as const;

export type BadgeCategory =
  | "streak"
  | "xp"
  | "completion"
  | "speed"
  | "perfect";

// ─────────────────────────────────────────────────────────────
// USER & AUTH
// ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  role: Role;
  avatarEmoji: string;       // e.g. "🦊", "🐸"
  accessCode: string;        // 6-digit code used for login
  grade: Grade | null;       // Lớp học (1–12); null cho giáo viên
  createdAt: string;         // ISO 8601
  updatedAt: string;
}

export interface StudentProfile extends User {
  role: "student";
  grade: Grade | null;
  teacherId?: string;
}

export interface TeacherProfile extends User {
  role: "teacher";
  school?: string;
  bio?: string;
  studentIds: string[];
}

export interface ParentProfile extends User {
  role: "parent";
  childIds: string[];
}

// ─────────────────────────────────────────────────────────────
// COURSE & LESSON
// ─────────────────────────────────────────────────────────────

export interface Course {
  id: string;
  title: string;
  description: string;
  emoji: string;             // Subject icon, e.g. "🔢", "🌿"
  colorKey: string;          // Key in theme.colors, e.g. "primary"
  teacherId: string;
  grade: Grade;              // Lớp học (1–12)
  lessonIds: string[];
  totalLessons: number;
  estimatedMinutes: number;
  difficulty: DifficultyLevel;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  emoji: string;
  type: LessonType;
  durationSeconds: number;   // Duration of the micro-lecture
  xpReward: number;          // XP awarded on completion
  order: number;             // Position within course
  content?: string;          // Rich text / markdown for reading type
  videoUrl?: string;         // For video type (legacy / external URL)
  cfVideoId?: string;        // Cloudflare Stream video UID
  quizIds?: string[];        // For quiz type
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────
// QUIZ
// ─────────────────────────────────────────────────────────────

export interface QuizOption {
  id: string;
  text: string;
  emoji?: string;            // Optional emoji beside option text
  isCorrect: boolean;
}

export interface Quiz {
  id: string;
  lessonId: string;
  question: string;
  questionEmoji?: string;
  options: QuizOption[];
  explanation?: string;      // Shown after answering
  xpReward: number;
  timeoutSeconds?: number;   // Optional countdown timer
  order: number;
}

// ─────────────────────────────────────────────────────────────
// PROGRESS & GAMIFICATION
// ─────────────────────────────────────────────────────────────

export interface LessonProgress {
  lessonId: string;
  userId: string;
  isCompleted: boolean;
  completedAt?: string;      // ISO 8601
  score?: number;            // Percentage 0–100 for quiz lessons
  attempts: number;
}

export interface CourseProgress {
  courseId: string;
  userId: string;
  completedLessons: number;
  totalLessons: number;
  percentComplete: number;   // 0–100
  lastAccessedAt: string;
}

export interface Progress {
  userId: string;
  xp: number;                // Total XP accumulated
  xpToday: number;           // XP earned today (resets midnight)
  xpDailyGoal: number;       // Default: 50 XP/day
  level: number;             // Derived from xp
  streak: number;            // Current consecutive days
  longestStreak: number;
  lastActiveDate: string;    // YYYY-MM-DD
  completedLessonIds: string[];
  badges: Badge[];
  courseProgress: CourseProgress[];
}

export interface XPLog {
  id: string;
  userId: string;
  amount: number;
  source: "lesson" | "quiz" | "streak" | "bonus";
  sourceId?: string;         // lessonId or quizId
  earnedAt: string;          // ISO 8601
}

// ─────────────────────────────────────────────────────────────
// BADGES
// ─────────────────────────────────────────────────────────────

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: BadgeCategory;
  unlockedAt?: string;       // ISO 8601 — undefined if not yet earned
  isUnlocked: boolean;
}

// ─────────────────────────────────────────────────────────────
// UTILITY TYPES
// ─────────────────────────────────────────────────────────────

/** Generic API response wrapper */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/** Used for any list + pagination */
export interface PaginatedList<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** Teacher dashboard stats */
export interface TeacherStats {
  totalStudents: number;
  activeToday: number;
  avgCompletionRate: number;  // 0–100
  studentsNeedingAttention: StudentSummary[];
}

export interface StudentSummary {
  userId: string;
  name: string;
  avatarEmoji: string;
  xp: number;
  streak: number;
  completionRate: number;     // 0–100
  lastActive: string;
}
