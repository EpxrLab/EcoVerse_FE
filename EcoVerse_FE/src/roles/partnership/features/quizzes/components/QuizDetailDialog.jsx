import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { 
  Clock, 
  Trophy, 
  Star, 
  Layout, 
  FileQuestion, 
  CheckCircle2, 
  Loader2,
  Pencil
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { quizzesService } from '../services/quizzes.service';

export function QuizDetailDialog({ isOpen, onClose, quizId, getDifficultyStars, getDifficultyColor }) {
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && quizId) {
      fetchDetail();
    }
  }, [isOpen, quizId]);

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const response = await quizzesService.getQuizDetail(quizId);
      if (response.data && response.data.data) {
        setQuiz(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch quiz detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden" style={{ maxHeight: '90vh' }}>
        <DialogHeader className="px-6 pt-5 pb-4 border-b bg-muted/20">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-eco-orange flex items-center justify-center shrink-0">
              <FileQuestion className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold truncate">{quiz?.title || 'Xem chi tiết Quiz'}</p>
              <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className={cn(
                    "font-medium text-[10px] px-1.5 h-5",
                    quiz?.published ? "bg-eco-green/10 text-eco-green border-eco-green/20" : "bg-muted text-muted-foreground border-border"
                  )}>
                    {quiz?.published ? 'Công khai' : 'Bản nháp'}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">• Đã cập nhật {quiz?.updatedAt ? new Date(quiz.updatedAt).toLocaleDateString() : '—'}</span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-6" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-10 h-10 text-eco-green animate-spin" />
              <p className="text-sm font-medium text-muted-foreground">Đang tải chi tiết...</p>
            </div>
          ) : quiz ? (
            <div className="space-y-8">
              {/* Info Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-2xl border bg-white shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-eco-blue/10 flex items-center justify-center">
                      <Layout className="w-4 h-4 text-eco-blue" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thông tin</span>
                  </div>
                  <p className="text-xl font-bold">{quiz.questionCount || quiz.questions?.length || 0}</p>
                  <p className="text-[11px] text-muted-foreground">Câu hỏi</p>
                </div>

                <div className="p-3 rounded-2xl border bg-white shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-eco-green/10 flex items-center justify-center">
                      <Star className="w-4 h-4 text-eco-green" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Độ khó</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex">
                      {[...Array(getDifficultyStars(quiz.difficulty))].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-eco-orange text-eco-orange" />
                      ))}
                    </div>
                    <span className={cn("text-xs font-bold", getDifficultyColor(quiz.difficulty))}>
                      {quiz.difficulty === 'EASY' ? 'Dễ' : quiz.difficulty === 'MEDIUM' ? 'TB' : 'Khó'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl border bg-white shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-eco-orange/10 flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-eco-orange" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phần thưởng</span>
                  </div>
                  <p className="text-xl font-bold">+{quiz.pointsReward}</p>
                  <p className="text-[11px] text-muted-foreground">Eco Points</p>
                </div>

                <div className="p-3 rounded-2xl border bg-white shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-eco-leaf/10 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-eco-leaf" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thời gian</span>
                  </div>
                  <p className="text-xl font-bold">{quiz.timePerQuestion}s</p>
                  <p className="text-[11px] text-muted-foreground">Mỗi câu hỏi</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                  Mô tả bài Quiz
                </h4>
                <div className="p-4 rounded-xl border bg-muted/5 text-sm leading-relaxed text-muted-foreground italic">
                  {quiz.description || "Không có mô tả cho bài quiz này."}
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <FileQuestion className="w-4 h-4 text-muted-foreground" />
                    Danh sách câu hỏi ({quiz.questions?.length || 0})
                  </h4>
                  <Badge variant="secondary" className="bg-eco-blue/10 text-eco-blue border-none text-[10px]">
                    {quiz.passScorePercentage}% để đạt
                  </Badge>
                </div>

                <div className="space-y-3">
                  {quiz.questions?.map((q, idx) => (
                    <div key={q.id || idx} className="p-4 rounded-xl border bg-white hover:border-eco-blue/30 transition-colors">
                      <div className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1 space-y-3">
                          <p className="text-sm font-semibold text-foreground">{q.questionText}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {q.answers?.map((ans, aIdx) => {
                              const isCorrect = ans.correct;
                              const optionLabel = String.fromCharCode(65 + aIdx); // A, B, C, D...
                              
                              return (
                                <div 
                                  key={ans.id || aIdx} 
                                  className={cn(
                                    "px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-between",
                                    isCorrect 
                                      ? "bg-eco-green/8 border-eco-green/30 text-eco-green-dark shadow-sm" 
                                      : "border-border/60 text-muted-foreground hover:border-border hover:bg-muted/5"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className={cn(
                                      "w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs border-2 shrink-0 transition-colors",
                                      isCorrect 
                                        ? "bg-eco-green text-white border-eco-green" 
                                        : "bg-muted text-muted-foreground border-border/80"
                                    )}>
                                      {optionLabel}
                                    </span>
                                    <span className="font-medium text-sm">{ans.answerText}</span>
                                  </div>
                                  {isCorrect && (
                                    <div className="w-5 h-5 rounded-full bg-eco-green flex items-center justify-center shadow-sm">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Không tìm thấy thông tin chi tiết.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
