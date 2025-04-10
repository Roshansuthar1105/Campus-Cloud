import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiClipboard, FiUsers, FiCalendar, FiFileText, FiBook, FiClock } from 'react-icons/fi';
import courseAPI from '../../services/courseApi';
import quizAPI from '../../services/quizApi';
import { useAuth } from '../../context/AuthContext';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        
        // Get course details
        const courseResponse = await courseAPI.getCourse(id);
        setCourse(courseResponse.data.data);
        
        // Get faculty for this course
        if (courseResponse.data.data.faculty) {
          setFaculty(courseResponse.data.data.faculty);
        }
        
        // Get quizzes for this course
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
                onClick={() => navigate('/student/courses')}
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
          onClick={() => navigate('/student/courses')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Return to Courses
        </button>
      </div>
    );
  }

  // Filter quizzes that are published and available to students
  const availableQuizzes = quizzes.filter(quiz => quiz.isPublished);
  
  // Get active quizzes (current date is between start and end date)
  const now = new Date();
  const activeQuizzes = availableQuizzes.filter(quiz => {
    const startDate = new Date(quiz.startDate);
    const endDate = new Date(quiz.endDate);
    return now >= startDate && now <= endDate;
  });
  
  // Get upcoming quizzes (start date is in the future)
  const upcomingQuizzes = availableQuizzes.filter(quiz => {
    const startDate = new Date(quiz.startDate);
    return now < startDate;
  });
  
  // Get past quizzes (end date is in the past)
  const pastQuizzes = availableQuizzes.filter(quiz => {
    const endDate = new Date(quiz.endDate);
    return now > endDate;
  });

  return (
    <div>
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate('/student/courses')}
          className="mr-4 text-blue-600 hover:text-blue-900"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
          <p className="text-gray-600">{course.code} • {course.department || 'No Department'}</p>
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

        {/* Faculty */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Faculty</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {faculty && faculty.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {faculty.map((teacher) => (
                  <li key={teacher._id} className="py-3 flex justify-between items-center">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-gray-900">{teacher.name}</p>
                      <p className="text-sm text-gray-500">{teacher.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No faculty assigned to this course.</p>
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeQuizzes.map((quiz) => (
                  <div key={quiz._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-md font-medium text-gray-900">{quiz.title}</h4>
                        <p className="text-sm text-gray-500">
                          Due: {new Date(quiz.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="bg-green-100 rounded-full p-2">
                        <FiClipboard className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <FiClock className="mr-1.5 h-4 w-4 text-gray-400" />
                      {quiz.duration} minutes
                    </div>
                    <div className="mt-4">
                      <Link
                        to={`/student/quizzes/${quiz._id}/take`}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Take Quiz
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No active quizzes available for this course.</p>
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
                        Available From
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {upcomingQuizzes.map((quiz) => (
                      <tr key={quiz._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(quiz.startDate).toLocaleDateString()} {new Date(quiz.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{quiz.duration} minutes</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{quiz.totalPoints} points</div>
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
                        Due Date
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
                    {pastQuizzes.map((quiz) => (
                      <tr key={quiz._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(quiz.endDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Closed
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/student/quizzes/${quiz._id}/results`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Results
                          </Link>
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
