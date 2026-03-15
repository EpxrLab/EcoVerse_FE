import { useState, lazy, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Badge, Button, Spin, Statistic } from "antd";
import {
  BookOpen,
  Clock,
  CheckCircle,
  Play,
  RotateCcw,
  Trophy,
  Target,
  Home,
  Coins,
} from "lucide-react";

// Mock quiz data
const mockQuizzes = [
  {
    id: 1,
    title: "Ô nhiễm không khí",
    description: "Tìm hiểu về các nguyên nhân và hậu quả của ô nhiễm không khí",
    difficulty: "Dễ",
    questionCount: 10,
    timeLimit: 10,
    coinReward: 25,
    completed: true,
    score: 90,
    completedAt: "2024-01-20",
  },
  {
    id: 2,
    title: "Phân loại rác thải",
    description: "Học cách phân loại rác thải đúng cách để bảo vệ môi trường",
    difficulty: "Trung bình",
    questionCount: 15,
    timeLimit: 15,
    coinReward: 35,
    completed: true,
    score: 85,
    completedAt: "2024-01-19",
  },
  {
    id: 3,
    title: "Tiết kiệm năng lượng",
    description: "Các biện pháp tiết kiệm năng lượng trong sinh hoạt hàng ngày",
    difficulty: "Dễ",
    questionCount: 10,
    timeLimit: 10,
    coinReward: 25,
    completed: false,
  },
  {
    id: 4,
    title: "Biến đổi khí hậu",
    description: "Nguyên nhân và tác động của biến đổi khí hậu toàn cầu",
    difficulty: "Khó",
    questionCount: 20,
    timeLimit: 20,
    coinReward: 50,
    completed: false,
  },
  {
    id: 5,
    title: "Bảo vệ đa dạng sinh học",
    description: "Tầm quan trọng của việc bảo vệ đa dạng sinh học",
    difficulty: "Trung bình",
    questionCount: 15,
    timeLimit: 15,
    coinReward: 35,
    completed: false,
  },
];

// Lazy-loaded QuizCard component
const QuizCard = lazy(() =>
  Promise.resolve({
    default: function QuizCard({ quiz, getDifficultyConfig, onStart }) {
      const config = getDifficultyConfig(quiz.difficulty);

      return (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          layout
        >
          <Card
            className={`border-2 transition-all duration-300 hover:shadow-2xl rounded-2xl overflow-hidden ${
              quiz.completed ? "border-green-400/40" : "border-gray-200"
            }`}
            bodyStyle={{ padding: 0 }}
          >
            {/* Card top accent bar */}
            <div className={`h-1.5 w-full ${config.bar}`} />

            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${config.badge}`}
                    >
                      {quiz.difficulty}
                    </span>
                    {quiz.completed && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300">
                        <CheckCircle className="w-3 h-3" />
                        Hoàn thành
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {quiz.description}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl shrink-0 shadow-inner">
                  📝
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-gray-50">
                <div className="flex items-center gap-2 text-gray-600">
                  <Target className="w-4 h-4" />
                  <span className="text-sm">{quiz.questionCount} câu hỏi</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{quiz.timeLimit} phút</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-amber-600">
                    +{quiz.coinReward} xu
                  </span>
                </div>
                {quiz.completed && (
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-600">
                      {quiz.score}%
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <Button
                type={quiz.completed ? "default" : "primary"}
                icon={
                  quiz.completed ? (
                    <RotateCcw className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )
                }
                onClick={() => onStart(quiz.id)}
                className={`w-full h-10 font-semibold flex items-center justify-center gap-2 rounded-xl transition-all duration-200 ${
                  quiz.completed
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                    : "bg-blue-500 hover:bg-blue-600 border-blue-500 text-white"
                }`}
              >
                {quiz.completed ? "Làm lại" : "Bắt đầu"}
              </Button>
            </div>
          </Card>
        </motion.div>
      );
    },
  }),
);

// Difficulty config helper
function getDifficultyConfig(difficulty) {
  switch (difficulty) {
    case "Dễ":
      return {
        badge: "bg-green-50 text-green-700 border-green-300",
        bar: "bg-gradient-to-r from-green-400 to-emerald-400",
      };
    case "Trung bình":
      return {
        badge: "bg-blue-50 text-blue-700 border-blue-300",
        bar: "bg-gradient-to-r from-blue-400 to-sky-400",
      };
    case "Khó":
      return {
        badge: "bg-red-50 text-red-700 border-red-300",
        bar: "bg-gradient-to-r from-red-400 to-rose-400",
      };
    default:
      return {
        badge: "bg-gray-100 text-gray-600 border-gray-300",
        bar: "bg-gray-300",
      };
  }
}

// Filter button config
const FILTER_OPTIONS = [
  {
    key: "all",
    label: "Tất cả",
    activeClass: "bg-gray-800 text-white border-gray-800",
  },
  {
    key: "Dễ",
    label: "Dễ",
    activeClass: "bg-green-500 text-white border-green-500",
  },
  {
    key: "Trung bình",
    label: "Trung bình",
    activeClass: "bg-blue-500 text-white border-blue-500",
  },
  {
    key: "Khó",
    label: "Khó",
    activeClass: "bg-red-500 text-white border-red-500",
  },
];

export default function StudentQuiz() {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  const filteredQuizzes =
    selectedDifficulty === "all"
      ? mockQuizzes
      : mockQuizzes.filter((q) => q.difficulty === selectedDifficulty);

  const completedQuizzes = mockQuizzes.filter((q) => q.completed);
  const totalCoinsEarned = completedQuizzes.reduce(
    (sum, q) => sum + (q.score >= 80 ? q.coinReward : 0),
    0,
  );

  const handleStartQuiz = (quiz) => {
    navigate(
      `/student/campaign/${campaignId}/quiz/${quiz.id}?title=${encodeURIComponent(
        quiz.title,
      )}&time=${quiz.timeLimit}&reward=${quiz.coinReward}`,
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-sm text-gray-500"
        >
          <button
            onClick={() => navigate(`/student/campaign/${campaignId}`)}
            className="flex items-center gap-1.5 hover:text-gray-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </button>
          <span>/</span>
          <span className="text-gray-800 font-medium">Quiz</span>
        </motion.div>

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            className="border-2 border-blue-100 shadow-xl rounded-3xl overflow-hidden"
            bodyStyle={{ padding: 0 }}
          >
            <div className="relative bg-gradient-to-br from-blue-50 via-purple-50/40 to-green-50 p-8">
              {/* Decorative blobs */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-blue-300/20 to-transparent rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-purple-400/15 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                {/* Title */}
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-800 mb-2 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    Làm Quiz
                  </h1>
                  <p className="text-gray-500 text-base">
                    Trả lời câu hỏi để kiểm tra kiến thức và nhận xu
                  </p>
                </div>

                {/* Stats */}
                <div className="flex gap-4 flex-wrap">
                  <Card
                    className="border-2 border-blue-200 rounded-2xl shadow-sm"
                    bodyStyle={{ padding: "16px 20px" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Đã hoàn thành</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {completedQuizzes.length}
                          <span className="text-gray-400 text-base font-normal">
                            /{mockQuizzes.length}
                          </span>
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card
                    className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-sm"
                    bodyStyle={{ padding: "16px 20px" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow">
                        <Coins className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Xu kiếm được</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                          {totalCoinsEarned}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card
            className="border-2 border-gray-100 rounded-2xl shadow-sm"
            bodyStyle={{ padding: "18px 24px" }}
          >
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm font-medium text-gray-500">Độ khó:</span>
              <div className="flex gap-2 flex-wrap">
                {FILTER_OPTIONS.map(({ key, label, activeClass }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedDifficulty(key)}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-full border-2 transition-all duration-200 ${
                      selectedDifficulty === key
                        ? activeClass
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quiz Grid with lazy-loaded cards */}
        <Suspense
          fallback={
            <div className="flex justify-center py-16">
              <Spin size="large" tip="Đang tải..." />
            </div>
          }
        >
          <AnimatePresence mode="popLayout">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              layout
            >
              {filteredQuizzes.map((quiz, index) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.07, duration: 0.35 }}
                  layout
                >
                  <QuizCard
                    quiz={quiz}
                    getDifficultyConfig={getDifficultyConfig}
                    onStart={() => handleStartQuiz(quiz)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </div>
    </div>
  );
}
