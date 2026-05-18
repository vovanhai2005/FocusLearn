-- ─────────────────────────────────────────────────────────────
-- Migration: add_grade_to_courses
-- Thêm phân lớp (grade 1–12) vào courses và users
-- ─────────────────────────────────────────────────────────────

-- 1. Thêm cột grade vào bảng courses
--    NOT NULL DEFAULT 1 để không break dữ liệu cũ
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS grade smallint NOT NULL DEFAULT 1
  CONSTRAINT courses_grade_range CHECK (grade BETWEEN 1 AND 12);

-- 2. Thêm cột grade vào bảng users (cho học sinh)
--    Nullable vì giáo viên không có grade
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS grade smallint
  CONSTRAINT users_grade_range CHECK (grade BETWEEN 1 AND 12);

-- 3. Index để query theo grade nhanh
CREATE INDEX IF NOT EXISTS idx_courses_grade ON courses(grade);
CREATE INDEX IF NOT EXISTS idx_users_grade    ON users(grade);

-- 4. RLS: Học sinh chỉ đọc courses cùng lớp với mình
--    Giáo viên thấy tất cả
--    (Chạy sau khi đã bật RLS trên bảng courses)

-- Xóa policy cũ nếu tồn tại để idempotent
DROP POLICY IF EXISTS "students_see_own_grade_courses" ON courses;

CREATE POLICY "students_see_own_grade_courses"
ON courses FOR SELECT
USING (
  -- Học sinh: chỉ thấy courses cùng grade
  (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role = 'student'
        AND grade = courses.grade
    )
  )
  OR
  -- Giáo viên: thấy tất cả courses của mình
  (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND role = 'teacher'
    )
  )
);
