import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Function to load user data
  const loadUser = async () => {
    try {
      // Check if token exists in localStorage or cookies
      let token = localStorage.getItem('token');

      // If not in localStorage, check cookies (for Google OAuth)
      if (!token) {
        token = getTokenFromCookies();

        // If found in cookies, also save to localStorage for future use
        if (token) {
          localStorage.setItem('token', token);
        }
      }

      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await authAPI.getCurrentUser();
      setUser(response.data.data);
      setIsAuthenticated(true);
    } catch (err) {
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  // Load user on initial render
  useEffect(() => {
    loadUser();
  }, []);

  // Register user
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.register(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const login = async (userData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(userData);
      setUser(response.user);
      setIsAuthenticated(true);

      // Load user data to ensure we have the complete profile
      loadUser();

      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    setIsLoading(true);

    try {
      await authAPI.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.forgotPassword(email);

      // Return the full response so we can access previewUrl if in test mode
      return response;
    } catch (err) {
      console.error('Forgot password error:', err);

      // Provide more detailed error information
      let errorMessage = 'Failed to send reset email';

      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        // If we have a message directly on the error object
        errorMessage = err.message;
      }

      setError(errorMessage);

      // If we have additional error details in development mode, log them
      if (err.response?.data?.error) {
        console.error('Error details:', err.response.data.error);
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (resetToken, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.resetPassword(resetToken, password);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has required role
  const hasRole = (requiredRoles) => {
    if (!user || !user.role) return false;

    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.role);
    }

    return user.role === requiredRoles;
  };

  // Update user in context after profile update
  const updateUser = (updatedUser) => {
    if (updatedUser) {
      setUser(updatedUser);
    } else {
      // If no user data provided, reload user data from API
      loadUser();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        updateUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default AuthContext;
