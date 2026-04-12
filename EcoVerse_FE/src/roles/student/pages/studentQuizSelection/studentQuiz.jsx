import { useState, lazy, Suspense, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Badge, Button, Spin, Statistic, Select, Space } from "antd";
import {
  Home,
  Coins,
  Layers,
  ChevronRight,
  BookOpen,
  CheckCircle,
  RotateCcw,
  Target,
  Trophy,
  Play,
} from "lucide-react";
import { ClippingGroup } from "three/webgpu";
import { getCampaignDetails } from "../../services";

// Lazy-loaded QuizCard component
const QuizCard = lazy(() =>
  Promise.resolve({
    default: function QuizCard({ quiz, getDifficultyConfig, onStart }) {
      const config = getDifficultyConfig(quiz.difficulty);
      const isCompleted = quiz.isPassed;

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
              isCompleted ? "border-green-400/40" : "border-gray-200"
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
                      {config.label}
                    </span>
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300">
                        <CheckCircle className="w-3 h-3" />
                        Hoàn thành
                      </span>
                    )}
                    {quiz.isRequired && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Bắt buộc
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {quiz.description ||
                      "Tham gia giải đố để tích lũy kiến thức bảo vệ môi trường."}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl shrink-0 shadow-inner">
                  📝
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-gray-50">
                <div className="flex items-center gap-2 text-gray-600">
                  <RotateCcw className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">
                    Lần thử: {quiz.attemptsUsed}/{quiz.maxAttempts}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Target className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">Thứ tự: {quiz.displayOrder}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-amber-600">
                    +{quiz.coinReward || 20} xu
                  </span>
                </div>
                {isCompleted && (
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-600">
                      Đã đạt
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <Button
                type={isCompleted ? "default" : "primary"}
                disabled={quiz.attemptsUsed >= quiz.maxAttempts && !isCompleted}
                icon={
                  isCompleted ? (
                    <RotateCcw className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )
                }
                onClick={() => onStart(quiz)}
                className={`w-full h-10 font-semibold flex items-center justify-center gap-2 rounded-xl transition-all duration-200 ${
                  isCompleted
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                    : "bg-blue-500 hover:bg-blue-600 border-blue-500 text-white"
                }`}
              >
                {isCompleted ? "Làm lại" : "Bắt đầu"}
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
    case "EASY":
      return {
        label: "Dễ",
        badge: "bg-green-50 text-green-700 border-green-300",
        bar: "bg-gradient-to-r from-green-400 to-emerald-400",
      };
    case "MEDIUM":
      return {
        label: "Trung bình",
        badge: "bg-blue-50 text-blue-700 border-blue-300",
        bar: "bg-gradient-to-r from-blue-400 to-sky-400",
      };
    case "HARD":
      return {
        label: "Khó",
        badge: "bg-red-50 text-red-700 border-red-300",
        bar: "bg-gradient-to-r from-red-400 to-rose-400",
      };
    default:
      return {
        label: difficulty,
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
    key: "EASY",
    label: "Dễ",
    activeClass: "bg-green-500 text-white border-green-500",
  },
  {
    key: "MEDIUM",
    label: "Trung bình",
    activeClass: "bg-blue-500 text-white border-blue-500",
  },
  {
    key: "HARD",
    label: "Khó",
    activeClass: "bg-red-500 text-white border-red-500",
  },
];

export default function StudentQuiz() {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [campaign, setCampaign] = useState(null);
  const [selectedRoundId, setSelectedRoundId] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getCampaignDetails(campaignId);
      const campaignData = res.data;
      setCampaign(campaignData);

      // Default to the first round
      if (campaignData?.rounds?.length > 0) {
        const firstRound = campaignData.rounds[0];
        setSelectedRoundId(firstRound.id);
        setQuizzes(firstRound.quizzes || []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [campaignId]);

  useEffect(() => {
    if (campaign && selectedRoundId) {
      const round = campaign.rounds.find((r) => r.id === selectedRoundId);
      if (round) {
        setQuizzes(round.quizzes || []);
      }
    }
  }, [selectedRoundId, campaign]);

  const filteredQuizzes =
    selectedDifficulty === "all"
      ? quizzes
      : quizzes.filter((q) => q.difficulty === selectedDifficulty);

  const completedQuizzes = quizzes.filter((q) => q.isPassed);
  const totalCoinsEarned = completedQuizzes.reduce(
    (sum, q) => sum + (q.coinReward || 20),
    0,
  );

  const handleStartQuiz = (quiz) => {
    navigate(
      `/student/campaign/${campaignId}/round/${selectedRoundId}/quiz/${quiz.quizId}`,
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
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-extrabold text-gray-800 leading-none">
                        Làm Quiz
                      </h1>
                      {campaign?.campaignName && (
                        <p className="text-blue-600 font-medium text-sm mt-1">
                          {campaign.campaignName}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-500 text-base max-w-md">
                    Trả lời câu hỏi để kiểm tra kiến thức và nhận xu bảo vệ môi
                    trường.
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
                        <p className="text-xs text-gray-400">Hoàn thành vòng</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {completedQuizzes.length}
                          <span className="text-gray-400 text-base font-normal">
                            /{quizzes.length}
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
                        <p className="text-xs text-gray-400">Xu có thể nhận</p>
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

        {/* Round Selection & Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Round Selector - Only show if not SCHOOL_INTERNAL and has rounds */}
          {campaign?.campaignType !== "SCHOOL_INTERNAL" &&
            campaign?.rounds?.length > 1 && (
              <motion.div
                className="lg:col-span-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card
                  className="border-2 border-blue-100 rounded-2xl shadow-sm hover:border-blue-200 transition-colors"
                  bodyStyle={{ padding: "20px" }}
                >
                  <Space direction="vertical" className="w-full" size="middle">
                    <div className="flex items-center gap-2 text-blue-600 font-bold px-1">
                      <Layers className="w-5 h-5" />
                      <span className="text-base">Chọn vòng thi đấu</span>
                    </div>
                    <Select
                      className="w-full h-12"
                      placeholder="Chọn vòng"
                      value={selectedRoundId}
                      onChange={setSelectedRoundId}
                      size="large"
                      suffixIcon={<ChevronRight className="w-4 h-4" />}
                      dropdownClassName="rounded-xl overflow-hidden shadow-xl"
                    >
                      {campaign.rounds.map((round) => (
                        <Select.Option key={round.id} value={round.id}>
                          <div className="flex items-center justify-between py-1 px-1">
                            <span className="font-semibold text-gray-700">
                              {round.roundName || `Vòng ${round.roundNumber}`}
                            </span>
                            <Badge
                              status={
                                round.status === "ACTIVE"
                                  ? "processing"
                                  : "default"
                              }
                              text={
                                <span className="text-[10px] text-gray-400">
                                  {round.status}
                                </span>
                              }
                            />
                          </div>
                        </Select.Option>
                      ))}
                    </Select>
                    <div className="px-2 pt-1 text-xs text-gray-400 italic flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      Mỗi vòng thi sẽ có bộ câu đố kiến thức riêng biệt.
                    </div>
                  </Space>
                </Card>
              </motion.div>
            )}

          {/* Filters */}
          <motion.div
            className={
              campaign?.campaignType !== "SCHOOL_INTERNAL" &&
              campaign?.rounds?.length > 1
                ? "lg:col-span-8"
                : "lg:col-span-12"
            }
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card
              className="border-2 border-gray-100 rounded-2xl shadow-sm h-full"
              bodyStyle={{ padding: "22px 24px" }}
            >
              <div className="flex items-center gap-6 flex-wrap h-full">
                <div className="flex items-center gap-2 pr-2 border-r border-gray-100">
                  <Statistic
                    title={
                      <span className="text-xs uppercase tracking-wider font-bold text-gray-400">
                        Độ khó
                      </span>
                    }
                    value=" "
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {FILTER_OPTIONS.map(({ key, label, activeClass }) => (
                    <button
                      key={key}
                      onClick={() => setSelectedDifficulty(key)}
                      className={`px-5 py-2 text-sm font-bold rounded-xl border-2 transition-all duration-300 ${
                        selectedDifficulty === key
                          ? `${activeClass} shadow-lg scale-105`
                          : "bg-white text-gray-500 border-gray-100 hover:border-gray-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Quiz Grid with lazy-loaded cards */}
        <Suspense
          fallback={
            <div className="flex justify-center py-16">
              <Spin size="large" tip="Đang tải..." />
            </div>
          }
        >
          {loading ? (
            <div className="flex justify-center py-16">
              <Spin size="large" tip="Đang lấy dữ liệu..." />
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                layout
              >
                {filteredQuizzes.length > 0 ? (
                  filteredQuizzes.map((quiz, index) => (
                    <motion.div
                      key={quiz.quizId}
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
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      Không tìm thấy câu đố nào trong phần này.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </Suspense>
      </div>
    </div>
  );
}
