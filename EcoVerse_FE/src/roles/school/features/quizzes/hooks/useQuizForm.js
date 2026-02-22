import { useState } from 'react';

export function useQuizForm() {
  // Quiz form state
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    timeLimit: 30, // Default 30s per question? Or total? Partnership has timeLimit input. Let's assume total or per question based on UI.
    passingScore: 60,
  });

  // Questions state
  const [questions, setQuestions] = useState([]);

  // Question form state
  const [questionForm, setQuestionForm] = useState({
    question: '',
    type: 'multiple_choice',
    options: ['', '', '', ''],
    correctAnswer: '',
  });

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);

  // Handlers
  const updateQuizForm = (data) => {
    setQuizForm(prev => ({ ...prev, ...data }));
  };

  const updateQuestionForm = (data) => {
    setQuestionForm(prev => ({ ...prev, ...data }));
  };

  const addQuestion = (data) => {
    if (data) {
        setQuestions(prev => [...prev, data]);
        return;
    }
    const newQuestion = {
      id: Date.now().toString(),
      question: questionForm.question,
      type: questionForm.type,
      options: questionForm.type === 'multiple_choice' ? questionForm.options : undefined,
      correctAnswer: questionForm.correctAnswer,
    };
    setQuestions(prev => [...prev, newQuestion]);
    resetQuestionForm();
    setIsAddQuestionOpen(false);
  };

  const removeQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const resetQuizForm = () => {
    setQuizForm({
      title: '',
      description: '',
      difficulty: 'easy',
      timeLimit: 30,
      passingScore: 60,
    });
    setQuestions([]);
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correctAnswer: '',
    });
  };

  const loadQuizForm = (data, questionsData = []) => {
    setQuizForm({
      title: data.title || '',
      description: data.description || '',
      difficulty: data.difficulty || 'easy',
      timeLimit: data.timeLimit || 30,
      passingScore: data.passingScore || 60,
    });
    setQuestions(questionsData);
  };

  return {
    // Quiz form
    quizForm,
    updateQuizForm,
    resetQuizForm,
    loadQuizForm,

    // Questions
    questions,
    addQuestion,
    removeQuestion,

    // Question form
    questionForm,
    updateQuestionForm,
    resetQuestionForm,

    // Dialog states
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isAddQuestionOpen,
    setIsAddQuestionOpen,
  };
}