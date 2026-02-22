import { useState, useMemo } from 'react';
import { 
  defaultQuizzesData, 
  customQuizzesData, 
  sampleQuestionsData, 
  getQuizStats 
} from '../../../data/quiz.data';

export function useQuizzes() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [questionType, setQuestionType] = useState('multiple_choice');

  const stats = useMemo(() => {
    return getQuizStats(defaultQuizzesData, customQuizzesData);
  }, []);

  const getDifficultyStars = (difficulty) => {
    return difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
  };

  const getDifficultyColor = (difficulty) => {
    return difficulty === "easy" ? "text-eco-green" : difficulty === "medium" ? "text-eco-orange" : "text-destructive";
  };

  return {
    defaultQuizzes: defaultQuizzesData,
    customQuizzes: customQuizzesData,
    sampleQuestions: sampleQuestionsData,
    stats,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isAddQuestionOpen,
    setIsAddQuestionOpen,
    questionType,
    setQuestionType,
    getDifficultyStars,
    getDifficultyColor,
  };
}