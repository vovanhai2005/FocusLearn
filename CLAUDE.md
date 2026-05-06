# FocusLearn — CLAUDE.md

> Tài liệu này dành cho AI assistant (Claude, Gemini, Copilot...).
> Đọc file này trước khi sửa bất kỳ code nào trong project.

---

## 📌 Tóm tắt dự án

**FocusLearn** — Nền tảng học tập dành cho trẻ em mắc ADHD (8–14 tuổi).
Chuyển đổi bài giảng dài thành micro-lecture ngắn + gamification (XP, streak, badge).

**Hai role người dùng:**
- `student` — xem bài học, làm quiz, nhận XP
- `teacher` — tạo khóa học, upload micro-lecture, theo dõi tiến độ

---

## 🛠 Tech Stack

| Lớp | Công nghệ |
|-----|-----------|
| Framework | React Native + Expo SDK 51 (managed workflow) |
| Routing | Expo Router v3 (file-based) |
| Styling | NativeWind v4 (Tailwind for React Native) |
| Animation | Moti + React Native Reanimated v3 |
| State | Zustand v4 |
| Backend | Supabase (auth + database + storage) |
| Language | TypeScript strict mode |

---

## 🎨 Color Tokens — "Calm Bright" Palette

> Thiết kế cho trẻ ADHD: tươi sáng, dễ phân biệt, không gây mỏi mắt.

### Màu chính

| Token | Hex | Dùng cho |
|-------|-----|----------|
| `primary` | `#6C63FF` | CTA, active state, navigation |
| `secondary` | `#FF8C42` | Streak 🔥, reward moments |
| `success` | `#3DD68C` | Completed ✅, XP earned |
| `warning` | `#FFD166` | XP bar ⭐, badges |
| `info` | `#56CFE1` | Subject tags, info states |
| `error` | `#FF6B6B` | Errors (soft red) |

### Background & Text

| Token | Hex | Dùng cho |
|-------|-----|----------|
| `bg` | `#F8F7FF` | Main background (light lavender) |
| `bg-card` | `#FFFFFF` | Card surface |
| `bg-muted` | `#F0EFF9` | Muted backgrounds |
| `text` | `#2D2B55` | Primary text (deep indigo) |
| `text-muted` | `#7A7899` | Secondary / caption |
| `text-light` | `#B5B3D0` | Placeholder / disabled |
| `border` | `#E8E7F5` | Default border |

### Trong Tailwind className
```
bg-primary         text-primary        border-primary
bg-secondary       text-secondary      border-secondary
bg-success         text-success        border-success
bg-warning         text-warning        border-warning
bg-info            text-info           border-info
bg-error           text-error          border-error
bg-bg              text-text           bg-bg-card
text-text-muted    text-text-light     text-text-inverse
bg-primary-subtle  bg-success-subtle   ...  (mỗi màu có -subtle)
*-dark             *-light             (shade variants)
```

### Import từ constants
```typescript
import { Colors, ColorFlat, Theme } from "@/constants/theme";

// Dùng trong style prop:
style={{ color: Colors.primary.DEFAULT }}

// Dùng flat:
style={{ color: ColorFlat.primary }}
```

---

## 📁 Cấu trúc thư mục

```
focuslearn/
├── app/
│   ├── _layout.tsx          # Root layout: import global.css, hydrate stores
│   ├── index.tsx            # Router guard (auth check + redirect)
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── onboarding.tsx   # Chọn role (student/teacher)
│   │   └── login.tsx        # Đăng nhập bằng tên + mã số
│   ├── (student)/
│   │   ├── _layout.tsx      # Custom tab bar 3 tab
│   │   ├── home.tsx         # Dashboard học sinh
│   │   ├── courses.tsx      # Danh sách khóa học
│   │   └── profile.tsx      # Hồ sơ + stats + badges
│   └── (teacher)/
│       ├── _layout.tsx      # Custom tab bar 2 tab
│       ├── dashboard.tsx    # Tổng quan lớp học
│       └── create.tsx       # Tạo khóa học mới
├── components/
│   ├── ui/
│   │   ├── Button.tsx       # variants: primary|secondary|outline|ghost
│   │   ├── Input.tsx        # animated focus border, error state
│   │   ├── Card.tsx         # variants: default|elevated|colored
│   │   ├── Badge.tsx        # variants: xp|streak|success|info|error
│   │   └── RoleCard.tsx     # Role selection card with spring animation
│   └── features/
│       ├── LessonCard.tsx   # Lesson item: emoji + info + XP badge
│       └── StreakBadge.tsx  # 🔥 animated streak display
├── constants/
│   └── theme.ts             # Colors, Spacing, Radius, Shadow, Animation, XPConfig
├── store/
│   ├── useAuthStore.ts      # Auth state: user, role, login, logout, hydrate
│   └── useProgressStore.ts  # XP, streak, lessons, badges, sync
├── lib/
│   └── supabase.ts          # Typed Supabase client + DB schema types
├── types/
│   └── index.ts             # All TypeScript interfaces
├── global.css               # @tailwind directives (NativeWind)
└── CLAUDE.md                # This file
```

---

## ⚙️ Conventions & Rules

### 1. Styling — NativeWind ONLY

```typescript
// ✅ ĐÚNG — dùng NativeWind className
<View className="flex-1 bg-bg px-5 py-4 rounded-card" />

// ❌ SAI — không dùng StyleSheet.create
const styles = StyleSheet.create({ ... })  // KHÔNG

// ❌ SAI — không dùng inline style cho layout
<View style={{ padding: 16, backgroundColor: '#fff' }} />
```

**Ngoại lệ hợp lệ** — dùng `style` prop khi:
- Giá trị **động** từ theme constants (màu sắc, shadow)
- Platform-specific values
- React Native shadow props (cross-platform)

```typescript
// ✅ OK — dynamic value từ theme
<View style={Shadow.md} className="rounded-card" />
<View style={{ backgroundColor: Colors.primary.DEFAULT }} />
```

### 2. Animation — Moti

```typescript
// ✅ ĐÚNG — dùng MotiView / MotiText
import { MotiView, MotiText } from "moti";

// Press animation (scale)
<MotiView
  animate={{ scale: isPressed ? 0.96 : 1 }}
  transition={{ type: "spring", damping: 20, stiffness: 300 }}
/>

// Entry animation
<MotiView
  from={{ opacity: 0, translateY: 12 }}
  animate={{ opacity: 1, translateY: 0 }}
  transition={{ type: "spring", damping: 22 }}
/>

// Stagger (delay per item)
<MotiView transition={{ delay: index * 80 }} />
```

**Animation duration guidelines:**
| Type | Duration |
|------|----------|
| Press feedback | 150ms |
| Standard transition | 250ms |
| Entry/exit, reward | 400ms |
| Stagger per item | 80ms |
| Pulse loop | 1200–1400ms |

**Spring presets từ `Animation.spring`:**
```typescript
import { Animation } from "@/constants/theme";
transition={Animation.spring.gentle}   // damping:20 stiffness:200
transition={Animation.spring.snappy}   // damping:15 stiffness:300
transition={Animation.spring.bouncy}   // damping:10 stiffness:250
```

### 3. TypeScript — Strict mode

```typescript
// ✅ ĐÚNG
interface Props {
  name: string;
  count: number;
}
function Component({ name, count }: Props) { ... }

// ❌ SAI — không dùng any
function fn(data: any) { ... }

// ❌ SAI — không dùng type assertion ngầm
const x = value!

// ✅ OK — type assertion khi thực sự cần
const el = ref.current as HTMLElement;
```

### 4. Minimum sizes (ADHD accessibility)

| Element | Minimum |
|---------|---------|
| Body text | `text-base` (16px) |
| Preferred body | `text-lg` (18px) |
| Headings | `text-2xl` (22px) |
| Button/Touchable | `min-h-[48px]` `min-w-[48px]` |
| Tab bar items | `min-h-[48px]` |
| Icon size (touch) | 24px+ |

### 5. File header convention

Mỗi file bắt đầu bằng:
```typescript
// filepath: components/ui/Button.tsx
```

### 6. Mock data

Screens chưa kết nối Supabase dùng mock data dạng `const` ở đầu file:
```typescript
// ─── MOCK DATA ───────────────────────────────────────────────
const MOCK_LESSONS = [ ... ];
```

### 7. Imports — path alias

```typescript
// ✅ ĐÚNG — dùng @/ alias
import { Colors } from "@/constants/theme";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/Button";

// ❌ SAI — relative import dài
import { Colors } from "../../constants/theme";
```

---

## 🗄 Supabase

### Typed client

```typescript
import { supabase, db } from "@/lib/supabase";

// Shorthand typed query:
const { data } = await db("users").select("*").eq("id", userId);

// Full client:
const { data } = await supabase.from("users").select("*");
```

### Auth flow (MVP)

1. User chọn role ở onboarding → `useAuthStore.setRole(role)`
2. Nhập tên + mã số → `useAuthStore.loginWithCode(name, code)`
3. Store tìm user trong bảng `users` theo `access_code`
4. Validate tên + role → Supabase anonymous sign-in
5. Session persist qua `AsyncStorage`

### Generate types từ Supabase schema

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
```

---

## 🏆 Gamification (XPConfig)

```typescript
import { XPConfig } from "@/constants/theme";

XPConfig.dailyGoal    = 50     // XP mục tiêu mỗi ngày
XPConfig.lessonBase   = 20     // XP mỗi bài học
XPConfig.quizBonus    = 10     // Bonus XP quiz
XPConfig.perfectBonus = 15     // Thêm XP nếu quiz 100%
XPConfig.streakBonus  = 5      // XP thêm mỗi ngày streak (max 5 ngày)
XPConfig.levelThreshold = 100  // XP để lên 1 cấp
```

### Gọi từ store:

```typescript
import { useProgressStore } from "@/store/useProgressStore";

const { addXP, markLessonComplete, incrementStreak } = useProgressStore();

// Khi học sinh hoàn thành bài:
markLessonComplete(lessonId, xpReward);
// → tự động: addXP + incrementStreak + unlock badges
```

---

## 🚫 Anti-patterns

```typescript
// ❌ Không StyleSheet.create
// ❌ Không `any`
// ❌ Không relative import dài (../../)
// ❌ Không animation duration > 400ms (trừ pulse loop)
// ❌ Không font size < 16px cho body text
// ❌ Không tap target < 48×48px
// ❌ Không fetch Supabase trong placeholder screens (dùng mock data)
// ❌ Không import trực tiếp từ 'react-native-reanimated' trong UI component
//    (dùng Moti wrapper thay thế)
```

---

## 📋 Checklist trước khi commit

- [ ] Không có `any` trong TypeScript
- [ ] Tất cả touchable có `min-h-[48px]`
- [ ] Mọi animation dùng Moti, duration ≤ 400ms
- [ ] Dùng `@/` alias cho tất cả import
- [ ] Không `StyleSheet.create`
- [ ] Dynamic colors lấy từ `Colors` hoặc `ColorFlat`
- [ ] Mock data dùng `const` ở đầu file, có comment `// MOCK DATA`
- [ ] File bắt đầu bằng `// filepath: ...`
