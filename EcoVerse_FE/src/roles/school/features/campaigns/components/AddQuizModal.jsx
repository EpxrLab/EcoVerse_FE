import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import { Brain, Sparkles, Bot, BookOpen, Plus, Check, Loader2, Wand2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

// ─── Data ─────────────────────────────────────────────────────────────────────

const difficultyConfig = {
  easy: { label: 'Dễ', color: 'bg-eco-green/15 text-eco-green', dot: 'bg-eco-green' },
  medium: { label: 'Trung bình', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  hard: { label: 'Khó', color: 'bg-destructive/15 text-destructive', dot: 'bg-destructive' },
};

const AI_TOPICS = ['Tái chế nhựa', 'Phân loại rác hữu cơ', 'Năng lượng tái tạo', 'Ô nhiễm không khí', 'Biến đổi khí hậu'];

const DEMO_AI_QUESTIONS = {
  easy: [
    'Chai nhựa thuộc loại rác thải nào?',
    'Vỏ chuối nên bỏ vào thùng rác nào?',
    'Màu sắc thùng rác hữu cơ thường là gì?',
  ],
  medium: [
    'Thời gian phân hủy của túi nilon là bao nhiêu năm?',
    'Pin điện tử được phân loại là rác thải gì?',
    'Quy trình tái chế giấy gồm mấy bước?',
  ],
  hard: [
    'LCA (Life Cycle Assessment) đo lường điều gì trong quản lý chất thải?',
    'Nguyên tắc 3R trong kinh tế tuần hoàn là gì?',
    'Phân biệt rác thải nguy hại và rác thải thông thường?',
  ],
};

function generateAIQuiz(topic, difficulty, count, existingCount) {
  const questions = DEMO_AI_QUESTIONS[difficulty] || DEMO_AI_QUESTIONS.medium;
  return {
    id: `ai_${Date.now()}`,
    title: `[AI] ${topic} — Bộ ${existingCount + 1}`,
    difficulty,
    questions: count,
    isAI: true,
    preview: questions.slice(0, 2).map((q, i) => `${i + 1}. ${q}`),
  };
}

// ─── AI Panel ─────────────────────────────────────────────────────────────────

function AIGeneratePanel({ onGenerated, existingCount = 0 }) {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [questionCount, setQuestionCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);

  const handleGenerate = () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setGeneratedQuiz(null);
    setTimeout(() => {
      const quiz = generateAIQuiz(topic, difficulty, questionCount, existingCount);
      setGeneratedQuiz(quiz);
      setIsGenerating(false);
    }, 1800);
  };

  const handleAdd = () => {
    if (generatedQuiz) {
      onGenerated(generatedQuiz);
      setGeneratedQuiz(null);
      setTopic('');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100">
        <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <p className="font-semibold text-purple-900 text-sm">Tạo Quiz bằng AI</p>
          <p className="text-xs text-purple-500">AI sẽ tự động tạo bộ câu hỏi phù hợp chủ đề môi trường bạn nhập</p>
        </div>
      </div>

      {/* Topic input */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Chủ đề / Nội dung</Label>
        <Input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="VD: Phân loại rác thải nhựa trong gia đình..."
          className="rounded-xl border-purple-100 focus-visible:ring-purple-400"
        />
        <div className="flex flex-wrap gap-1.5 mt-1">
          {AI_TOPICS.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTopic(t)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border transition-all",
                topic === t
                  ? "bg-purple-100 border-purple-400 text-purple-700 font-medium"
                  : "border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty + Count */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Độ khó</Label>
          <div className="flex flex-col gap-1.5">
            {Object.entries(difficultyConfig).map(([key, cfg]) => (
              <label key={key} className={cn(
                "flex items-center gap-2.5 p-2 rounded-xl border-2 cursor-pointer transition-all",
                difficulty === key ? "border-purple-400 bg-purple-50" : "border-gray-100 hover:border-gray-200"
              )}>
                <input type="radio" className="hidden" checked={difficulty === key} onChange={() => setDifficulty(key)} />
                <div className={cn("w-3 h-3 rounded-full flex-shrink-0", cfg.dot)} />
                <span className={cn("text-sm font-medium", difficulty === key ? "text-purple-800" : "text-gray-600")}>{cfg.label}</span>
                {difficulty === key && <Check className="w-3.5 h-3.5 text-purple-500 ml-auto" />}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Số câu hỏi</Label>
          <div className="flex flex-col gap-1.5">
            {[5, 10, 15, 20].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setQuestionCount(n)}
                className={cn(
                  "p-2 rounded-xl border-2 text-sm font-medium transition-all text-left",
                  questionCount === n ? "border-purple-400 bg-purple-50 text-purple-800" : "border-gray-100 text-gray-600 hover:border-gray-200"
                )}
              >
                {n} câu hỏi
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generate button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !topic.trim()}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold shadow-lg shadow-purple-100"
      >
        {isGenerating ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang tạo quiz...</>
        ) : (
          <><Wand2 className="w-4 h-4 mr-2" />Tạo ngay</>
        )}
      </Button>

      {/* Generated result */}
      {generatedQuiz && (
        <div className="rounded-2xl border-2 border-purple-300 bg-purple-50/50 p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <p className="font-semibold text-purple-900 text-sm">{generatedQuiz.title}</p>
              </div>
              <div className="flex gap-1.5">
                <Badge className={cn(difficultyConfig[generatedQuiz.difficulty].color, "text-[10px] border-0")}>{difficultyConfig[generatedQuiz.difficulty].label}</Badge>
                <Badge variant="outline" className="text-[10px]">{generatedQuiz.questions} câu</Badge>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center">
              <Bot className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <div className="space-y-1 bg-white/70 rounded-xl p-2.5 border border-purple-100">
            <p className="text-xs font-semibold text-purple-700 mb-1.5">Xem trước câu hỏi:</p>
            {generatedQuiz.preview.map((q, i) => (
              <p key={i} className="text-xs text-gray-600">{q}</p>
            ))}
            <p className="text-xs text-purple-400 italic mt-1">... và {generatedQuiz.questions - 2} câu khác</p>
          </div>
          <Button
            onClick={handleAdd}
            className="w-full h-9 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Thêm bộ quiz này vào chiến dịch
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function AddQuizModal({ isOpen, onClose, campaign, availableQuizzes, onSubmit }) {
  const [selectedQuizIds, setSelectedQuizIds] = useState([]);
  const [aiGeneratedQuizzes, setAiGeneratedQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState('library');

  React.useEffect(() => {
    if (isOpen) {
      setSelectedQuizIds(campaign?.selected_quizzes?.map(q => q.quiz_id) || []);
      setAiGeneratedQuizzes([]);
      setActiveTab('library');
    }
  }, [isOpen, campaign]);

  const allQuizzes = [...availableQuizzes, ...aiGeneratedQuizzes];

  const toggleQuiz = (quizId) => {
    setSelectedQuizIds(prev =>
      prev.includes(quizId) ? prev.filter(id => id !== quizId) : [...prev, quizId]
    );
  };

  const handleAIGenerated = (quiz) => {
    setAiGeneratedQuizzes(prev => [...prev, quiz]);
    setSelectedQuizIds(prev => [...prev, quiz.id]);
    setActiveTab('library');
  };

  const selectedQuizzes = allQuizzes.filter(q => selectedQuizIds.includes(q.id));
  const hasEasy = selectedQuizzes.some(q => q.difficulty === 'easy');
  const hasMedium = selectedQuizzes.some(q => q.difficulty === 'medium');
  const hasHard = selectedQuizzes.some(q => q.difficulty === 'hard');
  const isValid = hasEasy && hasMedium && hasHard;

  const easyQuizzes = allQuizzes.filter(q => q.difficulty === 'easy');
  const mediumQuizzes = allQuizzes.filter(q => q.difficulty === 'medium');
  const hardQuizzes = allQuizzes.filter(q => q.difficulty === 'hard');

  const handleSubmit = () => {
    onSubmit(campaign.id, selectedQuizIds);
    onClose();
  };

  const QuizGroup = ({ quizzes, diffKey }) => {
    const cfg = difficultyConfig[diffKey];
    const hasDiff = selectedQuizzes.some(q => q.difficulty === diffKey);
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge className={cn(cfg.color, "border-0")}>{cfg.label}</Badge>
          <span className="text-xs text-muted-foreground">({quizzes.length} quiz)</span>
          <span className={cn("text-xs font-medium ml-auto", hasDiff ? 'text-eco-green' : 'text-destructive')}>
            {hasDiff ? '✓ Đã chọn' : '✗ Cần chọn ít nhất 1'}
          </span>
        </div>
        {quizzes.length === 0 ? (
          <p className="text-sm text-muted-foreground italic pl-2">Chưa có quiz nào</p>
        ) : (
          quizzes.map(quiz => (
            <div
              key={quiz.id}
              onClick={() => toggleQuiz(quiz.id)}
              className={cn(
                "flex items-center space-x-3 p-2.5 rounded-xl border-2 cursor-pointer transition-all",
                selectedQuizIds.includes(quiz.id)
                  ? "bg-eco-blue/5 border-eco-blue/50"
                  : "border-border hover:bg-muted/40"
              )}
            >
              <Checkbox
                checked={selectedQuizIds.includes(quiz.id)}
                onCheckedChange={() => toggleQuiz(quiz.id)}
                onClick={e => e.stopPropagation()}
              />
              <div className="flex-1 flex items-center justify-between gap-2">
                <span className="font-medium text-sm flex items-center gap-1.5">
                  {quiz.isAI && <Sparkles className="w-3 h-3 text-purple-500 shrink-0" />}
                  {quiz.title}
                </span>
                <Badge variant="outline" className="shrink-0">{quiz.questions} câu</Badge>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-eco-blue/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-eco-blue" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Thêm Quiz cho chiến dịch</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Cần chọn ít nhất 1 quiz Dễ, Trung bình và Khó</p>
            </div>
          </div>

          {/* Tabs - Fixed */}
          <div className="flex gap-1 mt-4 bg-muted/40 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('library')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                activeTab === 'library' ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BookOpen className="w-4 h-4" />
              Thư viện
              {selectedQuizIds.length > 0 && (
                <span className="ml-1 bg-eco-blue text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{selectedQuizIds.length}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                activeTab === 'ai' ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              Tạo bằng AI
              {aiGeneratedQuizzes.length > 0 && (
                <span className="ml-1 bg-purple-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{aiGeneratedQuizzes.length}</span>
              )}
            </button>
          </div>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto py-4 pr-1 scrollbar-thin">
          {activeTab === 'library' ? (
            <div className="space-y-5 px-1">
              <QuizGroup quizzes={easyQuizzes} diffKey="easy" />
              <div className="border-t" />
              <QuizGroup quizzes={mediumQuizzes} diffKey="medium" />
              <div className="border-t" />
              <QuizGroup quizzes={hardQuizzes} diffKey="hard" />
            </div>
          ) : (
            <div className="px-1">
              <AIGeneratePanel
                onGenerated={handleAIGenerated}
                existingCount={aiGeneratedQuizzes.length}
              />
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4 shrink-0 mt-auto bg-background">
          <p className="text-xs text-muted-foreground mr-auto">
            Đã chọn <strong>{selectedQuizIds.length}</strong> quiz
            {!isValid && <span className="text-destructive ml-1">(Cần đủ 3 độ khó)</span>}
          </p>
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={!isValid} className="bg-eco-blue hover:bg-eco-blue/90 text-white">
            Lưu Quiz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
