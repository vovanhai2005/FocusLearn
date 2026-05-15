const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;

    const [, key, value] = match;
    process.env[key] = process.env[key] || value.replace(/^["']|["']$/g, "");
  }
}

loadEnv();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

const COURSES = [
  ["Toán lớp 4 - Phép nhân", "Ôn phép nhân, tách số và giải bài toán có lời văn.", "🔢", "primary", "easy", ["toan", "lop-4"]],
  ["Khoa học - Cây xanh", "Tìm hiểu ánh sáng, nước, không khí và quá trình quang hợp.", "🌿", "success", "medium", ["khoa-hoc", "cay-xanh"]],
  ["Tiếng Việt - Đọc hiểu", "Luyện tìm ý chính, từ khóa và trả lời câu hỏi đọc hiểu.", "📖", "warning", "easy", ["tieng-viet", "doc-hieu"]],
  ["Tin học - Internet an toàn", "Nhận biết thông tin cá nhân, mật khẩu và cách dùng mạng an toàn.", "💻", "info", "medium", ["tin-hoc", "internet"]],
  ["Kỹ năng tập trung", "Chia nhỏ nhiệm vụ, tự theo dõi tiến độ và hoàn thành bài học.", "🎯", "secondary", "easy", ["ky-nang", "tap-trung"]],
  ["Quiz tổng hợp cuối tuần", "Bộ bài ôn tập ngắn cho Toán, Tiếng Việt và Khoa học.", "✨", "error", "medium", ["quiz", "on-tap"]],
];

const STUDENTS = [
  ["An", "🐣", 4], ["Bảo", "🦊", 4], ["Chi", "🐼", 4], ["Dũng", "🐯", 4], ["Hà", "🐰", 4],
  ["Huy", "🚀", 4], ["Khoa", "⭐", 4], ["Mai", "🌈", 4], ["Nam", "🐧", 4], ["Nhi", "🦄", 4],
  ["Phúc", "🦁", 5], ["Quân", "🐸", 5], ["Trang", "🐵", 5], ["Uyên", "🐨", 5], ["Vy", "🌟", 5],
  ["Long", "🍀", 5], ["Lâm", "🐣", 5], ["My", "🦊", 5], ["Đạt", "🐼", 5], ["Tú", "🐯", 5],
  ["Hạnh", "🐰", 4], ["Quỳnh", "🚀", 4], ["Thảo", "⭐", 4], ["Bình", "🌈", 4], ["Nhật", "🐧", 5],
  ["Tín", "🦄", 5], ["Yến", "🦁", 5], ["Minh Anh", "🐸", 5], ["Hoàng", "🐵", 4], ["Gia Hân", "🐨", 4],
];

function demoUuid(seed) {
  const hash = crypto.createHash("md5").update(`focuslearn-222222-rest:${seed}`).digest("hex");
  const variant = ((parseInt(hash[16], 16) & 0x3) | 0x8).toString(16);

  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `4${hash.slice(13, 16)}`,
    `${variant}${hash.slice(17, 20)}`,
    hash.slice(20, 32),
  ].join("-");
}

function isoDate(daysOffset = 0) {
  return new Date(Date.now() + daysOffset * 86400000).toISOString().slice(0, 10);
}

function isoTime(daysOffset = 0) {
  return new Date(Date.now() + daysOffset * 86400000).toISOString();
}

function chunk(rows, size = 100) {
  const result = [];
  for (let index = 0; index < rows.length; index += size) {
    result.push(rows.slice(index, index + size));
  }
  return result;
}

async function upsert(table, rows, onConflict = "id") {
  for (const part of chunk(rows)) {
    const { error } = await supabase.from(table).upsert(part, { onConflict });
    if (error) {
      throw new Error(`${table}: ${error.message}`);
    }
  }
}

function quizContent(courseTitle) {
  return JSON.stringify({
    title: `Quiz AI: ${courseTitle}`,
    summary: `Bộ câu hỏi demo cho khóa ${courseTitle}.`,
    generated_from: `${courseTitle.toLowerCase().replaceAll(" ", "-")}.txt`,
    questions: [
      {
        question: `Mục tiêu chính của bài "${courseTitle}" là gì?`,
        choices: [
          { id: "A", text: "Hiểu ý chính và luyện tập từng bước" },
          { id: "B", text: "Bỏ qua phần câu hỏi" },
          { id: "C", text: "Chỉ xem tiêu đề" },
          { id: "D", text: "Không cần ghi nhớ gì" },
        ],
        correct_answer: "A",
        explanation: "Bài học yêu cầu học sinh hiểu ý chính rồi luyện tập.",
        difficulty: "easy",
        source_reference: "Tài liệu demo",
        learning_objective: "Nắm mục tiêu bài học",
      },
      {
        question: "Khi làm sai câu hỏi, học sinh nên làm gì?",
        choices: [
          { id: "A", text: "Xem giải thích và thử lại" },
          { id: "B", text: "Dừng học" },
          { id: "C", text: "Bỏ qua toàn bộ khóa" },
          { id: "D", text: "Không cần đọc lại" },
        ],
        correct_answer: "A",
        explanation: "Xem giải thích giúp sửa lỗi và tiến bộ.",
        difficulty: "medium",
        source_reference: "Quiz demo",
        learning_objective: "Tự sửa lỗi sau quiz",
      },
    ],
  });
}

async function main() {
  const { data: teacher, error: teacherError } = await supabase
    .from("users")
    .upsert(
      {
        name: "Lan",
        role: "teacher",
        avatar_emoji: "👩‍🏫",
        access_code: "222222",
        grade: null,
        teacher_id: null,
        school: "FocusLearn Demo School",
        bio: "Tài khoản giáo viên demo chính, có sẵn lớp, học sinh, khóa học và tiến độ.",
      },
      { onConflict: "access_code" }
    )
    .select("id")
    .single();

  if (teacherError || !teacher) {
    throw new Error(`users teacher: ${teacherError?.message ?? "missing teacher"}`);
  }

  const teacherId = teacher.id;

  const classes = [
    {
      id: demoUuid("class:4a"),
      name: "Lớp 4A - Lan",
      grade: 4,
      teacher_id: teacherId,
      school: "FocusLearn Demo School",
      academic_year: "2025-2026",
      access_code: "L2224A",
      description: "Lớp Toán và Tiếng Việt cơ bản.",
    },
    {
      id: demoUuid("class:4b"),
      name: "Lớp 4B - Lan",
      grade: 4,
      teacher_id: teacherId,
      school: "FocusLearn Demo School",
      academic_year: "2025-2026",
      access_code: "L2224B",
      description: "Lớp luyện quiz và kỹ năng tập trung.",
    },
    {
      id: demoUuid("class:5a"),
      name: "Lớp 5A - Lan",
      grade: 5,
      teacher_id: teacherId,
      school: "FocusLearn Demo School",
      academic_year: "2025-2026",
      access_code: "L2225A",
      description: "Lớp Khoa học và Tin học.",
    },
  ];

  await upsert("classes", classes);

  const students = STUDENTS.map(([name, avatar, grade], index) => ({
    id: demoUuid(`student:${index + 1}`),
    name,
    role: "student",
    avatar_emoji: avatar,
    access_code: String(222301 + index),
    grade,
    teacher_id: teacherId,
    school: "FocusLearn Demo School",
    bio: `Học sinh demo khối ${grade}.`,
  }));

  await upsert("users", students);

  await upsert(
    "class_students",
    students.map((student, index) => ({
      id: demoUuid(`class-student:${student.id}`),
      class_id: index < 10 ? classes[0].id : index < 20 ? classes[1].id : classes[2].id,
      student_id: student.id,
      joined_at: isoTime(-(index + 4)),
      status: "active",
    }))
  );

  const courses = COURSES.map(([title, description, emoji, colorKey, difficulty, tags], index) => ({
    id: demoUuid(`course:${index + 1}`),
    title,
    description,
    emoji,
    color_key: colorKey,
    teacher_id: teacherId,
    total_lessons: 6,
    estimated_minutes: 28 + index * 3,
    difficulty,
    tags,
    is_published: true,
  }));

  await upsert("courses", courses);

  const lessons = courses.flatMap((course, courseIndex) =>
    Array.from({ length: 6 }, (_, lessonOffset) => {
      const order = lessonOffset + 1;
      const type = order === 3 || order === 6 ? "quiz" : order === 2 ? "interactive" : "reading";

      return {
        id: demoUuid(`lesson:${courseIndex + 1}:${order}`),
        course_id: course.id,
        title: type === "quiz" ? `Quiz AI bài ${order}` : `Bài ${order}: ${course.title}`,
        emoji: type === "quiz" ? "✨" : course.emoji,
        type,
        duration_seconds: type === "quiz" ? 240 : 300,
        xp_reward: type === "quiz" ? 35 : 20,
        order,
        content:
          type === "quiz"
            ? quizContent(course.title)
            : `${course.title} - bài ${order}. Học sinh đọc phần tóm tắt, làm ví dụ ngắn và tự kiểm tra sau bài học.`,
        video_url: null,
        is_published: true,
      };
    })
  );

  await upsert("lessons", lessons);

  const enrollments = [];
  const lessonProgress = [];
  const progress = [];
  const xpLogs = [];

  students.forEach((student, studentIndex) => {
    const classId = studentIndex < 10 ? classes[0].id : studentIndex < 20 ? classes[1].id : classes[2].id;
    const activeToday = studentIndex % 5 !== 0;
    const streak = activeToday ? (studentIndex % 9) + 1 : 0;
    let xp = 80 + studentIndex * 12;

    courses.forEach((course, courseIndex) => {
      const shouldEnroll =
        courseIndex < 2 ||
        (studentIndex + courseIndex) % 2 === 0 ||
        studentIndex % 6 === courseIndex;
      if (!shouldEnroll) return;

      const progressPercent = Math.min(100, 25 + ((studentIndex * 13 + courseIndex * 17) % 76));
      const completedCount = Math.floor((progressPercent / 100) * 6);
      const status = progressPercent >= 95 ? "completed" : studentIndex % 17 === 0 ? "paused" : "active";
      const courseLessons = lessons.filter((lesson) => lesson.course_id === course.id);

      enrollments.push({
        id: demoUuid(`enrollment:${student.id}:${course.id}`),
        course_id: course.id,
        student_id: student.id,
        class_id: classId,
        assigned_by: teacherId,
        status,
        assigned_at: isoTime(-(15 + courseIndex + studentIndex)),
        completed_at: status === "completed" ? isoTime(-(studentIndex % 4)) : null,
        target_due_date: isoDate(14 + courseIndex * 5),
        progress_percent: progressPercent,
        last_activity_at: activeToday ? isoTime(0) : isoTime(-((studentIndex % 4) + 1)),
      });

      courseLessons.slice(0, completedCount).forEach((lesson, lessonIndex) => {
        const completedAt = isoTime(-(lessonIndex + courseIndex + (studentIndex % 3)));
        const isQuiz = lesson.type === "quiz";
        xp += isQuiz ? 35 : 20;

        lessonProgress.push({
          id: demoUuid(`lesson-progress:${student.id}:${lesson.id}`),
          user_id: student.id,
          lesson_id: lesson.id,
          is_completed: true,
          completed_at: completedAt,
          score: isQuiz ? 55 + ((studentIndex + lessonIndex + courseIndex) % 46) : null,
          attempts: isQuiz ? 1 + ((studentIndex + courseIndex) % 3) : 1,
        });

        xpLogs.push({
          id: demoUuid(`xp-log:${student.id}:${lesson.id}`),
          user_id: student.id,
          amount: isQuiz ? 35 : 20,
          source: isQuiz ? "quiz" : "lesson",
          source_id: lesson.id,
          earned_at: completedAt,
        });
      });
    });

    progress.push({
      id: demoUuid(`progress:${student.id}`),
      user_id: student.id,
      xp,
      xp_today: activeToday ? 20 + (studentIndex % 4) * 10 : 0,
      xp_daily_goal: 50,
      level: Math.max(1, Math.floor(xp / 140) + 1),
      streak,
      longest_streak: Math.max(streak, streak + (studentIndex % 5)),
      last_active_date: activeToday ? isoDate(0) : isoDate(-((studentIndex % 4) + 1)),
    });
  });

  await upsert("course_enrollments", enrollments);
  await upsert("progress", progress, "user_id");
  await upsert("lesson_progress", lessonProgress);
  await upsert("xp_logs", xpLogs);

  const { count: studentCount } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("teacher_id", teacherId)
    .eq("role", "student");
  const { count: courseCount } = await supabase
    .from("courses")
    .select("id", { count: "exact", head: true })
    .eq("teacher_id", teacherId);
  const { count: enrollmentCount } = await supabase
    .from("course_enrollments")
    .select("id", { count: "exact", head: true })
    .eq("assigned_by", teacherId);

  console.table([
    {
      teacher_id: teacherId,
      students: studentCount,
      courses: courseCount,
      lessons: lessons.length,
      enrollments: enrollmentCount,
      lesson_progress: lessonProgress.length,
    },
  ]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
