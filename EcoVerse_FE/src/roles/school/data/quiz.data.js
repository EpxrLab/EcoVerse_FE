export const defaultQuizzesData = [
  { 
    id: "default-1", 
    title: "Nhập môn Phân loại Rác", 
    questions: 5, 
    difficulty: "easy",
    completions: 145,
    avgScore: 82,
    type: "default"
  },
  { 
    id: "default-2", 
    title: "Biết Thêm Về Nhựa", 
    questions: 8, 
    difficulty: "medium",
    completions: 98,
    avgScore: 75,
    type: "default"
  },
  { 
    id: "default-3", 
    title: "Chuyên Gia Rác", 
    questions: 10, 
    difficulty: "hard",
    completions: 42,
    avgScore: 68,
    type: "default"
  },
];

export const customQuizzesData = [
  { 
    id: "custom-1", 
    title: "Quiz Tuần 1 - Lớp 3A", 
    questions: 6, 
    difficulty: "medium",
    completions: 28,
    avgScore: 85,
    type: "custom",
    classes: ["3A"],
    status: "published"
  },
  { 
    id: "custom-2", 
    title: "Ôn Tập Cuối Tháng", 
    questions: 10, 
    difficulty: "hard",
    completions: 0,
    avgScore: 0,
    type: "custom",
    classes: ["1A", "1B", "2A", "2B"],
    status: "draft"
  },
];

export const sampleQuestionsData = [
  { id: 1, question: "Chai nhựa nên được phân loại vào thùng nào?", type: "multiple_choice", answer: "Plastic" },
  { id: 2, question: "Giấy có thể tái chế được không?", type: "true_false", answer: "True" },
  { id: 3, question: "Vỏ chuối nên được bỏ vào thùng nào?", type: "multiple_choice", answer: "Organic" },
];

export const getQuizStats = (defaultQuizzes, customQuizzes) => {
  const allQuizzes = [...defaultQuizzes, ...customQuizzes];
  const totalCompletions = allQuizzes.reduce((acc, q) => acc + q.completions, 0);
  const avgScore = Math.round(
    allQuizzes.filter(q => q.completions > 0).reduce((acc, q) => acc + q.avgScore, 0) / 
    allQuizzes.filter(q => q.completions > 0).length
  );
  
  return {
    totalQuizzes: allQuizzes.length,
    totalCompletions,
    avgScore: avgScore || 0,
  };
};