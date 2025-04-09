import api from './api';

// Dashboard API calls
const dashboardAPI = {
  // Get student dashboard data
  getStudentDashboard: async () => {
    return await api.get('/dashboard/student');
  },

  // Get faculty dashboard data
  getFacultyDashboard: async () => {
    return await api.get('/dashboard/faculty');
  },

  // Get management dashboard data
  getManagementDashboard: async () => {
    return await api.get('/dashboard/management');
  }
};

export default dashboardAPI;
