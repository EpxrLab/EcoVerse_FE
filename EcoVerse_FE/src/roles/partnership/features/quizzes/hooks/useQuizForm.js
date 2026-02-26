import { useState } from 'react';

export function useQuizForm() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'easy',
    description: '',
    timeLimit: 30,
    passingScore: 70,
    questions: [],
  });

  const handleOpenCreate = () => {
    setIsCreateOpen(true);
  };

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
    resetForm();
  };

  const handleView = (quiz) => {
    setSelectedQuiz(quiz);
    setIsViewOpen(true);
  };

  const handleCloseView = () => {
    setIsViewOpen(false);
    setSelectedQuiz(null);
  };

  const handleEdit = (quiz) => {
    setSelectedQuiz(quiz);
    setFormData({
      title: quiz.title,
      difficulty: quiz.difficulty,
      description: quiz.description || '',
      timeLimit: quiz.timeLimit || 30,
      passingScore: quiz.passingScore || 70,
      questions: [],
    });
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setSelectedQuiz(null);
    resetForm();
  };

  const handleDelete = (quiz) => {
    if (confirm(`Bạn có chắc muốn xóa quiz "${quiz.title}"?\n\nQuiz này có ${quiz.question_count} câu hỏi.`)) {
      console.log('Deleting quiz:', quiz.id);
      alert('Quiz đã được xóa thành công!');
    }
  };

  const updateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      difficulty: 'easy',
      description: '',
      timeLimit: 30,
      passingScore: 70,
      questions: [],
    });
  };

  const handleSubmit = () => {
    console.log('Creating quiz:', formData);
    alert(`Quiz "${formData.title}" đã được tạo với ${formData.questions.length} câu hỏi!`);
    handleCloseCreate();
  };

  const handleUpdate = () => {
    console.log('Updating quiz:', selectedQuiz?.id, formData);
    alert(`Quiz "${formData.title}" đã được cập nhật!`);
    handleCloseEdit();
  };

  return {
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
  };
}