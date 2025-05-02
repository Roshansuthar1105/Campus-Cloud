import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLock, FiCheck, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: 'Too weak',
    color: 'text-red-500'
  });

  const { resetToken } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Validate token exists
    if (!resetToken) {
      setError('Invalid password reset token');
    }
  }, [resetToken]);

  // Check password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength({
        score: 0,
        message: 'Too weak',
        color: 'text-red-500'
      });
      return;
    }

    let score = 0;

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Set message based on score
    let message = '';
    let color = '';

    switch (true) {
      case (score <= 1):
        message = 'Too weak';
        color = 'text-red-500';
        break;
      case (score <= 3):
        message = 'Could be stronger';
        color = 'text-yellow-500';
        break;
      case (score <= 4):
        message = 'Good password';
        color = 'text-green-500';
        break;
      default:
        message = 'Strong password';
        color = 'text-green-600';
    }

    setPasswordStrength({ score, message, color });
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (!password) {
      setError('Please enter a new password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await resetPassword(resetToken, password);
      setSuccess(true);

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
            <div className="flex items-center">
              <FiAlertTriangle className="text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success ? (
          <div className="space-y-6">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 my-4">
              <div className="flex items-center">
                <FiCheck className="text-green-500 mr-2" />
                <p className="text-sm text-green-700">
                  Your password has been reset successfully! You will be redirected to the dashboard shortly.
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                <Link to="/dashboard" className="inline-flex items-center font-medium text-indigo-600 hover:text-indigo-500">
                  <FiArrowLeft className="mr-1" /> Go to dashboard now
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter new password"
                    required
                  />
                </div>
                {password && (
                  <div className="mt-1 flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className={`h-2 rounded-full ${
                          passwordStrength.score <= 1 ? 'bg-red-500' :
                          passwordStrength.score <= 3 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, passwordStrength.score * 20)}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs ${passwordStrength.color}`}>
                      {passwordStrength.message}
                    </span>
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Use at least 8 characters with a mix of letters, numbers & symbols
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                {password && confirmPassword && (
                  <div className="mt-1 flex items-center">
                    {password === confirmPassword ? (
                      <span className="text-xs text-green-500 flex items-center">
                        <FiCheck className="mr-1" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-xs text-red-500 flex items-center">
                        <FiAlertTriangle className="mr-1" /> Passwords do not match
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting password...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>
          </form>
        )}

        {!success && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Back to login
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
