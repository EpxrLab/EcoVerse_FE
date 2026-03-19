// This file is now empty as we use API data
export const defaultQuizzesData = [];
export const customQuizzesData = [];
export const sampleQuestionsData = [];

export const getQuizStats = (defaultQuizzes = [], customQuizzes = []) => {
  const allQuizzes = [...defaultQuizzes, ...customQuizzes];
  const totalCompletions = allQuizzes.reduce((acc, q) => acc + (q.completions || 0), 0);
  const scoredQuizzes = allQuizzes.filter(q => (q.completions || 0) > 0);
  const avgScore = scoredQuizzes.length > 0
    ? Math.round(scoredQuizzes.reduce((acc, q) => acc + (q.avgScore || 0), 0) / scoredQuizzes.length)
    : 0;
  
  return {
    totalQuizzes: allQuizzes.length,
    totalCompletions,
    avgScore,
  };
};