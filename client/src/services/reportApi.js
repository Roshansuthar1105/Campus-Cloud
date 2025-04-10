import api from './api';

// Reports API calls
const reportAPI = {
  // Get faculty reports
  getFacultyReports: async (params) => {
    return await api.get('/reports/faculty', { params });
  },

  // Get student reports
  getStudentReports: async (params) => {
    return await api.get('/reports/student', { params });
  },

  // Get management reports
  getManagementReports: async (params) => {
    return await api.get('/reports/management', { params });
  },

  // Get quiz performance report
  getQuizPerformanceReport: async (params) => {
    return await api.get('/reports/quiz-performance', { params });
  },

  // Get student engagement report
  getStudentEngagementReport: async (params) => {
    return await api.get('/reports/student-engagement', { params });
  },

  // Get question analysis report
  getQuestionAnalysisReport: async (params) => {
    return await api.get('/reports/question-analysis', { params });
  },

  // Export report
  exportReport: async (reportType, params) => {
    return await api.get(`/reports/export/${reportType}`, { 
      params,
      responseType: 'blob'
    });
  }
};

export default reportAPI;
