import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Brain, Sparkles, Bot, BookOpen, Plus, Minus, Check, Loader2, Wand2, RotateCcw, FileUp, File, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { aiQuizService } from '../../quizzes/services/aiQuiz.service';
import toast from 'react-hot-toast';

const difficultyConfig = {
  easy: { label: 'Dễ', color: 'bg-eco-green/15 text-eco-green', dot: 'bg-eco-green' },
  medium: { label: 'Trung bình', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  hard: { label: 'Khó', color: 'bg-destructive/15 text-destructive', dot: 'bg-destructive' },
};

// ─── AI Generate Panel (Ported from School) ───────────────────────────────────

function AIGeneratePanel({ campaignId, rounds, onGenerated }) {
  const [selectedRoundId, setSelectedRoundId] = useState(rounds[0]?.id || '');
  const [questionCount, setQuestionCount] = useState(15);
  const [targetGrade, setTargetGrade] = useState(1);
  const coinsOnPass = 0;
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [selectedFileIds, setSelectedFileIds] = useState([]);
  const [myFiles, setMyFiles] = useState([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editableQuiz, setEditableQuiz] = useState(null);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    fetchMyFiles();
  }, []);

  const fetchMyFiles = async () => {
    try {
      const res = await aiQuizService.getMyFiles();
      if (res.data?.data) {
        const allFiles = Array.isArray(res.data.data) ? res.data.data : (res.data.data.content || []);
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
        const newFile = { ...res.data.data, name: file.name };
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
    setIsGenerating(true);
    setEditableQuiz(null);
    try {
      const res = await aiQuizService.generateQuiz({
        campaignId,
        roundId: selectedRoundId,
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
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h3 className="font-bold text-lg">Chỉnh sửa Quiz AI</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setEditableQuiz(null)}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Tạo lại
          </Button>
        </div>

        {/* Editable Metadata */}
        <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-purple-700 uppercase">Tiêu đề Quiz</Label>
              <Input 
                value={quiz.title} 
                onChange={(e) => {
                  setEditableQuiz({...quiz, title: e.target.value});
                  setIsModified(true);
                }}
                className="bg-white border-purple-100 focus-visible:ring-purple-400 font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-purple-700 uppercase">Mô tả</Label>
              <Input 
                value={quiz.description || ''} 
                onChange={(e) => {
                  setEditableQuiz({...quiz, description: e.target.value});
                  setIsModified(true);
                }}
                className="bg-white border-purple-100 focus-visible:ring-purple-400 text-sm"
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
                <SelectTrigger className="h-8 text-xs bg-white border-purple-100 capitalize">
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
                <SelectTrigger className="h-8 text-xs bg-white border-purple-100">
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
                className="h-8 text-xs bg-white border-purple-100"
              />
            </div>
            <div className="space-y-1 invisible">
              <Label className="text-[10px] font-bold text-gray-500 uppercase">Điểm thưởng</Label>
              <Input 
                type="number"
                value={0} 
                disabled
                className="h-8 text-xs bg-white border-purple-100"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 border-t border-purple-100/50 mt-2">
            <Badge variant="outline" className="bg-white/50 text-[10px]">{quiz.questions.length} câu hỏi</Badge>
            <Badge variant="outline" className="bg-white/50 text-[10px]">{quiz.timePerQuestion}s / câu</Badge>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-600" />
            Nội dung câu hỏi:
          </p>
          {quiz.questions.map((q, idx) => (
            <div key={`question-${idx}`} className="p-4 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all space-y-3 relative group">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
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
                    className="text-sm font-medium border-gray-100 focus:border-purple-200"
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
            className="flex-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl h-11 px-8 shadow-lg shadow-purple-100"
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
      <div className="md:col-span-2 space-y-6 flex flex-col">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
              <Bot className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-bold text-purple-900 leading-none">Cấu hình AI</p>
              <p className="text-[10px] text-purple-500 mt-1">Điều chỉnh thông số cho bộ câu hỏi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700">Chọn vòng thi</Label>
              <Select value={selectedRoundId} onValueChange={setSelectedRoundId}>
                <SelectTrigger className="h-9 rounded-xl border-gray-200">
                  <SelectValue placeholder="Chọn vòng thi..." />
                </SelectTrigger>
                <SelectContent>
                  {rounds.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.roundName || `Vòng ${r.roundNumber}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700">Hạng mục lớp</Label>
              <Select value={String(targetGrade)} onValueChange={(val) => setTargetGrade(parseInt(val))}>
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
              <Select value={String(questionCount)} onValueChange={(val) => setQuestionCount(parseInt(val))}>
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

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700">Thời gian (s/câu)</Label>
              <div className="flex items-center gap-2 bg-gray-50 border rounded-xl px-2 h-9">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setTimePerQuestion(Math.max(5, timePerQuestion - 5))}><Minus className="w-3" /></Button>
                <span className="flex-1 text-center text-xs font-bold">{timePerQuestion}s</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setTimePerQuestion(timePerQuestion + 5)}><Plus className="w-3" /></Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full h-11 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg shadow-purple-100"
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang soạn...</>
            ) : (
              <><Wand2 className="w-4 h-4 mr-2" />Tạo Quiz ngay</>
            )}
          </Button>
        </div>
      </div>

      <div className="md:col-span-3 h-full border-l pl-6 space-y-4 flex flex-col min-h-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <Label className="text-sm font-bold text-gray-700">Tài liệu tham khảo ({selectedFileIds.length})</Label>
          </div>
          <Button 
            variant="outline" size="sm" className="h-8 text-[11px] border-purple-200 text-purple-600 hover:bg-purple-50"
            onClick={() => document.getElementById('ai-file-upload').click()}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <FileUp className="w-3 h-3 mr-1" />}
            Tải File mới
          </Button>
          <input id="ai-file-upload" type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} />
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
                    selectedFileIds.includes(file.id) ? "border-purple-400 bg-purple-50/50" : "border-gray-50 hover:border-gray-200 bg-gray-50/30"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    selectedFileIds.includes(file.id) ? "bg-purple-100" : "bg-white border shadow-sm"
                  )}>
                    <File className={cn("w-5 h-5", selectedFileIds.includes(file.id) ? "text-purple-600" : "text-gray-400")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate text-gray-700">
                      {file.name || file.fileName || (file.publicId ? file.publicId.split('/').pop().replace(/_\d{14}$/, '') : 'Tài liệu không tên')}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Đang xử lý size'} • {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'Vừa tải lên'}
                    </p>
                  </div>
                  <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                    selectedFileIds.includes(file.id) ? "bg-purple-600 border-purple-600" : "border-gray-200 group-hover:border-purple-300"
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

export function AddQuizModal({ isOpen, onClose, campaign, availableQuizzes, setAvailableQuizzes, onSubmit }) {
  const [configs, setConfigs] = useState({});
  const [aiGeneratedQuizzes, setAiGeneratedQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState('library');

  const isUpdateMode = useMemo(() => {
    const rounds = campaign?.qualifying_rounds || campaign?.rounds || [];
    return rounds.some(r => (r.quizzes?.length || 0) > 0 || (r.quiz_ids?.length || 0) > 0);
  }, [campaign]);

  useEffect(() => {
    const rounds = campaign?.qualifying_rounds || campaign?.rounds;
    if (isOpen && rounds) {
      const initial = {};
      rounds.forEach(round => {
        const roundId = round.id || round.roundNumber || round.round_number;
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

  const allQuizzes = useMemo(() => {
    const combined = [...availableQuizzes, ...aiGeneratedQuizzes];
    const seen = new Set();
    return combined.filter(q => {
      const id = q.id || q._id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [availableQuizzes, aiGeneratedQuizzes]);

  const toggleQuiz = (rnum, quizId) => {
    setConfigs(prev => {
      const current = prev[rnum]?.quiz_ids || [];
      const updatedIds = current.includes(quizId) 
        ? current.filter(id => id !== quizId) 
        : [...current, quizId];
      return { ...prev, [rnum]: { ...prev[rnum], quiz_ids: updatedIds } };
    });
  };

  const handleUpdateSetting = (roundId, field, value) => {
    setConfigs(prev => ({ ...prev, [roundId]: { ...prev[roundId], [field]: value } }));
  };

  const handleAIGenerated = (quiz) => {
    const transformedQuiz = {
      ...quiz,
      question_count: quiz.questions?.length || 0,
      difficulty: quiz.difficulty?.toLowerCase() || 'easy',
      isAI: true
    };
    setAiGeneratedQuizzes(prev => [...prev, transformedQuiz]);
    if (typeof setAvailableQuizzes === 'function') {
      setAvailableQuizzes(prev => [...prev, transformedQuiz]);
    }
    setActiveTab('library');
  };

  const totalSelected = Object.values(configs).reduce((sum, cfg) => sum + (cfg.quiz_ids?.length || 0), 0);

  const handleSubmit = () => {
    if (totalSelected === 0) {
      toast.error('Vui lòng chọn ít nhất một quiz trước khi lưu');
      return;
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "h-[85vh] flex flex-col overflow-hidden transition-all duration-300",
        activeTab === 'ai' ? "max-w-4xl" : "max-w-xl"
      )}>
        <DialogHeader className="shrink-0 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-eco-blue/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-eco-blue" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {isUpdateMode ? 'Cập nhật Quiz vào vòng thi' : 'Thêm Quiz vào vòng thi'}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Chọn từ thư viện hoặc tạo mới bằng AI</p>
            </div>
          </div>

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

        <div className="flex-1 min-h-0 overflow-y-auto py-4">
          {activeTab === 'library' ? (
            <div className="space-y-5">
              {(campaign?.qualifying_rounds || campaign?.rounds)?.map((round) => {
                const roundId = round.id || round.roundNumber || round.round_number;
                const currentConfig = configs[roundId] || { quiz_ids: [] };
                return (
                  <div key={roundId} className="border p-4 rounded-xl space-y-3 bg-muted/5">
                    <div className="flex items-center justify-between border-b pb-2">
                       <h3 className="font-bold text-base text-eco-blue">
                        {round.roundName || round.round_name || `Vòng ${round.roundNumber}`}
                      </h3>
                      <Badge variant="secondary" className="text-xs border">
                        {currentConfig.quiz_ids.length} quiz đã chọn
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-1">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-muted-foreground uppercase">Số lượt làm tối đa</Label>
                        <input
                          type="number" min="1"
                          value={currentConfig.maxAttempts || 1}
                          onChange={(e) => handleUpdateSetting(roundId, 'maxAttempts', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-eco-blue/20 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {allQuizzes.map((quiz) => {
                        const isSelected = currentConfig.quiz_ids.includes(quiz.id);
                        return (
                          <div
                            key={quiz.id}
                            onClick={() => toggleQuiz(roundId, quiz.id)}
                            className={cn(
                              "flex items-center gap-3 p-2.5 rounded-xl border-2 cursor-pointer transition-all",
                              isSelected ? "bg-blue-50 border-blue-400 shadow-sm" : "border-border hover:border-blue-200 bg-background"
                            )}
                          >
                            <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0",
                              isSelected ? "border-blue-500 bg-blue-500" : "border-muted-foreground/30"
                            )}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className={cn("font-medium text-sm flex-1 flex items-center gap-1.5", isSelected ? "text-blue-900" : "text-foreground")}>
                              {quiz.isAI && <Sparkles className="w-3 h-3 text-purple-500 shrink-0" />}
                              {quiz.title || quiz.name}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge className={cn(difficultyConfig[quiz.difficulty]?.color, "border-0 text-[10px]")}>
                                {difficultyConfig[quiz.difficulty]?.label}
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">{quiz.question_count || 0} câu</Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <AIGeneratePanel 
              campaignId={campaign?.id} 
              rounds={campaign?.qualifying_rounds || campaign?.rounds || []}
              onGenerated={handleAIGenerated} 
            />
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="ghost" onClick={onClose} className="mr-auto">Hủy</Button>
          <Button onClick={handleSubmit} className="bg-eco-blue hover:bg-eco-blue/90 text-white min-w-[140px]">
            {isUpdateMode ? 'Cập nhật Quiz' : 'Lưu cấu hình Quiz'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
