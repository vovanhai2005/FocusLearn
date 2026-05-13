-- ========================================
-- FOCUSLEARN SAMPLE DATA
-- Run these SQL statements in Supabase SQL Editor
-- ========================================
--
-- UUID MAP (for reference):
--   Teachers:
--     Cô Thuận    → 550e8400-e29b-41d4-a716-446655440001
--     Thầy Nam    → 550e8400-e29b-41d4-a716-446655440002
--   Students:
--     Bảo Nguyên  → 550e8400-e29b-41d4-a716-446655440010
--     Linh Nhi    → 550e8400-e29b-41d4-a716-446655440011
--     Minh Tuấn   → 550e8400-e29b-41d4-a716-446655440012
--   Courses:
--     Phép Cộng và Trừ  → 550e8400-e29b-41d4-a716-446655440101
--     Bảng Cửu Chương   → 550e8400-e29b-41d4-a716-446655440102
--     Thế Giới Động Vật → 550e8400-e29b-41d4-a716-446655440201
--     Cơ Thể Con Người  → 550e8400-e29b-41d4-a716-446655440202
--     Học Chữ Cái       → 550e8400-e29b-41d4-a716-446655440301
-- ========================================

-- ========================================
-- 1. INSERT TEACHERS
-- ========================================
INSERT INTO users (id, name, role, avatar_emoji, access_code, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Cô Thuận', 'teacher', '👩‍🏫', 'TEACHER001', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'Thầy Nam', 'teacher', '👨‍🏫', 'TEACHER002', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 2. INSERT STUDENTS
-- ========================================
INSERT INTO users (id, name, role, avatar_emoji, access_code, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440010', 'Bảo Nguyên', 'student', '🦊', 'STUDENT001', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440011', 'Linh Nhi',   'student', '🐰', 'STUDENT002', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440012', 'Minh Tuấn',  'student', '🐻', 'STUDENT303', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 3. INSERT COURSES
-- ========================================
INSERT INTO courses (id, title, description, emoji, color_key, teacher_id, difficulty, total_lessons, estimated_minutes, is_published, created_at, updated_at)
VALUES
  -- Math Courses (Cô Thuận)
  ('550e8400-e29b-41d4-a716-446655440101', 'Phép Cộng và Trừ',   'Học cơ bản về cộng và trừ số có nhớ',               '➕',  'primary',   '550e8400-e29b-41d4-a716-446655440001', 'easy',   5, 25, true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440102', 'Bảng Cửu Chương',    'Luyện tập bảng cửu chương 2-9',                      '✖️', 'secondary', '550e8400-e29b-41d4-a716-446655440001', 'medium', 8, 40, true, NOW(), NOW()),

  -- Science Courses (Thầy Nam)
  ('550e8400-e29b-41d4-a716-446655440201', 'Thế Giới Động Vật',  'Học về các loài động vật và môi trường sống',        '🐾', 'success',   '550e8400-e29b-41d4-a716-446655440002', 'easy',   6, 30, true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440202', 'Cơ Thể Con Người',   'Tìm hiểu các bộ phận cơ thể và chức năng',          '🫀', 'info',      '550e8400-e29b-41d4-a716-446655440002', 'medium', 7, 35, true, NOW(), NOW()),

  -- Language Courses (Cô Thuận)
  ('550e8400-e29b-41d4-a716-446655440301', 'Học Chữ Cái',        'Bảng chữ cái và các âm cơ bản',                     '🔤', 'warning',   '550e8400-e29b-41d4-a716-446655440001', 'easy',   4, 20, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 4. INSERT LESSONS - MATH COURSE 1 (Phép Cộng và Trừ)
-- ========================================
INSERT INTO lessons (id, course_id, title, emoji, type, duration_seconds, xp_reward, "order", content, video_url, is_published, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655441001', '550e8400-e29b-41d4-a716-446655440101', 'Phép Cộng Không Nhớ', '➕',  'video',   300, 20, 1, NULL, 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655441002', '550e8400-e29b-41d4-a716-446655440101', 'Phép Cộng Có Nhớ',   '➕➕','video',   360, 25, 2, NULL, 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655441003', '550e8400-e29b-41d4-a716-446655440101', 'Ôn Tập Cộng',        '📖', 'reading', 180, 15, 3, 'Hôm nay chúng ta sẽ ôn tập lại bài cộng. Cộng là phép tính gộp các số lại với nhau. Ví dụ: 3 + 2 = 5. Nghĩa là nếu bạn có 3 quả táo, rồi có thêm 2 quả táo nữa, thì tổng cộng bạn sẽ có 5 quả táo. Hãy cố gắng luyện tập nhiều nhé!', NULL, true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655441004', '550e8400-e29b-41d4-a716-446655440101', 'Quiz: Phép Cộng',    '✏️', 'quiz',    120, 20, 4, NULL, NULL, true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655441005', '550e8400-e29b-41d4-a716-446655440101', 'Thử Thách Cộng',     '🎯', 'quiz',    150, 30, 5, NULL, NULL, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 5. INSERT LESSONS - MATH COURSE 2 (Bảng Cửu Chương)
-- ========================================
INSERT INTO lessons (id, course_id, title, emoji, type, duration_seconds, xp_reward, "order", content, video_url, is_published, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655442001', '550e8400-e29b-41d4-a716-446655440102', 'Bảng Cửu Chương 2', '2️⃣', 'video',   300, 20, 1, NULL, 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655442002', '550e8400-e29b-41d4-a716-446655440102', 'Bảng Cửu Chương 3', '3️⃣', 'video',   300, 20, 2, NULL, 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655442003', '550e8400-e29b-41d4-a716-446655440102', 'Bảng Cửu Chương 5', '5️⃣', 'reading', 180, 15, 3, 'Bảng cửu chương 5 rất dễ nhớ! 5 x 1 = 5, 5 x 2 = 10, 5 x 3 = 15, 5 x 4 = 20... Bạn thấy chưa? Kết quả luôn kết thúc bằng 0 hoặc 5. Rất dễ phải không!', NULL, true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655442004', '550e8400-e29b-41d4-a716-446655440102', 'Quiz Bảng Cửu Chương', '✏️', 'quiz', 120, 25, 4, NULL, NULL, true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655442005', '550e8400-e29b-41d4-a716-446655440102', 'Thử Thách Nhân',    '⚡', 'quiz',    180, 35, 5, NULL, NULL, true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655442006', '550e8400-e29b-41d4-a716-446655440102', 'Luyện Tập Bảng 7',  '7️⃣', 'video',  300, 20, 6, NULL, 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655442007', '550e8400-e29b-41d4-a716-446655440102', 'Luyện Tập Bảng 8',  '8️⃣', 'video',  300, 20, 7, NULL, 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655442008', '550e8400-e29b-41d4-a716-446655440102', 'Bảng 9 - Đặc Biệt', '9️⃣', 'reading', 180, 15, 8, 'Bảng 9 có một bí quyết đặc biệt! Nếu bạn cộng các chữ số của kết quả, chúng luôn bằng 9. Ví dụ: 9 x 3 = 27, và 2 + 7 = 9. Thử xem nhé!', NULL, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 6. INSERT LESSONS - SCIENCE COURSE 1 (Thế Giới Động Vật)
-- ========================================
INSERT INTO lessons (id, course_id, title, emoji, type, duration_seconds, xp_reward, "order", content, video_url, is_published, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655443001', '550e8400-e29b-41d4-a716-446655440201', 'Sư Tử - Vua Của Các Thú', '🦁', 'video',   300, 20, 1, NULL, 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655443002', '550e8400-e29b-41d4-a716-446655440201', 'Cá Heo - Bạn Thông Minh', '🐬', 'video',   300, 20, 2, NULL, 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655443003', '550e8400-e29b-41d4-a716-446655440201', 'Chim Ưng - Vua Bầu Trời', '🦅', 'reading', 180, 15, 3, 'Chim ưng là loài chim săn mồi lớn nhất ở nhiều khu vực. Chúng có mắt rất nhạy bén, có thể nhìn thấy con mồi từ rất xa. Chim ưng sống ở núi cao và xây tổ trên những vách đá.', NULL, true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655443004', '550e8400-e29b-41d4-a716-446655440201', 'Quiz: Động Vật',          '✏️', 'quiz',    120, 20, 4, NULL, NULL, true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655443005', '550e8400-e29b-41d4-a716-446655440201', 'Gấu Trúc - Biểu Tượng',  '🐼', 'video',   300, 20, 5, NULL, 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655443006', '550e8400-e29b-41d4-a716-446655440201', 'Thách Thức Động Vật',     '🎯', 'quiz',    150, 30, 6, NULL, NULL, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 7. INSERT LESSONS - SCIENCE COURSE 2 (Cơ Thể Con Người)
-- ========================================
INSERT INTO lessons (id, course_id, title, emoji, type, duration_seconds, xp_reward, "order", content, video_url, is_published, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655444001', '550e8400-e29b-41d4-a716-446655440202', 'Tim - Bơm Máu',            '❤️', 'video',   300, 20, 1, NULL, 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655444002', '550e8400-e29b-41d4-a716-446655440202', 'Não - Trung Tâm Điều Khiển','🧠','video',  300, 20, 2, NULL, 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655444003', '550e8400-e29b-41d4-a716-446655440202', 'Xương và Cơ',              '💪', 'reading', 180, 15, 3, 'Cơ thể bạn có 206 xương. Chúng giúp bạn đứng thẳng và bảo vệ các cơ quan quan trọng. Cơ bắp giúp bạn chuyển động. Khi bạn chơi thể thao, các cơ bắp của bạn phát triển và trở nên mạnh hơn!', NULL, true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655444004', '550e8400-e29b-41d4-a716-446655440202', 'Hệ Tiêu Hóa',             '🍽️','video',  300, 20, 4, NULL, 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655444005', '550e8400-e29b-41d4-a716-446655440202', 'Quiz: Cơ Thể Con Người',  '✏️', 'quiz',    120, 25, 5, NULL, NULL, true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655444006', '550e8400-e29b-41d4-a716-446655440202', 'Phổi và Hô Hấp',          '💨', 'reading', 180, 15, 6, 'Phổi giúp bạn hô hấp. Khi bạn hít vào, không khí đi vào phổi. Phổi lấy oxy từ không khí và cho vào máu. Khi bạn thở ra, phổi đẩy ra khí thải.', NULL, true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655444007', '550e8400-e29b-41d4-a716-446655440202', 'Thách Thức Cơ Thể',       '⚡', 'quiz',    150, 30, 7, NULL, NULL, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 8. INSERT LESSONS - LANGUAGE COURSE (Học Chữ Cái)
-- ========================================
INSERT INTO lessons (id, course_id, title, emoji, type, duration_seconds, xp_reward, "order", content, video_url, is_published, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655445001', '550e8400-e29b-41d4-a716-446655440301', 'Chữ A - Z',      '🔤', 'video',   300, 20, 1, NULL, 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655445002', '550e8400-e29b-41d4-a716-446655440301', 'Âm Đầu Tiếng',   '🔊', 'video',   300, 20, 2, NULL, 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655445003', '550e8400-e29b-41d4-a716-446655440301', 'Từ Đơn Giản',    '📝', 'reading', 180, 15, 3, 'Các từ đơn giản: Cat (mèo), Dog (chó), Apple (táo), Book (sách). Bạn hãy học những từ này và tập phát âm từng chữ cái.', NULL, true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655445004', '550e8400-e29b-41d4-a716-446655440301', 'Quiz: Chữ Cái',  '✏️', 'quiz',    120, 20, 4, NULL, NULL, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 9. INSERT SAMPLE PROGRESS DATA
-- ========================================
INSERT INTO progress (user_id, xp, xp_today, xp_daily_goal, level, streak, longest_streak, last_active_date, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440010', 350, 45, 50, 4, 5,  7,  '2026-05-13', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440011', 210, 30, 50, 3, 2,  3,  '2026-05-13', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440012', 480, 50, 50, 5, 8,  12, '2026-05-13', NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

-- ========================================
-- DONE! Access codes to log in:
-- ========================================
-- Teachers: TEACHER001, TEACHER002
-- Students: STUDENT001, STUDENT002, STUDENT303
--
-- Sample video URLs used (public BigBuckBunny Commons):
--   https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4
--   https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4
--   https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4
