import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to get token from cookies
const getTokenFromCookies = () => {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith('token=')) {
      return cookie.substring('token='.length, cookie.length);
    }
  }
  return null;
};

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.url);
    // First check localStorage
    let token = localStorage.getItem('token');
    console.log('Token from localStorage:', token ? 'exists' : 'not found');

    // If not in localStorage, check cookies
    if (!token) {
      token = getTokenFromCookies();
      console.log('Token from cookies:', token ? 'exists' : 'not found');
      // If found in cookies, save to localStorage for future use
      if (token) {
        localStorage.setItem('token', token);
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set:', `Bearer ${token.substring(0, 10)}...`);
    } else {
      console.warn('No token found for request:', config.url);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', error.config?.url, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Login user
  login: async (userData) => {
    const response = await api.post('/auth/login', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Logout user
  logout: async () => {
    localStorage.removeItem('token');
    return await api.get('/auth/logout');
  },

  // Get current user
  getCurrentUser: async () => {
    return await api.get('/auth/me');
  },

  // Forgot password
  forgotPassword: async (email) => {
    return await api.post('/auth/forgotpassword', { email });
  },

  // Reset password
  resetPassword: async (resetToken, password) => {
    return await api.put(`/auth/resetpassword/${resetToken}`, { password });
  },
};

// User API calls
export const userAPI = {
  // Update profile
  updateProfile: async (userData) => {
    return await api.put('/users/profile', userData);
  },

  // Change password
  changePassword: async (passwordData) => {
    return await api.put('/users/password', passwordData);
  },
};

export default api;
