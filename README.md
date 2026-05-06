# 🎯 FocusLearn

> Nền tảng học tập được thiết kế đặc biệt cho trẻ em mắc ADHD (8–14 tuổi).

FocusLearn chuyển đổi các bài giảng dài thành **micro-lecture ngắn** kết hợp với hệ thống **gamification** (XP, streak, badge) giúp trẻ duy trì sự tập trung và động lực học tập. Ứng dụng hỗ trợ hai vai trò: **học sinh** tương tác với bài học, và **giáo viên** quản lý nội dung khóa học.

---

## ✨ Tính năng nổi bật

| Học sinh | Giáo viên |
|----------|-----------|
| Dashboard cá nhân với XP & streak | Tạo và quản lý khóa học |
| Xem micro-lecture ngắn | Upload nội dung bài giảng |
| Làm quiz tương tác | Theo dõi tiến độ học sinh |
| Thu thập badges & thành tích | Thống kê lớp học |
| Hệ thống điểm kinh nghiệm (XP) | Tạo mã truy cập học sinh |

---

## 🛠 Tech Stack

| Lớp | Công nghệ | Phiên bản |
|-----|-----------|-----------|
| ![React Native](https://img.shields.io/badge/React_Native-20232A?logo=react&logoColor=61DAFB) | **React Native** | 0.81 |
| ![Expo](https://img.shields.io/badge/Expo-000020?logo=expo&logoColor=white) | **Expo SDK** | 54 (managed workflow) |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) | **TypeScript** | 5.3 (strict mode) |
| ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white) | **Supabase** | Auth + DB + Storage |
| ![TailwindCSS](https://img.shields.io/badge/NativeWind-06B6D4?logo=tailwindcss&logoColor=white) | **NativeWind v4** | Tailwind for RN |
| 🎬 | **Moti + Reanimated v3** | Animations |
| 🐻 | **Zustand v4** | Global state |
| 🗺️ | **Expo Router v3** | File-based routing |

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
│   ├── ui/                  # Button, Input, Card, Badge, RoleCard
│   └── features/            # LessonCard, StreakBadge
├── constants/
│   └── theme.ts             # Colors, Spacing, Radius, Animation, XPConfig
├── store/
│   ├── useAuthStore.ts      # Auth state
│   └── useProgressStore.ts  # XP, streak, badges
├── lib/
│   └── supabase.ts          # Typed Supabase client
├── types/
│   └── index.ts             # TypeScript interfaces
└── global.css               # NativeWind directives
```

---

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống

- **Node.js** >= 18
- **npm** >= 9 hoặc **yarn** >= 1.22
- **Expo CLI** (cài qua `npm install -g expo-cli`)
- App **Expo Go** trên điện thoại (hoặc Android Emulator / iOS Simulator)

### 1. Clone repository

```bash
git clone https://github.com/your-username/focuslearn.git
cd focuslearn
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình Supabase

Tạo file `.env` ở root project:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> Lấy thông tin từ **Supabase Dashboard → Project Settings → API**.

### 4. Tạo database schema

Chạy các migration sau trong **Supabase SQL Editor**:

```sql
-- Bảng users
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text check (role in ('student', 'teacher')) not null,
  access_code text unique not null,
  created_at timestamptz default now()
);

-- Bảng courses
create table courses (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references users(id),
  title text not null,
  description text,
  subject text,
  created_at timestamptz default now()
);

-- Bảng lessons
create table lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id),
  title text not null,
  content_url text,
  duration_seconds int,
  xp_reward int default 20,
  order_index int,
  created_at timestamptz default now()
);

-- Bảng progress
create table progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references users(id),
  lesson_id uuid references lessons(id),
  completed_at timestamptz default now(),
  xp_earned int,
  unique(student_id, lesson_id)
);
```

### 5. Generate TypeScript types từ Supabase

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
```

### 6. Khởi động ứng dụng

```bash
# Khởi động Expo dev server
npm start

# Chạy trên Android
npm run android

# Chạy trên iOS
npm run ios

# Chạy trên Web (preview)
npm run web
```

Quét QR code bằng **Expo Go** hoặc nhấn `a` (Android) / `i` (iOS) để mở trên emulator.

---

## 🔐 Luồng xác thực

```
Onboarding (chọn role)
    ↓
Login (nhập tên + mã số)
    ↓
Supabase tìm user theo access_code
    ↓
Validate tên + role → Anonymous sign-in
    ↓
Session persist qua AsyncStorage
    ↓
Redirect → /student/home hoặc /teacher/dashboard
```

---

## 🏆 Hệ thống Gamification

| Config | Giá trị | Mô tả |
|--------|---------|-------|
| `dailyGoal` | 50 XP | Mục tiêu XP mỗi ngày |
| `lessonBase` | 20 XP | XP mỗi bài học hoàn thành |
| `quizBonus` | 10 XP | Bonus khi hoàn thành quiz |
| `perfectBonus` | 15 XP | Bonus khi đạt 100% quiz |
| `streakBonus` | 5 XP | Thêm mỗi ngày streak (tối đa 5 ngày) |
| `levelThreshold` | 100 XP | XP cần để lên 1 cấp |

---

## 🎨 Color Palette — "Calm Bright"

> Thiết kế cho trẻ ADHD: tươi sáng, dễ phân biệt, không gây mỏi mắt.

| Token | Màu | Dùng cho |
|-------|-----|----------|
| `primary` | ![#6C63FF](https://placehold.co/15x15/6C63FF/6C63FF.png) `#6C63FF` | CTA, active state |
| `secondary` | ![#FF8C42](https://placehold.co/15x15/FF8C42/FF8C42.png) `#FF8C42` | Streak, rewards |
| `success` | ![#3DD68C](https://placehold.co/15x15/3DD68C/3DD68C.png) `#3DD68C` | Completed, XP earned |
| `warning` | ![#FFD166](https://placehold.co/15x15/FFD166/FFD166.png) `#FFD166` | XP bar, badges |
| `info` | ![#56CFE1](https://placehold.co/15x15/56CFE1/56CFE1.png) `#56CFE1` | Subject tags |
| `error` | ![#FF6B6B](https://placehold.co/15x15/FF6B6B/FF6B6B.png) `#FF6B6B` | Error states |
| `bg` | ![#F8F7FF](https://placehold.co/15x15/F8F7FF/F8F7FF.png) `#F8F7FF` | Main background |

---

## 🔧 Scripts

```bash
npm start          # Khởi động Expo dev server
npm run android    # Mở trên Android
npm run ios        # Mở trên iOS
npm run web        # Mở trên trình duyệt
npm run lint       # Chạy ESLint
npm run ts         # Kiểm tra TypeScript (tsc --noEmit)
```

---

## 📋 Checklist trước khi commit

- [ ] Không có `any` trong TypeScript
- [ ] Tất cả touchable có `min-h-[48px]`
- [ ] Mọi animation dùng Moti, duration ≤ 400ms
- [ ] Dùng `@/` alias cho tất cả import
- [ ] Không `StyleSheet.create`
- [ ] Dynamic colors lấy từ `Colors` hoặc `ColorFlat`
- [ ] Mock data dùng `const` ở đầu file với comment `// MOCK DATA`
- [ ] File bắt đầu bằng `// filepath: ...`

---

## 📄 License

MIT © 2026 FocusLearn Team
