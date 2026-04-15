import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Card, Button, Spin, Tag, Typography, Progress } from "antd";
import {
  ArrowLeft,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Coins,
  TrendingUp,
  Target,
  ChevronRight,
} from "lucide-react";
import { getAttemptHistory } from "../../services";

const { Title, Text } = Typography;

const fmtTime = (sec) => {
  if (!sec && sec !== 0) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

function StudentQuizHistory() {
  const navigate = useNavigate();
  const { campaignId, roundId, quizId, attemptId } = useParams();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAttemptHistory(attemptId);
      setHistory(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (attemptId) {
      fetchData();
    }
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8">
        <Spin size="large" tip="Đang tải kết quả chi tiết..." />
      </div>
    );
  }

  if (!history) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
        <Title level={4} className="text-gray-400">
          Không tìm thấy dữ liệu bài làm
        </Title>
        <Button
          onClick={() => navigate(-1)}
          icon={<ArrowLeft size={16} />}
          className="mt-4 rounded-xl"
        >
          Quay lại
        </Button>
      </div>
    );
  }

  const passed = history.isPassed;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 min-h-screen">
      {/* Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button
            onClick={() => navigate(`/student/campaign/${campaignId}/quiz`)}
            className="hover:text-gray-800 transition-colors"
          >
            Quizzes
          </button>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-medium">Chi tiết kết quả</span>
        </div>
        <Button
          onClick={() => navigate(-1)}
          icon={<ArrowLeft size={16} />}
          type="text"
          className="w-fit text-gray-500 hover:text-gray-800 rounded-xl"
        >
          Quay lại lịch sử
        </Button>
      </div>

      {/* Result Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          className="border-none shadow-2xl rounded-[32px] overflow-hidden"
          bodyStyle={{ padding: 0 }}
        >
          <div
            className={`relative p-8 text-center ${
              passed
                ? "bg-primary"
                : "bg-gradient-to-br from-slate-700 via-gray-800 to-slate-900"
            }`}
          >
            {/* Background decorative elements */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

            <div className="relative space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto border border-white/30"
              >
                {passed ? (
                  <Trophy size={40} className="text-white drop-shadow-lg" />
                ) : (
                  <XCircle size={40} className="text-white/80" />
                )}
              </motion.div>

              <div>
                <Title level={2} className="!text-white !mb-1 !font-black">
                  {passed ? "CHÚC MỪNG BẠN!" : "HÀNH TRÌNH CHƯA DỪNG LẠI"}
                </Title>
                <p className="text-white/80 font-medium italic">
                  Lần thử số #{history.attemptNumber}
                </p>
              </div>

              {/* Progress Ring */}
              <div className="py-4 inline-flex">
                <div
                  className={`relative w-40 h-40 rounded-full flex items-center justify-center border-[8px] ${
                    passed
                      ? "border-primary/30 bg-white/10 shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)]"
                      : "border-slate-500/30 bg-white/5"
                  }`}
                >
                  <div className="text-center">
                    <p className="text-5xl font-black text-white leading-none">
                      {history.scorePercentage}
                      <span className="text-2xl font-bold opacity-60">%</span>
                    </p>
                    <p className="text-xs text-white/60 font-bold uppercase tracking-widest mt-1">
                      Điểm số
                    </p>
                  </div>
                </div>
              </div>

              {/* Coins Alert */}
              {history.coinsEarned > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-400 border-2 border-amber-300 text-amber-900 font-extrabold mx-auto w-fit shadow-xl"
                >
                  <Coins size={20} />
                  BẠN ĐÃ NHẬN ĐƯỢC +{history.coinsEarned} XU
                </motion.div>
              )}
            </div>
          </div>

          {/* Detailed Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100 bg-white">
            {[
              {
                icon: <CheckCircle2 size={18} className="text-primary" />,
                label: "Trả lời đúng",
                value: `${history.correctAnswers} / ${history.totalQuestions}`,
              },
              {
                icon: <Clock size={18} className="text-primary" />,
                label: "Thời gian",
                value: fmtTime(history.timeTakenSeconds),
              },
              {
                icon: <Target size={18} className="text-purple-500" />,
                label: "Lượt đã dùng",
                value: `${history.attemptsUsed} / ${history.maxAttempts}`,
              },
              {
                icon: <TrendingUp size={18} className="text-primary" />,
                label: "Điểm cao nhất",
                value: `${history.bestScorePercentage}%`,
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="p-6 flex flex-col items-center justify-center text-center gap-1"
              >
                <div className="p-2 rounded-lg bg-gray-50 mb-1">{stat.icon}</div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">
                  {stat.label}
                </p>
                <p className="text-lg font-black text-gray-800 leading-none">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Questions Breakdown */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Title level={4} className="!mb-0 !font-bold flex items-center gap-2">
            <RotateCcw className="text-primary w-5 h-5" />
            Chi tiết các câu hỏi
          </Title>
          <Tag className="rounded-full px-3 py-1 font-bold bg-gray-100 border-0 text-gray-500">
            {history.totalQuestions} Câu hỏi
          </Tag>
        </div>

        <div className="space-y-4">
          {history.answerResults.map((item, idx) => (
            <motion.div
              key={item.questionId}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx }}
            >
              <Card
                className={`rounded-2xl border-2 transition-all duration-300 ${
                  item.isCorrect
                    ? "border-emerald-100 bg-white"
                    : "border-rose-100 bg-rose-50/20"
                }`}
                bodyStyle={{ padding: "24px" }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${
                      item.isCorrect
                        ? "bg-primary/10 text-primary"
                        : "bg-rose-100 text-rose-600 shadow-sm shadow-rose-100"
                    }`}
                  >
                    {idx + 1}
                  </div>

                  <div className="flex-1 space-y-4">
                    <h3 className="text-base font-bold text-gray-800 leading-relaxed">
                      {item.questionText}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Selected Answer */}
                      <div
                        className={`p-4 rounded-xl border-2 flex flex-col gap-1 ${
                          item.isCorrect
                            ? "bg-emerald-50/50 border-emerald-200"
                            : "bg-rose-50 border-rose-200"
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          Bạn đã chọn
                        </span>
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-bold ${
                              item.isCorrect
                                ? "text-primary"
                                : "text-rose-700"
                            }`}
                          >
                            {item.selectedAnswerText}
                          </span>
                          {item.isCorrect ? (
                            <CheckCircle2 size={18} className="text-primary" />
                          ) : (
                            <XCircle size={18} className="text-rose-500" />
                          )}
                        </div>
                      </div>

                      {/* Correct Answer (if wrong) */}
                      {!item.isCorrect && (
                          <div className="p-4 rounded-xl border-2 border-primary/20 bg-primary/5 flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                              Đáp án đúng
                            </span>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-primary">
                                {item.correctAnswerText}
                              </span>
                              <CheckCircle2 size={18} className="text-primary" />
                            </div>
                          </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="flex justify-center pt-8">
        <Button
          size="large"
          type="primary"
          onClick={() =>
            navigate(
              `/student/campaign/${campaignId}/round/${roundId}/quiz/${quizId}`,
            )
          }
          icon={<RotateCcw size={18} />}
          disabled={history.attemptsUsed >= history.maxAttempts}
          className="h-14 px-12 rounded-2xl font-black bg-primary border-none shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
        >
          {history.attemptsUsed >= history.maxAttempts
            ? "ĐÃ HẾT LƯỢT THỬ"
            : "LÀM LẠI QUIZ"}
        </Button>
      </div>
    </div>
  );
}

export default StudentQuizHistory;
