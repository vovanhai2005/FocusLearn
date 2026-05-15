const crypto = require("crypto");
const { Client } = require("pg");

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL environment variable.");
  process.exit(1);
}

const TEACHERS = [
  {
    slug: "lan",
    id: "00000000-0000-4000-8000-000000000001",
    name: "Lan",
    avatar: "👩‍🏫",
    accessCode: "100001",
    subject: "Toán tư duy",
  },
  {
    slug: "minh",
    id: "00000000-0000-4000-8000-000000000002",
    name: "Minh",
    avatar: "👨‍🏫",
    accessCode: "100002",
    subject: "Khoa học",
  },
  {
    slug: "hoa",
    id: "00000000-0000-4000-8000-000000000003",
    name: "Hoa",
    avatar: "👩‍🏫",
    accessCode: "100003",
    subject: "Tiếng Việt",
  },
  { slug: "tuan", name: "Tuấn", avatar: "🧑‍🏫", accessCode: "100004", subject: "Lập trình cơ bản" },
  { slug: "ngoc", name: "Ngọc", avatar: "👩‍🏫", accessCode: "100005", subject: "Tiếng Anh" },
  { slug: "phuong", name: "Phương", avatar: "👩‍🏫", accessCode: "100006", subject: "Mỹ thuật" },
  { slug: "khanh", name: "Khánh", avatar: "👨‍🏫", accessCode: "100007", subject: "Lịch sử" },
  { slug: "linh-teacher", name: "Linh", avatar: "👩‍🏫", accessCode: "100008", subject: "Địa lý" },
  { slug: "son", name: "Sơn", avatar: "👨‍🏫", accessCode: "100009", subject: "Kỹ năng học tập" },
  { slug: "tram", name: "Trâm", avatar: "👩‍🏫", accessCode: "100010", subject: "Âm nhạc" },
  { slug: "duc-teacher", name: "Đức", avatar: "👨‍🏫", accessCode: "100011", subject: "Tin học" },
  { slug: "yen-teacher", name: "Yến", avatar: "👩‍🏫", accessCode: "100012", subject: "Kỹ năng sống" },
].map((teacher) => ({
  ...teacher,
  id: teacher.id || demoUuid(`teacher:${teacher.slug}`),
}));

const COURSE_TEMPLATES = [
  {
    subject: "Toán",
    emoji: "🔢",
    color: "primary",
    difficulty: "easy",
    tags: ["toan", "tu-duy"],
    titles: ["Phép nhân thông minh", "Phân số nhập môn", "Hình học quanh em", "Giải toán có lời văn"],
  },
  {
    subject: "Tiếng Việt",
    emoji: "📖",
    color: "warning",
    difficulty: "easy",
    tags: ["tieng-viet", "doc-hieu"],
    titles: ["Đọc hiểu nhanh", "Từ và câu", "Viết đoạn văn ngắn", "Kể chuyện sáng tạo"],
  },
  {
    subject: "Khoa học",
    emoji: "🔬",
    color: "success",
    difficulty: "medium",
    tags: ["khoa-hoc", "kham-pha"],
    titles: ["Cây xanh và môi trường", "Vòng tuần hoàn nước", "Cơ thể con người", "Ánh sáng và âm thanh"],
  },
  {
    subject: "Tiếng Anh",
    emoji: "🌍",
    color: "info",
    difficulty: "easy",
    tags: ["tieng-anh", "tu-vung"],
    titles: ["Daily Vocabulary", "Simple Sentences", "My School", "Food and Animals"],
  },
  {
    subject: "Tin học",
    emoji: "💻",
    color: "secondary",
    difficulty: "medium",
    tags: ["tin-hoc", "logic"],
    titles: ["Tư duy thuật toán", "Internet an toàn", "Dữ liệu và bảng tính", "Lập trình Scratch"],
  },
  {
    subject: "Kỹ năng",
    emoji: "🎯",
    color: "primary",
    difficulty: "easy",
    tags: ["ky-nang", "tap-trung"],
    titles: ["Kỹ năng tập trung", "Quản lý thời gian", "Ghi chú hiệu quả", "Tự học mỗi ngày"],
  },
];

const STUDENT_NAMES = [
  "An", "Bảo", "Chi", "Dũng", "Hà", "Huy", "Khoa", "Lan Anh", "Mai", "Nam",
  "Nhi", "Phúc", "Quân", "Trang", "Uyên", "Vy", "Long", "Lâm", "My", "Đạt",
  "Tú", "Hạnh", "Quỳnh", "Thảo", "Bình", "Nhật", "Tín", "Yến", "Minh Anh", "Hoàng",
  "Gia Hân", "Tuệ Nhi", "Khôi", "Bách", "Diệp", "Tường Vy", "Phương Anh", "Gia Bảo",
  "Hải Nam", "Ngọc Anh", "Quang", "Trúc", "Khánh Linh", "Tuấn Kiệt", "Thanh", "Mẫn Nhi",
  "Gia Khang", "Đức Anh", "Hồng Anh", "Thiên Phúc", "Bảo Ngọc", "Nguyên", "Song Nhi",
  "Gia Minh", "Đan", "Việt", "Hương", "Ánh", "Hùng", "Kiên", "Tâm", "Hiếu", "Lam",
  "Trí", "Như", "Phát", "Tùng", "Duy", "Hân", "Oanh", "Vân", "Nhã", "Phương",
  "Đông", "Ngân", "Thịnh", "Thu", "Cường", "Mộc", "Bảo Châu", "An Nhiên", "Nhật Minh",
  "Quốc Anh", "Gia Linh", "Minh Quân", "Tuệ Lâm", "Bảo Anh", "Khánh An", "Hoài An",
  "Bảo Long", "Minh Khang", "Hữu Phước", "Đăng Khoa", "Tú Anh", "Thanh Hà", "Hà My",
  "Gia Huy", "Phương Nhi", "Trọng Nghĩa", "Ngọc Minh", "Thiện Nhân", "Minh Châu",
];

const AVATARS = ["🐣", "🐧", "🦊", "🐼", "🐯", "🦁", "🐸", "🐵", "🐰", "🐨", "🦄", "⭐", "🚀", "🌈", "🌟", "🍀"];

function demoUuid(seed) {
  const hash = crypto.createHash("md5").update(`focuslearn-large-demo:${seed}`).digest("hex");
  const variant = ((parseInt(hash[16], 16) & 0x3) | 0x8).toString(16);

  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `4${hash.slice(13, 16)}`,
    `${variant}${hash.slice(17, 20)}`,
    hash.slice(20, 32),
  ].join("-");
}

function chunk(items, size) {
  const result = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

function sqlValuePlaceholders(rows, columnCount, offset = 0) {
  return rows
    .map((_, rowIndex) => {
      const values = [];
      for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
        values.push(`$${offset + rowIndex * columnCount + columnIndex + 1}`);
      }
      return `(${values.join(", ")})`;
    })
    .join(",\n");
}

function flattenRows(rows) {
  return rows.flatMap((row) => row);
}

async function insertMany(client, table, columns, rows, conflictTarget, updateColumns = columns) {
  if (rows.length === 0) return;

  for (const part of chunk(rows, 350)) {
    const quotedColumns = columns.map((column) => `"${column}"`).join(", ");
    const placeholders = sqlValuePlaceholders(part, columns.length);
    const updates = updateColumns
      .filter((column) => !conflictTarget.includes(`"${column}"`) && column !== "id")
      .map((column) => `"${column}" = excluded."${column}"`)
      .join(", ");
    const sql = `
      insert into public.${table} (${quotedColumns})
      values ${placeholders}
      on conflict (${conflictTarget}) do update set ${updates || `"id" = excluded."id"`};
    `;

    await client.query(sql, flattenRows(part));
  }
}

function buildLessonContent(course, lessonIndex, type) {
  if (type !== "quiz") {
    return [
      `${course.title} - bài ${lessonIndex}.`,
      "Mục tiêu của bài học là giúp học sinh nắm ý chính, luyện tập từng bước và tự kiểm tra sau khi học.",
      "Giáo viên có thể dùng bài này để giao nhiệm vụ trên lớp hoặc làm bài ôn ở nhà.",
    ].join("\n\n");
  }

  return JSON.stringify({
    title: `Quiz AI: ${course.title} ${lessonIndex}`,
    summary: `Bộ câu hỏi kiểm tra nhanh cho khóa ${course.title}.`,
    generated_from: `demo-${course.slug}-lesson-${lessonIndex}.txt`,
    questions: buildQuizQuestions(course, lessonIndex),
  });
}

function buildQuizQuestions(course, lessonIndex) {
  const baseQuestion = `Trong bài "${course.title}", mục tiêu chính là gì?`;
  return [
    {
      question: baseQuestion,
      choices: [
        { id: "A", text: "Hiểu kiến thức chính và áp dụng vào bài tập" },
        { id: "B", text: "Bỏ qua phần luyện tập" },
        { id: "C", text: "Chỉ ghi nhớ tiêu đề" },
        { id: "D", text: "Không cần tự kiểm tra" },
      ],
      correct_answer: "A",
      explanation: "Bài học được thiết kế để học sinh hiểu ý chính rồi luyện tập.",
      difficulty: "easy",
      source_reference: `Tài liệu ${course.title} - phần ${lessonIndex}`,
      learning_objective: "Nắm mục tiêu học tập",
    },
    {
      question: "Sau khi đọc lý thuyết, bước học tập phù hợp nhất là gì?",
      choices: [
        { id: "A", text: "Đóng ứng dụng ngay" },
        { id: "B", text: "Làm bài luyện tập ngắn" },
        { id: "C", text: "Chỉ xem đáp án" },
        { id: "D", text: "Bỏ qua câu khó" },
      ],
      correct_answer: "B",
      explanation: "Luyện tập ngắn giúp kiểm tra xem học sinh đã hiểu bài chưa.",
      difficulty: "easy",
      source_reference: `Tài liệu ${course.title} - phần luyện tập`,
      learning_objective: "Biết chọn bước luyện tập",
    },
    {
      question: "Nếu trả lời sai một câu quiz, học sinh nên làm gì?",
      choices: [
        { id: "A", text: "Xem giải thích và thử lại" },
        { id: "B", text: "Dừng học toàn bộ khóa" },
        { id: "C", text: "Xóa bài học" },
        { id: "D", text: "Không cần đọc lại" },
      ],
      correct_answer: "A",
      explanation: "Giải thích giúp học sinh hiểu lỗi sai và cải thiện ở lần sau.",
      difficulty: "medium",
      source_reference: `Quiz AI ${course.title}`,
      learning_objective: "Tự sửa lỗi sau quiz",
    },
    {
      question: "Dấu hiệu nào cho thấy học sinh đã hoàn thành tốt bài học?",
      choices: [
        { id: "A", text: "Hoàn thành bài và đạt điểm quiz tốt" },
        { id: "B", text: "Chỉ mở bài học trong vài giây" },
        { id: "C", text: "Không làm câu hỏi nào" },
        { id: "D", text: "Không xem tiến độ" },
      ],
      correct_answer: "A",
      explanation: "Hoàn thành bài và đạt điểm tốt là tín hiệu tiến độ tích cực.",
      difficulty: "medium",
      source_reference: `Báo cáo tiến độ ${course.title}`,
      learning_objective: "Nhận biết hoàn thành bài học",
    },
  ];
}

function buildData() {
  const now = new Date();
  const users = [];
  const classes = [];
  const classStudents = [];
  const courses = [];
  const lessons = [];
  const progressRows = [];
  const enrollments = [];
  const sourceDocuments = [];
  const quizzes = [];
  const questions = [];
  const choices = [];
  const lessonProgress = [];
  const xpLogs = [];
  const attempts = [];
  const answers = [];

  for (const teacher of TEACHERS) {
    users.push([
      teacher.id,
      teacher.name,
      "teacher",
      teacher.avatar,
      teacher.accessCode,
      null,
      null,
      "FocusLearn Demo School",
      `Giáo viên ${teacher.subject}, quản lý nhiều lớp demo.`,
    ]);
  }

  const allStudents = [];
  let studentCounter = 0;
  let classCounter = 0;

  for (const teacher of TEACHERS) {
    for (const grade of [3, 4, 5]) {
      classCounter += 1;
      const classSlug = `${teacher.slug}-grade-${grade}`;
      const classId = demoUuid(`class:${classSlug}`);
      const className = `${grade}${String.fromCharCode(64 + ((classCounter - 1) % 6) + 1)} - ${teacher.name}`;

      classes.push([
        classId,
        className,
        grade,
        teacher.id,
        "FocusLearn Demo School",
        "2025-2026",
        `L${String(classCounter).padStart(4, "0")}`,
        `Lớp ${className} do giáo viên ${teacher.name} phụ trách.`,
      ]);

      for (let seat = 1; seat <= 8; seat += 1) {
        studentCounter += 1;
        const name = `${STUDENT_NAMES[(studentCounter - 1) % STUDENT_NAMES.length]} ${grade}${seat}`;
        const studentId = demoUuid(`student:${teacher.slug}:${grade}:${seat}`);
        const accessCode = String(300000 + studentCounter);
        const student = {
          id: studentId,
          name,
          grade,
          teacherId: teacher.id,
          classId,
          className,
          accessCode,
          index: studentCounter,
        };

        allStudents.push(student);
        users.push([
          studentId,
          name,
          "student",
          AVATARS[(studentCounter - 1) % AVATARS.length],
          accessCode,
          grade,
          teacher.id,
          "FocusLearn Demo School",
          `Học sinh lớp ${className}.`,
        ]);
        classStudents.push([
          demoUuid(`class-student:${classId}:${studentId}`),
          classId,
          studentId,
          new Date(now.getTime() - (seat + grade) * 24 * 60 * 60 * 1000),
          "active",
        ]);
      }
    }
  }

  for (const teacher of TEACHERS) {
    for (let courseIndex = 0; courseIndex < 6; courseIndex += 1) {
      const template = COURSE_TEMPLATES[(courseIndex + TEACHERS.indexOf(teacher)) % COURSE_TEMPLATES.length];
      const title = `${template.titles[courseIndex % template.titles.length]} - ${teacher.name}`;
      const slug = `${teacher.slug}-course-${courseIndex + 1}`;
      const courseId = demoUuid(`course:${slug}`);
      const course = {
        id: courseId,
        slug,
        title,
        teacherId: teacher.id,
        subject: template.subject,
        difficulty: template.difficulty,
      };

      courses.push([
        courseId,
        title,
        `Khóa học demo môn ${template.subject} do giáo viên ${teacher.name} quản lý, có bài đọc, quiz AI và tiến độ mẫu.`,
        template.emoji,
        template.color,
        teacher.id,
        6,
        30 + courseIndex * 3,
        template.difficulty,
        template.tags,
        true,
      ]);

      sourceDocuments.push([
        demoUuid(`source-document:${slug}`),
        teacher.id,
        `${slug}-tai-lieu-demo.txt`,
        "text/plain",
        2400 + courseIndex * 120,
        `demo/${teacher.slug}/${slug}.txt`,
        null,
      ]);

      for (let lessonIndex = 1; lessonIndex <= 6; lessonIndex += 1) {
        const lessonType = lessonIndex === 3 || lessonIndex === 6 ? "quiz" : lessonIndex === 2 ? "interactive" : "reading";
        const lessonId = demoUuid(`lesson:${slug}:${lessonIndex}`);
        const lessonTitle =
          lessonType === "quiz"
            ? `Quiz AI ${lessonIndex === 3 ? "giữa khóa" : "cuối khóa"}`
            : `Bài ${lessonIndex}: ${title.split(" - ")[0]}`;

        lessons.push([
          lessonId,
          courseId,
          lessonTitle,
          lessonType === "quiz" ? "✨" : lessonType === "interactive" ? "🧩" : template.emoji,
          lessonType,
          lessonType === "quiz" ? 240 : 300,
          lessonType === "quiz" ? 35 : 20,
          lessonIndex,
          buildLessonContent(course, lessonIndex, lessonType),
          null,
          true,
        ]);

        if (lessonType === "quiz") {
          const quizId = demoUuid(`ai-quiz:${lessonId}`);
          const documentId = demoUuid(`source-document:${slug}`);
          const quizQuestions = buildQuizQuestions(course, lessonIndex);

          quizzes.push([
            quizId,
            lessonId,
            courseId,
            teacher.id,
            documentId,
            `Quiz AI: ${title}`,
            `Quiz tự động cho bài ${lessonIndex} của khóa ${title}.`,
            `${slug}-tai-lieu-demo.txt`,
            template.subject,
            "vi",
            "mixed",
            quizQuestions.length,
            [],
            JSON.stringify({ title, questions: quizQuestions }),
          ]);

          quizQuestions.forEach((question, questionIndex) => {
            const questionId = demoUuid(`ai-question:${quizId}:${questionIndex + 1}`);
            questions.push([
              questionId,
              quizId,
              questionIndex + 1,
              question.question,
              question.correct_answer,
              question.explanation,
              question.difficulty,
              question.source_reference,
              question.learning_objective,
            ]);

            question.choices.forEach((choice, choiceIndex) => {
              choices.push([
                demoUuid(`ai-choice:${questionId}:${choice.id}`),
                questionId,
                choice.id,
                choiceIndex + 1,
                choice.text,
                choice.id === question.correct_answer,
              ]);
            });
          });
        }
      }
    }
  }

  const coursesByTeacher = new Map();
  const lessonsByCourse = new Map();
  const quizzesByLesson = new Map();
  const questionsByQuiz = new Map();

  for (const course of courses) {
    const teacherId = course[5];
    const list = coursesByTeacher.get(teacherId) || [];
    list.push(course);
    coursesByTeacher.set(teacherId, list);
  }

  for (const lesson of lessons) {
    const courseId = lesson[1];
    const list = lessonsByCourse.get(courseId) || [];
    list.push(lesson);
    lessonsByCourse.set(courseId, list);
  }

  for (const quiz of quizzes) {
    quizzesByLesson.set(quiz[1], quiz);
    questionsByQuiz.set(quiz[0], questions.filter((question) => question[1] === quiz[0]));
  }

  for (const student of allStudents) {
    const teacherCourses = coursesByTeacher.get(student.teacherId) || [];
    const assignedCourses = teacherCourses.slice(student.grade === 3 ? 0 : student.grade === 4 ? 1 : 2, student.grade === 3 ? 4 : student.grade === 4 ? 5 : 6);
    const progressSeed = (student.index * 17 + student.grade * 11) % 101;
    const xpBase = 60 + (student.index % 11) * 35 + Math.floor(progressSeed * 2.4);
    const todayXp = student.index % 5 === 0 ? 0 : 10 + (student.index % 5) * 10;
    const streak = student.index % 6 === 0 ? 0 : (student.index % 12) + 1;

    progressRows.push([
      demoUuid(`progress:${student.id}`),
      student.id,
      xpBase,
      todayXp,
      50,
      Math.max(1, Math.floor(xpBase / 120) + 1),
      streak,
      Math.max(streak, streak + (student.index % 4)),
      student.index % 6 === 0
        ? new Date(now.getTime() - ((student.index % 5) + 1) * 24 * 60 * 60 * 1000)
        : new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    ]);

    assignedCourses.forEach((course, assignedIndex) => {
      const courseId = course[0];
      const courseLessons = lessonsByCourse.get(courseId) || [];
      const enrollmentProgress = Math.min(100, Math.max(0, (progressSeed + assignedIndex * 23) % 110));
      const completedCount = Math.min(courseLessons.length, Math.floor((enrollmentProgress / 100) * courseLessons.length));
      const status = enrollmentProgress >= 95 ? "completed" : student.index % 23 === 0 ? "paused" : "active";
      const assignedAt = new Date(now.getTime() - (10 + assignedIndex * 5 + student.index % 12) * 24 * 60 * 60 * 1000);
      const lastActivityAt =
        completedCount > 0
          ? new Date(now.getTime() - (student.index % 7) * 24 * 60 * 60 * 1000)
          : null;

      enrollments.push([
        demoUuid(`enrollment:${student.id}:${courseId}`),
        courseId,
        student.id,
        student.classId,
        student.teacherId,
        status,
        assignedAt,
        status === "completed" ? new Date(now.getTime() - (student.index % 3) * 24 * 60 * 60 * 1000) : null,
        new Date(now.getTime() + (14 + assignedIndex * 7) * 24 * 60 * 60 * 1000),
        status === "completed" ? 100 : enrollmentProgress,
        lastActivityAt,
      ]);

      courseLessons.slice(0, completedCount).forEach((lesson, lessonOffset) => {
        const lessonId = lesson[0];
        const lessonType = lesson[4];
        const completedAt = new Date(now.getTime() - (completedCount - lessonOffset + assignedIndex) * 24 * 60 * 60 * 1000);
        const score = lessonType === "quiz" ? 55 + ((student.index + lessonOffset * 7) % 46) : null;
        const attemptsCount = lessonType === "quiz" ? 1 + ((student.index + lessonOffset) % 3) : 1;

        lessonProgress.push([
          demoUuid(`lesson-progress:${student.id}:${lessonId}`),
          student.id,
          lessonId,
          true,
          completedAt,
          score,
          attemptsCount,
        ]);

        xpLogs.push([
          demoUuid(`xp-log:${student.id}:${lessonId}`),
          student.id,
          lessonType === "quiz" ? 35 : 20,
          lessonType === "quiz" ? "quiz" : "lesson",
          lessonId,
          completedAt,
        ]);

        if (lessonType === "quiz") {
          const quiz = quizzesByLesson.get(lessonId);
          if (!quiz) return;

          const quizId = quiz[0];
          const quizQuestions = questionsByQuiz.get(quizId) || [];
          const correctCount = Math.round((score / 100) * quizQuestions.length);
          const attemptId = demoUuid(`ai-attempt:${student.id}:${quizId}`);

          attempts.push([
            attemptId,
            quizId,
            lessonId,
            student.id,
            quizQuestions.length,
            correctCount,
            score,
            new Date(completedAt.getTime() - 7 * 60 * 1000),
            completedAt,
          ]);

          quizQuestions.forEach((question, questionIndex) => {
            const correctChoice = question[4];
            const selectedChoice = questionIndex < correctCount ? correctChoice : ["A", "B", "C", "D"][(questionIndex + student.index) % 4];

            answers.push([
              demoUuid(`ai-answer:${attemptId}:${question[0]}`),
              attemptId,
              question[0],
              selectedChoice,
              selectedChoice === correctChoice,
            ]);
          });
        }
      });
    });
  }

  return {
    users,
    classes,
    classStudents,
    courses,
    lessons,
    progressRows,
    enrollments,
    sourceDocuments,
    quizzes,
    questions,
    choices,
    lessonProgress,
    xpLogs,
    attempts,
    answers,
  };
}

async function createSchema(client) {
  await client.query(`
    create extension if not exists pgcrypto;

    create table if not exists public.classes (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      grade integer,
      teacher_id uuid not null references public.users(id) on delete cascade,
      school text,
      academic_year text not null default '2025-2026',
      access_code text not null unique,
      description text,
      created_at timestamp with time zone default now(),
      updated_at timestamp with time zone default now()
    );

    create table if not exists public.class_students (
      id uuid primary key default gen_random_uuid(),
      class_id uuid not null references public.classes(id) on delete cascade,
      student_id uuid not null references public.users(id) on delete cascade,
      joined_at timestamp with time zone default now(),
      status text not null default 'active' check (status in ('active', 'inactive', 'transferred')),
      unique (class_id, student_id)
    );

    create table if not exists public.course_enrollments (
      id uuid primary key default gen_random_uuid(),
      course_id uuid not null references public.courses(id) on delete cascade,
      student_id uuid not null references public.users(id) on delete cascade,
      class_id uuid references public.classes(id) on delete set null,
      assigned_by uuid references public.users(id) on delete set null,
      status text not null default 'active' check (status in ('active', 'completed', 'paused')),
      assigned_at timestamp with time zone default now(),
      completed_at timestamp with time zone,
      target_due_date date,
      progress_percent integer not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
      last_activity_at timestamp with time zone,
      unique (course_id, student_id)
    );

    create index if not exists classes_teacher_id_idx on public.classes(teacher_id);
    create index if not exists class_students_class_id_idx on public.class_students(class_id);
    create index if not exists class_students_student_id_idx on public.class_students(student_id);
    create index if not exists course_enrollments_course_id_idx on public.course_enrollments(course_id);
    create index if not exists course_enrollments_student_id_idx on public.course_enrollments(student_id);
    create index if not exists course_enrollments_class_id_idx on public.course_enrollments(class_id);
    create index if not exists lesson_progress_user_lesson_idx on public.lesson_progress(user_id, lesson_id);

    grant select, insert, update, delete on
      public.classes,
      public.class_students,
      public.course_enrollments
    to anon, authenticated;

    alter table public.classes enable row level security;
    alter table public.class_students enable row level security;
    alter table public.course_enrollments enable row level security;

    drop policy if exists "focuslearn_open_classes" on public.classes;
    drop policy if exists "focuslearn_open_class_students" on public.class_students;
    drop policy if exists "focuslearn_open_course_enrollments" on public.course_enrollments;

    create policy "focuslearn_open_classes"
    on public.classes for all to anon, authenticated using (true) with check (true);

    create policy "focuslearn_open_class_students"
    on public.class_students for all to anon, authenticated using (true) with check (true);

    create policy "focuslearn_open_course_enrollments"
    on public.course_enrollments for all to anon, authenticated using (true) with check (true);
  `);
}

async function main() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  const data = buildData();

  try {
    await client.query("begin");
    await createSchema(client);

    await insertMany(
      client,
      "users",
      ["id", "name", "role", "avatar_emoji", "access_code", "grade", "teacher_id", "school", "bio"],
      data.users,
      '"id"',
      ["name", "role", "avatar_emoji", "access_code", "grade", "teacher_id", "school", "bio"]
    );

    await insertMany(
      client,
      "classes",
      ["id", "name", "grade", "teacher_id", "school", "academic_year", "access_code", "description"],
      data.classes,
      '"id"',
      ["name", "grade", "teacher_id", "school", "academic_year", "access_code", "description"]
    );

    await insertMany(
      client,
      "class_students",
      ["id", "class_id", "student_id", "joined_at", "status"],
      data.classStudents,
      '"id"',
      ["class_id", "student_id", "joined_at", "status"]
    );

    await insertMany(
      client,
      "courses",
      ["id", "title", "description", "emoji", "color_key", "teacher_id", "total_lessons", "estimated_minutes", "difficulty", "tags", "is_published"],
      data.courses,
      '"id"',
      ["title", "description", "emoji", "color_key", "teacher_id", "total_lessons", "estimated_minutes", "difficulty", "tags", "is_published"]
    );

    await insertMany(
      client,
      "lessons",
      ["id", "course_id", "title", "emoji", "type", "duration_seconds", "xp_reward", "order", "content", "video_url", "is_published"],
      data.lessons,
      '"id"',
      ["course_id", "title", "emoji", "type", "duration_seconds", "xp_reward", "order", "content", "video_url", "is_published"]
    );

    await insertMany(
      client,
      "source_documents",
      ["id", "teacher_id", "file_name", "mime_type", "file_size_bytes", "storage_path", "public_url"],
      data.sourceDocuments,
      '"id"',
      ["teacher_id", "file_name", "mime_type", "file_size_bytes", "storage_path", "public_url"]
    );

    await insertMany(
      client,
      "ai_quizzes",
      ["id", "lesson_id", "course_id", "teacher_id", "source_document_id", "title", "summary", "generated_from", "subject", "language", "requested_difficulty", "requested_question_count", "validation_warnings", "raw_payload"],
      data.quizzes,
      '"id"',
      ["lesson_id", "course_id", "teacher_id", "source_document_id", "title", "summary", "generated_from", "subject", "language", "requested_difficulty", "requested_question_count", "validation_warnings", "raw_payload"]
    );

    await insertMany(
      client,
      "ai_quiz_questions",
      ["id", "quiz_id", "order_index", "question_text", "correct_choice_id", "explanation", "difficulty", "source_reference", "learning_objective"],
      data.questions,
      '"id"',
      ["quiz_id", "order_index", "question_text", "correct_choice_id", "explanation", "difficulty", "source_reference", "learning_objective"]
    );

    await insertMany(
      client,
      "ai_quiz_choices",
      ["id", "question_id", "choice_id", "order_index", "choice_text", "is_correct"],
      data.choices,
      '"id"',
      ["question_id", "choice_id", "order_index", "choice_text", "is_correct"]
    );

    await insertMany(
      client,
      "progress",
      ["id", "user_id", "xp", "xp_today", "xp_daily_goal", "level", "streak", "longest_streak", "last_active_date"],
      data.progressRows,
      '"user_id"',
      ["id", "xp", "xp_today", "xp_daily_goal", "level", "streak", "longest_streak", "last_active_date"]
    );

    await insertMany(
      client,
      "course_enrollments",
      ["id", "course_id", "student_id", "class_id", "assigned_by", "status", "assigned_at", "completed_at", "target_due_date", "progress_percent", "last_activity_at"],
      data.enrollments,
      '"id"',
      ["course_id", "student_id", "class_id", "assigned_by", "status", "assigned_at", "completed_at", "target_due_date", "progress_percent", "last_activity_at"]
    );

    await insertMany(
      client,
      "lesson_progress",
      ["id", "user_id", "lesson_id", "is_completed", "completed_at", "score", "attempts"],
      data.lessonProgress,
      '"id"',
      ["user_id", "lesson_id", "is_completed", "completed_at", "score", "attempts"]
    );

    await insertMany(
      client,
      "xp_logs",
      ["id", "user_id", "amount", "source", "source_id", "earned_at"],
      data.xpLogs,
      '"id"',
      ["user_id", "amount", "source", "source_id", "earned_at"]
    );

    await insertMany(
      client,
      "ai_quiz_attempts",
      ["id", "quiz_id", "lesson_id", "user_id", "total_questions", "correct_count", "score", "started_at", "completed_at"],
      data.attempts,
      '"id"',
      ["quiz_id", "lesson_id", "user_id", "total_questions", "correct_count", "score", "started_at", "completed_at"]
    );

    await insertMany(
      client,
      "ai_quiz_answers",
      ["id", "attempt_id", "question_id", "selected_choice_id", "is_correct"],
      data.answers,
      '"id"',
      ["attempt_id", "question_id", "selected_choice_id", "is_correct"]
    );

    await client.query("commit");

    const summary = await client.query(`
      select 'teachers' as label, count(*)::int as count from public.users where role = 'teacher'
      union all select 'students', count(*)::int from public.users where role = 'student'
      union all select 'classes', count(*)::int from public.classes
      union all select 'class_students', count(*)::int from public.class_students
      union all select 'courses', count(*)::int from public.courses
      union all select 'lessons', count(*)::int from public.lessons
      union all select 'course_enrollments', count(*)::int from public.course_enrollments
      union all select 'lesson_progress', count(*)::int from public.lesson_progress
      union all select 'progress', count(*)::int from public.progress
      union all select 'ai_quizzes', count(*)::int from public.ai_quizzes
      union all select 'ai_quiz_questions', count(*)::int from public.ai_quiz_questions
      union all select 'ai_quiz_attempts', count(*)::int from public.ai_quiz_attempts
      union all select 'xp_logs', count(*)::int from public.xp_logs
      order by label;
    `);

    console.table(summary.rows);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
