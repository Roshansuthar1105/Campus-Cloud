import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiArrowLeft, FiExternalLink } from 'react-icons/fi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isTestMode, setIsTestMode] = useState(false);
  const FROM_NAME=import.meta.env.VITE_FROM_NAME
  //  process.env.FROM_NAME;
  const FROM_EMAIL=import.meta.env.VITE_FROM_EMAIL
  // process.env.FROM_EMAIL;
  const { forgotPassword } = useAuth();
  // const 
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await forgotPassword(email);

      // Check if we're in test mode (using Ethereal Email)
      if (response && response.data && response.data.previewUrl) {
        setIsTestMode(true);
        setPreviewUrl(response.data.previewUrl);
        console.log('Email preview URL:', response.data.previewUrl);
      } else {
        setIsTestMode(false);
        setPreviewUrl('');
      }

      setEmailSent(true);
    } catch (err) {
      console.error('Password reset error:', err);

      // Try to extract a meaningful error message
      let errorMessage = 'Failed to send reset email';

      if (err.response && err.response.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }

        // Log additional error details if available
        if (err.response.data.error) {
          console.error('Error details:', err.response.data.error);
        }
      }

      setError(errorMessage);
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
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
            <div className="flex">
              <div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {emailSent ? (
          <div className="space-y-6">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 my-4">
              <div className="flex">
                <div>
                  <p className="text-sm text-green-700">
                    We've sent a password reset link to <strong>{email}</strong>.
                    {isTestMode ? (
                      <span> Since the application is in test mode, you can view the email at the link below.</span>
                    ) : (
                      <span> Please check your email and follow the instructions to reset your password.</span>
                    )}
                  </p>

                  {isTestMode && previewUrl && (
                    <div className="mt-3">
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        <FiExternalLink className="mr-1" /> View test email
                      </a>
                      <p className="mt-1 text-xs text-gray-500">
                        (This is a test email using Ethereal Email service. In production, real emails would be sent.)
                      </p>
                    </div>
                  )}

                  {!isTestMode && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500">
                        If you don't see the email in your inbox, please check your spam folder. The email will be from "{process.env.FROM_NAME || 'Campus Cloud'}" ({process.env.FROM_EMAIL || 'noreply@campuscloud.com'}).
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn't receive the email?
              </p>
              <button
                onClick={() => setEmailSent(false)}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Try again
              </button>
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                <Link to="/login" className="inline-flex items-center font-medium text-indigo-600 hover:text-indigo-500">
                  <FiArrowLeft className="mr-1" /> Back to login
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Works for all accounts, including Google Sign-In accounts.
              </p>
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
                    Sending...
                  </span>
                ) : (
                  'Send reset link'
                )}
              </button>
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Back to login
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
