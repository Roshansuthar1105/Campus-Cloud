import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiClipboard, FiUsers, FiPlus, FiEdit2, FiEye, FiBarChart2, FiTrash2 } from 'react-icons/fi';
import courseAPI from '../../services/courseApi';
import quizAPI from '../../services/quizApi';
import { useAuth } from '../../context/AuthContext';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
        const quizzesResponse = await quizAPI.getQuizzes({ course: id });
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

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }
    
    try {
      await quizAPI.deleteQuiz(quizId);
      
      // Update the quizzes list
      setQuizzes(quizzes.filter(quiz => quiz._id !== quizId));
    } catch (err) {
      console.error('Error deleting quiz:', err);
      setError('Failed to delete quiz. ' + (err.response?.data?.message || 'Please try again later.'));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
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
                onClick={() => navigate('/faculty/courses')}
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
          onClick={() => navigate('/faculty/courses')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Return to Courses
        </button>
      </div>
    );
  }

  // Get active quizzes (current date is between start and end date)
  const now = new Date();
  const activeQuizzes = quizzes.filter(quiz => {
    const startDate = new Date(quiz.startDate);
    const endDate = new Date(quiz.endDate);
    return now >= startDate && now <= endDate;
  });
  
  // Get upcoming quizzes (start date is in the future)
  const upcomingQuizzes = quizzes.filter(quiz => {
    const startDate = new Date(quiz.startDate);
    return now < startDate;
  });
  
  // Get past quizzes (end date is in the past)
  const pastQuizzes = quizzes.filter(quiz => {
    const endDate = new Date(quiz.endDate);
    return now > endDate;
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/faculty/courses')}
            className="mr-4 text-indigo-600 hover:text-indigo-900"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
            <p className="text-gray-600">{course.code} • {course.department || 'No Department'}</p>
          </div>
        </div>
        <div>
          <Link
            to={`/faculty/quizzes/create?course=${course._id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiPlus className="mr-2 -ml-1 h-5 w-5" />
            Create Quiz
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Course Details */}
        <div className="bg-white shadow rounded-lg overflow-hidden lg:col-span-2">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Course Details</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{course.description || 'No description provided.'}</dd>
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
            </dl>
          </div>
        </div>

        {/* Students */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Students</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {students.length} Enrolled
            </span>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {students.length > 0 ? (
              <div className="max-h-60 overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                  {students.map((student) => (
                    <li key={student._id} className="py-3 flex justify-between items-center">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No students enrolled in this course.</p>
            )}
          </div>
        </div>

        {/* Active Quizzes */}
        <div className="bg-white shadow rounded-lg overflow-hidden lg:col-span-3">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Active Quizzes</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {activeQuizzes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quiz
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Range
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submissions
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
                    {activeQuizzes.map((quiz) => (
                      <tr key={quiz._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                          <div className="text-sm text-gray-500">{quiz.duration} minutes</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(quiz.startDate).toLocaleDateString()} - {new Date(quiz.endDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {quiz.submissions?.length || 0} / {students.length}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <Link
                              to={`/faculty/quizzes/${quiz._id}/submissions`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View Submissions"
                            >
                              <FiUsers className="h-5 w-5" />
                            </Link>
                            <Link
                              to={`/faculty/quizzes/${quiz._id}`}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Quiz"
                            >
                              <FiEye className="h-5 w-5" />
                            </Link>
                            <Link
                              to={`/faculty/quizzes/${quiz._id}/edit`}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Edit Quiz"
                            >
                              <FiEdit2 className="h-5 w-5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No active quizzes for this course.</p>
            )}
          </div>
        </div>

        {/* Upcoming Quizzes */}
        <div className="bg-white shadow rounded-lg overflow-hidden lg:col-span-3">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Upcoming Quizzes</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {upcomingQuizzes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quiz
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
                    {upcomingQuizzes.map((quiz) => (
                      <tr key={quiz._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                          <div className="text-sm text-gray-500">{quiz.duration} minutes</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(quiz.startDate).toLocaleDateString()} - {new Date(quiz.endDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Upcoming
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <Link
                              to={`/faculty/quizzes/${quiz._id}`}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Quiz"
                            >
                              <FiEye className="h-5 w-5" />
                            </Link>
                            <Link
                              to={`/faculty/quizzes/${quiz._id}/edit`}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Edit Quiz"
                            >
                              <FiEdit2 className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => handleDeleteQuiz(quiz._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Quiz"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No upcoming quizzes scheduled for this course.</p>
            )}
          </div>
        </div>

        {/* Past Quizzes */}
        <div className="bg-white shadow rounded-lg overflow-hidden lg:col-span-3">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Past Quizzes</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {pastQuizzes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quiz
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Range
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submissions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pastQuizzes.map((quiz) => (
                      <tr key={quiz._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                          <div className="text-sm text-gray-500">{quiz.duration} minutes</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(quiz.startDate).toLocaleDateString()} - {new Date(quiz.endDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {quiz.submissions?.length || 0} / {students.length}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <Link
                              to={`/faculty/quizzes/${quiz._id}/submissions`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View Submissions"
                            >
                              <FiUsers className="h-5 w-5" />
                            </Link>
                            <Link
                              to={`/faculty/quizzes/${quiz._id}/reports`}
                              className="text-green-600 hover:text-green-900"
                              title="View Reports"
                            >
                              <FiBarChart2 className="h-5 w-5" />
                            </Link>
                            <Link
                              to={`/faculty/quizzes/${quiz._id}`}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Quiz"
                            >
                              <FiEye className="h-5 w-5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No past quizzes for this course.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
