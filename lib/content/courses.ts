export type CourseWord = {
  id: string;
  term: string;
  reading: string;
  meaning: string;
  example: string;
  translation: string;
};

export type Course = {
  slug: string;
  name: string;
  language: string;
  locale: string;
  kicker: string;
  title: string;
  description: string;
  glyph: string;
  theme: "violet" | "blue" | "amber" | "green";
  focus: string[];
  words: CourseWord[];
};

// Original learning content, independent of official examination materials.
export const courses: Course[] = [
  {
    slug: "topik",
    name: "TOPIK",
    language: "Tiếng Hàn",
    locale: "ko",
    kicker: "TIẾNG HÀN · TOPIK",
    title: "Thêm một từ Hàn, gần thêm một thế giới.",
    description:
      "Làm quen với từ và cách diễn đạt tiếng Hàn qua những tình huống đời thường. Đọc câu ví dụ, mở nghĩa và thử sức với bài luyện từ vựng.",
    glyph: "한",
    theme: "violet",
    focus: ["Giao tiếp hằng ngày", "Từ vựng trong câu", "Đọc hiểu cơ bản"],
    words: [
      {
        id: "topik-hello",
        term: "안녕하세요",
        reading: "annyeonghaseyo",
        meaning: "Xin chào",
        example: "안녕하세요, 저는 민수예요.",
        translation: "Xin chào, tôi là Minsu.",
      },
      {
        id: "topik-library",
        term: "도서관",
        reading: "doseogwan",
        meaning: "thư viện",
        example: "도서관에서 책을 읽어요.",
        translation: "Tôi đọc sách ở thư viện.",
      },
      {
        id: "topik-appointment",
        term: "약속",
        reading: "yaksok",
        meaning: "cuộc hẹn",
        example: "내일 친구와 약속이 있어요.",
        translation: "Ngày mai tôi có hẹn với bạn.",
      },
      {
        id: "topik-prepare",
        term: "준비하다",
        reading: "junbihada",
        meaning: "chuẩn bị",
        example: "여행을 준비해요.",
        translation: "Tôi chuẩn bị cho chuyến du lịch.",
      },
      {
        id: "topik-experience",
        term: "경험",
        reading: "gyeongheom",
        meaning: "trải nghiệm",
        example: "이번 여행은 좋은 경험이었어요.",
        translation: "Chuyến du lịch này là một trải nghiệm tốt.",
      },
      {
        id: "topik-environment",
        term: "환경",
        reading: "hwangyeong",
        meaning: "môi trường",
        example: "환경을 보호해야 해요.",
        translation: "Chúng ta cần bảo vệ môi trường.",
      },
    ],
  },
  {
    slug: "ielts",
    name: "IELTS",
    language: "Tiếng Anh",
    locale: "en",
    kicker: "TIẾNG ANH · IELTS",
    title: "Tìm đúng từ cho điều bạn muốn nói.",
    description:
      "Mở rộng vốn từ tiếng Anh về xã hội, học tập và môi trường. Mỗi từ đi cùng một câu rõ nghĩa để bạn đọc, hiểu và luyện nhận diện.",
    glyph: "Aa",
    theme: "blue",
    focus: ["Chủ đề xã hội", "Từ vựng học thuật", "Nghĩa trong ngữ cảnh"],
    words: [
      {
        id: "ielts-environment",
        term: "environment",
        reading: "/ɪnˈvaɪ.rə.mənt/",
        meaning: "môi trường",
        example: "Small changes can help protect the environment.",
        translation: "Những thay đổi nhỏ có thể giúp bảo vệ môi trường.",
      },
      {
        id: "ielts-significant",
        term: "significant",
        reading: "/sɪɡˈnɪf.ə.kənt/",
        meaning: "đáng kể",
        example: "The new bus route made a significant difference.",
        translation: "Tuyến xe buýt mới đã tạo ra một sự khác biệt đáng kể.",
      },
      {
        id: "ielts-approach",
        term: "approach",
        reading: "/əˈproʊtʃ/",
        meaning: "cách tiếp cận",
        example: "Our team needs a different approach to this problem.",
        translation: "Nhóm của chúng tôi cần một cách tiếp cận khác cho vấn đề này.",
      },
      {
        id: "ielts-benefit",
        term: "benefit",
        reading: "/ˈben.ə.fɪt/",
        meaning: "lợi ích",
        example: "One benefit of cycling is better health.",
        translation: "Một lợi ích của việc đạp xe là sức khỏe tốt hơn.",
      },
      {
        id: "ielts-evidence",
        term: "evidence",
        reading: "/ˈev.ə.dəns/",
        meaning: "bằng chứng",
        example: "The report provides evidence of a change in habits.",
        translation: "Báo cáo cung cấp bằng chứng về sự thay đổi trong thói quen.",
      },
      {
        id: "ielts-sustainable",
        term: "sustainable",
        reading: "/səˈsteɪ.nə.bəl/",
        meaning: "bền vững",
        example: "The city is investing in sustainable transport.",
        translation: "Thành phố đang đầu tư vào giao thông bền vững.",
      },
    ],
  },
  {
    slug: "hsk",
    name: "HSK",
    language: "Tiếng Trung",
    locale: "zh-Hans",
    kicker: "TIẾNG TRUNG · HSK",
    title: "Từng chữ mới, từng kết nối mới.",
    description:
      "Khám phá từ tiếng Trung giản thể với pinyin, nghĩa tiếng Việt và câu giao tiếp ngắn. Lật thẻ rồi luyện lại những từ vừa gặp.",
    glyph: "你",
    theme: "green",
    focus: ["Chữ Hán & pinyin", "Giao tiếp hằng ngày", "Từ vựng cơ bản"],
    words: [
      {
        id: "hsk-hello",
        term: "你好",
        reading: "nǐ hǎo",
        meaning: "Xin chào",
        example: "你好，我叫林安。",
        translation: "Xin chào, tôi tên là Lâm An.",
      },
      {
        id: "hsk-study",
        term: "学习",
        reading: "xuéxí",
        meaning: "học tập",
        example: "我每天学习中文。",
        translation: "Tôi học tiếng Trung mỗi ngày.",
      },
      {
        id: "hsk-friend",
        term: "朋友",
        reading: "péngyou",
        meaning: "bạn bè",
        example: "她是我的朋友。",
        translation: "Cô ấy là bạn của tôi.",
      },
      {
        id: "hsk-time",
        term: "时间",
        reading: "shíjiān",
        meaning: "thời gian",
        example: "今天我有时间。",
        translation: "Hôm nay tôi có thời gian.",
      },
      {
        id: "hsk-like",
        term: "喜欢",
        reading: "xǐhuan",
        meaning: "thích",
        example: "我喜欢喝茶。",
        translation: "Tôi thích uống trà.",
      },
      {
        id: "hsk-work",
        term: "工作",
        reading: "gōngzuò",
        meaning: "làm việc",
        example: "我在学校工作。",
        translation: "Tôi làm việc ở trường học.",
      },
    ],
  },
];

export function getCourse(slug: string) {
  return courses.find((course) => course.slug === slug);
}
