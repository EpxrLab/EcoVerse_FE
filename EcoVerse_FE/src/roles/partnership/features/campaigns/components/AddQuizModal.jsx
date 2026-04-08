import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Brain, Sparkles, Bot, BookOpen, Plus, Check, Loader2, Wand2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

// ─── Shared AI Data ────────────────────────────────────────────────────────────

const difficultyConfig = {
  easy:   { label: 'Dễ',         color: 'bg-eco-green/15 text-eco-green', dot: 'bg-eco-green' },
  medium: { label: 'Trung bình', color: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-500' },
  hard:   { label: 'Khó',        color: 'bg-destructive/15 text-destructive', dot: 'bg-destructive' },
};

const AI_TOPICS = ['Tái chế nhựa', 'Phân loại rác hữu cơ', 'Năng lượng tái tạo', 'Ô nhiễm không khí', 'Biến đổi khí hậu'];

const DEMO_AI_QUESTIONS = {
  easy:   ['Chai nhựa thuộc loại rác thải nào?', 'Vỏ chuối nên bỏ vào thùng rác nào?', 'Màu sắc thùng rác hữu cơ thường là gì?'],
  medium: ['Thời gian phân hủy của túi nilon là bao nhiêu năm?', 'Pin điện tử được phân loại là rác thải gì?', 'Quy trình tái chế giấy gồm mấy bước?'],
  hard:   ['LCA (Life Cycle Assessment) đo lường điều gì trong quản lý chất thải?', 'Nguyên tắc 3R trong kinh tế tuần hoàn là gì?', 'Phân biệt rác thải nguy hại và rác thải thông thường?'],
};

function generateAIQuiz(topic, difficulty, count, existingCount) {
  return {
    id: `ai_${Date.now()}`,
    title: `[AI] ${topic} — Bộ ${existingCount + 1}`,
    difficulty,
    question_count: count,
    isAI: true,
    preview: (DEMO_AI_QUESTIONS[difficulty] || []).slice(0, 2).map((q, i) => `${i + 1}. ${q}`),
  };
}

// ─── AI Panel Component ────────────────────────────────────────────────────────

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
      setGeneratedQuiz(generateAIQuiz(topic, difficulty, questionCount, existingCount));
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
    <div className="space-y-4">
      {/* Header banner */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100">
        <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <p className="font-semibold text-purple-900 text-sm">Tạo Quiz bằng AI</p>
          <p className="text-xs text-purple-500">AI tạo bộ câu hỏi phù hợp chủ đề môi trường bạn nhập</p>
        </div>
      </div>

      {/* Topic */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Chủ đề / Nội dung</Label>
        <Input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="VD: Phân loại rác thải nhựa trong gia đình..."
          className="rounded-xl border-purple-100 focus-visible:ring-purple-400"
        />
        <div className="flex flex-wrap gap-1.5">
          {AI_TOPICS.map(t => (
            <button key={t} type="button" onClick={() => setTopic(t)} className={cn(
              "text-xs px-2.5 py-1 rounded-full border transition-all",
              topic === t ? "bg-purple-100 border-purple-400 text-purple-700 font-medium" : "border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600"
            )}>{t}</button>
          ))}
        </div>
      </div>

      {/* Difficulty + Count */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Độ khó</Label>
          <div className="flex flex-col gap-1.5">
            {Object.entries(difficultyConfig).map(([key, cfg]) => (
              <label key={key} className={cn(
                "flex items-center gap-2.5 p-2 rounded-xl border-2 cursor-pointer transition-all",
                difficulty === key ? "border-purple-400 bg-purple-50" : "border-gray-100 hover:border-gray-200"
              )}>
                <input type="radio" className="hidden" checked={difficulty === key} onChange={() => setDifficulty(key)} />
                <div className={cn("w-3 h-3 rounded-full shrink-0", cfg.dot)} />
                <span className={cn("text-sm font-medium", difficulty === key ? "text-purple-800" : "text-gray-600")}>{cfg.label}</span>
                {difficulty === key && <Check className="w-3.5 h-3.5 text-purple-500 ml-auto" />}
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Số câu hỏi</Label>
          <div className="flex flex-col gap-1.5">
            {[5, 10, 15, 20].map(n => (
              <button key={n} type="button" onClick={() => setQuestionCount(n)} className={cn(
                "p-2 rounded-xl border-2 text-sm font-medium transition-all text-left",
                questionCount === n ? "border-purple-400 bg-purple-50 text-purple-800" : "border-gray-100 text-gray-600 hover:border-gray-200"
              )}>{n} câu hỏi</button>
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
        {isGenerating
          ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang tạo quiz...</>
          : <><Wand2 className="w-4 h-4 mr-2" />Tạo ngay</>}
      </Button>

      {/* Generated result preview */}
      {generatedQuiz && (
        <div className="rounded-2xl border-2 border-purple-300 bg-purple-50/50 p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <p className="font-semibold text-purple-900 text-sm">{generatedQuiz.title}</p>
              </div>
              <div className="flex gap-1.5">
                <Badge className={cn(difficultyConfig[generatedQuiz.difficulty].color, "border-0 text-[10px]")}>{difficultyConfig[generatedQuiz.difficulty].label}</Badge>
                <Badge variant="outline" className="text-[10px]">{generatedQuiz.question_count} câu</Badge>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <div className="space-y-1 bg-white/70 rounded-xl p-2.5 border border-purple-100">
            <p className="text-xs font-semibold text-purple-700 mb-1.5">Xem trước câu hỏi:</p>
            {generatedQuiz.preview.map((q, i) => <p key={i} className="text-xs text-gray-600">{q}</p>)}
            <p className="text-xs text-purple-400 italic mt-1">... và {generatedQuiz.question_count - 2} câu khác</p>
          </div>
          <Button onClick={handleAdd} className="w-full h-9 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold">
            <Plus className="w-4 h-4 mr-1.5" />
            Thêm bộ quiz này
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function AddQuizModal({ isOpen, onClose, campaign, availableQuizzes, setAvailableQuizzes, onSubmit }) {
  const [configs, setConfigs] = useState({});
  const [aiGeneratedQuizzes, setAiGeneratedQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState('library');

  useEffect(() => {
    const rounds = campaign?.qualifying_rounds || campaign?.rounds;
    if (isOpen && rounds) {
      const initial = {};
      rounds.forEach(round => {
        const roundId = round.id || round.roundNumber || round.round_number;
        // Search for existing settings if available in the campaign data
        const existingQuizzes = round.quizzes || [];
        const isAlreadyBound = existingQuizzes.length > 0;
        
        initial[roundId] = {
          quiz_ids: round.quiz_ids || existingQuizzes.map(q => q.quizId || q.id) || [],
          maxAttempts: round.maxAttempts || (isAlreadyBound ? existingQuizzes[0].maxAttempts : 1),
          isRequired: true
        };
      });
      setConfigs(initial);
      setAiGeneratedQuizzes([]);
      setActiveTab('library');
    }
  }, [isOpen, campaign]);

  const allQuizzes = [...availableQuizzes, ...aiGeneratedQuizzes];

  const toggleQuiz = (rnum, quizId) => {
    setConfigs(prev => {
      const current = prev[rnum]?.quiz_ids || [];
      const updatedIds = current.includes(quizId) 
        ? current.filter(id => id !== quizId) 
        : [...current, quizId];
      return {
        ...prev,
        [rnum]: {
          ...prev[rnum],
          quiz_ids: updatedIds
        }
      };
    });
  };

  const handleUpdateSetting = (roundId, field, value) => {
    setConfigs(prev => ({
      ...prev,
      [roundId]: {
        ...prev[roundId],
        [field]: value
      }
    }));
  };

  const handleAIGenerated = (quiz) => {
    setAiGeneratedQuizzes(prev => [...prev, quiz]);
    if (typeof setAvailableQuizzes === 'function') {
      setAvailableQuizzes(prev => [...prev, quiz]);
    }
    setActiveTab('library');
  };

  const handleSubmit = () => {
    const rounds = campaign?.qualifying_rounds || campaign?.rounds || [];
    const roundsWithQuizzes = rounds.map(round => {
      const roundId = round.id || round.roundNumber || round.round_number;
      const roundConfig = configs[roundId] || {};
      return {
        id: round.id,
        roundNumber: round.roundNumber || round.round_number,
        quiz_ids: roundConfig.quiz_ids || [],
        maxAttempts: parseInt(roundConfig.maxAttempts) || 1,
        isRequired: true
      };
    });
    onSubmit(roundsWithQuizzes);
  };

  const totalSelected = Object.values(configs).reduce((sum, ids) => sum + ids.length, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-eco-blue/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-eco-blue" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Thêm Quiz vào Vòng loại</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Chọn từ thư viện hoặc tạo mới bằng AI</p>
            </div>
          </div>

          {/* Tabs */}
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
              {totalSelected > 0 && (
                <span className="ml-1 bg-eco-blue text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{totalSelected}</span>
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

        <div className="flex-1 overflow-y-auto py-4">
          {activeTab === 'library' ? (
            <div className="space-y-5">
              {(campaign?.qualifying_rounds || campaign?.rounds)?.map((round) => {
                const roundId = round.id || round.roundNumber || round.round_number;
                const currentSelected = configs[roundId] || [];
                return (
                  <div key={roundId} className="border p-4 rounded-xl space-y-3 bg-muted/5">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="font-bold text-base text-eco-green">
                        {round.roundName || round.round_name}
                        {(round.advancement_limit !== undefined || round.advanceCount !== undefined) && (
                          <span className="text-xs font-normal text-muted-foreground ml-2">
                            (Sĩ số duyệt: {round.advanceCount || round.advancement_limit})
                          </span>
                        )}
                      </h3>
                      <Badge variant="secondary" className="text-xs border">
                        {configs[roundId]?.quiz_ids?.length || 0} quiz đã chọn
                      </Badge>
                    </div>

                    {/* Quiz Settings */}
                    <div className="grid grid-cols-1 gap-4 pt-1">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-muted-foreground uppercase">Số lượt làm tối đa</Label>
                        <input
                          type="number"
                          min="1"
                          value={configs[roundId]?.maxAttempts || 1}
                          onChange={(e) => handleUpdateSetting(roundId, 'maxAttempts', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-eco-blue/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {allQuizzes.map((quiz) => {
                        const isSelected = configs[roundId]?.quiz_ids?.includes(quiz.id);
                        return (
                          <div
                            key={quiz.id}
                            onClick={() => toggleQuiz(roundId, quiz.id)}
                            className={cn(
                              "flex items-center gap-3 p-2.5 rounded-xl border-2 cursor-pointer transition-all",
                              isSelected ? "bg-orange-50 border-orange-400 shadow-sm" : "border-border hover:border-orange-200 bg-background"
                            )}
                          >
                            <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                              isSelected ? "border-orange-500 bg-orange-500" : "border-muted-foreground/30"
                            )}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className={cn("font-medium text-sm flex-1 flex items-center gap-1.5", isSelected ? "text-orange-900" : "text-foreground")}>
                              {quiz.isAI && <Sparkles className="w-3 h-3 text-purple-500 shrink-0" />}
                              {quiz.title || quiz.name}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge className={cn(difficultyConfig[quiz.difficulty]?.color, "border-0 text-[10px]")}>
                                {difficultyConfig[quiz.difficulty]?.label}
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">{quiz.question_count || quiz.questions || 0} câu</Badge>
                            </div>
                          </div>
                        );
                      })}
                      {allQuizzes.length === 0 && (
                        <p className="text-sm text-muted-foreground italic text-center py-3 bg-muted/20 rounded-lg">
                          Chưa có quiz nào. Hãy tạo bằng AI!
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <AIGeneratePanel onGenerated={handleAIGenerated} existingCount={aiGeneratedQuizzes.length} />
          )}
        </div>

        <DialogFooter className="border-t pt-4 shrink-0">
          <Button variant="ghost" onClick={onClose} className="mr-auto">Hủy</Button>
          <Button onClick={handleSubmit} className="bg-eco-orange hover:bg-eco-orange/90 text-white">
            Lưu cấu hình Quiz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
