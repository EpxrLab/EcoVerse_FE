import { useState, lazy, Suspense, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  Button,
  Spin,
  Select,
  Space,
  Modal,
  Empty,
  Tag,
} from "antd";
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
  History,
  Clock,
  ExternalLink,
  Lock,
} from "lucide-react";
import { getCampaignDetails, getQuizHistory } from "../../services";
import { toLocalISO } from "@/utils/dateUtils";

// Lazy-loaded QuizCard component
const QuizCard = lazy(() =>
  Promise.resolve({
    default: function QuizCard({
      quiz,
      getDifficultyConfig,
      onStart,
      onOpenHistory,
      isPreviewMode,
    }) {
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
            className={`border-2 transition-all duration-300 hover:shadow-2xl rounded-2xl overflow-hidden relative ${
              isCompleted ? "border-primary/40" : "border-gray-200"
            }`}
            bodyStyle={{ padding: 0 }}
          >
            {/* Card top accent bar */}
            <div className={`h-1.5 w-full ${config.bar}`} />

            {/* History Toggle Button */}
            <div className="absolute top-4 right-4 z-10">
              <Button
                size="small"
                shape="circle"
                icon={<History className="w-3.5 h-3.5" />}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenHistory(quiz);
                }}
                className="bg-white/80 backdrop-blur-sm border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-200 shadow-sm"
              />
            </div>

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
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
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
                  <h3 className="text-xl font-bold text-gray-800 mb-1 line-clamp-1">
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
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
                    <Trophy className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">
                      Đã đạt
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <Button
                type={
                  isCompleted && !isPreviewMode
                    ? "default"
                    : isPreviewMode
                      ? "default"
                      : "primary"
                }
                disabled={
                  (quiz.attemptsUsed >= quiz.maxAttempts && !isCompleted) ||
                  isPreviewMode
                }
                icon={
                  isPreviewMode ? (
                    <Lock className="w-4 h-4" />
                  ) : isCompleted ? (
                    <RotateCcw className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )
                }
                onClick={() => onStart(quiz)}
                className={`w-full h-10 font-semibold flex items-center justify-center gap-2 rounded-xl transition-all duration-200 ${
                  isPreviewMode ||
                  (quiz.attemptsUsed >= quiz.maxAttempts && !isCompleted)
                    ? "bg-gray-100 text-gray-400 border-transparent cursor-not-allowed"
                    : isCompleted
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                      : "bg-primary hover:opacity-90 border-primary text-white shadow-md shadow-primary/10"
                }`}
              >
                {isPreviewMode
                  ? "Chưa mở"
                  : isCompleted
                    ? "Làm lại"
                    : "Bắt đầu"}
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
        badge: "bg-primary/10 text-primary border-primary/20",
        bar: "bg-primary",
      };
    case "MEDIUM":
      return {
        label: "Trung bình",
        badge: "bg-blue-50 text-blue-700 border-blue-300",
        bar: "bg-blue-400",
      };
    case "HARD":
      return {
        label: "Khó",
        badge: "bg-red-50 text-red-700 border-red-300",
        bar: "bg-red-400",
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
    activeClass: "bg-primary text-white border-primary",
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
  const [quizHistory, setQuizHistory] = useState([]);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isCompletedMode, setIsCompletedMode] = useState(false);

  const fetchQuizHistoryData = async (quizId) => {
    setHistoryLoading(true);
    try {
      const res = await getQuizHistory(campaignId, selectedRoundId, quizId);
      setQuizHistory(res.data || []);
    } catch (error) {
      console.log(error);
      setQuizHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenHistory = (quiz) => {
    setSelectedQuiz(quiz);
    setHistoryModalOpen(true);
    fetchQuizHistoryData(quiz.quizId);
  };

  const formatTime = (seconds) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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
        // Evaluate access based on round status
        const status = round.status;
        setIsPreviewMode(status === "UPCOMING");
        setIsCompletedMode(status === "COMPLETED");

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
    <div className="min-h-screen bg-background">
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
            className="border-2 border-primary/10 shadow-xl rounded-3xl overflow-hidden"
            bodyStyle={{ padding: 0 }}
          >
            <div className="relative bg-primary/5 p-8">
              {/* Decorative blobs */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

              {/* Title */}
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-mint-eco flex items-center justify-center shadow-lg">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-black text-foreground leading-none">
                        Làm Quiz
                      </h1>
                      {campaign?.campaignName && (
                        <p className="text-primary font-bold text-sm mt-1 uppercase tracking-wider">
                          {campaign.campaignName}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-base max-w-md font-medium">
                    Thử thách kiến thức để tích lũy xu bảo vệ hành tinh xanh của
                    chúng ta.
                  </p>
                </div>

                {/* Stats */}
                <div className="flex gap-4 flex-wrap">
                  <Card
                    className="border-2 border-primary/20 rounded-2xl shadow-sm bg-primary/5"
                    bodyStyle={{ padding: "16px 20px" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                          Tiến độ vòng
                        </p>
                        <p className="text-2xl font-black text-foreground">
                          {completedQuizzes.length}
                          <span className="text-muted-foreground/40 text-base font-normal">
                            /{quizzes.length}
                          </span>
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card
                    className="border-2 border-amber-200 bg-amber-50 rounded-2xl shadow-sm"
                    bodyStyle={{ padding: "16px 20px" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center shadow">
                        <Coins className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                          Xu tích lũy
                        </p>
                        <p className="text-2xl font-black text-amber-600">
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
                  className="border-2 border-primary/20 rounded-2xl shadow-sm hover:border-primary/40 transition-colors bg-white"
                  bodyStyle={{ padding: "20px" }}
                >
                  <Space direction="vertical" className="w-full" size="middle">
                    <div className="flex items-center gap-2 text-primary font-black px-1 uppercase tracking-wider text-xs">
                      <Layers className="w-4 h-4" />
                      <span>Vòng thi đấu</span>
                    </div>
                    <Select
                      className="w-full h-12"
                      placeholder="Chọn vòng"
                      value={selectedRoundId}
                      onChange={setSelectedRoundId}
                      size="large"
                      suffixIcon={<ChevronRight className="w-4 h-4" />}
                      dropdownClassName="rounded-xl overflow-hidden shadow-xl"
                      options={campaign?.rounds?.map((round) => {
                        const status = round.status;
                        const statusLabel =
                          status === "UPCOMING"
                            ? " (Chưa mở)"
                            : status === "COMPLETED"
                              ? " (Đã kết thúc)"
                              : "";
                        return {
                          label: `${round.roundName || `Vòng ${round.roundNumber}`}${statusLabel}`,
                          value: round.id,
                        };
                      })}
                    />
                    {(() => {
                      const selectedRound = campaign?.rounds?.find(
                        (r) => r.id === selectedRoundId,
                      );
                      if (!selectedRound) return null;
                      return (
                        <div className="mt-1 text-sm flex flex-col gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium">
                              Bắt đầu:
                            </span>
                            <span className="text-primary font-bold">
                              {new Date(toLocalISO(selectedRound.startTime)).toLocaleString(
                                "vi-VN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-medium">
                              Kết thúc:
                            </span>
                            <span className="text-gray-800 font-bold">
                              {new Date(toLocalISO(selectedRound.endTime)).toLocaleString(
                                "vi-VN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
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
              className="border-2 border-border rounded-2xl shadow-sm h-full bg-white"
              bodyStyle={{ padding: "22px 24px" }}
            >
              <div className="flex items-center gap-6 flex-wrap h-full">
                <div className="flex items-center gap-2 pr-6 border-r border-border">
                  <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">
                    Lọc theo độ khó
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {FILTER_OPTIONS.map(({ key, label, activeClass }) => (
                    <button
                      key={key}
                      onClick={() => setSelectedDifficulty(key)}
                      className={`px-6 py-2.5 text-xs font-black rounded-xl border-2 transition-all duration-300 uppercase tracking-wider ${
                        selectedDifficulty === key
                          ? key === "all"
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                            : `${activeClass} shadow-lg scale-105`
                          : "bg-white text-muted-foreground border-border hover:border-primary/30"
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

        {/* Preview Mode Notification */}
        {isPreviewMode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 shrink-0 rounded-xl bg-amber-100 flex items-center justify-center">
                <Lock className="text-amber-500 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-amber-800 text-lg font-bold m-0">
                  Vòng đấu chưa mở
                </h3>
                <p className="text-amber-700 m-0 mt-1">
                  Vòng đấu này hiện chưa tới thời gian bắt đầu nên bạn chưa thể
                  tham gia làm quiz. Hãy quay lại sau nhé!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Completed Mode Notification */}
        {isCompletedMode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-100 flex items-center justify-center">
                <Trophy className="text-blue-500 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-blue-800 text-lg font-bold m-0">
                  Vòng đấu đã kết thúc
                </h3>
                <p className="text-blue-700 m-0 mt-1">
                  Vòng đấu này đã hoàn thành. Bạn có thể xem lại lịch sử làm bài
                  nhưng không thể tham gia làm mới hoặc làm lại.
                </p>
              </div>
            </div>
          </motion.div>
        )}

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
                        onOpenHistory={handleOpenHistory}
                        isPreviewMode={isPreviewMode || isCompletedMode}
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

        <Modal
          title={
            <div className="flex items-center gap-2 text-lg font-bold">
              <History className="w-5 h-5 text-primary" />
              <span>Lịch sử làm bài: {selectedQuiz?.title}</span>
            </div>
          }
          open={historyModalOpen}
          onCancel={() => setHistoryModalOpen(false)}
          footer={null}
          width={700}
          className="rounded-2xl overflow-hidden"
          bodyStyle={{ padding: "12px 24px 24px" }}
        >
          {historyLoading ? (
            <div className="py-20 text-center">
              <Spin tip="Đang tải lịch sử..." />
            </div>
          ) : quizHistory.length > 0 ? (
            <div className="space-y-3 mt-4">
              {quizHistory.map((item) => (
                <div
                  key={item.attemptId}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex flex-wrap items-center gap-4 flex-1">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                        Lần thử
                      </span>
                      <span className="font-bold text-gray-700">
                        #{item.attemptNumber}
                      </span>
                    </div>

                    <div className="w-px h-8 bg-gray-200 mx-2 hidden sm:block" />

                    <div className="flex flex-col min-w-[80px]">
                      <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                        Điểm số
                      </span>
                      <span
                        className={`font-extrabold ${item.scorePercentage >= 80 ? "text-primary" : "text-amber-600"}`}
                      >
                        {item.scorePercentage}%
                      </span>
                    </div>

                    <div className="flex flex-col min-w-[100px]">
                      <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                        Thời gian
                      </span>
                      <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime(item.timeTakenSeconds)}
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                        Kết quả
                      </span>
                      {item.isPassed ? (
                        <Tag
                          color="success"
                          className="rounded-lg font-bold border-0 bg-primary/10 text-primary"
                        >
                          ĐẠT
                        </Tag>
                      ) : (
                        <Tag
                          color="error"
                          className="rounded-lg font-bold border-0 bg-red-100 text-red-600"
                        >
                          KHÔNG ĐẠT
                        </Tag>
                      )}
                    </div>
                  </div>

                  <Button
                    type="primary"
                    ghost
                    size="middle"
                    icon={<ExternalLink className="w-4 h-4" />}
                    onClick={() =>
                      navigate(
                        `/student/campaign/${campaignId}/round/${selectedRoundId}/quiz/${selectedQuiz.quizId}/history/${item.attemptId}`,
                      )
                    }
                    className="rounded-xl font-semibold border-primary/20 text-primary hover:bg-primary/5 ml-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Xem chi tiết
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="space-y-1">
                    <p className="text-gray-500 font-medium">Chưa làm</p>
                    <p className="text-xs text-gray-400">
                      Bạn chưa thực hiện lần làm bài nào cho quiz này.
                    </p>
                  </div>
                }
              />
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
