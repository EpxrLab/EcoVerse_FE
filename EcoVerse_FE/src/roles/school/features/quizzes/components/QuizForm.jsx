import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Plus, Trash2, Check, Leaf } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useState } from 'react';

export function QuizForm({
  isOpen,
  onClose,
  formData,
  questions,
  onFormChange,
  onAddQuestion,
  onRemoveQuestion,
  onSubmit,
}) {
  // Local state for new question creation
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    type: 'multiple_choice',
    options: ['', '', '', ''],
    correctAnswer: 0, // index for multiple choice
    trueFalseAnswer: 'true', // string for true/false
  });

  const handleAddQuestion = () => {
    if (!currentQuestion.question) {
        // Basic validation
        return; 
    }

    const newQuestion = {
      id: Date.now().toString(),
      question: currentQuestion.question,
      type: currentQuestion.type,
      options: currentQuestion.type === 'multiple_choice' ? currentQuestion.options : undefined,
      correctAnswer: currentQuestion.type === 'multiple_choice' 
        ? currentQuestion.options[currentQuestion.correctAnswer] // Store actual value or index? 
        // Note: Partnership stores index but hook stores string in previous version.
        // Let's adapt to hook: `correctAnswer` is string or boolean.
        // If multiple choice, we store the value of the option?
        // Let's store the index for now to be safe or string.
        // Based on `useQuizForm`, `correctAnswer` is string | boolean.
        : currentQuestion.trueFalseAnswer,
    };

    // If multiple choice, correct answer is the string value at index?
    if (currentQuestion.type === 'multiple_choice') {
        newQuestion.correctAnswer = currentQuestion.options[currentQuestion.correctAnswer];
    } else if (currentQuestion.type === 'true_false') {
        newQuestion.correctAnswer = currentQuestion.trueFalseAnswer;
    }

    onAddQuestion(newQuestion);
    
    // Reset
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
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Leaf className="w-5 h-5 text-eco-green" />
            Tạo Quiz mới
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Thông tin Quiz</TabsTrigger>
            <TabsTrigger value="questions">
              Câu hỏi ({questions.length})
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
                <Label>Loại câu hỏi</Label>
                <Select 
                    value={currentQuestion.type} 
                    onValueChange={(val) => setCurrentQuestion(prev => ({ ...prev, type: val }))}
                >
                    <SelectTrigger>
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="multiple_choice">Trắc nghiệm</SelectItem>
                    <SelectItem value="true_false">Đúng/Sai</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Câu hỏi</Label>
                <Input
                  placeholder="Nhập câu hỏi..."
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                />
              </div>

              {currentQuestion.type === 'multiple_choice' && (
                  <div className="space-y-2">
                    <Label>Đáp án (chọn đáp án đúng)</Label>
                    {currentQuestion.options.map((answer, idx) => (
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
                            const newAnswers = [...currentQuestion.options];
                            newAnswers[idx] = e.target.value;
                            setCurrentQuestion({ ...currentQuestion, options: newAnswers });
                          }}
                        />
                      </div>
                    ))}
                  </div>
              )}

              {currentQuestion.type === 'true_false' && (
                  <div className="space-y-2">
                    <Label>Đáp án đúng</Label>
                    <RadioGroup 
                        value={currentQuestion.trueFalseAnswer} 
                        onValueChange={(val) => setCurrentQuestion({...currentQuestion, trueFalseAnswer: val})}
                        className="flex gap-4"
                    >
                        <div className="flex items-center gap-2">
                        <RadioGroupItem value="true" id="true" />
                        <Label htmlFor="true">Đúng</Label>
                        </div>
                        <div className="flex items-center gap-2">
                        <RadioGroupItem value="false" id="false" />
                        <Label htmlFor="false">Sai</Label>
                        </div>
                    </RadioGroup>
                  </div>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full border-2"
                onClick={handleAddQuestion}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm câu hỏi
              </Button>
            </div>

            {/* Questions List */}
            <div className="space-y-2">
              <h3 className="font-bold">Danh sách câu hỏi ({questions.length})</h3>
              {questions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-xl">
                  Chưa có câu hỏi nào
                </p>
              ) : (
                questions.map((q, idx) => (
                  <div key={q.id} className="p-3 border-2 rounded-lg bg-card">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold">Câu {idx + 1}: {q.question}</p>
                        <p className="text-xs text-muted-foreground mb-2">
                             {q.type === 'multiple_choice' ? 'Trắc nghiệm' : 'Đúng/Sai'}
                        </p>
                        {q.options && (
                            <div className="space-y-1">
                            {q.options.map((a, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                <Badge 
                                    variant={a === q.correctAnswer ? "default" : "outline"} 
                                    className={cn(
                                        a === q.correctAnswer ? "bg-eco-green" : ""
                                    )}
                                >
                                    {String.fromCharCode(65 + i)}
                                </Badge>
                                <span>{a}</span>
                                </div>
                            ))}
                            </div>
                        )}
                         {!q.options && (
                             <Badge className="bg-eco-green">
                                 Đáp án: {q.correctAnswer === 'true' ? 'Đúng' : 'Sai'}
                             </Badge>
                         )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => onRemoveQuestion(q.id)}
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
            Tạo Quiz ({questions.length} câu)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}