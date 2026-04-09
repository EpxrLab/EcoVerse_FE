import axios from '@/utils/axios.customize';

export const quizzesService = {
  getQuizzes: () => {
    return axios.get('/quiz');
  },

  getQuizDetail: (quizId) => {
    return axios.get(`/quiz/${quizId}`);
  },

  publishQuiz: (quizId, published = true) => {
    return axios.put(`/quiz/${quizId}/publish`, published, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  deleteQuiz: (quizId) => {
    return axios.delete(`/quiz/${quizId}`);
  },

  createManualQuiz: (data) => {
    return axios.post('/quiz/manual', data);
  },

  addQuestionsToQuiz: (quizId, questions) => {
    return axios.post(`/quiz/${quizId}/questions`, questions);
  },

  updateQuiz: (quizId, data) => {
    return axios.put(`/quiz/${quizId}`, data);
  },

  updateQuestion: (quizId, questionId, data) => {
    return axios.put(`/quiz/${quizId}/questions/${questionId}`, data);
  },

  deleteQuestion: (quizId, questionId) => {
    return axios.delete(`/quiz/${quizId}/questions/${questionId}`);
  },

  previewQuestions: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post('/quiz/preview-questions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};
