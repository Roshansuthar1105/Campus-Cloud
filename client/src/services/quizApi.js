import api from './api';

// Quiz API calls
const quizAPI = {
  // Get all quizzes
  getQuizzes: async (params) => {
    return await api.get('/quizzes', { params });
  },

  // Get single quiz
  getQuiz: async (id) => {
    return await api.get(`/quizzes/${id}`);
  },

  // Create quiz
  createQuiz: async (quizData) => {
    return await api.post('/quizzes', quizData);
  },

  // Update quiz
  updateQuiz: async (id, quizData) => {
    return await api.put(`/quizzes/${id}`, quizData);
  },

  // Delete quiz
  deleteQuiz: async (id) => {
    return await api.delete(`/quizzes/${id}`);
  },

  // Get quiz submissions
  getQuizSubmissions: async (id) => {
    return await api.get(`/quizzes/${id}/submissions`);
  },

  // Start quiz attempt
  startQuizAttempt: async (quizId) => {
    return await api.post('/submissions/start', { quizId });
  },

  // Submit answer
  submitAnswer: async (submissionId, answerData) => {
    return await api.put(`/submissions/${submissionId}/answer`, answerData);
  },

  // Complete quiz submission
  completeSubmission: async (submissionId) => {
    return await api.put(`/submissions/${submissionId}/complete`);
  },

  // Grade submission
  gradeSubmission: async (submissionId, gradingData) => {
    return await api.put(`/submissions/${submissionId}/grade`, gradingData);
  }
};

export default quizAPI;
