import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { FileQuestion, Plus, Star, Eye, Edit, Trash2, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/shared/components/ui/dropdown-menu';
import { useQuizForm } from '../../features/quizzes/hooks';
import { QuizView, QuizForm } from '../../features/quizzes/components';

// Mock data
const mockQuizzes = [
  { id: 'q1', title: 'Quiz Phân loại rác cơ bản', difficulty: 'easy', question_count: 10, timeLimit: 30, passingScore: 70 },
  { id: 'q2', title: 'Quiz Tái chế nhựa', difficulty: 'medium', question_count: 15, timeLimit: 45, passingScore: 75 },
  { id: 'q3', title: 'Quiz Bảo vệ môi trường', difficulty: 'hard', question_count: 20, timeLimit: 60, passingScore: 80 },
  { id: 'q4', title: 'Quiz Rác thải hữu cơ', difficulty: 'easy', question_count: 8, timeLimit: 25, passingScore: 65 },
];

export default function PartnershipQuizzes() {
  const {
    isCreateOpen,
    handleOpenCreate,
    handleCloseCreate,
    handleSubmit,
    isEditOpen,
    handleEdit,
    handleCloseEdit,
    handleUpdate,
    isViewOpen,
    handleView,
    handleCloseView,
    handleDelete,
    formData,
    updateFormData,
    selectedQuiz,
  } = useQuizForm();

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-eco-green/15 text-eco-green border-eco-green/25';
      case 'medium': return 'bg-eco-orange/15 text-eco-orange border-eco-orange/25';
      case 'hard': return 'bg-destructive/15 text-destructive border-destructive/25';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      default: return difficulty;
    }
  };

  const getDifficultyStars = (difficulty) => {
    return difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
  };

  const quizzesByDifficulty = {
    easy: mockQuizzes.filter(q => q.difficulty === 'easy'),
    medium: mockQuizzes.filter(q => q.difficulty === 'medium'),
    hard: mockQuizzes.filter(q => q.difficulty === 'hard'),
  };

  const renderTable = (quizzes) => (
    <div className="border-2 rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-bold">Tên quiz</TableHead>
            <TableHead className="font-bold">Độ khó</TableHead>
            <TableHead className="text-center font-bold">Số câu hỏi</TableHead>
            <TableHead className="text-center font-bold">Thời gian/câu</TableHead>
            <TableHead className="text-center font-bold">Điểm đạt</TableHead>
            <TableHead className="text-right font-bold">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quizzes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                Chưa có quiz nào
              </TableCell>
            </TableRow>
          ) : (
            quizzes.map((quiz) => (
              <TableRow key={quiz.id} className="hover:bg-muted/30">
                <TableCell>
                  <div>
                    <p className="font-semibold">{quiz.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: getDifficultyStars(quiz.difficulty) }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-eco-orange text-eco-orange" />
                      ))}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getDifficultyColor(quiz.difficulty)}>
                    {getDifficultyLabel(quiz.difficulty)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center font-bold">{quiz.question_count}</TableCell>
                <TableCell className="text-center font-bold">{quiz.timeLimit}s</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="bg-eco-blue/10 text-eco-blue border-eco-blue/20">
                    {quiz.passingScore}%
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(quiz)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(quiz)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(quiz)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-eco-orange flex items-center justify-center">
            <FileQuestion className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quản lý Quiz</h1>
            <p className="text-muted-foreground">Tạo và quản lý các bộ câu hỏi</p>
          </div>
        </div>
        <Button 
          className="bg-eco-orange hover:bg-eco-orange/90 text-primary-foreground font-semibold"
          onClick={handleOpenCreate}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo Quiz
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-eco-green/5 border-2 border-eco-green/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-eco-green/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-eco-green" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{quizzesByDifficulty.easy.length}</p>
              <p className="text-sm text-muted-foreground">Quiz Dễ</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-eco-orange/5 border-2 border-eco-orange/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-eco-orange/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-eco-orange" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{quizzesByDifficulty.medium.length}</p>
              <p className="text-sm text-muted-foreground">Quiz Trung bình</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-destructive/5 border-2 border-destructive/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{quizzesByDifficulty.hard.length}</p>
              <p className="text-sm text-muted-foreground">Quiz Khó</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-muted/50 border-2 border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <FileQuestion className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mockQuizzes.length}</p>
              <p className="text-sm text-muted-foreground">Tổng quiz</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Tabs */}
      <Tabs defaultValue="all" className="space-y-5">
        <TabsList className="bg-muted/50 p-1 border-2 border-eco-orange/15">
          <TabsTrigger value="all" className="gap-2 font-medium data-[state=active]:bg-card">
            Tất cả ({mockQuizzes.length})
          </TabsTrigger>
          <TabsTrigger value="easy" className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-eco-green">
            Dễ ({quizzesByDifficulty.easy.length})
          </TabsTrigger>
          <TabsTrigger value="medium" className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-eco-orange">
            Trung bình ({quizzesByDifficulty.medium.length})
          </TabsTrigger>
          <TabsTrigger value="hard" className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-destructive">
            Khó ({quizzesByDifficulty.hard.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {renderTable(mockQuizzes)}
        </TabsContent>

        <TabsContent value="easy">
          {renderTable(quizzesByDifficulty.easy)}
        </TabsContent>

        <TabsContent value="medium">
          {renderTable(quizzesByDifficulty.medium)}
        </TabsContent>

        <TabsContent value="hard">
          {renderTable(quizzesByDifficulty.hard)}
        </TabsContent>
      </Tabs>

      {/* Create Quiz Dialog */}
      <QuizForm
        isOpen={isCreateOpen}
        onClose={handleCloseCreate}
        formData={formData}
        onFormChange={updateFormData}
        onSubmit={handleSubmit}
      />

      {/* Edit Quiz Dialog */}
      <QuizForm
        isOpen={isEditOpen}
        onClose={handleCloseEdit}
        formData={formData}
        onFormChange={updateFormData}
        onSubmit={handleUpdate}
      />

      {/* View Quiz Dialog */}
      <QuizView
        isOpen={isViewOpen}
        onClose={handleCloseView}
        quiz={selectedQuiz}
      />
    </div>
  );
}