-- FocusLearn Supabase setup
-- Run this in Supabase SQL Editor for project qxlesbcxfreznwoqjhym.
--
-- This script keeps the existing app tables and adds normalized storage for
-- AI-generated quizzes, questions, answer choices, source documents, and quiz
-- attempts. It also inserts demo data that works with the current login screen.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- AI quiz source and normalized quiz tables
-- ---------------------------------------------------------------------------

create table if not exists public.source_documents (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.users(id) on delete cascade,
  file_name text not null,
  mime_type text,
  file_size_bytes bigint,
  storage_path text,
  public_url text,
  created_at timestamp with time zone default now()
);

create table if not exists public.ai_quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null unique references public.lessons(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  teacher_id uuid not null references public.users(id) on delete cascade,
  source_document_id uuid references public.source_documents(id) on delete set null,
  title text not null,
  summary text not null,
  generated_from text not null,
  subject text,
  language text not null default 'vi' check (language in ('vi', 'en')),
  requested_difficulty text not null default 'mixed'
    check (requested_difficulty in ('easy', 'medium', 'hard', 'mixed')),
  requested_question_count integer not null default 10
    check (requested_question_count > 0 and requested_question_count <= 50),
  validation_warnings text[] not null default '{}'::text[],
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.ai_quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.ai_quizzes(id) on delete cascade,
  order_index integer not null check (order_index > 0),
  question_text text not null,
  correct_choice_id text not null check (correct_choice_id in ('A', 'B', 'C', 'D')),
  explanation text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  source_reference text,
  learning_objective text,
  created_at timestamp with time zone default now(),
  unique (quiz_id, order_index)
);

create table if not exists public.ai_quiz_choices (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.ai_quiz_questions(id) on delete cascade,
  choice_id text not null check (choice_id in ('A', 'B', 'C', 'D')),
  order_index integer not null check (order_index between 1 and 4),
  choice_text text not null,
  is_correct boolean not null default false,
  created_at timestamp with time zone default now(),
  unique (question_id, choice_id)
);

create table if not exists public.ai_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.ai_quizzes(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  total_questions integer not null check (total_questions > 0),
  correct_count integer not null default 0 check (correct_count >= 0),
  score integer not null default 0 check (score >= 0 and score <= 100),
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  unique (quiz_id, user_id, started_at)
);

create table if not exists public.ai_quiz_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.ai_quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.ai_quiz_questions(id) on delete cascade,
  selected_choice_id text not null check (selected_choice_id in ('A', 'B', 'C', 'D')),
  is_correct boolean not null default false,
  answered_at timestamp with time zone default now(),
  unique (attempt_id, question_id)
);

create index if not exists source_documents_teacher_id_idx
  on public.source_documents(teacher_id);
create index if not exists ai_quizzes_course_id_idx
  on public.ai_quizzes(course_id);
create index if not exists ai_quizzes_teacher_id_idx
  on public.ai_quizzes(teacher_id);
create index if not exists ai_quiz_questions_quiz_id_idx
  on public.ai_quiz_questions(quiz_id);
create index if not exists ai_quiz_choices_question_id_idx
  on public.ai_quiz_choices(question_id);
create index if not exists ai_quiz_attempts_user_id_idx
  on public.ai_quiz_attempts(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_ai_quizzes_updated_at on public.ai_quizzes;
create trigger set_ai_quizzes_updated_at
before update on public.ai_quizzes
for each row execute function public.set_updated_at();

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on
  public.users,
  public.courses,
  public.lessons,
  public.progress,
  public.lesson_progress,
  public.xp_logs,
  public.source_documents,
  public.ai_quizzes,
  public.ai_quiz_questions,
  public.ai_quiz_choices,
  public.ai_quiz_attempts,
  public.ai_quiz_answers
to anon, authenticated;

-- The app currently uses a simple access-code login plus Supabase anonymous
-- sessions. For this MVP/demo schema we keep policies permissive so mobile
-- clients can create courses, lessons, quizzes, and progress records.
-- Tighten these policies before production.
alter table public.users enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.progress enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.xp_logs enable row level security;
alter table public.source_documents enable row level security;
alter table public.ai_quizzes enable row level security;
alter table public.ai_quiz_questions enable row level security;
alter table public.ai_quiz_choices enable row level security;
alter table public.ai_quiz_attempts enable row level security;
alter table public.ai_quiz_answers enable row level security;

drop policy if exists "focuslearn_open_users" on public.users;
drop policy if exists "focuslearn_open_courses" on public.courses;
drop policy if exists "focuslearn_open_lessons" on public.lessons;
drop policy if exists "focuslearn_open_progress" on public.progress;
drop policy if exists "focuslearn_open_lesson_progress" on public.lesson_progress;
drop policy if exists "focuslearn_open_xp_logs" on public.xp_logs;
drop policy if exists "focuslearn_open_source_documents" on public.source_documents;
drop policy if exists "focuslearn_open_ai_quizzes" on public.ai_quizzes;
drop policy if exists "focuslearn_open_ai_quiz_questions" on public.ai_quiz_questions;
drop policy if exists "focuslearn_open_ai_quiz_choices" on public.ai_quiz_choices;
drop policy if exists "focuslearn_open_ai_quiz_attempts" on public.ai_quiz_attempts;
drop policy if exists "focuslearn_open_ai_quiz_answers" on public.ai_quiz_answers;

create policy "focuslearn_open_users"
on public.users for all to anon, authenticated using (true) with check (true);
create policy "focuslearn_open_courses"
on public.courses for all to anon, authenticated using (true) with check (true);
create policy "focuslearn_open_lessons"
on public.lessons for all to anon, authenticated using (true) with check (true);
create policy "focuslearn_open_progress"
on public.progress for all to anon, authenticated using (true) with check (true);
create policy "focuslearn_open_lesson_progress"
on public.lesson_progress for all to anon, authenticated using (true) with check (true);
create policy "focuslearn_open_xp_logs"
on public.xp_logs for all to anon, authenticated using (true) with check (true);
create policy "focuslearn_open_source_documents"
on public.source_documents for all to anon, authenticated using (true) with check (true);
create policy "focuslearn_open_ai_quizzes"
on public.ai_quizzes for all to anon, authenticated using (true) with check (true);
create policy "focuslearn_open_ai_quiz_questions"
on public.ai_quiz_questions for all to anon, authenticated using (true) with check (true);
create policy "focuslearn_open_ai_quiz_choices"
on public.ai_quiz_choices for all to anon, authenticated using (true) with check (true);
create policy "focuslearn_open_ai_quiz_attempts"
on public.ai_quiz_attempts for all to anon, authenticated using (true) with check (true);
create policy "focuslearn_open_ai_quiz_answers"
on public.ai_quiz_answers for all to anon, authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Demo data
-- Login screen accepts numbers only, so access codes below are 6 digits.
-- Teacher: name Lan, code 100001
-- Students: An 200001, Bao 200002, Nhi 200003, Khoa 200004
-- ---------------------------------------------------------------------------

insert into public.users (
  id, name, role, avatar_emoji, access_code, grade, teacher_id, school, bio
) values
  (
    '00000000-0000-4000-8000-000000000001',
    'Lan',
    'teacher',
    '👩‍🏫',
    '100001',
    null,
    null,
    'FocusLearn Demo School',
    'Giáo viên demo cho lớp Toán và Khoa học.'
  ),
  (
    '00000000-0000-4000-8000-000000000010',
    'An',
    'student',
    '🦊',
    '200001',
    4,
    '00000000-0000-4000-8000-000000000001',
    null,
    null
  ),
  (
    '00000000-0000-4000-8000-000000000011',
    'Bao',
    'student',
    '🐼',
    '200002',
    4,
    '00000000-0000-4000-8000-000000000001',
    null,
    null
  ),
  (
    '00000000-0000-4000-8000-000000000012',
    'Nhi',
    'student',
    '🦋',
    '200003',
    5,
    '00000000-0000-4000-8000-000000000001',
    null,
    null
  ),
  (
    '00000000-0000-4000-8000-000000000013',
    'Khoa',
    'student',
    '🚀',
    '200004',
    5,
    '00000000-0000-4000-8000-000000000001',
    null,
    null
  )
on conflict (id) do update set
  name = excluded.name,
  role = excluded.role,
  avatar_emoji = excluded.avatar_emoji,
  access_code = excluded.access_code,
  grade = excluded.grade,
  teacher_id = excluded.teacher_id,
  school = excluded.school,
  bio = excluded.bio,
  updated_at = now();

insert into public.courses (
  id, title, description, emoji, color_key, teacher_id, total_lessons,
  estimated_minutes, difficulty, tags, is_published
) values
  (
    '00000000-0000-4000-8000-000000000101',
    'Toán tư duy lớp 4',
    'Các bài học ngắn về phép nhân, chia và giải toán có lời văn.',
    '🔢',
    'primary',
    '00000000-0000-4000-8000-000000000001',
    3,
    12,
    'easy',
    array['toan', 'lop-4'],
    true
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    'Khoa học quanh em',
    'Tìm hiểu thực vật, động vật và cơ thể người qua micro-lesson.',
    '🌿',
    'success',
    '00000000-0000-4000-8000-000000000001',
    3,
    14,
    'medium',
    array['khoa-hoc', 'lop-5'],
    true
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  emoji = excluded.emoji,
  color_key = excluded.color_key,
  teacher_id = excluded.teacher_id,
  total_lessons = excluded.total_lessons,
  estimated_minutes = excluded.estimated_minutes,
  difficulty = excluded.difficulty,
  tags = excluded.tags,
  is_published = excluded.is_published,
  updated_at = now();

insert into public.lessons (
  id, course_id, title, emoji, type, duration_seconds, xp_reward, "order",
  content, video_url, is_published
) values
  (
    '00000000-0000-4000-8000-000000001001',
    '00000000-0000-4000-8000-000000000101',
    'Nhân với số có một chữ số',
    '✖️',
    'reading',
    240,
    20,
    1,
    'Khi nhân một số với số có một chữ số, ta nhân lần lượt từ phải sang trái. Ví dụ: 23 x 4 = 92. Hãy tách thành 20 x 4 và 3 x 4 để dễ hiểu hơn.',
    null,
    true
  ),
  (
    '00000000-0000-4000-8000-000000001002',
    '00000000-0000-4000-8000-000000000101',
    'Quiz AI: Phép nhân nhanh',
    '✨',
    'quiz',
    180,
    30,
    2,
    $json$
{
  "title": "Quiz AI: Phép nhân nhanh",
  "summary": "Ôn cách nhân số có hai chữ số với số có một chữ số.",
  "generated_from": "demo-phep-nhan.txt",
  "questions": [
    {
      "question": "23 x 4 bằng bao nhiêu?",
      "choices": [
        { "id": "A", "text": "72" },
        { "id": "B", "text": "82" },
        { "id": "C", "text": "92" },
        { "id": "D", "text": "102" }
      ],
      "correct_answer": "C",
      "explanation": "23 x 4 = 20 x 4 + 3 x 4 = 80 + 12 = 92.",
      "difficulty": "easy",
      "source_reference": "Bài đọc: Nhân với số có một chữ số",
      "learning_objective": "Tách số để nhân nhanh"
    },
    {
      "question": "Muốn tính 34 x 2, cách tách nào đúng?",
      "choices": [
        { "id": "A", "text": "30 x 2 + 4 x 2" },
        { "id": "B", "text": "3 x 2 + 4 x 2" },
        { "id": "C", "text": "34 + 2" },
        { "id": "D", "text": "30 + 4 + 2" }
      ],
      "correct_answer": "A",
      "explanation": "Ta tách 34 thành 30 và 4, sau đó nhân từng phần với 2.",
      "difficulty": "medium",
      "source_reference": "Bài đọc: Nhân với số có một chữ số",
      "learning_objective": "Hiểu phép nhân theo giá trị hàng"
    }
  ]
}
$json$,
    null,
    true
  ),
  (
    '00000000-0000-4000-8000-000000001003',
    '00000000-0000-4000-8000-000000000101',
    'Giải toán có lời văn',
    '🧩',
    'reading',
    300,
    25,
    3,
    'Đọc kỹ đề bài, gạch chân dữ kiện quan trọng, chọn phép tính phù hợp rồi viết câu trả lời. Mỗi bước nhỏ giúp em tránh bị rối.',
    null,
    true
  ),
  (
    '00000000-0000-4000-8000-000000001101',
    '00000000-0000-4000-8000-000000000102',
    'Cây cần gì để sống?',
    '🌱',
    'reading',
    240,
    20,
    1,
    'Cây cần ánh sáng, nước, không khí và chất dinh dưỡng trong đất để lớn lên. Nếu thiếu một yếu tố quan trọng, cây sẽ phát triển chậm.',
    null,
    true
  ),
  (
    '00000000-0000-4000-8000-000000001102',
    '00000000-0000-4000-8000-000000000102',
    'Quiz AI: Điều kiện sống của cây',
    '🌿',
    'quiz',
    180,
    30,
    2,
    $json$
{
  "title": "Quiz AI: Điều kiện sống của cây",
  "summary": "Kiểm tra kiến thức về các yếu tố giúp cây phát triển.",
  "generated_from": "demo-cay-can-gi.txt",
  "questions": [
    {
      "question": "Yếu tố nào sau đây cây cần để quang hợp?",
      "choices": [
        { "id": "A", "text": "Ánh sáng" },
        { "id": "B", "text": "Bánh kẹo" },
        { "id": "C", "text": "Đồ chơi" },
        { "id": "D", "text": "Tiếng nhạc lớn" }
      ],
      "correct_answer": "A",
      "explanation": "Cây dùng ánh sáng để quang hợp và tạo thức ăn.",
      "difficulty": "easy",
      "source_reference": "Bài đọc: Cây cần gì để sống?",
      "learning_objective": "Nhận biết điều kiện cây cần"
    },
    {
      "question": "Nếu cây không được tưới nước lâu ngày thì điều gì dễ xảy ra?",
      "choices": [
        { "id": "A", "text": "Cây lớn nhanh hơn" },
        { "id": "B", "text": "Cây bị héo" },
        { "id": "C", "text": "Cây biến thành đá" },
        { "id": "D", "text": "Cây không cần đất nữa" }
      ],
      "correct_answer": "B",
      "explanation": "Nước giúp cây vận chuyển chất dinh dưỡng. Thiếu nước cây dễ bị héo.",
      "difficulty": "medium",
      "source_reference": "Bài đọc: Cây cần gì để sống?",
      "learning_objective": "Giải thích vai trò của nước"
    }
  ]
}
$json$,
    null,
    true
  ),
  (
    '00000000-0000-4000-8000-000000001103',
    '00000000-0000-4000-8000-000000000102',
    'Động vật và môi trường sống',
    '🐾',
    'reading',
    300,
    25,
    3,
    'Mỗi loài động vật thích nghi với một môi trường sống khác nhau. Cá sống dưới nước, chim bay trên bầu trời, còn nhiều loài thú sống trên cạn.',
    null,
    true
  )
on conflict (id) do update set
  course_id = excluded.course_id,
  title = excluded.title,
  emoji = excluded.emoji,
  type = excluded.type,
  duration_seconds = excluded.duration_seconds,
  xp_reward = excluded.xp_reward,
  "order" = excluded."order",
  content = excluded.content,
  video_url = excluded.video_url,
  is_published = excluded.is_published,
  updated_at = now();

insert into public.progress (
  id, user_id, xp, xp_today, xp_daily_goal, level, streak, longest_streak,
  last_active_date
) values
  ('00000000-0000-4000-8000-000000002010', '00000000-0000-4000-8000-000000000010', 180, 40, 50, 2, 4, 5, current_date),
  ('00000000-0000-4000-8000-000000002011', '00000000-0000-4000-8000-000000000011', 95, 10, 50, 1, 2, 3, current_date),
  ('00000000-0000-4000-8000-000000002012', '00000000-0000-4000-8000-000000000012', 260, 50, 50, 3, 6, 6, current_date),
  ('00000000-0000-4000-8000-000000002013', '00000000-0000-4000-8000-000000000013', 20, 0, 50, 1, 0, 1, current_date - 3)
on conflict (user_id) do update set
  xp = excluded.xp,
  xp_today = excluded.xp_today,
  xp_daily_goal = excluded.xp_daily_goal,
  level = excluded.level,
  streak = excluded.streak,
  longest_streak = excluded.longest_streak,
  last_active_date = excluded.last_active_date,
  updated_at = now();

insert into public.lesson_progress (
  id, user_id, lesson_id, is_completed, completed_at, score, attempts
) values
  ('00000000-0000-4000-8000-000000003010', '00000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000001001', true, now() - interval '2 days', null, 1),
  ('00000000-0000-4000-8000-000000003011', '00000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000001002', true, now() - interval '1 day', 100, 1),
  ('00000000-0000-4000-8000-000000003012', '00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000001001', true, now() - interval '1 day', null, 1),
  ('00000000-0000-4000-8000-000000003013', '00000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000001101', true, now() - interval '1 day', null, 1),
  ('00000000-0000-4000-8000-000000003014', '00000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000001102', true, now(), 100, 1)
on conflict (id) do update set
  user_id = excluded.user_id,
  lesson_id = excluded.lesson_id,
  is_completed = excluded.is_completed,
  completed_at = excluded.completed_at,
  score = excluded.score,
  attempts = excluded.attempts;

insert into public.source_documents (
  id, teacher_id, file_name, mime_type, file_size_bytes
) values
  ('00000000-0000-4000-8000-000000004001', '00000000-0000-4000-8000-000000000001', 'demo-phep-nhan.txt', 'text/plain', 2048),
  ('00000000-0000-4000-8000-000000004002', '00000000-0000-4000-8000-000000000001', 'demo-cay-can-gi.txt', 'text/plain', 1900)
on conflict (id) do update set
  teacher_id = excluded.teacher_id,
  file_name = excluded.file_name,
  mime_type = excluded.mime_type,
  file_size_bytes = excluded.file_size_bytes;

insert into public.ai_quizzes (
  id, lesson_id, course_id, teacher_id, source_document_id, title, summary,
  generated_from, subject, language, requested_difficulty,
  requested_question_count, validation_warnings, raw_payload
) values
  (
    '00000000-0000-4000-8000-000000005001',
    '00000000-0000-4000-8000-000000001002',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000004001',
    'Quiz AI: Phép nhân nhanh',
    'Ôn cách nhân số có hai chữ số với số có một chữ số.',
    'demo-phep-nhan.txt',
    'Toán lớp 4',
    'vi',
    'mixed',
    2,
    '{}'::text[],
    (select content::jsonb from public.lessons where id = '00000000-0000-4000-8000-000000001002')
  ),
  (
    '00000000-0000-4000-8000-000000005002',
    '00000000-0000-4000-8000-000000001102',
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000004002',
    'Quiz AI: Điều kiện sống của cây',
    'Kiểm tra kiến thức về các yếu tố giúp cây phát triển.',
    'demo-cay-can-gi.txt',
    'Khoa học lớp 5',
    'vi',
    'mixed',
    2,
    '{}'::text[],
    (select content::jsonb from public.lessons where id = '00000000-0000-4000-8000-000000001102')
  )
on conflict (id) do update set
  lesson_id = excluded.lesson_id,
  course_id = excluded.course_id,
  teacher_id = excluded.teacher_id,
  source_document_id = excluded.source_document_id,
  title = excluded.title,
  summary = excluded.summary,
  generated_from = excluded.generated_from,
  subject = excluded.subject,
  language = excluded.language,
  requested_difficulty = excluded.requested_difficulty,
  requested_question_count = excluded.requested_question_count,
  validation_warnings = excluded.validation_warnings,
  raw_payload = excluded.raw_payload,
  updated_at = now();

insert into public.ai_quiz_questions (
  id, quiz_id, order_index, question_text, correct_choice_id, explanation,
  difficulty, source_reference, learning_objective
) values
  ('00000000-0000-4000-8000-000000006001', '00000000-0000-4000-8000-000000005001', 1, '23 x 4 bằng bao nhiêu?', 'C', '23 x 4 = 20 x 4 + 3 x 4 = 80 + 12 = 92.', 'easy', 'Bài đọc: Nhân với số có một chữ số', 'Tách số để nhân nhanh'),
  ('00000000-0000-4000-8000-000000006002', '00000000-0000-4000-8000-000000005001', 2, 'Muốn tính 34 x 2, cách tách nào đúng?', 'A', 'Ta tách 34 thành 30 và 4, sau đó nhân từng phần với 2.', 'medium', 'Bài đọc: Nhân với số có một chữ số', 'Hiểu phép nhân theo giá trị hàng'),
  ('00000000-0000-4000-8000-000000006003', '00000000-0000-4000-8000-000000005002', 1, 'Yếu tố nào sau đây cây cần để quang hợp?', 'A', 'Cây dùng ánh sáng để quang hợp và tạo thức ăn.', 'easy', 'Bài đọc: Cây cần gì để sống?', 'Nhận biết điều kiện cây cần'),
  ('00000000-0000-4000-8000-000000006004', '00000000-0000-4000-8000-000000005002', 2, 'Nếu cây không được tưới nước lâu ngày thì điều gì dễ xảy ra?', 'B', 'Nước giúp cây vận chuyển chất dinh dưỡng. Thiếu nước cây dễ bị héo.', 'medium', 'Bài đọc: Cây cần gì để sống?', 'Giải thích vai trò của nước')
on conflict (id) do update set
  quiz_id = excluded.quiz_id,
  order_index = excluded.order_index,
  question_text = excluded.question_text,
  correct_choice_id = excluded.correct_choice_id,
  explanation = excluded.explanation,
  difficulty = excluded.difficulty,
  source_reference = excluded.source_reference,
  learning_objective = excluded.learning_objective;

insert into public.ai_quiz_choices (
  id, question_id, choice_id, order_index, choice_text, is_correct
) values
  ('00000000-0000-4000-8000-000000007001', '00000000-0000-4000-8000-000000006001', 'A', 1, '72', false),
  ('00000000-0000-4000-8000-000000007002', '00000000-0000-4000-8000-000000006001', 'B', 2, '82', false),
  ('00000000-0000-4000-8000-000000007003', '00000000-0000-4000-8000-000000006001', 'C', 3, '92', true),
  ('00000000-0000-4000-8000-000000007004', '00000000-0000-4000-8000-000000006001', 'D', 4, '102', false),
  ('00000000-0000-4000-8000-000000007005', '00000000-0000-4000-8000-000000006002', 'A', 1, '30 x 2 + 4 x 2', true),
  ('00000000-0000-4000-8000-000000007006', '00000000-0000-4000-8000-000000006002', 'B', 2, '3 x 2 + 4 x 2', false),
  ('00000000-0000-4000-8000-000000007007', '00000000-0000-4000-8000-000000006002', 'C', 3, '34 + 2', false),
  ('00000000-0000-4000-8000-000000007008', '00000000-0000-4000-8000-000000006002', 'D', 4, '30 + 4 + 2', false),
  ('00000000-0000-4000-8000-000000007009', '00000000-0000-4000-8000-000000006003', 'A', 1, 'Ánh sáng', true),
  ('00000000-0000-4000-8000-000000007010', '00000000-0000-4000-8000-000000006003', 'B', 2, 'Bánh kẹo', false),
  ('00000000-0000-4000-8000-000000007011', '00000000-0000-4000-8000-000000006003', 'C', 3, 'Đồ chơi', false),
  ('00000000-0000-4000-8000-000000007012', '00000000-0000-4000-8000-000000006003', 'D', 4, 'Tiếng nhạc lớn', false),
  ('00000000-0000-4000-8000-000000007013', '00000000-0000-4000-8000-000000006004', 'A', 1, 'Cây lớn nhanh hơn', false),
  ('00000000-0000-4000-8000-000000007014', '00000000-0000-4000-8000-000000006004', 'B', 2, 'Cây bị héo', true),
  ('00000000-0000-4000-8000-000000007015', '00000000-0000-4000-8000-000000006004', 'C', 3, 'Cây biến thành đá', false),
  ('00000000-0000-4000-8000-000000007016', '00000000-0000-4000-8000-000000006004', 'D', 4, 'Cây không cần đất nữa', false)
on conflict (id) do update set
  question_id = excluded.question_id,
  choice_id = excluded.choice_id,
  order_index = excluded.order_index,
  choice_text = excluded.choice_text,
  is_correct = excluded.is_correct;

insert into public.ai_quiz_attempts (
  id, quiz_id, lesson_id, user_id, total_questions, correct_count, score,
  started_at, completed_at
) values
  ('00000000-0000-4000-8000-000000008001', '00000000-0000-4000-8000-000000005001', '00000000-0000-4000-8000-000000001002', '00000000-0000-4000-8000-000000000010', 2, 2, 100, now() - interval '1 day', now() - interval '1 day' + interval '4 minutes'),
  ('00000000-0000-4000-8000-000000008002', '00000000-0000-4000-8000-000000005002', '00000000-0000-4000-8000-000000001102', '00000000-0000-4000-8000-000000000012', 2, 2, 100, now(), now() + interval '3 minutes')
on conflict (id) do update set
  quiz_id = excluded.quiz_id,
  lesson_id = excluded.lesson_id,
  user_id = excluded.user_id,
  total_questions = excluded.total_questions,
  correct_count = excluded.correct_count,
  score = excluded.score,
  started_at = excluded.started_at,
  completed_at = excluded.completed_at;

insert into public.ai_quiz_answers (
  id, attempt_id, question_id, selected_choice_id, is_correct
) values
  ('00000000-0000-4000-8000-000000009001', '00000000-0000-4000-8000-000000008001', '00000000-0000-4000-8000-000000006001', 'C', true),
  ('00000000-0000-4000-8000-000000009002', '00000000-0000-4000-8000-000000008001', '00000000-0000-4000-8000-000000006002', 'A', true),
  ('00000000-0000-4000-8000-000000009003', '00000000-0000-4000-8000-000000008002', '00000000-0000-4000-8000-000000006003', 'A', true),
  ('00000000-0000-4000-8000-000000009004', '00000000-0000-4000-8000-000000008002', '00000000-0000-4000-8000-000000006004', 'B', true)
on conflict (id) do update set
  attempt_id = excluded.attempt_id,
  question_id = excluded.question_id,
  selected_choice_id = excluded.selected_choice_id,
  is_correct = excluded.is_correct;

insert into public.xp_logs (
  id, user_id, amount, source, source_id, earned_at
) values
  ('00000000-0000-4000-8000-000000010001', '00000000-0000-4000-8000-000000000010', 20, 'lesson', '00000000-0000-4000-8000-000000001001', now() - interval '2 days'),
  ('00000000-0000-4000-8000-000000010002', '00000000-0000-4000-8000-000000000010', 30, 'quiz', '00000000-0000-4000-8000-000000001002', now() - interval '1 day'),
  ('00000000-0000-4000-8000-000000010003', '00000000-0000-4000-8000-000000000012', 30, 'quiz', '00000000-0000-4000-8000-000000001102', now())
on conflict (id) do update set
  user_id = excluded.user_id,
  amount = excluded.amount,
  source = excluded.source,
  source_id = excluded.source_id,
  earned_at = excluded.earned_at;

-- ---------------------------------------------------------------------------
-- Extra demo volume for dashboards and reports
-- ---------------------------------------------------------------------------

insert into public.users (
  id, name, role, avatar_emoji, access_code, grade, teacher_id, school, bio
) values
  ('00000000-0000-4000-8000-000000000002', 'Minh', 'teacher', '👨‍🏫', '100002', null, null, 'FocusLearn Demo School', 'Giáo viên Khoa học demo.'),
  ('00000000-0000-4000-8000-000000000003', 'Hoa', 'teacher', '👩‍🏫', '100003', null, null, 'FocusLearn Demo School', 'Giáo viên Tiếng Việt demo.'),
  ('00000000-0000-4000-8000-000000000014', 'Mai', 'student', '🐯', '200005', 4, '00000000-0000-4000-8000-000000000001', null, null),
  ('00000000-0000-4000-8000-000000000015', 'Long', 'student', '🦁', '200006', 4, '00000000-0000-4000-8000-000000000001', null, null),
  ('00000000-0000-4000-8000-000000000016', 'Vy', 'student', '🐧', '200007', 5, '00000000-0000-4000-8000-000000000001', null, null),
  ('00000000-0000-4000-8000-000000000017', 'Duc', 'student', '⭐', '200008', 5, '00000000-0000-4000-8000-000000000001', null, null),
  ('00000000-0000-4000-8000-000000000018', 'Trang', 'student', '🦄', '200009', 4, '00000000-0000-4000-8000-000000000001', null, null),
  ('00000000-0000-4000-8000-000000000019', 'Huy', 'student', '🐙', '200010', 5, '00000000-0000-4000-8000-000000000001', null, null),
  ('00000000-0000-4000-8000-000000000020', 'Nam', 'student', '🦖', '200011', 4, '00000000-0000-4000-8000-000000000002', null, null),
  ('00000000-0000-4000-8000-000000000021', 'Linh', 'student', '🦋', '200012', 4, '00000000-0000-4000-8000-000000000002', null, null),
  ('00000000-0000-4000-8000-000000000022', 'Phuc', 'student', '🚀', '200013', 5, '00000000-0000-4000-8000-000000000002', null, null),
  ('00000000-0000-4000-8000-000000000023', 'Quynh', 'student', '🐼', '200014', 5, '00000000-0000-4000-8000-000000000003', null, null),
  ('00000000-0000-4000-8000-000000000024', 'Tin', 'student', '🦊', '200015', 4, '00000000-0000-4000-8000-000000000003', null, null),
  ('00000000-0000-4000-8000-000000000025', 'Yen', 'student', '🐸', '200016', 5, '00000000-0000-4000-8000-000000000003', null, null)
on conflict (access_code) do update set
  name = excluded.name,
  role = excluded.role,
  avatar_emoji = excluded.avatar_emoji,
  grade = excluded.grade,
  teacher_id = excluded.teacher_id,
  school = excluded.school,
  bio = excluded.bio,
  updated_at = now();

insert into public.courses (
  id, title, description, emoji, color_key, teacher_id, total_lessons,
  estimated_minutes, difficulty, tags, is_published
) values
  ('00000000-0000-4000-8000-000000000103', 'Đọc hiểu tiếng Việt', 'Luyện đọc đoạn văn ngắn, tìm ý chính và trả lời câu hỏi.', '📖', 'warning', '00000000-0000-4000-8000-000000000001', 3, 15, 'easy', array['tieng-viet','doc-hieu'], true),
  ('00000000-0000-4000-8000-000000000104', 'Kỹ năng tập trung', 'Bài học ngắn giúp học sinh chia nhỏ nhiệm vụ và tự kiểm tra tiến độ.', '🎯', 'info', '00000000-0000-4000-8000-000000000001', 3, 12, 'easy', array['tap-trung','ky-nang'], true),
  ('00000000-0000-4000-8000-000000000105', 'Luyện quiz tổng hợp', 'Bộ quiz ngắn để ôn Toán, Khoa học và Tiếng Việt.', '📝', 'secondary', '00000000-0000-4000-8000-000000000001', 2, 10, 'medium', array['quiz','tong-hop'], true),
  ('00000000-0000-4000-8000-000000000106', 'Khoa học tự nhiên', 'Bài học demo của thầy Minh về nước, không khí và năng lượng.', '🔬', 'success', '00000000-0000-4000-8000-000000000002', 2, 10, 'medium', array['khoa-hoc'], true),
  ('00000000-0000-4000-8000-000000000107', 'Tập viết sáng tạo', 'Bài học demo của cô Hoa về câu văn, đoạn văn và kể chuyện.', '✍️', 'primary', '00000000-0000-4000-8000-000000000003', 2, 10, 'easy', array['viet','sang-tao'], true)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  emoji = excluded.emoji,
  color_key = excluded.color_key,
  teacher_id = excluded.teacher_id,
  total_lessons = excluded.total_lessons,
  estimated_minutes = excluded.estimated_minutes,
  difficulty = excluded.difficulty,
  tags = excluded.tags,
  is_published = excluded.is_published,
  updated_at = now();

insert into public.lessons (
  id, course_id, title, emoji, type, duration_seconds, xp_reward, "order",
  content, video_url, is_published
) values
  ('00000000-0000-4000-8000-000000001201', '00000000-0000-4000-8000-000000000103', 'Tìm ý chính', '🔎', 'reading', 240, 20, 1, 'Ý chính là điều quan trọng nhất của đoạn văn. Em có thể tìm ý chính bằng cách hỏi: đoạn này đang nói về điều gì?', null, true),
  ('00000000-0000-4000-8000-000000001202', '00000000-0000-4000-8000-000000000103', 'Quiz AI: Đọc hiểu nhanh', '✨', 'quiz', 180, 30, 2, '{"title":"Quiz AI: Đọc hiểu nhanh","summary":"Kiểm tra cách tìm ý chính trong đoạn văn.","generated_from":"demo-doc-hieu.txt","questions":[{"question":"Ý chính của đoạn văn thường cho biết điều gì?","choices":[{"id":"A","text":"Điều quan trọng nhất đoạn văn nói tới"},{"id":"B","text":"Chỉ một từ bất kỳ"},{"id":"C","text":"Tên tác giả"},{"id":"D","text":"Số trang của sách"}],"correct_answer":"A","explanation":"Ý chính tóm tắt điều quan trọng nhất của đoạn văn.","difficulty":"easy","source_reference":"Bài đọc: Tìm ý chính","learning_objective":"Nhận biết ý chính"}]}', null, true),
  ('00000000-0000-4000-8000-000000001203', '00000000-0000-4000-8000-000000000103', 'Gạch chân từ khóa', '✏️', 'reading', 240, 20, 3, 'Từ khóa là những từ giúp em hiểu đề bài nhanh hơn. Khi đọc, hãy gạch chân tên người, số liệu, thời gian và yêu cầu chính.', null, true),
  ('00000000-0000-4000-8000-000000001301', '00000000-0000-4000-8000-000000000104', 'Chia nhỏ nhiệm vụ', '🧩', 'reading', 180, 20, 1, 'Khi nhiệm vụ quá dài, em hãy chia thành từng bước nhỏ: đọc đề, làm phần một, nghỉ ngắn, rồi tiếp tục.', null, true),
  ('00000000-0000-4000-8000-000000001302', '00000000-0000-4000-8000-000000000104', 'Checklist 3 bước', '✅', 'reading', 180, 20, 2, 'Checklist giúp em không bỏ sót việc. Hãy đánh dấu từng bước sau khi hoàn thành.', null, true),
  ('00000000-0000-4000-8000-000000001303', '00000000-0000-4000-8000-000000000104', 'Quiz AI: Tập trung', '🎯', 'quiz', 180, 30, 3, '{"title":"Quiz AI: Tập trung","summary":"Ôn kỹ năng chia nhỏ nhiệm vụ.","generated_from":"demo-tap-trung.txt","questions":[{"question":"Khi bài quá dài, em nên làm gì trước?","choices":[{"id":"A","text":"Chia bài thành các bước nhỏ"},{"id":"B","text":"Bỏ qua toàn bộ"},{"id":"C","text":"Làm thật nhanh không đọc đề"},{"id":"D","text":"Đợi người khác làm hộ"}],"correct_answer":"A","explanation":"Chia nhỏ giúp não dễ bắt đầu và theo dõi tiến độ.","difficulty":"easy","source_reference":"Bài đọc: Chia nhỏ nhiệm vụ","learning_objective":"Biết chia nhỏ nhiệm vụ"}]}', null, true),
  ('00000000-0000-4000-8000-000000001401', '00000000-0000-4000-8000-000000000105', 'Quiz AI: Ôn Toán', '🔢', 'quiz', 180, 30, 1, '{"title":"Quiz AI: Ôn Toán","summary":"Ôn phép nhân và phép cộng đơn giản.","generated_from":"demo-on-toan.txt","questions":[{"question":"6 x 7 bằng bao nhiêu?","choices":[{"id":"A","text":"36"},{"id":"B","text":"42"},{"id":"C","text":"48"},{"id":"D","text":"54"}],"correct_answer":"B","explanation":"6 x 7 = 42.","difficulty":"easy","source_reference":"Bảng nhân","learning_objective":"Nhớ phép nhân cơ bản"}]}', null, true),
  ('00000000-0000-4000-8000-000000001402', '00000000-0000-4000-8000-000000000105', 'Quiz AI: Ôn Khoa học', '🌿', 'quiz', 180, 30, 2, '{"title":"Quiz AI: Ôn Khoa học","summary":"Ôn kiến thức cây xanh và môi trường.","generated_from":"demo-on-khoa-hoc.txt","questions":[{"question":"Cây cần gì để sống?","choices":[{"id":"A","text":"Ánh sáng, nước, không khí"},{"id":"B","text":"Chỉ cần đồ chơi"},{"id":"C","text":"Không cần gì"},{"id":"D","text":"Chỉ cần tiếng ồn"}],"correct_answer":"A","explanation":"Cây cần ánh sáng, nước, không khí và chất dinh dưỡng.","difficulty":"easy","source_reference":"Bài cây xanh","learning_objective":"Nhận biết điều kiện sống của cây"}]}', null, true),
  ('00000000-0000-4000-8000-000000001501', '00000000-0000-4000-8000-000000000106', 'Vòng tuần hoàn nước', '💧', 'reading', 240, 20, 1, 'Nước bốc hơi, tạo thành mây, rồi rơi xuống thành mưa. Quá trình này gọi là vòng tuần hoàn nước.', null, true),
  ('00000000-0000-4000-8000-000000001502', '00000000-0000-4000-8000-000000000106', 'Quiz AI: Nước', '🧪', 'quiz', 180, 30, 2, '{"title":"Quiz AI: Nước","summary":"Ôn vòng tuần hoàn nước.","generated_from":"demo-nuoc.txt","questions":[{"question":"Nước bốc hơi lên trời tạo thành gì?","choices":[{"id":"A","text":"Mây"},{"id":"B","text":"Đá"},{"id":"C","text":"Cát"},{"id":"D","text":"Kim loại"}],"correct_answer":"A","explanation":"Hơi nước ngưng tụ tạo thành mây.","difficulty":"easy","source_reference":"Bài vòng tuần hoàn nước","learning_objective":"Hiểu bốc hơi và ngưng tụ"}]}', null, true),
  ('00000000-0000-4000-8000-000000001601', '00000000-0000-4000-8000-000000000107', 'Câu văn đủ ý', '✍️', 'reading', 240, 20, 1, 'Một câu văn đủ ý thường có người hoặc vật được nói tới và hoạt động hoặc đặc điểm của người/vật đó.', null, true),
  ('00000000-0000-4000-8000-000000001602', '00000000-0000-4000-8000-000000000107', 'Quiz AI: Viết câu', '📝', 'quiz', 180, 30, 2, '{"title":"Quiz AI: Viết câu","summary":"Ôn cách nhận biết câu văn đủ ý.","generated_from":"demo-viet-cau.txt","questions":[{"question":"Câu nào đủ ý hơn?","choices":[{"id":"A","text":"Bạn Lan đang đọc sách."},{"id":"B","text":"Đang đọc."},{"id":"C","text":"Một quyển."},{"id":"D","text":"Rất đẹp."}],"correct_answer":"A","explanation":"Câu A có chủ thể và hoạt động rõ ràng.","difficulty":"easy","source_reference":"Bài câu văn đủ ý","learning_objective":"Nhận biết câu đủ ý"}]}', null, true)
on conflict (id) do update set
  course_id = excluded.course_id,
  title = excluded.title,
  emoji = excluded.emoji,
  type = excluded.type,
  duration_seconds = excluded.duration_seconds,
  xp_reward = excluded.xp_reward,
  "order" = excluded."order",
  content = excluded.content,
  video_url = excluded.video_url,
  is_published = excluded.is_published,
  updated_at = now();

insert into public.progress (
  id, user_id, xp, xp_today, xp_daily_goal, level, streak, longest_streak,
  last_active_date
) values
  ('00000000-0000-4000-8000-000000002014', '00000000-0000-4000-8000-000000000014', 310, 45, 50, 4, 7, 9, current_date),
  ('00000000-0000-4000-8000-000000002015', '00000000-0000-4000-8000-000000000015', 120, 20, 50, 2, 3, 4, current_date),
  ('00000000-0000-4000-8000-000000002016', '00000000-0000-4000-8000-000000000016', 80, 0, 50, 1, 0, 2, current_date - 2),
  ('00000000-0000-4000-8000-000000002017', '00000000-0000-4000-8000-000000000017', 440, 50, 50, 5, 10, 12, current_date),
  ('00000000-0000-4000-8000-000000002018', '00000000-0000-4000-8000-000000000018', 55, 5, 50, 1, 1, 1, current_date),
  ('00000000-0000-4000-8000-000000002019', '00000000-0000-4000-8000-000000000019', 15, 0, 50, 1, 0, 0, current_date - 5),
  ('00000000-0000-4000-8000-000000002020', '00000000-0000-4000-8000-000000000020', 160, 35, 50, 2, 4, 5, current_date),
  ('00000000-0000-4000-8000-000000002021', '00000000-0000-4000-8000-000000000021', 90, 25, 50, 1, 2, 2, current_date),
  ('00000000-0000-4000-8000-000000002022', '00000000-0000-4000-8000-000000000022', 200, 50, 50, 3, 5, 5, current_date),
  ('00000000-0000-4000-8000-000000002023', '00000000-0000-4000-8000-000000000023', 110, 10, 50, 2, 1, 3, current_date),
  ('00000000-0000-4000-8000-000000002024', '00000000-0000-4000-8000-000000000024', 70, 0, 50, 1, 0, 2, current_date - 4),
  ('00000000-0000-4000-8000-000000002025', '00000000-0000-4000-8000-000000000025', 240, 50, 50, 3, 6, 8, current_date)
on conflict (user_id) do update set
  xp = excluded.xp,
  xp_today = excluded.xp_today,
  xp_daily_goal = excluded.xp_daily_goal,
  level = excluded.level,
  streak = excluded.streak,
  longest_streak = excluded.longest_streak,
  last_active_date = excluded.last_active_date,
  updated_at = now();

insert into public.lesson_progress (
  id, user_id, lesson_id, is_completed, completed_at, score, attempts
) values
  ('00000000-0000-4000-8000-000000003020', '00000000-0000-4000-8000-000000000014', '00000000-0000-4000-8000-000000001201', true, now() - interval '2 days', null, 1),
  ('00000000-0000-4000-8000-000000003021', '00000000-0000-4000-8000-000000000014', '00000000-0000-4000-8000-000000001202', true, now() - interval '1 day', 100, 1),
  ('00000000-0000-4000-8000-000000003022', '00000000-0000-4000-8000-000000000015', '00000000-0000-4000-8000-000000001301', true, now(), null, 1),
  ('00000000-0000-4000-8000-000000003023', '00000000-0000-4000-8000-000000000017', '00000000-0000-4000-8000-000000001401', true, now(), 100, 1),
  ('00000000-0000-4000-8000-000000003024', '00000000-0000-4000-8000-000000000018', '00000000-0000-4000-8000-000000001001', true, now() - interval '3 days', null, 1),
  ('00000000-0000-4000-8000-000000003025', '00000000-0000-4000-8000-000000000020', '00000000-0000-4000-8000-000000001501', true, now(), null, 1),
  ('00000000-0000-4000-8000-000000003026', '00000000-0000-4000-8000-000000000023', '00000000-0000-4000-8000-000000001601', true, now(), null, 1)
on conflict (id) do update set
  user_id = excluded.user_id,
  lesson_id = excluded.lesson_id,
  is_completed = excluded.is_completed,
  completed_at = excluded.completed_at,
  score = excluded.score,
  attempts = excluded.attempts;
