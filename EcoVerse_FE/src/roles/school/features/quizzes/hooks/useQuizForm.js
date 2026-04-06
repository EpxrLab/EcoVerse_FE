import { useState } from 'react';

export function useQuizForm() {
  // Quiz form state
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    timeLimit: 30,
    passingScore: 60,
    targetGrade: 1,
    coinsOnPass: 1,
  });

  // Questions state
  const [questions, setQuestions] = useState([]);

  // Dialog & Editing states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  // Handlers
  const updateQuizForm = (data) => {
    setQuizForm(prev => ({ ...prev, ...data }));
  };

  const addQuestion = (data) => {
    if (!data) return;
    setQuestions(prev => [...prev, data]);
  };

  const saveQuestion = (data) => {
    if (!data) return;
    setQuestions(prev => prev.map(q => q.id == data.id ? { ...q, ...data } : q));
    setEditingQuestionId(null);
  };

  const startEditQuestion = (id) => {
    setEditingQuestionId(id);
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
      targetGrade: 1,
      coinsOnPass: 1,
    });
    setQuestions([]);
  };

  const loadQuizForm = (data, questionsData = []) => {
    setQuizForm({
      title: data.title || '',
      description: data.description || '',
      difficulty: data.difficulty || 'easy',
      timeLimit: data.timeLimit || 30,
      passingScore: data.passingScore || 60,
      targetGrade: data.targetGrade || 1,
      coinsOnPass: data.coinsOnPass || 1,
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

    // Editing
    editingQuestionId,
    startEditQuestion,
    saveQuestion,
    cancelAddQuestion: () => {
        setEditingQuestionId(null);
    },
    // Dialog states
    isCreateDialogOpen,
    setIsCreateDialogOpen,
  };
}
