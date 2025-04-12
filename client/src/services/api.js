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
    console.log('%c API Request ', 'background: #3498db; color: white; font-weight: bold;', config.url);
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
      console.log('%c Token Found ', 'background: #2ecc71; color: white; font-weight: bold;');
      console.log('Token value:', token);
      console.log('Authorization header:', `Bearer ${token.substring(0, 10)}...`);

      try {
        // Try to decode the token to show user info
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const decodedToken = JSON.parse(jsonPayload);
        console.log('Decoded token:', decodedToken);
        console.log('User ID:', decodedToken.id);
        console.log('Token expiration:', new Date(decodedToken.exp * 1000).toLocaleString());
      } catch (e) {
        console.log('Could not decode token:', e.message);
      }
    } else {
      console.warn('%c No Token Found ', 'background: #e74c3c; color: white; font-weight: bold;', 'for request:', config.url);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('%c API Response Success ', 'background: #2ecc71; color: white; font-weight: bold;');
    console.log('URL:', response.config.url);
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    return response;
  },
  (error) => {
    console.log('%c API Response Error ', 'background: #e74c3c; color: white; font-weight: bold;');
    console.log('URL:', error.config?.url);
    console.log('Status:', error.response?.status);
    console.log('Error data:', error.response?.data);

    // Check for authentication errors
    if (error.response?.status === 401) {
      console.warn('Authentication error detected. Token may be invalid or expired.');
    }

    // Check for authorization errors
    if (error.response?.status === 403) {
      console.warn('Authorization error detected. User may not have required permissions.');
      console.log('User role required:', error.response?.data?.message);
    }

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
