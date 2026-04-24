import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Button,
  Radio,
  Typography,
  Divider,
  Progress,
  Card,
  Modal,
} from "antd";
import {
  ChevronLeft,
  Trophy,
  Timer,
  X,
  Menu,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Star,
  TrendingUp,
  Hash,
} from "lucide-react";

import { submitQuiz, getAttemptResult } from "../../../services";
import toast from "react-hot-toast";
import { useStudentContext } from "../../../context";

const { Title, Text } = Typography;

function ResultModal({ result, onClose }) {
  if (!result) return null;

  const passed = result.isPassed;

  const fmtTime = (sec) => {
    if (!sec && sec !== 0) return "—";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const stats = [
    {
      icon: (
        <CheckCircle2
          size={18}
          className={passed ? "text-primary" : "text-red-400"}
        />
      ),
      label: "Câu đúng",
      value: `${result.correctAnswers ?? "—"} / ${result.totalQuestions ?? "—"}`,
      highlight: passed,
    },
    {
      icon: <TrendingUp size={18} className="text-primary" />,
      label: "Điểm lần này",
      value:
        result.scorePercentage != null ? `${result.scorePercentage}%` : "—",
    },
    {
      icon: <Star size={18} className="text-amber-500" />,
      label: "Điểm cao nhất",
      value:
        result.bestScorePercentage != null
          ? `${result.bestScorePercentage}%`
          : "—",
    },
    {
      icon: <Clock size={18} className="text-purple-500" />,
      label: "Thời gian làm",
      value: fmtTime(result.timeTakenSeconds),
    },
    {
      icon: <Hash size={18} className="text-gray-500" />,
      label: "Lần thử",
      value: result.maxAttempts
        ? `${result.attemptUsed ?? result.attemptsUsed ?? "—"} / ${result.maxAttempts}`
        : `${result.attemptUsed ?? result.attemptsUsed ?? "—"}`,
    },
  ];

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      centered
      width={480}
      closable={false}
      zIndex={10005}
      className="[&_.ant-modal-content]:rounded-2xl [&_.ant-modal-content]:overflow-hidden [&_.ant-modal-content]:p-0"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
      >
        {/* Banner */}
        <div
          className={`px-8 pt-8 pb-6 text-center ${passed ? "bg-primary" : "bg-gradient-to-br from-slate-700 to-slate-800"}`}
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 220 }}
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-white/20 backdrop-blur"
          >
            {passed ? (
              <Trophy size={32} className="text-white" />
            ) : (
              <XCircle size={32} className="text-white/80" />
            )}
          </motion.div>

          <h2 className="text-2xl font-extrabold text-white mb-1">
            {passed ? "Hoàn thành xuất sắc!" : "Chưa đạt yêu cầu"}
          </h2>
          <p className="text-white/70 text-sm">
            {passed
              ? "Bạn đã vượt qua bài kiểm tra này"
              : "Hãy thử lại để đạt kết quả tốt hơn"}
          </p>

          {/* Score ring */}
          <div className="mt-5 inline-flex items-center justify-center">
            <div
              className={`relative w-24 h-24 rounded-full flex items-center justify-center border-4 ${passed ? "border-white/40 bg-white/15" : "border-white/20 bg-white/10"}`}
            >
              <div className="text-center">
                <p className="text-3xl font-black text-white leading-none">
                  {result.scorePercentage ?? "—"}%
                </p>
                <p className="text-[11px] text-white/60 mt-0.5">Điểm số</p>
              </div>
            </div>
          </div>

          {/* Xu nhận được */}
          {result.coinsEarned != null && result.coinsEarned > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/25 border border-amber-300/40 text-amber-200 font-bold text-sm"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <circle cx="12" cy="12" r="10" opacity="0.25" />
                <circle cx="12" cy="12" r="8" />
                <text
                  x="12"
                  y="16"
                  fontSize="10"
                  fontWeight="bold"
                  fill="white"
                  textAnchor="middle"
                >
                  ₫
                </text>
              </svg>
              +{result.coinsEarned} xu
            </motion.div>
          )}
          {result.coinsEarned === 0 && (
            <p className="mt-3 text-sm text-white/50">
              {passed
                ? "Không nhận thêm xu cho lần làm lại"
                : "Không nhận xu (chưa đạt)"}
            </p>
          )}
        </div>

        {/* Stats grid */}
        <div className="p-6 bg-white space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                  s.highlight
                    ? "bg-primary/5 border border-primary/10"
                    : "bg-gray-50 border border-gray-100"
                }`}
              >
                <div className="flex-shrink-0">{s.icon}</div>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400 leading-none mb-0.5">
                    {s.label}
                  </p>
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {s.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="pt-2">
            <Button
              block
              size="large"
              type="primary"
              onClick={onClose}
              className={`rounded-xl h-12 font-bold text-base ${passed ? "bg-primary border-primary hover:opacity-90" : "bg-slate-800 border-slate-800 hover:bg-slate-900"}`}
            >
              {passed ? "Tiếp tục" : "Đóng"}
            </Button>
          </div>
        </div>
      </motion.div>
    </Modal>
  );
}

export default function QuizPlay({ quiz: _quiz, onFinish, onCancel }) {
  const quiz = useMemo(() => {
    if (!_quiz) return _quiz;
    const questions = (_quiz?.questions ?? []).map((q) => ({
      id: q.questionId ?? q.id,
      content: q.questionText ?? q.content,
      imageUrl: q.questionImagePresignedUrl ?? q.questionImageUrl ?? null,
      options: (q.answers ?? q.options ?? []).map((a) => ({
        id: a.answerId ?? a.id,
        text: a.answerText ?? a.text,
      })),
      _raw: q,
    }));

    const totalSeconds =
      (_quiz?.timePerQuestion ?? 0) *
      (_quiz?.questionCount ?? questions.length);
    const timeLimitMin =
      totalSeconds > 0
        ? Math.max(1, Math.ceil(totalSeconds / 60))
        : (_quiz?.timeLimit ?? 10);

    return {
      ..._quiz,
      questions,
      timeLimit: timeLimitMin,
      passScorePercentage: _quiz?.passScorePercentage ?? 80,
      coinOnPass: _quiz?.coinOnPass ?? 0,
      title: _quiz?.title ?? "Quiz",
    };
  }, [_quiz]);

  const [attemptId, setAttemptId] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(() => (quiz?.timeLimit ?? 10) * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { refreshStudentData } = useStudentContext();

  const questions = useMemo(() => quiz?.questions || [], [quiz?.questions]);
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers.find(
    (a) => a.questionId === currentQuestion?.id,
  );
  const answeredCount = answers.length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  useEffect(() => {
    if (timeLeft <= 0 || showResult) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, showResult]);

  useEffect(() => {
    if (_quiz?.attemptId) {
      setAttemptId(_quiz.attemptId);
      // Reset state for new attempt (Play Again)
      setAnswers([]);
      setCurrentQuestionIndex(0);
      setShowResult(false);
      setQuizResult(null);
      setTimeLeft((quiz?.timeLimit ?? 10) * 60);
    }
  }, [_quiz?.attemptId, quiz?.timeLimit]);

  const handleSelectAnswer = (selectedAnswerId) => {
    setAnswers((prev) => {
      const existingIndex = prev.findIndex(
        (a) => a.questionId === currentQuestion?.id,
      );
      if (existingIndex > -1) {
        const newAnswers = [...prev];
        newAnswers[existingIndex] = {
          ...newAnswers[existingIndex],
          selectedAnswerId,
        };
        return newAnswers;
      }
      return [...prev, { questionId: currentQuestion?.id, selectedAnswerId }];
    });
  };

  const handleClearAnswer = () => {
    setAnswers((prev) =>
      prev.filter((a) => a.questionId !== currentQuestion?.id),
    );
  };

  const handleFinish = async () => {
    setIsSubmitting(true);

    const finalPayload = { answers };

    try {
      const res = await submitQuiz(attemptId, finalPayload);
      const resultRes = await getAttemptResult(attemptId);

      if (res) {
        toast.success("Nộp bài làm thành công!");
      } else {
        toast.error("Nộp bài làm thất bại!");
      }

      if (resultRes && resultRes.data) {
        setQuizResult(resultRes.data);
      } else {
        setQuizResult(resultRes);
      }

      if (refreshStudentData) {
        refreshStudentData();
      }

      // Ensure we show result even if resultRes is partially empty
      setShowResult(true);
    } catch (error) {
      console.error("Quiz submission error:", error);
      toast.error("Đã xảy ra lỗi khi nộp bài hoặc lấy kết quả.");
      // Fallback: set empty result object to ensure beShapedResult is at least truthy
      setQuizResult({});
      setShowResult(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Timer color ──
  const timerRatio = timeLeft / ((quiz?.timeLimit ?? 10) * 60);
  const timerColor =
    timerRatio > 0.5
      ? "text-slate-700"
      : timerRatio > 0.25
        ? "text-amber-500"
        : "text-red-500 animate-pulse";

  const beShapedResult = quizResult
    ? {
        attemptId: quizResult.attemptId ?? null,
        attemptNumber: quizResult.attemptNumber ?? null,
        correctAnswers: quizResult.correctAnswers ?? 0,
        totalQuestions: quizResult.totalQuestions ?? questions.length,
        scorePercentage: quizResult.scorePercentage ?? quizResult.score ?? 0,
        timeTakenSeconds: quizResult.timeTakenSeconds ?? null,
        isPassed: quizResult.isPassed ?? false,
        coinsEarned: quizResult.coinsEarned ?? quizResult.coins ?? 0,
        bestScorePercentage: quizResult.bestScorePercentage ?? null,
        attemptsUsed: quizResult.attemptUsed ?? quizResult.attemptsUsed ?? null,
        maxAttempts: quizResult.maxAttempts ?? null,
      }
    : null;

  return (
    <>
      {showResult && beShapedResult && (
        <ResultModal
          result={beShapedResult}
          onClose={() => {
            if (onFinish) onFinish();
          }}
        />
      )}

      <div className="fixed inset-0 z-[10001] bg-[#f8f9fa] flex flex-col overflow-hidden font-sans text-slate-900">
        <header className="h-14 border-b border-slate-200 px-4 flex items-center justify-between bg-white z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              type="text"
              size="small"
              icon={<Menu size={18} className="text-slate-600" />}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <Divider type="vertical" className="h-6" />
            <Text className="font-semibold text-slate-700 truncate max-w-[300px] text-sm">
              {quiz?.title}
            </Text>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-1.5 font-mono font-bold text-sm ${timerColor}`}
            >
              <Timer size={15} />
              {Math.floor(timeLeft / 60)}:
              {String(timeLeft % 60).padStart(2, "0")}
            </div>
            <button
              onClick={onCancel}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 260, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="border-r border-slate-200 bg-white p-5 overflow-hidden flex-shrink-0"
              >
                <Text className="text-[11px] font-bold text-slate-400 uppercase block mb-3">
                  Tiến độ — {answeredCount}/{questions.length}
                </Text>
                <Progress
                  percent={progressPercent}
                  strokeColor="var(--primary)"
                  size="small"
                  className="mb-5"
                />

                <div className="grid grid-cols-5 gap-1.5">
                  {questions.map((q, idx) => {
                    const isAnswered = answers.some(
                      (a) => a.questionId === q.id,
                    );
                    const isCurrent = currentQuestionIndex === idx;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`h-9 rounded-lg text-xs font-semibold border transition-all
                          ${
                            isCurrent
                              ? "border-primary text-primary bg-primary/10 ring-1 ring-primary/40"
                              : isAnswered
                                ? "bg-slate-800 text-white border-slate-800"
                                : "bg-white text-slate-400 border-slate-200 hover:border-slate-400"
                          }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-slate-800" />
                    <span>Đã trả lời</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 border-primary/40 bg-primary/10" />
                    <span>Câu hiện tại</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border border-slate-200 bg-white" />
                    <span>Chưa trả lời</span>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main */}
          <main className="flex-1 overflow-y-auto p-8 md:p-12">
            <div className="max-w-[700px] mx-auto">
              {/* Question header */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-bold text-primary uppercase tracking-widest">
                  Câu hỏi {currentQuestionIndex + 1} / {questions.length}
                </span>
                {currentAnswer && (
                  <button
                    onClick={handleClearAnswer}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <RotateCcw size={13} />
                    Xóa chọn
                  </button>
                )}
              </div>

              {/* Question text */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.22 }}
                >
                  <h2 className="text-xl font-bold text-slate-800 leading-relaxed mb-8">
                    {currentQuestion?.content}
                  </h2>

                  {/* Options */}
                  <Radio.Group
                    onChange={(e) => handleSelectAnswer(e.target.value)}
                    value={currentAnswer?.selectedAnswerId}
                    className="w-full"
                  >
                    <div className="flex flex-col gap-3">
                      {currentQuestion?.options.map((option, idx) => {
                        const selected =
                          currentAnswer?.selectedAnswerId === option.id;
                        return (
                          <Radio.Button
                            key={option.id}
                            value={option.id}
                            className={`
            !h-auto !py-4 !px-5 !rounded-xl !border-2 !flex !items-center !w-full !transition-all !relative
            ${
              selected
                ? "!border-primary !bg-primary/5 !shadow-sm"
                : "!border-slate-100 hover:!border-slate-300 !bg-white"
            }
            before:!hidden
          `}
                          >
                            <div
                              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 text-xs font-bold flex-shrink-0 transition-colors
            ${selected ? "bg-primary border-primary text-white" : "bg-slate-50 border-slate-200 text-slate-500"}`}
                            >
                              {String.fromCharCode(65 + idx)}
                            </div>

                            {/* Nội dung câu trả lời */}
                            <span
                              className={`text-[15px] leading-relaxed flex-grow pr-4 transition-colors ${
                                selected
                                  ? "text-primary font-semibold"
                                  : "text-slate-600 font-medium"
                              }`}
                            >
                              {option.text}
                            </span>

                            {/* Icon Check nằm ở cuối bên phải */}
                            <div className="flex-shrink-0 w-6 flex justify-end">
                              {selected ? (
                                <CheckCircle2
                                  size={20}
                                  className="text-primary animate-in zoom-in duration-200"
                                />
                              ) : (
                                // Giữ khoảng trống hoặc một vòng tròn mờ để UI không bị "giật" khi chọn
                                <div className="w-5 h-5 rounded-full border border-slate-200" />
                              )}
                            </div>
                          </Radio.Button>
                        );
                      })}
                    </div>
                  </Radio.Group>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-100">
                <Button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((p) => p - 1)}
                  icon={<ChevronLeft size={16} />}
                  type="text"
                  className="text-slate-500"
                >
                  Câu trước
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    {answeredCount}/{questions.length} đã trả lời
                  </span>
                  <Button
                    type="primary"
                    size="large"
                    loading={isSubmitting}
                    disabled={
                      currentQuestionIndex === questions.length - 1 &&
                      answeredCount < questions.length
                    }
                    onClick={
                      currentQuestionIndex === questions.length - 1
                        ? handleFinish
                        : () => setCurrentQuestionIndex((p) => p + 1)
                    }
                    className="bg-primary border-primary hover:opacity-90 rounded-xl px-8 font-bold disabled:bg-slate-200 disabled:border-slate-200 disabled:text-slate-400"
                  >
                    {currentQuestionIndex === questions.length - 1
                      ? "Gửi bài"
                      : "Tiếp theo"}
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
