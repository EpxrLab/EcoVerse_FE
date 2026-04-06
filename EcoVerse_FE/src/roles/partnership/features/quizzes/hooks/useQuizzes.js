import { useState, useMemo, useEffect } from 'react';
import { quizzesService } from '../services/quizzes.service';

export function useQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchQuizzes = async () => {
    setIsLoading(true);
    try {
      const response = await quizzesService.getQuizzes();
      if (response.data && response.data.data) {
        setQuizzes(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const transformedQuizzes = useMemo(() => {
    return quizzes.map(quiz => ({
      ...quiz,
      questions: quiz.questionCount || 0,
      difficulty: quiz.difficulty?.toLowerCase() || 'easy',
      status: quiz.published ? 'published' : 'draft',
      type: quiz.source === 'SYSTEM' ? 'default' : 'custom',
      completions: quiz.completions || 0,
      avgScore: quiz.avgScore || 0,
    }));
  }, [quizzes]);

  const defaultQuizzes = useMemo(() => transformedQuizzes.filter(q => q.type === 'default'), [transformedQuizzes]);
  const customQuizzes = useMemo(() => transformedQuizzes.filter(q => q.type === 'custom'), [transformedQuizzes]);

  const stats = useMemo(() => {
    const all = transformedQuizzes;
    const totalCompletions = all.reduce((acc, q) => acc + (q.completions || 0), 0);
    const scoredQuizzes = all.filter(q => (q.completions || 0) > 0);
    const avgScore = scoredQuizzes.length > 0
      ? Math.round(scoredQuizzes.reduce((acc, q) => acc + (q.avgScore || 0), 0) / scoredQuizzes.length)
      : 0;

    return {
      totalQuizzes: all.length,
      totalCompletions,
      avgScore,
    };
  }, [transformedQuizzes]);

  const getDifficultyStars = (difficulty) => {
    const d = difficulty?.toLowerCase();
    return d === "easy" ? 1 : d === "medium" ? 2 : 3;
  };

  const getDifficultyColor = (difficulty) => {
    const d = difficulty?.toLowerCase();
    return d === "easy" ? "text-eco-green" : d === "medium" ? "text-eco-orange" : "text-destructive";
  };

  return {
    quizzes: transformedQuizzes,
    defaultQuizzes,
    customQuizzes,
    stats,
    isLoading,
    getDifficultyStars,
    getDifficultyColor,
    refreshQuizzes: fetchQuizzes,
  };
}
