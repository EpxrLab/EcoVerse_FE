import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import { Brain, Sparkles, Bot, BookOpen, Plus, Minus, Check, Loader2, Wand2, RotateCcw, FileUp, File, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { aiQuizService } from '../../quizzes/services/aiQuiz.service';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

const difficultyConfig = {
  easy: { label: 'Dễ', color: 'bg-eco-green/15 text-eco-green', dot: 'bg-eco-green' },
  medium: { label: 'Trung bình', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  hard: { label: 'Khó', color: 'bg-destructive/15 text-destructive', dot: 'bg-destructive' },
};

function AIGeneratePanel({ campaignId, roundId, onGenerated, currentSubscription, isLoadingSubscription }) {
  const [questionCount, setQuestionCount] = useState(15);
  const [targetGrade, setTargetGrade] = useState(1);
  const [coinsOnPass, setCoinsOnPass] = useState(10);
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [selectedFileIds, setSelectedFileIds] = useState([]);
  const [myFiles, setMyFiles] = useState([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editableQuiz, setEditableQuiz] = useState(null);
  const [isModified, setIsModified] = useState(false);

  React.useEffect(() => {
    fetchMyFiles();
  }, []);

  const fetchMyFiles = async () => {
    try {
      const res = await aiQuizService.getMyFiles();
      if (res.data?.data) {
        // Handle both simple array and paginated response
        const allFiles = Array.isArray(res.data.data) ? res.data.data : (res.data.data.content || []);
        // Filter to only show documents
        const docs = allFiles.filter(file => file.category === 'DOCUMENT');
        setMyFiles(docs);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await aiQuizService.uploadDocument(file);
      if (res.data?.data) {
        const newFile = res.data.data;
        setMyFiles(prev => [newFile, ...prev]);
        setSelectedFileIds(prev => [...prev, newFile.id]);
        toast.success('Tải tài liệu thành công');
      }
    } catch (error) {
      toast.error('Tải tài liệu thất bại');
      console.error(error);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const toggleFileSelection = (fileId) => {
    setSelectedFileIds(prev => 
      prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
    );
  };

  const handleGenerate = async () => {
    if (currentSubscription) {
      const { maxAiQuizGenerations, usedAiQuizGenerations } = currentSubscription;
      if (maxAiQuizGenerations !== null && usedAiQuizGenerations >= maxAiQuizGenerations) {
        toast.error('Giới hạn gói đăng ký', {
          description: `Bạn đã đạt giới hạn ${maxAiQuizGenerations} lượt tạo AI của gói hiện tại.`,
        });
        return;
      }
    }

    setIsGenerating(true);
    setEditableQuiz(null);
    try {
      const res = await aiQuizService.generateQuiz({
        campaignId,
        roundId,
        questionCount,
        targetGrade,
        coinsOnPass,
        timePerQuestion,
        fileIds: selectedFileIds
      });

      if (res.data?.data?.quizPreview) {
        setEditableQuiz(res.data.data.quizPreview);
        setIsModified(false);
        toast.success('Tạo quiz thành công! Bạn có thể chỉnh sửa trước khi lưu.');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Tạo quiz thất bại';
      toast.error(errorMsg);
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirm = async () => {
    if (!editableQuiz) return;
 
    setIsConfirming(true);
    try {
      const res = await aiQuizService.confirmQuiz({
        title: editableQuiz.title,
        description: editableQuiz.description,
        difficulty: editableQuiz.difficulty,
        targetGrade: editableQuiz.targetGrade,
        coinOnPass: editableQuiz.coinsOnPass,
        timePerQuestion: editableQuiz.timePerQuestion,
        passScorePercentage: editableQuiz.passScorePercentage,
        createdBy: isModified ? 'USER' : 'AI',
        source: 'AI_GENERATED',
        questions: editableQuiz.questions.map(q => ({
          questionOrder: q.questionOrder,
          questionType: q.questionType || "MULTIPLE_CHOICE",
          questionText: q.questionText,
          answers: q.answers.map(a => ({
            answerText: a.answerText,
            correct: a.correct
          }))
        }))
      });
 
      if (res.data?.data) {
        toast.success('Đã lưu quiz vào hệ thống');
        onGenerated(res.data.data);
        setEditableQuiz(null);
      }
    } catch (error) {
      toast.error('Lưu quiz thất bại');
      console.error(error);
    } finally {
      setIsConfirming(false);
    }
  };

  if (editableQuiz) {
    const quiz = editableQuiz;
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between pb-2 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-eco-green" />
            <h3 className="font-bold text-lg">Chỉnh sửa Quiz AI</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setEditableQuiz(null)}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Tạo lại
          </Button>
        </div>

        {/* Editable Metadata */}
        <div className="bg-eco-green/5 rounded-2xl p-4 border border-eco-green/10 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-eco-green uppercase">Tiêu đề Quiz</Label>
              <Input 
                value={quiz.title} 
                onChange={(e) => {
                  setEditableQuiz({...quiz, title: e.target.value});
                  setIsModified(true);
                }}
                className="bg-white border-eco-green/10 focus-visible:ring-eco-green font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-eco-green uppercase">Mô tả</Label>
              <Input 
                value={quiz.description || ''} 
                onChange={(e) => {
                  setEditableQuiz({...quiz, description: e.target.value});
                  setIsModified(true);
                }}
                className="bg-white border-eco-green/10 focus-visible:ring-eco-green text-sm"
                placeholder="Nhập mô tả..."
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-gray-500 uppercase">Độ khó</Label>
              <Select 
                value={quiz.difficulty} 
                onValueChange={(v) => {
                  setEditableQuiz({...quiz, difficulty: v});
                  setIsModified(true);
                }}
              >
                <SelectTrigger className="h-8 text-xs bg-white border-eco-green/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">Dễ</SelectItem>
                  <SelectItem value="MEDIUM">Trung bình</SelectItem>
                  <SelectItem value="HARD">Khó</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-gray-500 uppercase">Lớp</Label>
              <Select 
                value={String(quiz.targetGrade)} 
                onValueChange={(v) => {
                  setEditableQuiz({...quiz, targetGrade: parseInt(v)});
                  setIsModified(true);
                }}
              >
                <SelectTrigger className="h-8 text-xs bg-white border-eco-green/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                   {[1,2,3,4,5].map(g => (
                     <SelectItem key={g} value={String(g)}>Lớp {g}</SelectItem>
                   ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-gray-500 uppercase">Điểm đạt (%)</Label>
              <Input 
                type="number"
                value={quiz.passScorePercentage || 0} 
                onChange={(e) => {
                  setEditableQuiz({...quiz, passScorePercentage: parseInt(e.target.value)});
                  setIsModified(true);
                }}
                className="h-8 text-xs bg-white border-eco-green/10"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-gray-500 uppercase">Điểm thưởng</Label>
              <Input 
                type="number"
                value={quiz.coinsOnPass || 0} 
                onChange={(e) => {
                  setEditableQuiz({...quiz, coinsOnPass: parseInt(e.target.value)});
                  setIsModified(true);
                }}
                className="h-8 text-xs bg-white border-eco-green/10"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 border-t border-eco-green/10 mt-2">
            <Badge variant="outline" className="bg-white/50 text-[10px]">{quiz.questions.length} câu hỏi</Badge>
            <Badge variant="outline" className="bg-white/50 text-[10px]">{quiz.timePerQuestion}s / câu</Badge>
            {quiz.source && <Badge variant="secondary" className="text-[10px] opacity-70 border-0">{quiz.source}</Badge>}
            {quiz.createdBy && <Badge variant="secondary" className="text-[10px] opacity-70 border-0">Bởi: {quiz.createdBy}</Badge>}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Bot className="w-4 h-4 text-eco-green" />
            Nội dung câu hỏi:
          </p>
          {quiz.questions.map((q, idx) => (
            <div key={`question-${idx}`} className="p-4 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all space-y-3 relative group">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-eco-green/10 text-eco-green flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <div className="flex-1 space-y-2">
                  <Input 
                    value={q.questionText}
                    onChange={(e) => {
                      const newQs = [...quiz.questions];
                      newQs[idx].questionText = e.target.value;
                      setEditableQuiz({...quiz, questions: newQs});
                      setIsModified(true);
                    }}
                    className="text-sm font-medium border-gray-100 focus:border-eco-green/20"
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.answers.map((a, aidx) => (
                      <div key={`answer-${idx}-${aidx}`} className={cn(
                        "flex items-center gap-2 p-2 rounded-xl border text-xs",
                        a.correct ? "bg-eco-green/5 border-eco-green/20" : "bg-gray-50/50 border-gray-100"
                      )}>
                        <Checkbox 
                          checked={a.correct} 
                          onCheckedChange={(checked) => {
                             const newQs = [...quiz.questions];
                             newQs[idx].answers = newQs[idx].answers.map((ans, i) => ({
                               ...ans,
                               correct: i === aidx ? !!checked : (checked ? false : ans.correct)
                             }));
                             setEditableQuiz({...quiz, questions: newQs});
                             setIsModified(true);
                          }}
                        />
                        <Input 
                           value={a.answerText}
                           onChange={(e) => {
                             const newQs = [...quiz.questions];
                             newQs[idx].answers[aidx].answerText = e.target.value;
                             setEditableQuiz({...quiz, questions: newQs});
                             setIsModified(true);
                           }}
                           className="h-7 border-0 bg-transparent focus-visible:ring-0 p-0 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <Button 
                   variant="ghost" 
                   size="icon" 
                   className="h-8 w-8 text-gray-400 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                   onClick={() => {
                     const newQs = quiz.questions.filter((_, i) => i !== idx);
                     setEditableQuiz({...quiz, questions: newQs});
                     setIsModified(true);
                   }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 flex gap-3 sticky bottom-0 bg-background/95 backdrop-blur-sm pb-2 border-t z-10">
          <Button variant="outline" className="flex-1 rounded-xl h-11" onClick={() => setEditableQuiz(null)}>
            Hủy & Tạo lại
          </Button>
          <Button 
            className="flex-2 bg-eco-green hover:bg-eco-green/90 text-white font-bold rounded-xl h-11 px-8 shadow-lg shadow-eco-green/10"
            onClick={handleConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
            Xác nhận & Lưu Quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 h-full min-h-[400px]">
      {/* Left Column: Settings */}
      <div className="md:col-span-2 space-y-6 flex flex-col">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 p-4 rounded-xl bg-gradient-to-r from-eco-green/5 to-emerald-50 border border-eco-green/10">
            <div className="w-10 h-10 rounded-xl bg-eco-green/10 flex items-center justify-center shrink-0">
              <Bot className="w-6 h-6 text-eco-green" />
            </div>
            <div>
              <p className="font-bold text-eco-green-dark leading-none">Cấu hình AI</p>
              <p className="text-[10px] text-eco-green mt-1">Điều chỉnh thông số cho bộ câu hỏi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700">Hạng mục lớp</Label>
              <Select 
                value={String(targetGrade)} 
                onValueChange={(val) => setTargetGrade(parseInt(val))}
              >
                <SelectTrigger className="h-9 rounded-xl border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(g => (
                    <SelectItem key={g} value={String(g)}>Lớp {g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700">Số câu hỏi</Label>
              <Select 
                value={String(questionCount)} 
                onValueChange={(val) => setQuestionCount(parseInt(val))}
              >
                <SelectTrigger className="h-9 rounded-xl border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[15, 20, 25, 30].map(n => (
                    <SelectItem key={n} value={String(n)}>{n} câu</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700">Thời gian (s/câu)</Label>
                <div className="flex items-center gap-2 bg-gray-50 border rounded-xl px-2 h-9">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setTimePerQuestion(Math.max(5, timePerQuestion - 5))}><Minus className="w-3" /></Button>
                  <span className="flex-1 text-center text-xs font-bold">{timePerQuestion}s</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setTimePerQuestion(timePerQuestion + 5)}><Plus className="w-3" /></Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700">Điểm thưởng</Label>
                <div className="flex items-center gap-2 bg-gray-50 border rounded-xl px-2 h-9">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCoinsOnPass(Math.max(1, coinsOnPass - 1))}><Minus className="w-3" /></Button>
                  <span className="flex-1 text-center text-xs font-bold">{coinsOnPass}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCoinsOnPass(coinsOnPass + 1)}><Plus className="w-3" /></Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 space-y-2">
          {currentSubscription && (
            <div className="flex justify-between items-center text-[10px] text-muted-foreground px-1">
              <span>Lượt tạo AI hàng tháng:</span>
              <span className={cn(
                "font-bold",
                currentSubscription.usedAiQuizGenerations >= currentSubscription.maxAiQuizGenerations ? "text-destructive" : "text-eco-green"
              )}>
                {currentSubscription.usedAiQuizGenerations}/{currentSubscription.maxAiQuizGenerations}
              </span>
            </div>
          )}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || isLoadingSubscription}
            className="w-full h-11 rounded-xl bg-eco-green hover:bg-eco-green/90 text-white font-bold shadow-lg shadow-eco-green/10"
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang soạn...</>
            ) : (
              <><Wand2 className="w-4 h-4 mr-2" />Tạo Quiz ngay</>
            )}
          </Button>
        </div>
      </div>

      {/* Right Column: Document Management */}
      <div className="md:col-span-3 h-full border-l pl-6 space-y-4 flex flex-col min-h-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-eco-green" />
            <Label className="text-sm font-bold text-gray-700">Tài liệu tham khảo ({selectedFileIds.length})</Label>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-[11px] border-eco-green/20 text-eco-green hover:bg-eco-green/5"
            onClick={() => document.getElementById('ai-file-upload').click()}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <FileUp className="w-3 h-3 mr-1" />}
            Tải File mới
          </Button>
          <input 
            id="ai-file-upload" 
            type="file" 
            className="hidden" 
            accept=".pdf,.doc,.docx,.txt" 
            onChange={handleFileUpload}
          />
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {myFiles.length > 0 ? (
            <div className="space-y-2 overflow-y-auto pr-2 scrollbar-thin flex-1">
              {myFiles.map((file, index) => (
                <div 
                  key={file.id || `file-${index}`} 
                  onClick={() => toggleFileSelection(file.id)}
                  className={cn(
                    "group flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                    selectedFileIds.includes(file.id) 
                      ? "border-eco-green/40 bg-eco-green/5" 
                      : "border-gray-50 hover:border-gray-200 bg-gray-50/30"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    selectedFileIds.includes(file.id) ? "bg-eco-green/20" : "bg-white border shadow-sm"
                  )}>
                    <File className={cn("w-5 h-5", selectedFileIds.includes(file.id) ? "text-eco-green" : "text-gray-400")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate text-gray-700">
                      {file.name || file.fileName || (file.publicId ? file.publicId.split('/').pop() : 'Tài liệu không tên')}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Đang xử lý size'} 
                      • 
                      {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'Vừa tải lên'}
                    </p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                    selectedFileIds.includes(file.id) 
                      ? "bg-eco-green border-eco-green" 
                      : "border-gray-200 group-hover:border-eco-green/30"
                  )}>
                    {selectedFileIds.includes(file.id) && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl bg-gray-50/50">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <FileUp className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-xs text-gray-400 text-center px-8 font-medium">Chưa có tài liệu nào. Vui lòng tải tài liệu lên để AI có dữ liệu tạo câu hỏi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function AddQuizModal({ 
  isOpen, 
  onClose, 
  campaign, 
  roundId, 
  availableQuizzes, 
  onSubmit, 
  currentSubscription, 
  isLoadingSubscription 
}) {
  const [selectedQuizIds, setSelectedQuizIds] = useState([]);
  const [aiGeneratedQuizzes, setAiGeneratedQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState('library');
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      let initialQuizzes = [];
      
      if (roundId && campaign?.rounds) {
        // Mode: Specific round binding (Detail View)
        const round = campaign.rounds.find(r => r.id === roundId);
        initialQuizzes = round?.quizzes?.map(q => q.id) || [];
      } else if (campaign?.rounds && campaign.rounds.length > 0) {
        // Mode: Campaign level binding (List View - Single Round support)
        // Pre-select from the first/only round
        initialQuizzes = campaign.rounds[0].quizzes?.map(q => q.id) || [];
      } else {
        // Fallback or legacy (no rounds yet)
        initialQuizzes = campaign?.selected_quizzes?.map(q => q.quiz_id) || [];
      }

      setSelectedQuizIds(initialQuizzes);
      setMaxAttempts(1);
      setAiGeneratedQuizzes([]);
      setActiveTab('library');
    }
  }, [isOpen, campaign, roundId]);

  const allQuizzes = [...availableQuizzes, ...aiGeneratedQuizzes];

  const toggleQuiz = (quizId) => {
    setSelectedQuizIds(prev =>
      prev.includes(quizId) ? prev.filter(id => id !== quizId) : [...prev, quizId]
    );
  };

  const handleAIGenerated = (quiz) => {
    // Transform API quiz to match local quiz format if needed
    const transformedQuiz = {
      ...quiz,
      questions: quiz.questions?.length || quiz.questionCount || 0,
      difficulty: quiz.difficulty?.toLowerCase() || 'easy',
      isAI: true
    };
    setAiGeneratedQuizzes(prev => [...prev, transformedQuiz]);
    setSelectedQuizIds(prev => [...prev, transformedQuiz.id]);
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

  const isUpdateMode = useMemo(() => {
    if (roundId && campaign?.rounds) {
      const round = campaign.rounds.find(r => r.id === roundId);
      return (round?.quizzes?.length || 0) > 0;
    }
    // Fallback: check first round if no roundId is provided (e.g. from campaign list)
    if (campaign?.rounds && campaign.rounds.length > 0) {
      return (campaign.rounds[0].quizzes?.length || 0) > 0;
    }
    return (campaign?.selected_quizzes?.length || 0) > 0;
  }, [campaign, roundId]);

  const effectiveRoundId = useMemo(() => {
    if (roundId) return roundId;
    if (campaign?.rounds && campaign.rounds.length > 0) {
      return campaign.rounds[0].id;
    }
    return null;
  }, [roundId, campaign]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(campaign.id, selectedQuizIds, roundId, maxAttempts);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
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
          quizzes.map((quiz, index) => (
            <div
              key={quiz.id || `${diffKey}-${index}`}
              onClick={() => toggleQuiz(quiz.id)}
              className={cn(
                "flex items-center space-x-3 p-2.5 rounded-xl border-2 cursor-pointer transition-all",
                selectedQuizIds.includes(quiz.id)
                  ? "bg-eco-green/5 border-eco-green/50"
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
                  {quiz.isAI && <Sparkles className="w-3 h-3 text-eco-green shrink-0" />}
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
      <DialogContent className={cn(
        "h-[85vh] flex flex-col overflow-hidden transition-all duration-300",
        activeTab === 'ai' && !isSubmitting ? "max-w-4xl" : "max-w-xl"
      )}>
        <DialogHeader className="shrink-0 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-eco-green/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-eco-green" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {isUpdateMode ? 'Cập nhật Quiz vào vòng thi' : 'Thêm Quiz cho chiến dịch'}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {roundId ? 'Chọn các bộ câu hỏi để học sinh giải đố trong vòng này' : 'Cần chọn ít nhất 1 quiz Dễ, Trung bình và Khó'}
              </p>
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
                <span className="ml-1 bg-eco-green text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{selectedQuizIds.length}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                activeTab === 'ai' ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="w-4 h-4 text-eco-green" />
              Tạo bằng AI
              {aiGeneratedQuizzes.length > 0 && (
                <span className="ml-1 bg-eco-green text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{aiGeneratedQuizzes.length}</span>
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
                campaignId={campaign?.id}
                roundId={effectiveRoundId}
                onGenerated={handleAIGenerated}
                currentSubscription={currentSubscription}
                isLoadingSubscription={isLoadingSubscription}
              />
            </div>
          )}
        </div>

        {/* Quiz Settings Section */}
        <div className="px-1 py-3 border-t bg-muted/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-eco-green/10 flex items-center justify-center">
                <RotateCcw className="w-4 h-4 text-eco-green" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Số lượt làm bài</p>
                <p className="text-[10px] text-muted-foreground">Số lần tối đa học sinh được làm lại Quiz</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 bg-background border rounded-xl p-1 shadow-sm">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg hover:bg-muted"
                onClick={() => setMaxAttempts(Math.max(1, maxAttempts - 1))}
              >
                <Minus className="w-3.5 h-3.5" />
              </Button>
              <Input 
                id="max-attempts"
                type="number" 
                min="1" 
                value={maxAttempts} 
                onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 1)}
                className="h-8 w-12 border-0 text-center font-bold focus-visible:ring-0 text-sm p-0"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg hover:bg-muted"
                onClick={() => setMaxAttempts(maxAttempts + 1)}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4 shrink-0 mt-auto bg-background px-1">
          <div className="mr-auto">
            <p className="text-xs text-muted-foreground">
              Đã chọn <span className="font-bold text-eco-green">{selectedQuizIds.length}</span> bộ Quiz
              {!isValid && (
                <span className="flex items-center text-destructive mt-0.5 font-medium">
                  (Cần chọn đủ 3 độ khó)
                </span>
              )}
            </p>
          </div>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={(!isValid && !roundId) || isSubmitting} 
            className="bg-eco-green hover:bg-eco-green/90 text-white min-w-[120px] shadow-md shadow-eco-green/10"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              isUpdateMode ? 'Cập nhật bộ Quiz' : 'Lưu cấu hình Quiz'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
