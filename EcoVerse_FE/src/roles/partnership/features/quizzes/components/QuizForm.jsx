import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Plus, Trash2, Check, Leaf, Loader2, Pencil } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useEffect, useState } from 'react';

export function QuizForm({
  isOpen,
  onClose,
  formData,
  questions,
  onFormChange,
  onAddQuestion,
  onRemoveQuestion,
  onEditQuestion,
  onSubmit,
  isSubmitting = false,
  isEdit = false,
  editingQuestionId = null,
  onSaveQuestion,
  onCancelAddQuestion,
  questionForm: hookQuestionForm,
}) {
  // Local state for new question creation
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    type: 'multiple_choice',
    options: ['', '', '', ''],
    correctAnswer: 0,
    trueFalseAnswer: 'true',
  });

  // Sync with hook state when editing starts
  useEffect(() => {
    if (editingQuestionId && hookQuestionForm) {
      const isMultipleChoice = hookQuestionForm.type === 'multiple_choice';
      setCurrentQuestion({
        question: hookQuestionForm.question,
        type: hookQuestionForm.type,
        options: hookQuestionForm.options || ['', '', '', ''],
        correctAnswer: isMultipleChoice 
          ? (hookQuestionForm.options?.indexOf(hookQuestionForm.correctAnswer) ?? 0)
          : 0,
        trueFalseAnswer: isMultipleChoice ? 'true' : String(hookQuestionForm.correctAnswer),
      });
    } else if (!editingQuestionId) {
      setCurrentQuestion({
        question: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correctAnswer: 0,
        trueFalseAnswer: 'true',
      });
    }
  }, [editingQuestionId, hookQuestionForm]);

  const handleAddQuestion = () => {
    if (!currentQuestion.question) {
        return; 
    }

    const qData = {
      id: editingQuestionId || Date.now().toString(),
      question: currentQuestion.question,
      type: currentQuestion.type,
      options: currentQuestion.type === 'multiple_choice' ? currentQuestion.options : undefined,
      correctAnswer: currentQuestion.type === 'multiple_choice' 
        ? currentQuestion.options[currentQuestion.correctAnswer]
        : currentQuestion.trueFalseAnswer,
    };

    if (editingQuestionId) {
        onSaveQuestion(qData);
    } else {
        onAddQuestion(qData);
    }

    // Reset local state
    setCurrentQuestion({
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      trueFalseAnswer: 'true',
    });
  };

  const isFormValid = formData.title && formData.timeLimit > 0 && formData.passingScore > 0 && questions.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-eco-green-dark">
            <Leaf className="w-5 h-5 text-eco-green" />
            {isEdit ? 'Cập nhật bài Quiz' : 'Tạo Quiz mới'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 border-2 border-eco-green/15">
            <TabsTrigger value="info" className="data-[state=active]:bg-card data-[state=active]:text-eco-green">Thông tin Quiz</TabsTrigger>
            <TabsTrigger value="questions" className="data-[state=active]:bg-card data-[state=active]:text-eco-green">
              Câu hỏi ({questions.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Quiz Info */}
          <TabsContent value="info" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-semibold">Tiêu đề Quiz *</Label>
              <Input
                id="title"
                placeholder="VD: Quiz Phân loại rác cơ bản"
                value={formData.title}
                onChange={(e) => onFormChange({ title: e.target.value })}
                className="border-2 focus-visible:ring-eco-green"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả ngắn về quiz..."
                rows={3}
                value={formData.description}
                onChange={(e) => onFormChange({ description: e.target.value })}
                className="border-2 focus-visible:ring-eco-green"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Độ khó *</Label>
              <div className="grid grid-cols-3 gap-2">
                {['easy', 'medium', 'hard'].map((diff) => (
                  <Button
                    key={diff}
                    type="button"
                    variant={formData.difficulty === diff ? "default" : "outline"}
                    className={cn(
                      "border-2 font-medium",
                      formData.difficulty === diff && diff === 'easy' && "bg-eco-green hover:bg-eco-green/90",
                      formData.difficulty === diff && diff === 'medium' && "bg-eco-orange hover:bg-eco-orange/90",
                      formData.difficulty === diff && diff === 'hard' && "bg-destructive hover:bg-destructive/90"
                    )}
                    onClick={() => onFormChange({ difficulty: diff })}
                  >
                    {diff === 'easy' ? 'Dễ' : diff === 'medium' ? 'Trung bình' : 'Khó'}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeLimit" className="font-semibold">Thời gian/câu (giây) *</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min={5}
                  max={300}
                  value={formData.timeLimit}
                  onChange={(e) => onFormChange({ timeLimit: parseInt(e.target.value) || 0 })}
                  className="border-2 focus-visible:ring-eco-green"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passingScore" className="font-semibold">Điểm đạt (%) *</Label>
                <Input
                  id="passingScore"
                  type="number"
                  min={1}
                  max={100}
                  value={formData.passingScore}
                  onChange={(e) => onFormChange({ passingScore: parseInt(e.target.value) || 0 })}
                  className="border-2 focus-visible:ring-eco-green"
                />
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Questions */}
          <TabsContent value="questions" className="space-y-4">
            <div className="p-4 border-2 rounded-xl space-y-3 bg-muted/30 border-eco-green/20">
              <h3 className="font-bold text-eco-green-dark">{editingQuestionId ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}</h3>
              
              <div className="space-y-2">
                <Label className="font-semibold">Loại câu hỏi</Label>
                <Select 
                    value={currentQuestion.type} 
                    onValueChange={(val) => setCurrentQuestion(prev => ({ ...prev, type: val }))}
                >
                    <SelectTrigger className="border-2">
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="multiple_choice">Trắc nghiệm</SelectItem>
                    <SelectItem value="true_false">Đúng/Sai</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Câu hỏi</Label>
                <Input
                  placeholder="Nhập câu hỏi..."
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                  className="border-2 focus-visible:ring-eco-green"
                />
              </div>

              {currentQuestion.type === 'multiple_choice' && (
                  <div className="space-y-2">
                    <Label className="font-semibold">Đáp án (chọn đáp án đúng)</Label>
                    {currentQuestion.options.map((answer, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant={currentQuestion.correctAnswer === idx ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "w-8 h-8 p-0 border-2",
                            currentQuestion.correctAnswer === idx && "bg-eco-green hover:bg-eco-green/90 border-eco-green"
                          )}
                          onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: idx })}
                        >
                          {currentQuestion.correctAnswer === idx && <Check className="w-4 h-4" />}
                        </Button>
                        <Input
                          placeholder={`Đáp án ${idx + 1}`}
                          value={answer}
                          onChange={(e) => {
                            const newAnswers = [...currentQuestion.options];
                            newAnswers[idx] = e.target.value;
                            setCurrentQuestion({ ...currentQuestion, options: newAnswers });
                          }}
                          className="border-2 focus-visible:ring-eco-green"
                        />
                      </div>
                    ))}
                  </div>
              )}

              {currentQuestion.type === 'true_false' && (
                  <div className="space-y-2">
                    <Label className="font-semibold">Đáp án đúng</Label>
                    <RadioGroup 
                        value={currentQuestion.trueFalseAnswer} 
                        onValueChange={(val) => setCurrentQuestion({...currentQuestion, trueFalseAnswer: val})}
                        className="flex gap-4"
                    >
                        <div className="flex items-center gap-2">
                        <RadioGroupItem value="true" id="true" className="text-eco-green" />
                        <Label htmlFor="true">Đúng</Label>
                        </div>
                        <div className="flex items-center gap-2">
                        <RadioGroupItem value="false" id="false" className="text-eco-green" />
                        <Label htmlFor="false">Sai</Label>
                        </div>
                    </RadioGroup>
                  </div>
              )}

              <Button
                type="button"
                variant={editingQuestionId ? "default" : "outline"}
                className={cn(
                    "w-full border-2 transition-all duration-300",
                    editingQuestionId 
                        ? "bg-eco-blue hover:bg-eco-blue-dark border-eco-blue text-white shadow-md" 
                        : "border-dashed border-eco-green text-eco-green hover:bg-eco-green/10"
                )}
                onClick={handleAddQuestion}
              >
                {editingQuestionId ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {editingQuestionId ? 'Cập nhật câu hỏi' : 'Thêm câu hỏi'}
              </Button>
              {editingQuestionId && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-xs text-muted-foreground mt-1"
                    onClick={onCancelAddQuestion}
                  >
                    Hủy sửa
                  </Button>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              <h3 className="font-bold text-eco-green-dark">Danh sách câu hỏi ({questions.length})</h3>
              {questions.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-xl bg-muted/5">
                  <Plus className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p>Chưa có câu hỏi nào</p>
                </div>
              ) : (
                questions.map((q, idx) => (
                  <div key={q.id} className="p-4 border-2 rounded-xl bg-card hover:border-eco-green/40 transition-colors shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-bold text-eco-green-dark mb-1">Câu {idx + 1}: {q.question}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                             {q.type === 'multiple_choice' ? 'Trắc nghiệm' : 'Đúng/Sai'}
                        </p>
                        {q.options && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                            {q.options.map((a, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm bg-muted/30 p-2 rounded-lg border border-transparent hover:border-eco-green/20">
                                <Badge 
                                    variant={a === q.correctAnswer ? "default" : "outline"} 
                                    className={cn(
                                        "w-5 h-5 p-0 flex items-center justify-center shrink-0",
                                        a === q.correctAnswer ? "bg-eco-green" : ""
                                    )}
                                >
                                    {String.fromCharCode(65 + i)}
                                </Badge>
                                <span className={cn(a === q.correctAnswer ? "font-bold text-eco-green" : "text-muted-foreground")}>{a}</span>
                                </div>
                            ))}
                            </div>
                        )}
                         {!q.options && (
                             <div className="mt-2">
                                <Badge className="bg-eco-green px-3 py-1">
                                    Đáp án: {q.correctAnswer === 'true' ? 'Đúng' : 'Sai'}
                                </Badge>
                             </div>
                         )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0 text-eco-blue hover:text-eco-blue hover:bg-eco-blue/10"
                          onClick={() => onEditQuestion(q.id)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onRemoveQuestion(q.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t mt-4">
          <Button variant="outline" className="flex-1 h-11 border-2 font-bold" onClick={onClose}>
            Hủy
          </Button>
          <Button
            className="flex-1 h-11 bg-eco-orange hover:bg-eco-orange-dark text-white font-bold shadow-lg shadow-eco-orange/20"
            onClick={onSubmit}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {isEdit ? 'Đang cập nhật...' : 'Đang tạo...'}
              </>
            ) : (
              `${isEdit ? 'Cập nhật' : 'Tạo'} Quiz (${questions.length} câu)`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}