import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import { Plus, Trash2, Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useState } from 'react';

export function QuizForm({
  isOpen,
  onClose,
  formData,
  onFormChange,
  onSubmit,
}) {
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    answers: ['', '', '', ''],
    correctAnswer: 0,
  });

  const addQuestion = () => {
    if (!currentQuestion.question || currentQuestion.answers.some(a => !a)) {
      alert('Vui lòng điền đầy đủ câu hỏi và 4 đáp án');
      return;
    }

    const newQuestion = {
      id: Date.now().toString(),
      ...currentQuestion,
    };

    onFormChange({ questions: [...formData.questions, newQuestion] });
    setCurrentQuestion({ question: '', answers: ['', '', '', ''], correctAnswer: 0 });
  };

  const removeQuestion = (id) => {
    onFormChange({ questions: formData.questions.filter(q => q.id !== id) });
  };

  const isFormValid = formData.title && formData.timeLimit > 0 && formData.passingScore > 0 && formData.passingScore <= 100 && formData.questions.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Tạo Quiz mới</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Thông tin Quiz</TabsTrigger>
            <TabsTrigger value="questions">
              Câu hỏi ({formData.questions.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Quiz Info */}
          <TabsContent value="info" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề Quiz *</Label>
              <Input
                id="title"
                placeholder="VD: Quiz Phân loại rác cơ bản"
                value={formData.title}
                onChange={(e) => onFormChange({ title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả ngắn về quiz..."
                rows={3}
                value={formData.description}
                onChange={(e) => onFormChange({ description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Độ khó *</Label>
              <div className="grid grid-cols-3 gap-2">
                {['easy', 'medium', 'hard'].map((diff) => (
                  <Button
                    key={diff}
                    type="button"
                    variant={formData.difficulty === diff ? "default" : "outline"}
                    className={cn(
                      "border-2",
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
                <Label htmlFor="timeLimit">Thời gian/câu (giây) *</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min={5}
                  max={300}
                  value={formData.timeLimit}
                  onChange={(e) => onFormChange({ timeLimit: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passingScore">Điểm đạt (%) *</Label>
                <Input
                  id="passingScore"
                  type="number"
                  min={1}
                  max={100}
                  value={formData.passingScore}
                  onChange={(e) => onFormChange({ passingScore: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Questions */}
          <TabsContent value="questions" className="space-y-4">
            {/* Add Question Form */}
            <div className="p-4 border-2 rounded-xl space-y-3 bg-muted/30">
              <h3 className="font-bold">Thêm câu hỏi mới</h3>
              <div className="space-y-2">
                <Label>Câu hỏi</Label>
                <Input
                  placeholder="Nhập câu hỏi..."
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Đáp án (chọn đáp án đúng)</Label>
                {currentQuestion.answers.map((answer, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={currentQuestion.correctAnswer === idx ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "w-8 h-8 p-0",
                        currentQuestion.correctAnswer === idx && "bg-eco-green hover:bg-eco-green/90"
                      )}
                      onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: idx })}
                    >
                      {currentQuestion.correctAnswer === idx && <Check className="w-4 h-4" />}
                    </Button>
                    <Input
                      placeholder={`Đáp án ${idx + 1}`}
                      value={answer}
                      onChange={(e) => {
                        const newAnswers = [...currentQuestion.answers];
                        newAnswers[idx] = e.target.value;
                        setCurrentQuestion({ ...currentQuestion, answers: newAnswers });
                      }}
                    />
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-2"
                onClick={addQuestion}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm câu hỏi
              </Button>
            </div>

            {/* Questions List */}
            <div className="space-y-2">
              <h3 className="font-bold">Danh sách câu hỏi ({formData.questions.length})</h3>
              {formData.questions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-xl">
                  Chưa có câu hỏi nào
                </p>
              ) : (
                formData.questions.map((q, idx) => (
                  <div key={q.id} className="p-3 border-2 rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold">Câu {idx + 1}: {q.question}</p>
                        <div className="mt-2 space-y-1">
                          {q.answers.map((a, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <Badge variant={i === q.correctAnswer ? "default" : "outline"} className={i === q.correctAnswer ? "bg-eco-green" : ""}>
                                {String.fromCharCode(65 + i)}
                              </Badge>
                              <span>{a}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => removeQuestion(q.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" className="flex-1 border-2" onClick={onClose}>
            Hủy
          </Button>
          <Button
            className="flex-1 bg-eco-orange hover:bg-eco-orange/90 text-primary-foreground font-semibold"
            onClick={onSubmit}
            disabled={!isFormValid}
          >
            Tạo Quiz ({formData.questions.length} câu)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}