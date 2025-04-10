import api from './api';

// Preference Form API calls
const preferenceFormAPI = {
  // Get all preference forms
  getPreferenceForms: async (params) => {
    return await api.get('/preference-forms', { params });
  },

  // Get faculty preference forms
  getFacultyPreferenceForms: async (params) => {
    return await api.get('/preference-forms/faculty', { params });
  },

  // Get student preference forms
  getStudentPreferenceForms: async (params) => {
    return await api.get('/preference-forms/student', { params });
  },

  // Get single preference form
  getPreferenceForm: async (id) => {
    return await api.get(`/preference-forms/${id}`);
  },

  // Create preference form
  createPreferenceForm: async (formData) => {
    return await api.post('/preference-forms', formData);
  },

  // Update preference form
  updatePreferenceForm: async (id, formData) => {
    return await api.put(`/preference-forms/${id}`, formData);
  },

  // Delete preference form
  deletePreferenceForm: async (id) => {
    return await api.delete(`/preference-forms/${id}`);
  },

  // Get preference form submissions
  getPreferenceFormSubmissions: async (id) => {
    return await api.get(`/preference-forms/${id}/submissions`);
  },

  // Submit preference form
  submitPreferenceForm: async (id, submissionData) => {
    return await api.post(`/preference-forms/${id}/submit`, submissionData);
  },

  // Get preference form reports
  getPreferenceFormReports: async (id, params) => {
    return await api.get(`/preference-forms/${id}/reports`, { params });
  }
};

export default preferenceFormAPI;
