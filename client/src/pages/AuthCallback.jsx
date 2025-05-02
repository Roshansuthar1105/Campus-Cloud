import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const [message, setMessage] = useState('Processing authentication...');
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuth();

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Get token from URL query parameters
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!token) {
          setMessage('Authentication failed: No token received');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        // Store token without logging it

        // Store token in localStorage
        localStorage.setItem('token', token);

        // Update auth context
        if (typeof updateUser === 'function') {
          updateUser();
        }

        setMessage('Authentication successful! Redirecting...');

        // Redirect to dashboard
        setTimeout(() => navigate('/dashboard'), 1000);
      } catch (error) {
        console.error('Error processing authentication:', error);
        setMessage('Authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    processAuth();
  }, [location, navigate, updateUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md text-center">
        <div className="animate-pulse">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{message}</h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
