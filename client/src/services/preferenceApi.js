import api from './api';

// Preference Form API calls
const preferenceAPI = {
  // Get all preference forms
  getPreferenceForms: async (params) => {
    return await api.get('/preferences', { params });
  },

  // Get single preference form
  getPreferenceForm: async (id) => {
    return await api.get(`/preferences/${id}`);
  },

  // Create preference form
  createPreferenceForm: async (formData) => {
    return await api.post('/preferences', formData);
  },

  // Update preference form
  updatePreferenceForm: async (id, formData) => {
    return await api.put(`/preferences/${id}`, formData);
  },

  // Delete preference form
  deletePreferenceForm: async (id) => {
    return await api.delete(`/preferences/${id}`);
  },

  // Get form submissions
  getFormSubmissions: async (id) => {
    return await api.get(`/preferences/${id}/submissions`);
  },

  // Submit preference form
  submitPreferenceForm: async (id, submissionData) => {
    return await api.post(`/preferences/${id}/submit`, submissionData);
  }
};

export default preferenceAPI;
