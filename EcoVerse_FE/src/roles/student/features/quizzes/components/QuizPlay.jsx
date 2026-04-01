import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Button,
  Radio,
  Typography,
  Badge,
  Tag,
  Divider,
  Progress,
  Tooltip,
  Card,
} from "antd";
import {
  ChevronLeft,
  Trophy,
  Coins,
  Timer,
  X,
  Menu,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Flag,
  Info,
  ArrowRight,
} from "lucide-react";

const { Title, Text } = Typography;

export default function QuizPlay({ quiz, onFinish, onCancel }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const questions = useMemo(() => quiz.questions || [], [quiz.questions]);
  const currentQuestion = questions[currentQuestionIndex];

  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  useEffect(() => {
    if (timeLeft <= 0 || showResult) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, showResult]);

  const handleClearAnswer = () => {
    const newAnswers = { ...answers };
    delete newAnswers[currentQuestion.id];
    setAnswers(newAnswers);
  };

  const handleFinish = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const totalQuestions = questions.length;
      // Giả sử logic check đúng/sai ở đây, hiện tại đang tính dựa trên số câu đã làm
      const correctCount = Object.keys(answers).length;
      const scorePerc = Math.round((correctCount / totalQuestions) * 100);
      const isPassed = scorePerc >= quiz.passScorePercentage;

      setQuizResult({
        score: scorePerc,
        coins: isPassed ? quiz.coinOnPass : 0,
        isPassed: isPassed,
        correctAnswers: correctCount,
        totalQuestions,
      });
      setShowResult(true);
      setIsSubmitting(false);
    }, 1200);
  };

  // --- RENDER RESULT VIEW ---
  if (showResult && quizResult) {
    return (
      <div className="fixed inset-0 z-[10001] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-lg w-full"
        >
          <Card className="rounded-2xl border-none shadow-2xl overflow-hidden p-0">
            <div
              className={`p-8 text-center ${quizResult.isPassed ? "bg-emerald-600" : "bg-slate-800"} text-white`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, delay: 0.2 }}
                className="inline-flex p-4 rounded-full bg-white/20 mb-4"
              >
                {quizResult.isPassed ? (
                  <Trophy size={40} />
                ) : (
                  <AlertCircle size={40} />
                )}
              </motion.div>
              <Title level={3} className="!text-white !m-0 !font-bold">
                {quizResult.isPassed ? "Chúc mừng bạn!" : "Chưa đạt yêu cầu"}
              </Title>
              <Text className="text-white/80 text-sm mt-2 block">
                {quizResult.isPassed
                  ? "Bạn đã hoàn thành xuất sắc bài kiểm tra này."
                  : "Bạn cần đạt kết quả cao hơn để vượt qua khóa học."}
              </Text>
            </div>

            <div className="p-8 bg-white">
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Điểm số
                  </Text>
                  <Title
                    level={2}
                    className={`!m-0 ${quizResult.isPassed ? "text-emerald-600" : "text-slate-800"}`}
                  >
                    {quizResult.score}%
                  </Title>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Phần thưởng
                  </Text>
                  <div className="flex items-center justify-center gap-2">
                    <Coins size={20} className="text-amber-500" />
                    <Title level={2} className="!m-0 text-amber-600">
                      +{quizResult.coins}
                    </Title>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-sm">
                  <Text className="text-slate-500 font-medium">
                    Số câu trả lời đúng
                  </Text>
                  <Text className="font-bold text-slate-700">
                    {quizResult.correctAnswers} / {quizResult.totalQuestions}
                  </Text>
                </div>
                <Progress
                  percent={quizResult.score}
                  showInfo={false}
                  strokeColor={quizResult.isPassed ? "#10b981" : "#1e293b"}
                  strokeWidth={10}
                  className="m-0"
                />
                <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-lg">
                  <Text className="text-[12px] text-indigo-700 font-medium">
                    Yêu cầu đạt được:
                  </Text>
                  <Tag color="blue" className="mr-0 border-none font-bold">
                    {quiz.passScorePercentage}%
                  </Tag>
                </div>
              </div>

              <Button
                type="primary"
                size="large"
                block
                onClick={() => onFinish(quizResult)}
                className={`h-12 rounded-lg font-bold shadow-lg border-none ${quizResult.isPassed ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-900"}`}
              >
                {quizResult.isPassed ? "Tiếp tục bài học" : "Quay lại khóa học"}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // --- RENDER MAIN QUIZ PLAY ---
  return (
    <div className="fixed inset-0 z-[9999] bg-[#f8f9fa] flex flex-col overflow-hidden font-sans text-slate-900">
      <header className="h-14 border-b border-slate-200 px-4 flex items-center justify-between bg-white z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            type="text"
            size="small"
            icon={<Menu size={18} className="text-slate-600" />}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <Divider type="vertical" className="h-6" />
          <Text className="font-semibold text-slate-700 truncate max-w-[300px]">
            {quiz.title}
          </Text>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Timer
              size={16}
              className={timeLeft < 60 ? "text-red-500" : "text-slate-400"}
            />
            <span
              className={`font-mono font-bold text-base ${timeLeft < 60 ? "text-red-600 animate-pulse" : "text-slate-700"}`}
            >
              {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")}
            </span>
          </div>
          <Tooltip title="Thoát bài làm">
            <Button
              type="text"
              shape="circle"
              icon={<X size={18} />}
              onClick={onCancel}
              className="hover:bg-slate-100"
            />
          </Tooltip>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r border-slate-200 flex flex-col bg-white"
            >
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Tiến độ
                    </Text>
                    <Text className="text-xs font-bold text-indigo-600">
                      {progressPercent}%
                    </Text>
                  </div>
                  <Progress
                    percent={progressPercent}
                    showInfo={false}
                    strokeColor="#4f46e5"
                    size="small"
                  />
                </div>

                <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-4">
                  Câu hỏi bài tập
                </Text>
                <div className="grid grid-cols-5 gap-2 overflow-y-auto max-h-[60vh] pr-2">
                  {questions.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-10 rounded-md text-xs font-semibold transition-all flex items-center justify-center border
                        ${
                          currentQuestionIndex === idx
                            ? "bg-indigo-50 border-indigo-600 text-indigo-600 ring-1 ring-indigo-600"
                            : answers[q.id]
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"
                        }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto p-6 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-start gap-3">
                  <Info size={16} className="text-slate-400 mt-0.5" />
                  <Text className="text-[11px] text-slate-500 italic">
                    Bạn cần đạt ít nhất {quiz.passScorePercentage}% để vượt qua
                    bài kiểm tra này.
                  </Text>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Quiz Area */}
        <main className="flex-1 overflow-y-auto bg-white relative">
          <div className="max-w-[720px] mx-auto px-8 py-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                      CÂU HỎI {currentQuestionIndex + 1}
                    </span>
                    {answers[currentQuestion.id] && (
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="text"
                      size="small"
                      icon={<Flag size={14} />}
                      className="text-slate-400 text-[11px]"
                    >
                      Báo lỗi
                    </Button>
                    {answers[currentQuestion.id] && (
                      <Button
                        type="text"
                        size="small"
                        icon={<RotateCcw size={14} />}
                        onClick={handleClearAnswer}
                        className="text-slate-400 text-[11px]"
                      >
                        Xóa chọn
                      </Button>
                    )}
                  </div>
                </div>

                <Title
                  level={4}
                  className="!text-slate-800 !mb-10 !leading-relaxed !font-medium"
                >
                  {currentQuestion.content}
                </Title>

                <Radio.Group
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [currentQuestion.id]: e.target.value,
                    })
                  }
                  value={answers[currentQuestion.id]}
                  className="w-full flex flex-col gap-3"
                >
                  {currentQuestion.options.map((option, idx) => (
                    <Radio.Button
                      key={option.id}
                      value={option.id}
                      className={`!h-auto !py-4 !px-5 !rounded-xl !border !flex !items-center !transition-all
                        ${
                          answers[currentQuestion.id] === option.id
                            ? "!border-indigo-600 !bg-indigo-50/30 shadow-sm"
                            : "!border-slate-200 hover:!border-indigo-300 hover:!bg-slate-50/50 !bg-white"
                        }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full border flex items-center justify-center mr-4 text-xs font-bold transition-colors
                        ${answers[currentQuestion.id] === option.id ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-300 text-slate-500"}`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span
                        className={`text-sm md:text-[15px] ${answers[currentQuestion.id] === option.id ? "text-indigo-900 font-medium" : "text-slate-600"}`}
                      >
                        {option.text}
                      </span>
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between pt-10 border-t border-slate-100 mt-16">
              <Button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                icon={<ChevronLeft size={18} />}
                type="text"
                className="text-slate-600 font-semibold"
              >
                Câu trước
              </Button>

              <div className="flex gap-3">
                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    type="primary"
                    size="large"
                    loading={isSubmitting}
                    onClick={handleFinish}
                    className="bg-indigo-600 border-none rounded-md px-8 font-bold h-11"
                  >
                    Gửi bài làm
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="bg-indigo-600 border-none rounded-md px-8 font-bold h-11"
                  >
                    Tiếp tục
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
