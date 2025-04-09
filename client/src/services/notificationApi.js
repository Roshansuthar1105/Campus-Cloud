import api from './api';

// Notification API calls
const notificationAPI = {
  // Get user notifications
  getNotifications: async () => {
    return await api.get('/notifications');
  },

  // Mark notification as read
  markAsRead: async (id) => {
    return await api.put(`/notifications/${id}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return await api.put('/notifications/read-all');
  },

  // Create notification (management only)
  createNotification: async (notificationData) => {
    return await api.post('/notifications', notificationData);
  }
};

export default notificationAPI;
