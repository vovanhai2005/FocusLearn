// filepath: constants/mockData.ts

export interface MockLesson {
  id: string;
  courseId: string;
  title: string;
  emoji: string;
  lessonType: "video" | "quiz" | "reading";
  duration: number;
  xpReward: number;
  readingContent?: string;
  quiz?: {
    question: string;
    questionEmoji: string;
    options: { id: string; text: string; isCorrect: boolean }[];
    explanation: string;
  };
}

export interface MockCourse {
  id: string;
  emoji: string;
  title: string;
  description: string;
  subject: string;
  color: string;
  subtleColor: string;
  difficulty: string;
  lessons: MockLesson[];
}

export const MOCK_COURSES: Record<string, MockCourse> = {
  c1: {
    id: "c1",
    emoji: "🔢",
    title: "Toán lớp 3",
    description: "Học phép tính cơ bản và nâng cao",
    subject: "Toán học",
    color: "#6C63FF",
    subtleColor: "#EEEEFF",
    difficulty: "Dễ",
    lessons: [
      {
        id: "c1l1", courseId: "c1", title: "Phép cộng có nhớ", emoji: "➕",
        lessonType: "video", duration: 300, xpReward: 20,
      },
      {
        id: "c1l2", courseId: "c1", title: "Quiz: Phép cộng", emoji: "✏️",
        lessonType: "quiz", duration: 120, xpReward: 15,
        quiz: {
          question: "35 + 47 bằng bao nhiêu?",
          questionEmoji: "🤔",
          options: [
            { id: "a", text: "72", isCorrect: false },
            { id: "b", text: "82", isCorrect: true },
            { id: "c", text: "92", isCorrect: false },
            { id: "d", text: "75", isCorrect: false },
          ],
          explanation: "35 + 47 = 82 vì 5+7=12 (viết 2 nhớ 1), rồi 3+4+1=8 ✨",
        },
      },
      {
        id: "c1l3", courseId: "c1", title: "Phép nhân cơ bản", emoji: "✖️",
        lessonType: "video", duration: 240, xpReward: 20,
      },
      {
        id: "c1l4", courseId: "c1", title: "Đọc: Toán trong cuộc sống", emoji: "📖",
        lessonType: "reading", duration: 180, xpReward: 15,
        readingContent:
          "Toán học có mặt ở khắp nơi trong cuộc sống! 🌟\n\nKhi mẹ mua 3 quả táo và 5 quả cam, chúng ta dùng phép cộng để biết tổng số quả.\n\nKhi chia đều 12 cái bánh cho 4 bạn, chúng ta dùng phép chia.\n\nToán giúp chúng ta mua sắm, nấu ăn, và rất nhiều việc khác! 🎉",
      },
      {
        id: "c1l5", courseId: "c1", title: "Quiz: Bảng cửu chương", emoji: "🎯",
        lessonType: "quiz", duration: 150, xpReward: 25,
        quiz: {
          question: "6 × 7 bằng bao nhiêu?",
          questionEmoji: "⭐",
          options: [
            { id: "a", text: "36", isCorrect: false },
            { id: "b", text: "48", isCorrect: false },
            { id: "c", text: "42", isCorrect: true },
            { id: "d", text: "56", isCorrect: false },
          ],
          explanation: "6 × 7 = 42. Hãy nhớ bảng cửu chương nhé! 🔥",
        },
      },
    ],
  },
  c2: {
    id: "c2",
    emoji: "🌿",
    title: "Khoa học tự nhiên",
    description: "Khám phá thế giới xung quanh",
    subject: "Khoa học",
    color: "#3DD68C",
    subtleColor: "#E6FBF2",
    difficulty: "Vừa",
    lessons: [
      {
        id: "c2l1", courseId: "c2", title: "Động vật và môi trường sống", emoji: "🦁",
        lessonType: "video", duration: 270, xpReward: 20,
      },
      {
        id: "c2l2", courseId: "c2", title: "Quiz: Nhận biết động vật", emoji: "🐾",
        lessonType: "quiz", duration: 150, xpReward: 15,
        quiz: {
          question: "Loài động vật nào sống dưới nước?",
          questionEmoji: "🌊",
          options: [
            { id: "a", text: "🦁 Sư tử", isCorrect: false },
            { id: "b", text: "🐬 Cá heo", isCorrect: true },
            { id: "c", text: "🐘 Voi", isCorrect: false },
            { id: "d", text: "🦊 Cáo", isCorrect: false },
          ],
          explanation: "Cá heo sống dưới nước và là loài động vật thông minh! 🐬",
        },
      },
      {
        id: "c2l3", courseId: "c2", title: "Cây xanh và ánh sáng", emoji: "🌱",
        lessonType: "video", duration: 240, xpReward: 20,
      },
      {
        id: "c2l4", courseId: "c2", title: "Đọc: Vòng tuần hoàn nước", emoji: "💧",
        lessonType: "reading", duration: 200, xpReward: 15,
        readingContent:
          "Nước trên Trái Đất di chuyển theo một vòng lặp đi lặp lại! 💧\n\n☀️ Ánh mặt trời làm nước bốc hơi lên cao.\n\n☁️ Hơi nước tụ lại thành mây.\n\n🌧️ Mây gặp lạnh tạo thành mưa rơi xuống.\n\n🏞️ Nước mưa chảy vào sông, hồ, rồi lại bốc hơi... và vòng tuần hoàn tiếp tục!",
      },
    ],
  },
  c3: {
    id: "c3",
    emoji: "📖",
    title: "Tiếng Việt luyện đọc",
    description: "Nâng cao kỹ năng đọc hiểu",
    subject: "Tiếng Việt",
    color: "#FFD166",
    subtleColor: "#FFFBEB",
    difficulty: "Dễ",
    lessons: [
      {
        id: "c3l1", courseId: "c3", title: "Câu chuyện: Rùa và Thỏ", emoji: "🐢",
        lessonType: "reading", duration: 300, xpReward: 20,
        readingContent:
          "Ngày xưa, Thỏ và Rùa thi chạy. 🐇🐢\n\nThỏ chạy rất nhanh nên kiêu ngạo, nằm ngủ dọc đường.\n\nRùa tuy chậm nhưng không bỏ cuộc, cứ từng bước một tiến về đích.\n\nKhi Thỏ thức dậy thì Rùa đã về đích rồi! 🏆\n\n💡 Bài học: Kiên trì và không bỏ cuộc quan trọng hơn tài năng.",
      },
      {
        id: "c3l2", courseId: "c3", title: "Quiz: Hiểu bài đọc", emoji: "✏️",
        lessonType: "quiz", duration: 120, xpReward: 20,
        quiz: {
          question: "Ai thắng cuộc thi chạy giữa Rùa và Thỏ?",
          questionEmoji: "🏆",
          options: [
            { id: "a", text: "🐇 Thỏ thắng", isCorrect: false },
            { id: "b", text: "🐢 Rùa thắng", isCorrect: true },
            { id: "c", text: "Hòa nhau", isCorrect: false },
            { id: "d", text: "Không ai thắng", isCorrect: false },
          ],
          explanation: "Rùa thắng vì kiên trì không bỏ cuộc, dù Thỏ chạy nhanh hơn! 🐢",
        },
      },
      {
        id: "c3l3", courseId: "c3", title: "Từ vựng: Thiên nhiên", emoji: "🌸",
        lessonType: "video", duration: 180, xpReward: 15,
      },
    ],
  },
  c4: {
    id: "c4",
    emoji: "🎨",
    title: "Mỹ thuật sáng tạo",
    description: "Khám phá sáng tạo nghệ thuật",
    subject: "Mỹ thuật",
    color: "#FF8C42",
    subtleColor: "#FFF0E6",
    difficulty: "Dễ",
    lessons: [
      {
        id: "c4l1", courseId: "c4", title: "Màu sắc cơ bản", emoji: "🖌️",
        lessonType: "video", duration: 240, xpReward: 20,
      },
      {
        id: "c4l2", courseId: "c4", title: "Đọc: Ý nghĩa của màu sắc", emoji: "🌈",
        lessonType: "reading", duration: 200, xpReward: 15,
        readingContent:
          "Màu sắc có thể tạo ra cảm xúc khác nhau! 🎨\n\n❤️ Đỏ: Năng lượng, nhiệt tình\n💙 Xanh dương: Bình yên, tin tưởng\n💚 Xanh lá: Thiên nhiên, hy vọng\n💛 Vàng: Vui vẻ, hạnh phúc\n🟣 Tím: Sáng tạo, đặc biệt\n\nHãy thử dùng màu sắc để biểu lộ cảm xúc của bạn! 🌟",
      },
      {
        id: "c4l3", courseId: "c4", title: "Quiz: Nhận biết màu sắc", emoji: "🎯",
        lessonType: "quiz", duration: 120, xpReward: 15,
        quiz: {
          question: "Màu đỏ + màu vàng = màu gì?",
          questionEmoji: "🎨",
          options: [
            { id: "a", text: "🟢 Xanh lá", isCorrect: false },
            { id: "b", text: "🟠 Cam", isCorrect: true },
            { id: "c", text: "🟣 Tím", isCorrect: false },
            { id: "d", text: "⚫ Đen", isCorrect: false },
          ],
          explanation: "Đỏ + Vàng = Cam 🟠 Đây là màu thứ cấp rất đẹp!",
        },
      },
    ],
  },
};

// All lessons flat map for quick lookup
export const MOCK_LESSONS: Record<string, MockLesson> = Object.values(
  MOCK_COURSES
).reduce(
  (acc, course) => {
    course.lessons.forEach((l) => { acc[l.id] = l; });
    return acc;
  },
  {} as Record<string, MockLesson>
);

// Courses as array for list screens
export const MOCK_COURSES_LIST = Object.values(MOCK_COURSES).map((c) => ({
  ...c,
  totalLessons: c.lessons.length,
  completedLessons: 0, // filled dynamically from store
}));
