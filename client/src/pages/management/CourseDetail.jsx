import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2, FiPlus, FiX, FiUsers, FiClipboard, FiBarChart2 } from 'react-icons/fi';
import courseAPI from '../../services/courseApi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showAddStudentsModal, setShowAddStudentsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Check if user is authenticated and has management role
    if (!isAuthenticated || user?.role !== 'management') {
      setError('You do not have permission to access this page');
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    const fetchCourseDetails = async () => {
      try {
        setLoading(true);

        // Get course details
        const courseResponse = await courseAPI.getCourse(id);
        setCourse(courseResponse.data.data);

        // Get students in course
        if (courseResponse.data.data.students) {
          setStudents(courseResponse.data.data.students);
        }

        // Get quizzes for course
        const quizzesResponse = await api.get('/quizzes', { params: { course: id } });
        setQuizzes(quizzesResponse.data.data);

        setError(null);
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError('Failed to load course details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  const fetchAvailableStudents = async () => {
    try {
      // Get all students
      const response = await api.get('/users', { params: { role: 'student' } });

      // Filter out students already in the course
      const currentStudentIds = students.map(student => student._id);
      const availableStudents = response.data.data.filter(
        student => !currentStudentIds.includes(student._id)
      );

      setAvailableStudents(availableStudents);
    } catch (err) {
      console.error('Error fetching available students:', err);
      setError('Failed to load available students. Please try again later.');
    }
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      await courseAPI.deleteCourse(id);
      navigate('/management/courses');
    } catch (err) {
      console.error('Error deleting course:', err);
      setError('Failed to delete course. ' + (err.response?.data?.message || 'Please try again later.'));
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student from the course?')) {
      return;
    }

    try {
      await courseAPI.removeStudentFromCourse(id, studentId);

      // Update students list
      setStudents(students.filter(student => student._id !== studentId));
    } catch (err) {
      console.error('Error removing student:', err);
      setError('Failed to remove student. ' + (err.response?.data?.message || 'Please try again later.'));
    }
  };

  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) return;

    try {
      await courseAPI.addStudentsToCourse(id, selectedStudents);

      // Refresh course details
      const courseResponse = await courseAPI.getCourse(id);
      setCourse(courseResponse.data.data);
      setStudents(courseResponse.data.data.students || []);

      // Reset selection
      setSelectedStudents([]);
      setShowAddStudentsModal(false);
    } catch (err) {
      console.error('Error adding students:', err);
      setError('Failed to add students. ' + (err.response?.data?.message || 'Please try again later.'));
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const filteredAvailableStudents = availableStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <div className="mt-2">
              <button
                onClick={() => navigate('/management/courses')}
                className="text-sm text-red-700 hover:text-red-900 font-medium"
              >
                Return to Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-10">
        <p>Course not found.</p>
        <button
          onClick={() => navigate('/management/courses')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Return to Courses
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/management/courses')}
            className="mr-4 text-purple-600 hover:text-purple-900"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
            <p className="text-gray-600">{course.code} • {course.department || 'No Department'}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/management/courses/${id}/edit`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <FiEdit2 className="mr-2 -ml-0.5 h-4 w-4" />
            Edit
          </Link>
          <button
            onClick={handleDeleteCourse}
            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <FiTrash2 className="mr-2 -ml-0.5 h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Course Details */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Course Details</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Course Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{course.name}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Course Code</dt>
                <dd className="mt-1 text-sm text-gray-900">{course.code}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Department</dt>
                <dd className="mt-1 text-sm text-gray-900">{course.department || 'N/A'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    course.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {course.isActive ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{course.description || 'No description provided.'}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Faculty */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Faculty</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {course.faculty && course.faculty.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {course.faculty.map((faculty) => (
                  <li key={faculty._id} className="py-3 flex justify-between items-center">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-gray-900">{faculty.name}</p>
                      <p className="text-sm text-gray-500">{faculty.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No faculty assigned to this course.</p>
            )}
          </div>
        </div>

        {/* Students */}
        <div className="bg-white shadow rounded-lg overflow-hidden lg:col-span-2">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Students</h3>
            <button
              onClick={() => {
                fetchAvailableStudents();
                setShowAddStudentsModal(true);
              }}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <FiPlus className="mr-2 -ml-0.5 h-4 w-4" />
              Add Students
            </button>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.studentId || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleRemoveStudent(student._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiX className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No students enrolled in this course.</p>
            )}
          </div>
        </div>

        {/* Quizzes */}
        <div className="bg-white shadow rounded-lg overflow-hidden lg:col-span-2">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Quizzes</h3>
            <Link
              to={`/management/quizzes/create?course=${id}`}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <FiPlus className="mr-2 -ml-0.5 h-4 w-4" />
              Create Quiz
            </Link>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {quizzes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Range
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quizzes.map((quiz) => (
                      <tr key={quiz._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {quiz.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(quiz.startDate).toLocaleDateString()} - {new Date(quiz.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            quiz.isPublished
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {quiz.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <Link
                              to={`/management/quizzes/${quiz._id}`}
                              className="text-purple-600 hover:text-purple-900"
                              title="View Quiz"
                            >
                              <FiClipboard className="h-5 w-5" />
                            </Link>
                            <Link
                              to={`/management/quizzes/${quiz._id}/submissions`}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Submissions"
                            >
                              <FiUsers className="h-5 w-5" />
                            </Link>
                            <Link
                              to={`/management/quizzes/${quiz._id}/reports`}
                              className="text-green-600 hover:text-green-900"
                              title="View Reports"
                            >
                              <FiBarChart2 className="h-5 w-5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No quizzes created for this course.</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Students Modal */}
      {showAddStudentsModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Add Students to Course
                    </h3>
                    <div className="mt-4">
                      <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="mt-4 max-h-60 overflow-y-auto">
                      {filteredAvailableStudents.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No students available to add.</p>
                      ) : (
                        <ul className="divide-y divide-gray-200">
                          {filteredAvailableStudents.map((student) => (
                            <li key={student._id} className="py-3 flex items-center">
                              <input
                                id={`student-${student._id}`}
                                type="checkbox"
                                checked={selectedStudents.includes(student._id)}
                                onChange={() => toggleStudentSelection(student._id)}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`student-${student._id}`} className="ml-3 block">
                                <span className="text-sm font-medium text-gray-900">{student.name}</span>
                                <span className="text-sm text-gray-500 block">{student.email}</span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAddStudents}
                  disabled={selectedStudents.length === 0}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Selected Students
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddStudentsModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
