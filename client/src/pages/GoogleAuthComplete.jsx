import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiLock, FiBriefcase, FiBookmark, FiHash } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { authAPI } from '../services/api';

const GoogleAuthComplete = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    role: 'student',
    department: '',
    studentId: '',
    facultyId: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Flag to track if token has been processed
  const [tokenProcessed, setTokenProcessed] = useState(false);

  // First useEffect to handle token processing only once
  useEffect(() => {
    const processToken = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (token && !tokenProcessed) {
        // Store token in localStorage
        localStorage.setItem('token', token);

        // Update auth context to load user data
        if (typeof updateUser === 'function') {
          await updateUser();
        }

        // Mark token as processed to prevent infinite loop
        setTokenProcessed(true);
      }
    };

    if (!tokenProcessed && location.search.includes('token=')) {
      processToken();
    }
  }, [location.search, tokenProcessed, updateUser]);

  // Second useEffect to handle user data and form setup
  useEffect(() => {
    // If user is not authenticated, wait for token processing
    if (!user) {
      return;
    }

    // Check if user is a Google account
    if (!user.isGoogleAccount) {
      navigate('/dashboard');
      return;
    }

    // If user already has a password set, redirect to dashboard
    if (user.password) {
      navigate('/dashboard');
      return;
    }

    // Pre-fill form with user data if available
    // If user has management role, default to student for the form
    const role = user.role === 'management' ? 'student' : (user.role || 'student');

    setFormData(prevData => ({
      ...prevData,
      role: role,
      department: user.department || '',
      studentId: user.studentId || '',
      facultyId: user.facultyId || ''
    }));
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validate password
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Validate role
    if (!['student', 'faculty'].includes(formData.role)) {
      errors.role = 'Please select a valid role';
    }

    // Validate department
    if (!formData.department) {
      errors.department = 'Department is required';
    }

    // Validate ID based on role
    if (formData.role === 'student' && !formData.studentId) {
      errors.studentId = 'Student ID is required';
    } else if (formData.role === 'faculty' && !formData.facultyId) {
      errors.facultyId = 'Faculty ID is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...updateData } = formData;

      // Call API to update user information
      const response = await authAPI.completeGoogleAuth(updateData);

      setSuccess('Profile information updated successfully!');

      // Update user in context
      if (response.user) {
        updateUser(response.user);
      } else {
        updateUser(); // Reload user data
      }

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile information');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <div className="flex justify-center">
            <FcGoogle className="h-12 w-12 mb-2" />
          </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Google Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please provide additional information to complete your Google account setup
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <div className="flex">
              <div>
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center">
                <FiLock className="mr-2" /> Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  formErrors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mt-1`}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 flex items-center">
                <FiLock className="mr-2" /> Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  formErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mt-1`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="text-sm font-medium text-gray-700 flex items-center">
                <FiBriefcase className="mr-2" /> Role
              </label>
              <select
                id="role"
                name="role"
                className={`mt-1 block w-full py-2 px-3 border ${
                  formErrors.role ? 'border-red-300' : 'border-gray-300'
                } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>
              {formErrors.role && (
                <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Note: Management role can only be assigned by administrators.
              </p>
            </div>

            {/* Department Field */}
            <div>
              <label htmlFor="department" className="text-sm font-medium text-gray-700 flex items-center">
                <FiBookmark className="mr-2" /> Department
              </label>
              <input
                id="department"
                name="department"
                type="text"
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  formErrors.department ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mt-1`}
                placeholder="Your department"
                value={formData.department}
                onChange={handleChange}
              />
              {formErrors.department && (
                <p className="mt-1 text-sm text-red-600">{formErrors.department}</p>
              )}
            </div>

            {/* Conditional ID Fields based on role */}
            {formData.role === 'student' && (
              <div>
                <label htmlFor="studentId" className="text-sm font-medium text-gray-700 flex items-center">
                  <FiHash className="mr-2" /> Student ID
                </label>
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    formErrors.studentId ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mt-1`}
                  placeholder="Your student ID"
                  value={formData.studentId}
                  onChange={handleChange}
                />
                {formErrors.studentId && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.studentId}</p>
                )}
              </div>
            )}

            {formData.role === 'faculty' && (
              <div>
                <label htmlFor="facultyId" className="text-sm font-medium text-gray-700 flex items-center">
                  <FiHash className="mr-2" /> Faculty ID
                </label>
                <input
                  id="facultyId"
                  name="facultyId"
                  type="text"
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    formErrors.facultyId ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm mt-1`}
                  placeholder="Your faculty ID"
                  value={formData.facultyId}
                  onChange={handleChange}
                />
                {formErrors.facultyId && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.facultyId}</p>
                )}
              </div>
            )}


          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {isSubmitting ? 'Saving...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoogleAuthComplete;
