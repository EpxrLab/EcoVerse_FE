import { useMemo } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Calendar,
  Brain,
  Gamepad2,
  Recycle,
  Zap,
  CheckCircle2,
  AlertCircle,
  Layers,
  Send,
  UserPlus,
} from 'lucide-react';
import { useState } from 'react';
import { StudentSelectionDialog } from './StudentSelectionDialog';
import { useStudents } from '../../../hooks/useStudents';
import { getGameLevelsForSchool } from '@/shared/data/admin-game-levels.data';

const difficultyConfig = {
  easy: { label: 'Dễ', color: 'bg-eco-green/15 text-eco-green' },
  medium: { label: 'Trung bình', color: 'bg-eco-orange/15 text-eco-orange' },
  hard: { label: 'Khó', color: 'bg-destructive/15 text-destructive' },
};

export function CampaignForm({
  mode,
  formData,
  availableClasses,
  availableQuizzes,
  gameTypes,
  onFormChange,
  onClassToggle,
  onStudentSelection,
  onQuizToggle,
  onGameToggle,
  onLevelToggle,
  onSubmit,
  onCancel,
}) {
  // Quiz validation
  const quizValidation = useMemo(() => {
    const selectedQuizzes = availableQuizzes.filter(q => formData.quiz_ids.includes(q.id));
    const hasEasy = selectedQuizzes.some(q => q.difficulty === 'easy');
    const hasMedium = selectedQuizzes.some(q => q.difficulty === 'medium');
    const hasHard = selectedQuizzes.some(q => q.difficulty === 'hard');
    return { hasEasy, hasMedium, hasHard, isValid: hasEasy && hasMedium && hasHard };
  }, [formData.quiz_ids, availableQuizzes]);

  const schoolGameLevels = useMemo(() => getGameLevelsForSchool(), []);

  // Level validation
  const levelValidation = useMemo(() => {
    const validation = {};
    
    formData.game_types.forEach(gameType => {
      const selectedLevelsForGame = schoolGameLevels.filter(
        level => formData.level_ids.includes(level.id) && level.gameType === gameType
      );
      
      const hasEasy = selectedLevelsForGame.some(l => l.difficulty === 'Dễ');
      const hasMedium = selectedLevelsForGame.some(l => l.difficulty === 'Trung bình');
      const hasHard = selectedLevelsForGame.some(l => l.difficulty === 'Khó');
      
      validation[gameType] = {
        hasEasy,
        hasMedium,
        hasHard,
        isValid: hasEasy && hasMedium && hasHard
      };
    });
    
    const allValid = formData.game_types.length === 0 || formData.game_types.every(gt => validation[gt]?.isValid);
    return { byGameType: validation, allValid };
  }, [formData.game_types, formData.level_ids]);
  
  // Student Selection Logic
  const { students: allStudents } = useStudents();
  const [studentSelectionClass, setStudentSelectionClass] = useState(null);
  
  const handleOpenStudentSelection = (cls, e) => {
    e.preventDefault(); // Prevent parent click (card toggle)
    e.stopPropagation();
    setStudentSelectionClass(cls);
  };
  
  const handleConfirmStudents = (studentIds) => {
    if (studentSelectionClass && onStudentSelection) {
      onStudentSelection(studentIds, studentSelectionClass.id);
    }
    setStudentSelectionClass(null);
  };
  
  const studentsForSelection = useMemo(() => {
    if (!studentSelectionClass) return [];
    return allStudents.filter(s => s.class === studentSelectionClass.name);
  }, [allStudents, studentSelectionClass]);

  // Group quizzes by difficulty
  const easyQuizzes = availableQuizzes.filter(q => q.difficulty === 'easy');
  const mediumQuizzes = availableQuizzes.filter(q => q.difficulty === 'medium');
  const hardQuizzes = availableQuizzes.filter(q => q.difficulty === 'hard');

  const isFormValid = 
    formData.name &&
    formData.start_date &&
    formData.end_date &&
    formData.class_ids.length > 0 &&
    quizValidation.isValid &&
    formData.game_types.length > 0 &&
    levelValidation.allValid;

  return (
    <div className="space-y-6 py-4">
      {/* Basic Info */}
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${mode}-name`}>Tên chiến dịch *</Label>
          <Input
            id={`${mode}-name`}
            value={formData.name}
            onChange={(e) => onFormChange({ name: e.target.value })}
            placeholder="Nhập tên chiến dịch"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${mode}-description`}>Mô tả</Label>
          <Textarea
            id={`${mode}-description`}
            value={formData.description}
            onChange={(e) => onFormChange({ description: e.target.value })}
            placeholder="Mô tả chi tiết về chiến dịch"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${mode}-start-date`}>
              <Calendar className="w-4 h-4 inline mr-1" />
              Ngày bắt đầu *
            </Label>
            <Input
              id={`${mode}-start-date`}
              type="date"
              value={formData.start_date}
              onChange={(e) => onFormChange({ start_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${mode}-end-date`}>
              <Calendar className="w-4 h-4 inline mr-1" />
              Ngày kết thúc *
            </Label>
            <Input
              id={`${mode}-end-date`}
              type="date"
              value={formData.end_date}
              onChange={(e) => onFormChange({ end_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${mode}-invite-date`}>
              <Send className="w-4 h-4 inline mr-1" />
              Ngày gửi mời
            </Label>
            <Input
              id={`${mode}-invite-date`}
              type="date"
              value={formData.invitation_send_date}
              onChange={(e) => onFormChange({ invitation_send_date: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Quiz Selection */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-eco-blue" />
          Chọn Quiz *
        </Label>
        <p className="text-xs text-muted-foreground">
          Cần ít nhất 1 quiz Dễ, 1 quiz Trung bình và 1 quiz Khó
        </p>
        <div className="flex items-center gap-4 text-xs">
          <span className={quizValidation.hasEasy ? 'text-eco-green' : 'text-destructive'}>
            Dễ: {quizValidation.hasEasy ? '✓' : '✗'}
          </span>
          <span className={quizValidation.hasMedium ? 'text-eco-green' : 'text-destructive'}>
            TB: {quizValidation.hasMedium ? '✓' : '✗'}
          </span>
          <span className={quizValidation.hasHard ? 'text-eco-green' : 'text-destructive'}>
            Khó: {quizValidation.hasHard ? '✓' : '✗'}
          </span>
        </div>

        <Card>
          <ScrollArea className="h-64">
            <div className="p-4 space-y-4">
              {/* Easy Quizzes */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Badge className={difficultyConfig.easy.color}>Dễ</Badge>
                  <span className="text-muted-foreground">({easyQuizzes.length} quiz)</span>
                </h4>
                <div className="space-y-2">
                  {easyQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={`${mode}-quiz-${quiz.id}`}
                        checked={formData.quiz_ids.includes(quiz.id)}
                        onCheckedChange={() => onQuizToggle(quiz.id)}
                      />
                      <label
                        htmlFor={`${mode}-quiz-${quiz.id}`}
                        className="flex-1 flex items-center justify-between cursor-pointer"
                      >
                        <span className="font-medium">{quiz.title}</span>
                        <Badge variant="outline">{quiz.questions} câu</Badge>
                      </label>
                    </div>
                  ))}
                  {easyQuizzes.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">Chưa có quiz dễ nào</p>
                  )}
                </div>
              </div>

              {/* Medium Quizzes */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Badge className={difficultyConfig.medium.color}>Trung bình</Badge>
                  <span className="text-muted-foreground">({mediumQuizzes.length} quiz)</span>
                </h4>
                <div className="space-y-2">
                  {mediumQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={`${mode}-quiz-${quiz.id}`}
                        checked={formData.quiz_ids.includes(quiz.id)}
                        onCheckedChange={() => onQuizToggle(quiz.id)}
                      />
                      <label
                        htmlFor={`${mode}-quiz-${quiz.id}`}
                        className="flex-1 flex items-center justify-between cursor-pointer"
                      >
                        <span className="font-medium">{quiz.title}</span>
                        <Badge variant="outline">{quiz.questions} câu</Badge>
                      </label>
                    </div>
                  ))}
                  {mediumQuizzes.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">Chưa có quiz trung bình nào</p>
                  )}
                </div>
              </div>

              {/* Hard Quizzes */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Badge className={difficultyConfig.hard.color}>Khó</Badge>
                  <span className="text-muted-foreground">({hardQuizzes.length} quiz)</span>
                </h4>
                <div className="space-y-2">
                  {hardQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={`${mode}-quiz-${quiz.id}`}
                        checked={formData.quiz_ids.includes(quiz.id)}
                        onCheckedChange={() => onQuizToggle(quiz.id)}
                      />
                      <label
                        htmlFor={`${mode}-quiz-${quiz.id}`}
                        className="flex-1 flex items-center justify-between cursor-pointer"
                      >
                        <span className="font-medium">{quiz.title}</span>
                        <Badge variant="outline">{quiz.questions} câu</Badge>
                      </label>
                    </div>
                  ))}
                  {hardQuizzes.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">Chưa có quiz khó nào</p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </Card>
        {formData.quiz_ids.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Đã chọn {formData.quiz_ids.length} quiz
          </p>
        )}
      </div>

      {/* Game Selection */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-eco-orange" />
          Chọn loại Game *
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {gameTypes.map((game) => (
            <Card
              key={game.id}
              className={`cursor-pointer transition-all ${
                formData.game_types.includes(game.id)
                  ? 'border-2 border-eco-green bg-eco-green/5'
                  : 'border-2 hover:border-muted-foreground/50'
              }`}
              onClick={() => onGameToggle(game.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    formData.game_types.includes(game.id)
                      ? 'bg-eco-green/15'
                      : 'bg-muted'
                  }`}>
                    {game.id === 'sorting' ? (
                      <Recycle className={`w-5 h-5 ${
                        formData.game_types.includes(game.id) ? 'text-eco-green' : 'text-muted-foreground'
                      }`} />
                    ) : (
                      <Zap className={`w-5 h-5 ${
                        formData.game_types.includes(game.id) ? 'text-eco-green' : 'text-muted-foreground'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{game.name}</h4>
                      {formData.game_types.includes(game.id) && (
                        <CheckCircle2 className="w-4 h-4 text-eco-green" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {game.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {formData.game_types.length === 0 && (
          <p className="text-sm text-destructive">Vui lòng chọn ít nhất 1 loại game</p>
        )}
      </div>

      {/* Level Selection - Show only for selected game types */}
      {formData.game_types.length > 0 && (
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-eco-purple" />
            Chọn cấp độ game *
          </Label>
          <p className="text-xs text-muted-foreground">
            Mỗi loại game cần ít nhất 1 cấp độ Dễ, 1 Trung bình và 1 Khó
          </p>

          {formData.game_types.map((gameType) => {
            const gameName = gameTypes.find(g => g.id === gameType)?.name || gameType;
            const levelsForGame = schoolGameLevels.filter(l => l.gameType === gameType);
            const validation = levelValidation.byGameType[gameType] || { hasEasy: false, hasMedium: false, hasHard: false, isValid: false };

            return (
              <div key={gameType} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    {gameType === 'sorting' ? <Recycle className="w-4 h-4 text-eco-green" /> : <Zap className="w-4 h-4 text-eco-blue" />}
                    {gameName}
                  </h4>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={validation.hasEasy ? 'text-eco-green' : 'text-destructive'}>
                      Dễ: {validation.hasEasy ? '✓' : '✗'}
                    </span>
                    <span className={validation.hasMedium ? 'text-eco-green' : 'text-destructive'}>
                      TB: {validation.hasMedium ? '✓' : '✗'}
                    </span>
                    <span className={validation.hasHard ? 'text-eco-green' : 'text-destructive'}>
                      Khó: {validation.hasHard ? '✓' : '✗'}
                    </span>
                  </div>
                </div>

                {!validation.isValid && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-eco-orange/10 text-eco-orange text-xs">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>Cần chọn ít nhất 1 cấp độ Dễ, 1 Trung bình và 1 Khó</span>
                  </div>
                )}

                <Card>
                  <ScrollArea className="h-48">
                    <div className="p-3 space-y-3">
                      {/* Easy Levels */}
                      {levelsForGame.filter(l => l.difficulty === 'Dễ').length > 0 && (
                        <div>
                          <h5 className="text-xs font-medium mb-2 text-eco-green">Dễ</h5>
                          <div className="space-y-1">
                            {levelsForGame.filter(l => l.difficulty === 'Dễ').map((level) => (
                              <div key={level.id} className="flex items-center space-x-2 p-1.5 rounded hover:bg-muted/50">
                                <Checkbox
                                  id={`${mode}-level-${level.id}`}
                                  checked={formData.level_ids.includes(level.id)}
                                  onCheckedChange={() => onLevelToggle(level.id)}
                                />
                                <label htmlFor={`${mode}-level-${level.id}`} className="flex-1 flex items-center justify-between cursor-pointer text-sm">
                                  <span>{level.name}</span>
                                  <Badge variant="outline" className="text-xs">+{level.coinsReward} xu</Badge>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Medium Levels */}
                      {levelsForGame.filter(l => l.difficulty === 'Trung bình').length > 0 && (
                        <div>
                          <h5 className="text-xs font-medium mb-2 text-eco-orange">Trung bình</h5>
                          <div className="space-y-1">
                            {levelsForGame.filter(l => l.difficulty === 'Trung bình').map((level) => (
                              <div key={level.id} className="flex items-center space-x-2 p-1.5 rounded hover:bg-muted/50">
                                <Checkbox
                                  id={`${mode}-level-${level.id}`}
                                  checked={formData.level_ids.includes(level.id)}
                                  onCheckedChange={() => onLevelToggle(level.id)}
                                />
                                <label htmlFor={`${mode}-level-${level.id}`} className="flex-1 flex items-center justify-between cursor-pointer text-sm">
                                  <span>{level.name}</span>
                                  <Badge variant="outline" className="text-xs">+{level.coinsReward} xu</Badge>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Hard Levels */}
                      {levelsForGame.filter(l => l.difficulty === 'Khó').length > 0 && (
                        <div>
                          <h5 className="text-xs font-medium mb-2 text-destructive">Khó</h5>
                          <div className="space-y-1">
                            {levelsForGame.filter(l => l.difficulty === 'Khó').map((level) => (
                              <div key={level.id} className="flex items-center space-x-2 p-1.5 rounded hover:bg-muted/50">
                                <Checkbox
                                  id={`${mode}-level-${level.id}`}
                                  checked={formData.level_ids.includes(level.id)}
                                  onCheckedChange={() => onLevelToggle(level.id)}
                                />
                                <label htmlFor={`${mode}-level-${level.id}`} className="flex-1 flex items-center justify-between cursor-pointer text-sm">
                                  <span>{level.name}</span>
                                  <Badge variant="outline" className="text-xs">+{level.coinsReward} xu</Badge>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Class Selection */}
      <div className="space-y-2">
        <Label>Chọn lớp tham gia *</Label>
        <Card>
          <ScrollArea className="h-48">
            <div className="p-4 space-y-2">
              {availableClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={`${mode}-class-${cls.id}`}
                    checked={formData.class_ids.includes(cls.id)}
                    onCheckedChange={() => onClassToggle(cls.id)}
                  />
                  <label
                    htmlFor={`${mode}-class-${cls.id}`}
                    className="flex-1 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <span className="font-medium">{cls.name}</span>
                      <span className="text-muted-foreground ml-2">Khối {cls.grade}</span>
                    </div>
                    <Badge variant="outline">{cls.students_count} học sinh</Badge>
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        className="ml-2 h-8 w-8 p-0"
                        onClick={(e) => handleOpenStudentSelection(cls, e)}
                        title="Chọn học sinh cụ thể"
                    >
                        <UserPlus className="h-4 w-4 text-eco-blue" />
                    </Button>
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
        
        {/* Student Selection Dialog */}
        {studentSelectionClass && onStudentSelection && (
            <StudentSelectionDialog
                isOpen={!!studentSelectionClass}
                onClose={() => setStudentSelectionClass(null)}
                onConfirm={handleConfirmStudents}
                studentLimit={studentSelectionClass.students_count}
                students={studentsForSelection}
                campaignName={`Lớp ${studentSelectionClass.name}`}
            />
        )}

        {formData.class_ids.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Đã chọn {formData.class_ids.length} lớp với tổng{' '}
            {availableClasses
              .filter((c) => formData.class_ids.includes(c.id))
              .reduce((sum, c) => sum + c.students_count, 0)}{' '}
            học sinh
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!isFormValid}
          className="bg-eco-green hover:bg-eco-green/90"
        >
          {mode === 'create' ? 'Tạo chiến dịch' : 'Cập nhật chiến dịch'}
        </Button>
      </div>
    </div>
  );
}