import { useState } from 'react';
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Plus, FileQuestion, Globe, Pencil, FileUp } from "lucide-react";
import { useQuizzes, useQuizForm, useQuizImport } from '../../features/quizzes/hooks';
import { QuizStats, QuizList, QuizForm, ImportQuizDialog, QuizDetailDialog, ConfirmDeleteDialog } from '../../features/quizzes/components';
import { toast } from 'sonner';
import { quizzesService } from '../../features/quizzes/services/quizzes.service';

export default function PartnershipQuizzes() {
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState([]);
  const [originalQuestions, setOriginalQuestions] = useState([]);

  const {
    defaultQuizzes,
    customQuizzes,
    stats,
    getDifficultyStars,
    getDifficultyColor,
    isLoading,
    refreshQuizzes,
  } = useQuizzes();

  const {
    quizForm,
    updateQuizForm,
    resetQuizForm,
    loadQuizForm,
    questions,
    addQuestion,
    removeQuestion,
    questionForm,
    updateQuestionForm,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    editingQuestionId,
    startEditQuestion,
    saveQuestion,
    cancelAddQuestion,
  } = useQuizForm();

  const {
    isImporting,
    importProgress,
    isImportDialogOpen,
    setIsImportDialogOpen,
    handleImport,
  } = useQuizImport();

  const allQuizzes = [...defaultQuizzes, ...customQuizzes];
  const publishedQuizzes = customQuizzes.filter(q => q.status === 'published');
  const draftQuizzes = customQuizzes.filter(q => q.status === 'draft');

  const handleViewDetail = (quiz) => {
    setSelectedQuizId(quiz.id);
    setIsDetailDialogOpen(true);
  };

  const handleOpenCreate = () => {
    setSelectedQuizId(null);
    setDeletedQuestionIds([]);
    setOriginalQuestions([]);
    resetQuizForm();
    setIsCreateDialogOpen(true);
  };

  const handleCloseForm = () => {
    setIsCreateDialogOpen(false);
    setSelectedQuizId(null);
    setDeletedQuestionIds([]);
    setOriginalQuestions([]);
    resetQuizForm();
  };

  const handleEditQuiz = async (quiz) => {
    if (quiz.status === 'published') {
        toast.error('Không thể sửa bài quiz đã xuất bản. Hãy chuyển về bản nháp trước.');
        return;
    }
    try {
        const response = await quizzesService.getQuizDetail(quiz.id);
        const detailedQuiz = response.data.data;
        
        const qData = detailedQuiz.questions.map(q => ({
          id: q.id,
          question: q.questionText,
          type: 'multiple_choice', 
          options: q.answers.map(a => a.answerText),
          correctAnswer: q.answers.find(a => a.correct)?.answerText,
          isExisting: true,
        }));

        loadQuizForm({
          title: detailedQuiz.title,
          description: detailedQuiz.description,
          difficulty: detailedQuiz.difficulty.toLowerCase(),
          timeLimit: detailedQuiz.timePerQuestion,
          passingScore: detailedQuiz.passScorePercentage,
          targetGrade: detailedQuiz.targetGrade,
          coinsOnPass: detailedQuiz.coinsOnPass,
        }, qData);
        
        setOriginalQuestions(JSON.parse(JSON.stringify(qData)));
        setDeletedQuestionIds([]);
        setSelectedQuizId(quiz.id);
        setIsCreateDialogOpen(true);
    } catch (error) {
        console.error('Failed to load quiz details for editing:', error);
        toast.error('Không thể tải chi tiết bài quiz để chỉnh sửa');
    }
  };

  const handleUpdateQuiz = async () => {
    setIsCreating(true);
    try {
      // 1. Update Quiz Metadata
      const updateData = {
        title: quizForm.title,
        description: quizForm.description,
        difficulty: quizForm.difficulty.toUpperCase(),
        quizType: 'MULTIPLE_CHOICE',
        targetGrade: quizForm.targetGrade,
        coinsOnPass: quizForm.coinsOnPass,
        timePerQuestion: quizForm.timeLimit,
        passScorePercentage: quizForm.passingScore,
      };
      
      await quizzesService.updateQuiz(selectedQuizId, updateData);

      // 2. Handle Deletions
      for (const questionId of deletedQuestionIds) {
          await quizzesService.deleteQuestion(selectedQuizId, questionId);
      }

      // 3. Handle Updates for ALL existing questions
      const existingQuestions = questions.filter(q => q.isExisting);
      for (const q of existingQuestions) {
          const original = originalQuestions.find(orig => orig.id == q.id);
          const newOrder = questions.indexOf(q) + 1;
          
          if (original) {
              const updateQData = {
                  questionOrder: newOrder,
                  questionText: q.question,
                  answers: q.type === 'multiple_choice' 
                    ? q.options.map(opt => ({
                        answerText: opt,
                        correct: opt === q.correctAnswer
                      }))
                    : [
                        { answerText: 'Đúng', correct: q.correctAnswer === 'true' },
                        { answerText: 'Sai', correct: q.correctAnswer === 'false' }
                      ]
              };
              await quizzesService.updateQuestion(selectedQuizId, q.id, updateQData);
          }
      }

      // 4. Add New Questions
      const newQuestions = questions.filter(q => !q.isExisting);
      if (newQuestions.length > 0) {
        const formattedNewQuestions = newQuestions.map((q, index) => ({
          questionOrder: (questions.length - newQuestions.length) + index + 1,
          questionText: q.question,
          answers: q.type === 'multiple_choice' 
            ? q.options.map(opt => ({
                answerText: opt,
                correct: opt === q.correctAnswer
              }))
            : [
                { answerText: 'Đúng', correct: q.correctAnswer === 'true' },
                { answerText: 'Sai', correct: q.correctAnswer === 'false' }
              ]
        }));

        await quizzesService.addQuestionsToQuiz(selectedQuizId, formattedNewQuestions);
      }
      
      toast.success('Cập nhật bài quiz thành công!');
      handleCloseForm();
      refreshQuizzes();
    } catch (error) {
      console.error('Failed to update quiz:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật bài quiz';
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const wrapRemoveQuestion = (id) => {
    const questionToRemove = questions.find(q => q.id == id);
    if (questionToRemove?.isExisting) {
        setDeletedQuestionIds(prev => [...prev, id]);
    }
    removeQuestion(id);
  };

  const handleCreateQuiz = async () => {
    setIsCreating(true);
    try {
      const apiData = {
        title: quizForm.title,
        description: quizForm.description,
        difficulty: quizForm.difficulty.toUpperCase(),
        quizType: 'MULTIPLE_CHOICE',
        targetGrade: quizForm.targetGrade,
        coinsOnPass: quizForm.coinsOnPass,
        timePerQuestion: quizForm.timeLimit,
        passScorePercentage: quizForm.passingScore,
        questions: questions.map((q, index) => ({
          questionOrder: index + 1,
          questionText: q.question,
          answers: q.type === 'multiple_choice' 
            ? q.options.map(opt => ({
                answerText: opt,
                correct: opt === q.correctAnswer
              }))
            : [
                { answerText: 'Đúng', correct: q.correctAnswer === 'true' },
                { answerText: 'Sai', correct: q.correctAnswer === 'false' }
              ]
        }))
      };

      await quizzesService.createManualQuiz(apiData);
      toast.success('Tạo bài quiz thành công!');
      setIsCreateDialogOpen(false);
      resetQuizForm();
      refreshQuizzes();
    } catch (error) {
      console.error('Failed to create quiz:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tạo bài quiz';
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteQuiz = (id) => {
    const quiz = allQuizzes.find(q => q.id === id);
    if (!quiz || quiz.status === 'published') {
        toast.error('Không thể xóa bài quiz đã xuất bản. Hãy chuyển về bản nháp trước.');
        return;
    }
    setQuizToDelete(quiz);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!quizToDelete) return;
    try {
        await quizzesService.deleteQuiz(quizToDelete.id);
        toast.success('Xóa bài quiz thành công!');
        refreshQuizzes();
    } catch (error) {
        console.error('Failed to delete quiz:', error);
        const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa bài quiz';
        toast.error(errorMessage);
    } finally {
        setIsDeleteDialogOpen(false);
        setQuizToDelete(null);
    }
  };

  const handlePublishQuiz = async (id, published) => {
    setIsPublishing(true);
    try {
      await quizzesService.publishQuiz(id, published);
      toast.success(published ? 'Xuất bản quiz thành công!' : 'Đã chuyển quiz về bản nháp');
      refreshQuizzes();
    } catch (error) {
      console.error('Failed to update quiz status:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái quiz';
      toast.error(errorMessage);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-eco-green-dark">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-eco-orange flex items-center justify-center">
            <FileQuestion className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quản lý Quiz</h1>
            <p className="text-muted-foreground">Tạo và quản lý quiz cho đối tác</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Import Button */}
          <Button 
            variant="outline"
            className="border-eco-orange text-eco-orange hover:bg-eco-orange/10 font-semibold"
            onClick={() => setIsImportDialogOpen(true)}
          >
            <FileUp className="w-4 h-4 mr-2" />
            Import
          </Button>

          {/* Create Quiz Button & Dialog */}
          <Button 
            className="bg-eco-orange hover:bg-eco-orange/90 text-primary-foreground font-semibold"
            onClick={handleOpenCreate}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo Quiz
          </Button>
        </div>
          
        <QuizForm 
            isOpen={isCreateDialogOpen}
            onClose={handleCloseForm}
            formData={quizForm}
            questions={questions}
            onFormChange={updateQuizForm}
            questionForm={questionForm}
            onQuestionFormChange={updateQuestionForm}
            onAddQuestion={addQuestion}
            onRemoveQuestion={wrapRemoveQuestion}
            onEditQuestion={startEditQuestion}
            onSubmit={selectedQuizId ? handleUpdateQuiz : handleCreateQuiz}
            isSubmitting={isCreating}
            isEdit={!!selectedQuizId}
            editingQuestionId={editingQuestionId}
            onSaveQuestion={saveQuestion}
            onCancelAddQuestion={cancelAddQuestion}
        />

        <ImportQuizDialog 
          isOpen={isImportDialogOpen}
          onClose={() => setIsImportDialogOpen(false)}
          onImport={(file) => handleImport(file, refreshQuizzes)}
          isImporting={isImporting}
          importProgress={importProgress}
        />

        <QuizDetailDialog
          isOpen={isDetailDialogOpen}
          onClose={() => {
            setIsDetailDialogOpen(false);
            setSelectedQuizId(null);
          }}
          quizId={selectedQuizId}
          getDifficultyStars={getDifficultyStars}
          getDifficultyColor={getDifficultyColor}
        />

        <ConfirmDeleteDialog
           isOpen={isDeleteDialogOpen}
           onClose={() => {
             setIsDeleteDialogOpen(false);
             setQuizToDelete(null);
           }}
           onConfirm={handleConfirmDelete}
           title={quizToDelete?.title}
        />
      </div>

      {/* Stats */}
      <QuizStats stats={stats} />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-eco-green/30 border-t-eco-green rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">Đang tải danh sách bài quiz...</p>
        </div>
      ) : (
        /* Quiz List */
        <Tabs defaultValue="published" className="space-y-5">
          <TabsList className="bg-muted/50 p-1 border-2 border-eco-orange/15 grid w-full grid-cols-2">
            <TabsTrigger value="published" className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-eco-green">
              <Globe className="w-4 h-4" />
              Đã xuất bản ({(defaultQuizzes.length + publishedQuizzes.length)})
            </TabsTrigger>
            <TabsTrigger value="draft" className="gap-2 font-medium data-[state=active]:bg-card data-[state=active]:text-eco-orange">
              <Pencil className="w-4 h-4" />
              Bản nháp ({draftQuizzes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="published" className="space-y-4 animate-fade-in">
             <div className="flex items-center justify-between">
               <div>
                 <h3 className="text-lg font-semibold text-eco-green flex items-center gap-2">
                   <Globe className="w-5 h-5" />
                   Thư viện Quiz
                 </h3>
                 <p className="text-sm text-muted-foreground">Các bài quiz đã xuất bản sẵn sàng sử dụng</p>
               </div>
             </div>
          <QuizList
            quizzes={[...defaultQuizzes, ...publishedQuizzes]}
            onViewDetail={handleViewDetail}
            onPublish={handlePublishQuiz}
            getDifficultyStars={getDifficultyStars}
            getDifficultyColor={getDifficultyColor}
          />
        </TabsContent>

        <TabsContent value="draft" className="space-y-4 animate-fade-in">
           <div className="flex items-center justify-between">
             <div>
               <h3 className="text-lg font-semibold text-eco-orange flex items-center gap-2">
                 <Pencil className="w-5 h-5" />
                 Bản nháp
               </h3>
               <p className="text-sm text-muted-foreground">Các bài quiz đang trong quá trình soạn thảo</p>
             </div>
           </div>
          <QuizList
            quizzes={draftQuizzes}
            onViewDetail={handleViewDetail}
            onEdit={handleEditQuiz}
            onDelete={handleDeleteQuiz}
            onPublish={handlePublishQuiz}
            getDifficultyStars={getDifficultyStars}
            getDifficultyColor={getDifficultyColor}
          />
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
}