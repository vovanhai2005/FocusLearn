# FocusLearn — Test Plan & Database Verification

## 📋 Pre-Testing Checklist

### 1. Database Setup
- [ ] Supabase project created and configured
- [ ] `.env.local` contains `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Sample data loaded from `SAMPLE_DATA.sql` in Supabase SQL Editor

### 2. Run Sample Data
```sql
-- Execute SAMPLE_DATA.sql in Supabase SQL Editor
-- This will create:
--   • 2 teachers (Cô Thuận, Thầy Nam)
--   • 3 students (Bảo Nguyên, Linh Nhi, Minh Tuấn)
--   • 5 courses (Math, Science, Language)
--   • 30+ lessons with video/reading/quiz content
```

**Credentials for manual testing:**

| Role | Name | Access Code | Avatar |
|------|------|------------|--------|
| Student | Bảo Nguyên | STUDENT001 | 🦊 |
| Student | Linh Nhi | STUDENT002 | 🐰 |
| Student | Minh Tuấn | STUDENT303 | 🐻 |
| Teacher | Cô Thuận | TEACHER001 | 👩‍🏫 |
| Teacher | Thầy Nam | TEACHER002 | 👨‍🏫 |

---

## 🧪 Functional Test Cases

### A. Authentication Flow

#### A1: Student Login (Valid)
**Steps:**
1. Start app → onboarding screen
2. Select "Học sinh" role
3. Enter name: `Bảo Nguyên`
4. Enter access code: `STUDENT001`
5. Press "Đăng nhập"

**Expected:**
- ✅ Login succeeds
- ✅ Splash screen remains visible during course load (not blank)
- ✅ Home screen shows 5 courses
- ✅ Student dashboard displays correctly

**Verify in Supabase:**
```sql
SELECT * FROM users WHERE access_code = 'STUDENT001';
-- Should return: id=550e8400-e29b-41d4-a716-446655440010, name=Bảo Nguyên, role=student
```

---

#### A2: Student Login (Invalid Code)
**Steps:**
1. Select "Học sinh" role
2. Enter name: `Bảo Nguyên`
3. Enter access code: `WRONG_CODE`
4. Press "Đăng nhập"

**Expected:**
- ❌ Login fails
- ✅ Error message: "Mã số không đúng. Hãy kiểm tra lại!"

---

#### A3: Student Login (Wrong Role for Code)
**Steps:**
1. Select "Giáo viên" role (teacher)
2. Enter name: `Bảo Nguyên`
3. Enter access code: `STUDENT001` (student code)
4. Press "Đăng nhập"

**Expected:**
- ❌ Login fails
- ✅ Error message: "Mã số này thuộc về học sinh, không phải giáo viên"

---

#### A4: Teacher Login (Valid)
**Steps:**
1. Select "Giáo viên" role
2. Enter name: `Cô Thuận`
3. Enter access code: `TEACHER001`
4. Press "Đăng nhập"

**Expected:**
- ✅ Login succeeds
- ✅ Teacher dashboard loads
- ✅ Shows stats: `2 khóa học`, `3 học sinh`, `0% hoàn thành`

---

#### A5: Logout & Session Persistence
**Steps:**
1. Log in as student
2. Close app completely (kill process)
3. Reopen app

**Expected:**
- ✅ Student logs back in automatically (session persists)
- ✅ App shows home screen (not onboarding)

**Verify in Supabase:**
```sql
SELECT * FROM progress WHERE user_id = '550e8400-e29b-41d4-a716-446655440010';
-- Should have one row with the user's progress
```

---

### B. Course & Lesson Loading

#### B1: Courses Load from Database
**Steps:**
1. Log in as student
2. Navigate to "Khóa học" tab
3. Wait for load

**Expected:**
- ✅ See all 5 courses:
  - ➕ Phép Cộng và Trừ (5 lessons)
  - ✖️ Bảng Cửu Chương (8 lessons)
  - 🐾 Thế Giới Động Vật (6 lessons)
  - 🫀 Cơ Thể Con Người (7 lessons)
  - 🔤 Học Chữ Cái (4 lessons)

**Verify in Supabase:**
```sql
SELECT id, title, total_lessons FROM courses WHERE is_published = true ORDER BY created_at DESC;
-- Should return 5 rows with correct lesson counts
```

---

#### B2: Filter Courses (Tất cả, Đang học, Hoàn thành)
**Steps:**
1. In courses list, tap "Tất cả" filter (default)
2. See all 5 courses
3. Tap "Đang học"
4. See 0 courses (none started yet)
5. Tap "Hoàn thành"
6. See 0 courses (none completed yet)

**Expected:**
- ✅ Filter buttons work correctly
- ✅ List updates dynamically

---

#### B3: Open Course & See Lessons
**Steps:**
1. Tap any course (e.g., "Phép Cộng và Trừ")
2. Wait for lessons to load

**Expected:**
- ✅ Course header shows emoji, title, description
- ✅ Progress bar shows `0/5 bài`
- ✅ See all 5 lesson cards with:
  - Title, emoji, duration, XP reward
  - ❌ Completion checkmark (not done yet)

**Verify in Supabase:**
```sql
SELECT id, title, type, duration_seconds, xp_reward, video_url FROM lessons 
WHERE course_id = '550e8400-e29b-41d4-a716-446655440101' 
ORDER BY "order" ASC;
-- Should return 5 rows:
--   1. Phép Cộng Không Nhớ (video, 300s, 20 XP)
--   2. Phép Cộng Có Nhớ (video, 360s, 25 XP)
--   3. Ôn Tập Cộng (reading, 180s, 15 XP)
--   4. Quiz: Phép Cộng (quiz, 120s, 20 XP)
--   5. Thử Thách Cộng (quiz, 150s, 30 XP)
```

---

### C. Lesson Playback & Types

#### C1: Video Lesson (Real Video)
**Steps:**
1. Tap first lesson: "Phép Cộng Không Nhớ"
2. Wait for video to load

**Expected:**
- ✅ Header shows: 🎬 Video
- ✅ Video player shows with native controls
- ✅ Video plays (Elephants Dream, ~5 min)
- ✅ Can pause/resume
- ✅ "Tôi đã xem xong!" button available at all times
- ✅ Pressing button shows completion overlay

**Database check:**
```sql
SELECT video_url FROM lessons WHERE id = '550e8400-e29b-41d4-a716-446655441001';
-- Should return: https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4
```

---

#### C2: Video Lesson (Placeholder — No URL)
**Steps:**
1. Create a test lesson with `video_url = NULL`
2. Tap the lesson

**Expected:**
- ✅ Dark placeholder shows with ▶️ emoji
- ✅ Shows estimated time
- ✅ Shows message: "Video đang được cập nhật"
- ✅ Info banner explains student can still complete
- ✅ "Tôi đã xem xong!" button works

---

#### C3: Reading Lesson
**Steps:**
1. Tap third lesson: "Ôn Tập Cộng"
2. Wait for content to load

**Expected:**
- ✅ Header shows: 📖 Đọc
- ✅ Shows progress: "📖 Phần 1/1" (or more if text has multiple paragraphs)
- ✅ Text displays in card
- ✅ "Tiếp theo →" button visible
- ✅ After last paragraph, shows "Hoàn thành" button
- ✅ Pressing completes lesson

**Database check:**
```sql
SELECT content FROM lessons WHERE id = '550e8400-e29b-41d4-a716-446655441003';
-- Should have Vietnamese learning content
```

---

#### C4: Quiz Lesson (Mock Quiz)
**Steps:**
1. Tap fourth lesson: "Quiz: Phép Cộng"
2. Wait for quiz to load

**Expected:**
- ✅ Header shows: ✏️ Quiz
- ✅ Question displays in purple card
- ✅ 4 options (A, B, C, D) with radio buttons
- ✅ Can select one option
- ✅ "Kiểm tra" button disabled until selection
- ✅ After submit:
  - ✅ Correct answer shows ✅ green
  - ❌ Incorrect answer shows red
  - ✅ Explanation appears
  - ✅ Shows feedback message

**Note:** This uses `MOCK_LESSONS` data because quiz content isn't in database yet.

---

#### C5: Quiz Placeholder (No Quiz Data)
**Steps:**
1. Create a lesson with `type='quiz'` and `content=NULL`
2. Tap the lesson

**Expected:**
- ✅ Shows 📝 placeholder
- ✅ Message: "Bài tập đang được cập nhật"
- ✅ Explains teacher is preparing quiz
- ✅ "Bạn vẫn có thể hoàn thành bài học này" banner
- ✅ "Hoàn thành" button works

---

### D. Progress & XP System

#### D1: Complete Lesson → Award XP
**Steps:**
1. Log in as `Bảo Nguyên`
2. Check home screen: XP = 0
3. Tap first video lesson and complete it
4. Confirm completion overlay shows `+20 XP`
5. Return to home screen

**Expected:**
- ✅ Completion overlay shows: "🎉 Hoàn thành!" + `⭐ +20 XP`
- ✅ Home screen now shows XP: 20
- ✅ Level bar progresses slightly
- ✅ Lesson shows ✅ checkmark in course list

**Verify in Supabase:**
```sql
SELECT * FROM progress WHERE user_id = '550e8400-e29b-41d4-a716-446655440010';
-- xp should be 20, level should be 1, xp_today should be 20

SELECT * FROM lesson_progress WHERE user_id = '550e8400-e29b-41d4-a716-446655440010' AND lesson_id = '550e8400-e29b-41d4-a716-446655441001';
-- Should have is_completed=true, completed_at=NOW()
```

---

#### D2: Perfect Quiz → Bonus XP
**Steps:**
1. Tap quiz lesson
2. Select correct answer
3. Submit
4. See feedback and complete

**Expected:**
- ✅ Completion overlay shows: `⭐ +30 XP` (20 base + 10 perfect bonus + 5 streak bonus)
  - Base: 20 XP
  - Perfect quiz: +10 XP
  - First streak: +5 XP (min(1, 5) * 5)

**Verify in Supabase:**
```sql
SELECT amount, source FROM xp_logs WHERE user_id = '550e8400-e29b-41d4-a716-446655440010' ORDER BY earned_at DESC LIMIT 3;
-- Should show 3 entries: lesson (20), perfect (10), streak (5)
```

---

#### D3: Streak System
**Steps:**
1. Complete one lesson today
2. Check home screen: streak = 1
3. Close and reopen app
4. Streak should still be 1 (same day)
5. Check next day after midnight: streak resets to 0
6. Complete lesson: streak becomes 1 again

**Expected:**
- ✅ Streak increments on first lesson each day
- ✅ Persists across app restarts (same day)
- ✅ Resets after 1 day gap

**Verify in Supabase:**
```sql
SELECT streak, longest_streak, last_active_date FROM progress 
WHERE user_id = '550e8400-e29b-41d4-a716-446655440010';
-- streak should be 1, longest_streak should be 1, last_active_date should be today
```

---

#### D4: Double-Completion Prevention
**Steps:**
1. Open a lesson (not yet complete)
2. Rapidly tap "Hoàn thành" button twice (or completion overlay buttons)
3. Check XP awarded

**Expected:**
- ✅ Only awards XP once (not twice)
- ✅ Lesson marked complete once
- ✅ No duplicate `lesson_progress` rows

**Verify in Supabase:**
```sql
SELECT COUNT(*) FROM lesson_progress 
WHERE user_id = '550e8400-e29b-41d4-a716-446655440010' AND lesson_id = '...';
-- Should be exactly 1, not 2
```

---

#### D5: Review Lesson (Already Completed)
**Steps:**
1. Complete a lesson (from D1)
2. Return to course and tap same lesson again
3. Complete it again

**Expected:**
- ✅ Header shows: "✅ Đã hoàn thành — đang ôn lại"
- ✅ Completion overlay shows: "📚 Ôn lại xong rồi!" (review message)
- ✅ No XP awarded (only on first completion)
- ✅ "Ôn bài là cách học thông minh!" message

**Verify in Supabase:**
```sql
SELECT * FROM xp_logs WHERE user_id = '550e8400-e29b-41d4-a716-446655440010' 
AND source_id = '550e8400-e29b-41d4-a716-446655441001';
-- Should have exactly 1 XP log for this lesson (no duplicates)
```

---

### E. Data Persistence & Sync

#### E1: Progress Syncs to Database (Background)
**Steps:**
1. Log in and complete 3 lessons (45 XP total, assuming no bonuses)
2. Open app settings or background it
3. Wait 5+ seconds (sync interval is 5 min in code, but might be faster)
4. Check Supabase directly

**Expected:**
- ✅ Progress table updated with latest XP/level/streak
- ✅ lesson_progress table has 3 rows (one per completed lesson)

**Verify in Supabase:**
```sql
SELECT xp, level, streak FROM progress WHERE user_id = '550e8400-e29b-41d4-a716-446655440010';
-- xp should be ≥45

SELECT COUNT(*) FROM lesson_progress WHERE user_id = '550e8400-e29b-41d4-a716-446655440010' AND is_completed = true;
-- Should be ≥3
```

---

#### E2: Progress Syncs on Logout
**Steps:**
1. Log in and complete a lesson
2. Tap teacher profile → "Thoát" button
3. Confirm logout

**Expected:**
- ✅ Progress syncs to DB before logout completes
- ✅ User returned to onboarding screen
- ✅ Data persisted

**Verify in Supabase:**
```sql
SELECT xp FROM progress WHERE user_id = '550e8400-e29b-41d4-a716-446655440010';
-- Should have latest XP
```

---

#### E3: Progress Hydrates on Login
**Steps:**
1. Student completes lessons (XP = 45)
2. Logout
3. Login again with same credentials

**Expected:**
- ✅ Home screen shows XP = 45 (loaded from DB, not reset)
- ✅ Completed lessons marked with ✅
- ✅ Streak persists

**Verify in Supabase:**
```sql
SELECT xp FROM progress WHERE user_id = '550e8400-e29b-41d4-a716-446655440010';
-- Matches home screen XP value
```

---

### F. Teacher Dashboard

#### F1: Teacher Sees Student Stats
**Steps:**
1. Log in as teacher (`Cô Thuận`, `TEACHER001`)
2. View dashboard

**Expected:**
- ✅ Shows header: "Xin chào, Thuận! 👩‍🏫"
- ✅ Shows stats:
  - 👩‍🎓 3 học sinh (students enrolled)
  - ⚡ X% tỷ lệ hoàn thành (average completion rate)
  - 📚 2 khóa học (courses published)
- ✅ Shows "X học sinh đang học hôm nay"
- ✅ "Cần chú ý" section (if any students < 50% completion)
- ✅ "Học sinh xuất sắc" section (if any students > 70% completion)

**Verify in Supabase:**
```sql
SELECT * FROM courses WHERE teacher_id = '550e8400-e29b-41d4-a716-446655440001' AND is_published = true;
-- Should return 2 courses (Cô Thuận's courses)

SELECT COUNT(*) FROM users WHERE role = 'student';
-- Teachers see all students in MVP (future: per-class)
```

---

#### F2: Teacher Creates Course
**Steps:**
1. Log in as teacher
2. Tap "Tạo khóa" feature
3. Fill in course details
4. Save

**Expected:**
- ✅ Course creation form opens
- ✅ Course saves to `courses` table (see database section)

---

### G. Error Handling & Edge Cases

#### G1: Network Error During Login
**Steps:**
1. Enable airplane mode / disconnect WiFi
2. Try to login

**Expected:**
- ✅ Error message: "Chưa kết nối được. Thử lại hoặc nhờ giáo viên giúp nhé!"
- ✅ No crash

---

#### G2: Network Error During Course Load
**Steps:**
1. Log in successfully
2. Go to "Khóa học" tab
3. Disconnect internet
4. Pull to refresh

**Expected:**
- ✅ Error banner shows: "Chưa kết nối được. Kiểm tra mạng và thử lại nhé!"
- ✅ "Thử lại" button visible and functional
- ✅ Can reconnect and retry

---

#### G3: Missing Lesson Data
**Steps:**
1. Navigate to a lesson with missing `duration_seconds` or `xp_reward`

**Expected:**
- ✅ Uses defaults:
  - `durationSeconds = 300` (5 minutes)
  - `xpReward = 20` (20 XP)
- ✅ Lesson renders without errors

---

#### G4: Video Fails to Load
**Steps:**
1. Update a lesson's `video_url` to invalid URL
2. Tap the lesson

**Expected:**
- ✅ Shows error UI: "⚠️ Video failed to load"
- ✅ "Tôi đã xem xong!" button still works
- ✅ Can complete lesson without video

---

### H. Accessibility (Screen Readers)

#### H1: Button Labels for Screen Readers
**Steps:**
1. Enable screen reader (Android: TalkBack, iOS: VoiceOver)
2. Tap various buttons: "← Quay lại", "Tôi đã xem xong!", etc.

**Expected:**
- ✅ All buttons have `accessibilityLabel`
- ✅ Screen reader announces button purpose

---

#### H2: Interactive Elements Have Minimum Size
**Steps:**
1. Tap buttons throughout app (back, complete, next, etc.)

**Expected:**
- ✅ All interactive elements: `min-h-[48px]` (WCAG AA standard)
- ✅ Easy to tap for users with fine motor challenges

---

### I. UI/UX Polish

#### I1: Splash Screen Visible on Launch
**Steps:**
1. Kill app
2. Reopen
3. Observe splash screen

**Expected:**
- ✅ Splash screen visible for 1–2 seconds (not instant)
- ✅ Covers loading period
- ✅ No blank/jarring screen while courses load

---

#### I2: Course Progress Bar Updates
**Steps:**
1. Open course with 0 lessons completed
2. Complete one lesson
3. Return to course list and reopen course

**Expected:**
- ✅ Progress bar animates to new value
- ✅ Shows: "1/X bài hoàn thành"
- ✅ At 100%: Shows 🏆 "Hoàn thành! Xuất sắc!"

---

#### I3: Animations Smooth
**Steps:**
1. Navigate between screens
2. Complete lessons
3. Open/close modals

**Expected:**
- ✅ All transitions use Moti spring animations
- ✅ No janky jumps
- ✅ Duration ≤ 400ms (not slow)

---

## 🔍 Database Verification Queries

### Check Sample Data Loaded
```sql
-- Users
SELECT COUNT(*) FROM users;  -- Should be 5 (2 teachers, 3 students)

-- Courses
SELECT COUNT(*) FROM courses WHERE is_published = true;  -- Should be 5

-- Lessons
SELECT COUNT(*) FROM lessons WHERE is_published = true;  -- Should be 30

-- Tables should be empty initially (until tests run)
SELECT COUNT(*) FROM progress;  -- Should be 0 until first student logs in
SELECT COUNT(*) FROM lesson_progress;  -- Should be 0 until lessons completed
SELECT COUNT(*) FROM xp_logs;  -- Should be 0 until XP earned
```

### Monitor Progress During Tests
```sql
-- After a student logs in and completes lessons:

SELECT * FROM progress WHERE user_id = '550e8400-e29b-41d4-a716-446655440010';
-- Check: xp, level, streak, last_active_date updated

SELECT * FROM lesson_progress 
WHERE user_id = '550e8400-e29b-41d4-a716-446655440010' 
AND is_completed = true;
-- Check: Row count = # of lessons completed

SELECT * FROM xp_logs 
WHERE user_id = '550e8400-e29b-41d4-a716-446655440010' 
ORDER BY earned_at DESC;
-- Check: XP logs record each lesson + streak bonus
```

### Course & Lesson Structure
```sql
SELECT courses.id, courses.title, COUNT(lessons.id) as lesson_count
FROM courses
LEFT JOIN lessons ON lessons.course_id = courses.id
WHERE courses.is_published = true
GROUP BY courses.id, courses.title;
-- Should show 5 courses with correct lesson counts:
--   Phép Cộng và Trừ: 5
--   Bảng Cửu Chương: 8
--   Thế Giới Động Vật: 6
--   Cơ Thể Con Người: 7
--   Học Chữ Cái: 4
```

---

## 📝 Issue Log Template

| # | Date | Component | Issue | Severity | Fix | Status |
|---|------|-----------|-------|----------|-----|--------|
| 1 | | | | | | |

---

## ✅ Sign-Off

- [ ] All test cases passed
- [ ] No console errors or crashes
- [ ] Database data verified
- [ ] TypeScript check: `npm run ts` passes
- [ ] Ready for user testing

