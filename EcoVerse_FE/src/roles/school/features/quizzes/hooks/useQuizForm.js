import { useState } from 'react';

export function useQuizForm() {
  // Quiz form state
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    timeLimit: 30,
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
  const [editingQuestionId, setEditingQuestionId] = useState(null);

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

  const saveQuestion = (data) => {
    // If data is passed (from QuizForm local state), use it
    if (data) {
        setQuestions(prev => prev.map(q => q.id == data.id ? { ...q, ...data } : q));
        setEditingQuestionId(null);
        return;
    }

    const updatedQuestion = {
      id: editingQuestionId,
      question: questionForm.question,
      type: questionForm.type,
      options: questionForm.type === 'multiple_choice' ? questionForm.options : undefined,
      correctAnswer: questionForm.correctAnswer,
    };
    
    setQuestions(prev => prev.map(q => q.id == editingQuestionId ? { ...q, ...updatedQuestion } : q));
    resetQuestionForm();
    setEditingQuestionId(null);
    setIsAddQuestionOpen(false);
  };

  const startEditQuestion = (id) => {
    const q = questions.find(question => question.id === id);
    if (q) {
      setQuestionForm({
        question: q.question,
        type: q.type || 'multiple_choice',
        options: q.options || ['', '', '', ''],
        correctAnswer: q.correctAnswer,
      });
      setEditingQuestionId(id);
      setIsAddQuestionOpen(true);
    }
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

    // Editing
    editingQuestionId,
    startEditQuestion,
    saveQuestion,
    cancelAddQuestion: () => {
        setIsAddQuestionOpen(false);
        resetQuestionForm();
        setEditingQuestionId(null);
    },

    // Dialog states
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isAddQuestionOpen,
    setIsAddQuestionOpen,
  };
}