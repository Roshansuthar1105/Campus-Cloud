import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiPlus, FiX } from 'react-icons/fi';
import courseAPI from '../../services/courseApi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    department: '',
    faculty: [],
    isActive: true
  });

  const [facultyOptions, setFacultyOptions] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Check if user is authenticated and has management role
    console.log('Auth state:', { isAuthenticated, user });

    const fetchFacultyUsers = async () => {
      try {
        console.log('Fetching faculty users...');
        // Get token from localStorage to check if it exists
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);

        const response = await api.get('/users', {
          params: { role: 'faculty' },
          headers: {
            // Add token explicitly for debugging
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Faculty response:', response.data);
        setFacultyOptions(response.data.data);
      } catch (err) {
        console.error('Error fetching faculty users:', err);
        console.error('Error details:', err.response?.data);
        setError('Failed to load faculty users. Please try again later.');
      }
    };

    const fetchCourse = async () => {
      if (!isEditMode) return;

      try {
        setInitialLoading(true);
        const response = await courseAPI.getCourse(id);
        const courseData = response.data.data;

        setFormData({
          name: courseData.name,
          code: courseData.code,
          description: courseData.description || '',
          department: courseData.department || '',
          faculty: courseData.faculty || [],
          isActive: courseData.isActive
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course. Please try again later.');
      } finally {
        setInitialLoading(false);
      }
    };

    // Execute auth check and continue only if successful
    const initializeComponent = async () => {
      try {
        const response = await api.get('/auth/me');
        console.log('Auth check response:', response.data);

        // Check if user has management role
        if (response.data.data.role !== 'management') {
          setError('You do not have permission to access this page. Management role required.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }

        // Continue with component initialization
        fetchFacultyUsers();
        if (isEditMode) {
          fetchCourse();
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setError('Authentication failed. Please log in again.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };

    initializeComponent();

    // Functions are called in initializeComponent
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddFaculty = () => {
    if (!selectedFaculty) return;

    const facultyToAdd = facultyOptions.find(f => f._id === selectedFaculty);
    if (!facultyToAdd) return;

    // Check if faculty is already added
    if (formData.faculty.some(f => f._id === facultyToAdd._id)) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      faculty: [...prev.faculty, facultyToAdd]
    }));

    setSelectedFaculty('');
  };

  const handleRemoveFaculty = (facultyId) => {
    setFormData(prev => ({
      ...prev,
      faculty: prev.faculty.filter(f => f._id !== facultyId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Course name is required');
      }

      if (!formData.code.trim()) {
        throw new Error('Course code is required');
      }

      // Format data for API
      const courseData = {
        ...formData,
        faculty: formData.faculty.map(f => f._id)
      };

      // Submit to API
      if (isEditMode) {
        await courseAPI.updateCourse(id, courseData);
        setSuccess('Course updated successfully!');
      } else {
        await courseAPI.createCourse(courseData);
        setSuccess('Course created successfully!');
      }

      // Redirect to course list after a short delay
      setTimeout(() => {
        navigate('/management/courses');
      }, 1500);
    } catch (err) {
      console.error('Error saving course:', err);
      setError(err.message || 'Failed to save course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate('/management/courses')}
          className="mr-4 text-purple-600 hover:text-purple-900"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Course' : 'Create New Course'}
          </h1>
          <p className="text-gray-600">
            {isEditMode ? 'Update course details' : 'Add a new course to the system'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Course Details</h2>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Course Name *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Course Code *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="code"
                  id="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter course description"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="department"
                  id="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="isActive" className="font-medium text-gray-700">
                    Active Course
                  </label>
                  <p className="text-gray-500">Make this course available to students</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Faculty Assignment</h2>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-5">
              <label htmlFor="faculty" className="block text-sm font-medium text-gray-700">
                Add Faculty
              </label>
              <div className="mt-1">
                <select
                  id="faculty"
                  name="faculty"
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select a faculty member</option>
                  {facultyOptions.map((faculty) => (
                    <option key={faculty._id} value={faculty._id}>
                      {faculty.name} ({faculty.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 invisible">
                Add
              </label>
              <button
                type="button"
                onClick={handleAddFaculty}
                disabled={!selectedFaculty}
                className="mt-1 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <FiPlus className="mr-2 -ml-1 h-5 w-5" />
                Add
              </button>
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700">
                Assigned Faculty
              </label>
              <div className="mt-1">
                {formData.faculty.length === 0 ? (
                  <p className="text-sm text-gray-500">No faculty assigned to this course yet.</p>
                ) : (
                  <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                    {formData.faculty.map((faculty) => (
                      <li key={faculty._id} className="px-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <span className="ml-2 flex-1 w-0 truncate">
                            {faculty.name} ({faculty.email})
                          </span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleRemoveFaculty(faculty._id)}
                            className="font-medium text-red-600 hover:text-red-500"
                          >
                            <FiX className="h-5 w-5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/management/courses')}
            className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            {loading ? 'Saving...' : (
              <>
                <FiSave className="mr-2 -ml-1 h-5 w-5" />
                {isEditMode ? 'Update Course' : 'Create Course'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
