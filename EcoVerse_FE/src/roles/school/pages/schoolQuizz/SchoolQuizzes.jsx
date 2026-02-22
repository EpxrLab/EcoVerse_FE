import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Plus, FileQuestion, Globe, Pencil } from "lucide-react";
import { useQuizzes } from '../../features/quizzes/hooks/useQuizzes';
import { useQuizForm } from '../../features/quizzes/hooks';
import { QuizStats, QuizList, QuizForm } from '../../features/quizzes/components';

export default function SchoolQuizzes() {
  const {
    defaultQuizzes,
    customQuizzes,
    stats,
    getDifficultyStars,
    getDifficultyColor,
  } = useQuizzes();

  const {
    quizForm,
    updateQuizForm,
    resetQuizForm,
    questions,
    addQuestion,
    removeQuestion,
    questionForm,
    updateQuestionForm,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isAddQuestionOpen,
    setIsAddQuestionOpen,
  } = useQuizForm();

  const allQuizzes = [...defaultQuizzes, ...customQuizzes];
  const publishedQuizzes = customQuizzes.filter(q => q.status === 'published');
  const draftQuizzes = customQuizzes.filter(q => q.status === 'draft');

  const handleViewDetail = (quiz) => {
    console.log('View quiz:', quiz);
    // TODO: Implement view detail
  };

  const handleEditQuiz = (quiz) => {
    console.log('Edit quiz:', quiz);
    // TODO: Implement edit quiz
  };

  const handleDeleteQuiz = (id) => {
    console.log('Delete quiz:', id);
    // TODO: Implement delete quiz
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-eco-orange flex items-center justify-center">
            <FileQuestion className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quản lý Quiz</h1>
            <p className="text-muted-foreground">Tạo và quản lý quiz cho học sinh</p>
          </div>
        </div>

        {/* Create Quiz Button & Dialog */}
        <Button 
          className="bg-eco-green hover:bg-eco-green-dark text-primary-foreground font-semibold"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo Quiz
        </Button>
          
        <QuizForm 
            isOpen={isCreateDialogOpen}
            onClose={() => setIsCreateDialogOpen(false)}
            formData={quizForm}
            questions={questions}
            onFormChange={updateQuizForm}
            onAddQuestion={addQuestion}
            onRemoveQuestion={removeQuestion}
            onSubmit={() => {
                console.log("Submit quiz", quizForm, questions);
                setIsCreateDialogOpen(false);
                resetQuizForm();
            }}
        />
      </div>

      {/* Stats */}
      <QuizStats stats={stats} />

      {/* Quiz List */}
      <Tabs defaultValue="published" className="space-y-5">
        <TabsList className="bg-muted/50 p-1 border-2 border-eco-green/15 grid w-full grid-cols-2">
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
               <p className="text-sm text-muted-foreground">Các bài quiz đã xuất bản và quiz hệ thống sẵn sàng sử dụng</p>
             </div>
           </div>
          <QuizList
            quizzes={[...defaultQuizzes, ...publishedQuizzes]}
            onViewDetail={handleViewDetail}
            onEdit={(quiz) => {
                if ('status' in quiz) { // Check if it's a CustomQuiz
                   handleEditQuiz(quiz);
                } else {
                    console.log("Cannot edit system quiz");
                }
            }}
            onDelete={(id) => {
                 // Check if it's not a system quiz (system quizzes usually have id starting with 'default-')
                 // This is a basic check; robust logic depends on ID strategy or type
                 if (!id.startsWith('default-')) {
                     handleDeleteQuiz(id);
                 } else {
                     console.log("Cannot delete system quiz");
                 }
            }}
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
            getDifficultyStars={getDifficultyStars}
            getDifficultyColor={getDifficultyColor}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}