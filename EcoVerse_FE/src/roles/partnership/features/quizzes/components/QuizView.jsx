import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Star } from 'lucide-react';

export function QuizView({ isOpen, onClose, quiz }) {
  if (!quiz) return null;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-eco-green/15 text-eco-green border-eco-green/25';
      case 'medium': return 'bg-eco-orange/15 text-eco-orange border-eco-orange/25';
      case 'hard': return 'bg-destructive/15 text-destructive border-destructive/25';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    return difficulty === 'easy' ? 'Dễ' : difficulty === 'medium' ? 'Trung bình' : 'Khó';
  };

  const getDifficultyStars = (difficulty) => {
    return difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{quiz.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getDifficultyColor(quiz.difficulty)}>
              {getDifficultyLabel(quiz.difficulty)}
            </Badge>
            <div className="flex items-center gap-1">
              {Array.from({ length: getDifficultyStars(quiz.difficulty) }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-eco-orange text-eco-orange" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground mb-1">Số câu hỏi</p>
              <p className="text-2xl font-bold">{quiz.question_count}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground mb-1">Thời gian/câu</p>
              <p className="text-2xl font-bold">{quiz.timeLimit}s</p>
            </div>
            <div className="p-4 rounded-lg bg-eco-blue/10 border border-eco-blue/20">
              <p className="text-sm text-muted-foreground mb-1">Điểm đạt</p>
              <p className="text-2xl font-bold text-eco-blue">{quiz.passingScore}%</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}