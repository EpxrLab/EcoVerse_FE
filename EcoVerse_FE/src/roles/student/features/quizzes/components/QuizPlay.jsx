import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Button, Progress, Radio, Space, Typography, Badge, Tooltip } from "antd";
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Trophy, 
  Coins, 
  CheckCircle2, 
  Timer,
  LayoutDashboard,
  X,
  Menu,
  Check
} from "lucide-react";

const { Title, Text, Paragraph } = Typography;

export default function QuizPlay({ quiz, onFinish, onCancel }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOptionId }
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const questions = useMemo(() => quiz.questions || [], [quiz.questions]);
  const currentQuestion = questions[currentQuestionIndex];

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0 || showResult) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, showResult]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOptionSelect = (e) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: e.target.value,
    });
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    // Mock result
    setTimeout(() => {
      const score = 85;
      const coins = 40;
      setQuizResult({
        score,
        coins,
        correctAnswers: 3,
        totalQuestions: questions.length
      });
      setShowResult(true);
      setIsSubmitting(false);
    }, 1000);
  };

  if (showResult) {
    return (
      <div className="fixed inset-0 z-[10000] bg-slate-950 flex items-center justify-center p-6 overflow-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden text-center">
             <div className="p-12 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
                <Trophy size={64} className="mx-auto mb-4 text-amber-300 drop-shadow-lg" />
                <Title level={2} className="!text-white !mb-0 text-3xl font-black">Thử thách hoàn tất!</Title>
             </div>
             <div className="p-12">
                <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                        <Text className="text-slate-400 block mb-1 font-bold uppercase tracking-wider text-xs">Điểm số</Text>
                        <Title level={2} className="!m-0 !text-slate-800">{quizResult.score}%</Title>
                    </div>
                    <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100">
                        <Text className="text-amber-600 block mb-1 font-bold uppercase tracking-wider text-xs">Thưởng</Text>
                        <div className="flex items-center justify-center gap-2">
                            <Coins size={20} className="text-amber-500" />
                            <Title level={2} className="!m-0 !text-amber-700">+{quizResult.coins}</Title>
                        </div>
                    </div>
                </div>
                <Button 
                    type="primary" 
                    size="large" 
                    block
                    className="h-14 rounded-2xl bg-indigo-600 font-black text-lg shadow-lg"
                    onClick={() => onFinish(quizResult)}
                >
                    Tiếp tục hành trình
                </Button>
             </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-[#F8FAFC] flex flex-col overflow-hidden font-sans">
      {/* Top Header */}
      <header className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button 
            type="text" 
            icon={<Menu size={20} />} 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-100"
          />
          <div className="h-8 w-[1px] bg-slate-200 hidden sm:block" />
          <Title level={4} className="!m-0 !text-slate-800 hidden sm:block truncate max-w-[300px]">
            {quiz.title}
          </Title>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-200">
            <Timer size={18} className={timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-indigo-600'} />
            <span className={`text-xl font-black font-mono tracking-tight ${timeLeft < 60 ? 'text-red-600' : 'text-slate-700'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <Button 
            shape="circle" 
            icon={<X size={20} />} 
            onClick={onCancel}
            className="border-none bg-slate-100 hover:bg-slate-200 text-slate-500"
          />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Navigation */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 z-10"
            >
              <div className="p-6 border-b border-slate-100">
                <Text className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4">
                  Danh sách câu hỏi
                </Text>
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                  <span>Hoàn thành:</span>
                  <span>{Object.keys(answers).length} / {questions.length}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-4 gap-3">
                  {questions.map((q, idx) => {
                    const isCurrent = currentQuestionIndex === idx;
                    const isAnswered = !!answers[q.id];
                    return (
                      <Tooltip key={q.id} title={`Câu ${idx + 1}`} placement="right">
                        <button
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`relative w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all duration-200
                            ${isCurrent 
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110 z-10' 
                              : isAnswered 
                                ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-100' 
                                : 'bg-slate-50 text-slate-400 border border-slate-200 hover:border-indigo-300 hover:bg-white'
                            }`}
                        >
                          {idx + 1}
                          {isAnswered && (
                            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                              <Check size={8} className="text-white" strokeWidth={4} />
                            </div>
                          )}
                        </button>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Question Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 sm:p-12 md:p-16 flex flex-col">
          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                <div className="mb-8">
                  <Badge 
                    count={`Câu hỏi ${currentQuestionIndex + 1}`} 
                    style={{ backgroundColor: '#6366f1', height: '28px', lineHeight: '28px', padding: '0 16px', borderRadius: '14px', fontWeight: 'bold' }} 
                  />
                  <Title level={2} className="!text-3xl !font-black !text-slate-800 !leading-tight !mt-6 tracking-tight">
                    {currentQuestion.content}
                  </Title>
                </div>

                <div className="space-y-4">
                  <Radio.Group 
                    onChange={handleOptionSelect} 
                    value={answers[currentQuestion.id]} 
                    className="w-full"
                  >
                    <div className="grid grid-cols-1 gap-4">
                      {currentQuestion.options.map((option, idx) => {
                        const isSelected = answers[currentQuestion.id] === option.id;
                        const label = String.fromCharCode(65 + idx);
                        return (
                          <motion.div key={option.id} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                            <Radio.Button
                              value={option.id}
                              className={`w-full !h-auto !p-6 !rounded-2xl !border-2 !transition-all !duration-300 !flex !items-center !gap-6 !relative !overflow-hidden
                                ${isSelected 
                                  ? '!border-indigo-600 !bg-indigo-600 shadow-[0_12px_24px_rgba(99,102,241,0.2)]' 
                                  : '!border-slate-200 !bg-white hover:!border-indigo-300 hover:!bg-slate-50'
                                }`}
                            >
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl font-black transition-colors
                                ${isSelected ? 'bg-white text-indigo-600' : 'bg-slate-100 text-slate-400'}`}
                              >
                                {label}
                              </div>
                              <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                                {option.text}
                              </span>
                              {isSelected && (
                                <div className="absolute right-8 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                  <CheckCircle2 size={24} className="text-white" />
                                </div>
                              )}
                            </Radio.Button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </Radio.Group>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Bar (Embedded in main area but stays at bottom) */}
          <div className="max-w-4xl mx-auto w-full shrink-0 flex items-center justify-between py-8 mt-auto border-t border-slate-200/60">
            <Button
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentIndex(currentQuestionIndex - 1)}
              icon={<ChevronLeft size={20} />}
              className="h-14 px-8 rounded-2xl font-black text-slate-400 hover:text-indigo-600 border-none bg-transparent flex items-center gap-2"
            >
              Quay lại
            </Button>

            <div className="flex gap-4">
              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  type="primary"
                  loading={isSubmitting}
                  onClick={handleFinish}
                  className="h-14 px-12 rounded-2xl font-black bg-emerald-500 hover:bg-emerald-600 border-none flex items-center gap-2 shadow-[0_10px_20px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02]"
                >
                  Nộp bài <Send size={18} />
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  className="h-14 px-12 rounded-2xl font-black bg-indigo-600 hover:bg-indigo-700 border-none flex items-center gap-2 shadow-[0_10px_20px_rgba(99,102,241,0.3)] transition-all hover:scale-[1.02]"
                >
                  Tiếp theo <ChevronRight size={20} />
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}</style>
    </div>
  );
}
