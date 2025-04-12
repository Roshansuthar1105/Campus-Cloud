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
      console.log('%c Loading User Data ', 'background: #9b59b6; color: white; font-weight: bold;');

      // Check if token exists in localStorage or cookies
      let token = localStorage.getItem('token');
      console.log('Token in localStorage:', token ? 'Found' : 'Not found');

      // If not in localStorage, check cookies (for Google OAuth)
      if (!token) {
        token = getTokenFromCookies();
        console.log('Token in cookies:', token ? 'Found' : 'Not found');

        // If found in cookies, also save to localStorage for future use
        if (token) {
          localStorage.setItem('token', token);
          console.log('Token found in cookies and saved to localStorage');
        }
      }

      if (!token) {
        console.log('%c No Authentication Token Found ', 'background: #e74c3c; color: white; font-weight: bold;');
        setIsLoading(false);
        return;
      }

      console.log('%c Token Found, Fetching User Data ', 'background: #2ecc71; color: white; font-weight: bold;');

      // Try to decode token to show user info
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const decodedToken = JSON.parse(jsonPayload);
        console.log('Token payload:', decodedToken);
        console.log('User ID from token:', decodedToken.id);
        console.log('Token expiration:', new Date(decodedToken.exp * 1000).toLocaleString());
      } catch (e) {
        console.log('Could not decode token:', e.message);
      }

      const response = await authAPI.getCurrentUser();
      console.log('%c User Data Received ', 'background: #2ecc71; color: white; font-weight: bold;');
      console.log('User data:', response.data.data);
      console.log('User role:', response.data.data.role);

      setUser(response.data.data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('%c Error Loading User ', 'background: #e74c3c; color: white; font-weight: bold;');
      console.error('Error details:', err);

      if (err.response) {
        console.log('Response status:', err.response.status);
        console.log('Response data:', err.response.data);
      }

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

    console.log('%c Login Attempt ', 'background: #3498db; color: white; font-weight: bold;');
    console.log('Login credentials:', { email: userData.email, passwordProvided: !!userData.password });

    try {
      console.log('Calling login API...');
      const response = await authAPI.login(userData);
      console.log('%c Login Successful ', 'background: #2ecc71; color: white; font-weight: bold;');
      console.log('Login response:', response);
      console.log('User data:', response.user);
      console.log('User role:', response.user?.role);
      console.log('Token received:', response.token ? 'Yes' : 'No');

      setUser(response.user);
      setIsAuthenticated(true);

      // Load user data to ensure we have the complete profile
      loadUser();

      return response;
    } catch (err) {
      console.log('%c Login Failed ', 'background: #e74c3c; color: white; font-weight: bold;');
      console.error('Login error:', err);

      if (err.response) {
        console.log('Response status:', err.response.status);
        console.log('Response data:', err.response.data);
      }

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
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
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
