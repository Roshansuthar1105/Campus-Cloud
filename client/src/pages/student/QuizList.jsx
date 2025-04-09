import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiCalendar, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import quizAPI from '../../services/quizApi';
import courseAPI from '../../services/courseApi';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissions, setSubmissions] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch courses first
        const coursesResponse = await courseAPI.getCourses();
        setCourses(coursesResponse.data.data);
        
        // Then fetch quizzes
        const params = selectedCourse ? { course: selectedCourse } : {};
        const quizzesResponse = await quizAPI.getQuizzes(params);
        setQuizzes(quizzesResponse.data.data);
        
        // Fetch submissions for each quiz
        const submissionsData = {};
        for (const quiz of quizzesResponse.data.data) {
          try {
            const submissionsResponse = await quizAPI.getQuizSubmissions(quiz._id);
            submissionsData[quiz._id] = submissionsResponse.data.data;
          } catch (err) {
            console.error(`Error fetching submissions for quiz ${quiz._id}:`, err);
          }
        }
        setSubmissions(submissionsData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load quizzes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCourse]);

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  const getQuizStatus = (quiz) => {
    const now = new Date();
    const startDate = new Date(quiz.startDate);
    const endDate = new Date(quiz.endDate);
    
    if (now < startDate) {
      return {
        status: 'upcoming',
        label: 'Upcoming',
        color: 'yellow',
        icon: <FiCalendar className="mr-1.5 h-4 w-4 text-yellow-500" />
      };
    } else if (now >= startDate && now <= endDate) {
      return {
        status: 'active',
        label: 'Active',
        color: 'green',
        icon: <FiClock className="mr-1.5 h-4 w-4 text-green-500" />
      };
    } else {
      return {
        status: 'ended',
        label: 'Ended',
        color: 'red',
        icon: <FiAlertCircle className="mr-1.5 h-4 w-4 text-red-500" />
      };
    }
  };

  const getSubmissionStatus = (quiz) => {
    if (!submissions[quiz._id] || submissions[quiz._id].length === 0) {
      return {
        status: 'not-attempted',
        label: 'Not Attempted',
        color: 'gray'
      };
    }
    
    // Find the latest submission
    const latestSubmission = submissions[quiz._id].reduce((latest, current) => {
      return new Date(current.submittedAt) > new Date(latest.submittedAt) ? current : latest;
    }, submissions[quiz._id][0]);
    
    if (latestSubmission.status === 'completed' || latestSubmission.status === 'graded') {
      return {
        status: 'completed',
        label: latestSubmission.isGraded ? `Graded: ${latestSubmission.percentage.toFixed(1)}%` : 'Completed',
        color: 'green',
        submissionId: latestSubmission._id
      };
    } else if (latestSubmission.status === 'in-progress') {
      return {
        status: 'in-progress',
        label: 'In Progress',
        color: 'blue',
        submissionId: latestSubmission._id
      };
    } else {
      return {
        status: 'not-attempted',
        label: 'Not Attempted',
        color: 'gray'
      };
    }
  };

  if (loading && quizzes.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
        <p className="text-gray-600">View and take quizzes for your courses</p>
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

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-lg font-medium text-gray-900">Available Quizzes</h2>
            </div>
            <div className="w-full md:w-64">
              <label htmlFor="course" className="sr-only">
                Filter by Course
              </label>
              <select
                id="course"
                name="course"
                value={selectedCourse}
                onChange={handleCourseChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {quizzes.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No quizzes available for your courses.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Your Submission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quizzes.map((quiz) => {
                  const quizStatus = getQuizStatus(quiz);
                  const submissionStatus = getSubmissionStatus(quiz);
                  
                  return (
                    <tr key={quiz._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(quiz.startDate).toLocaleDateString()} - {new Date(quiz.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{quiz.course?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{quiz.course?.code || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center text-sm text-${quizStatus.color}-700`}>
                          {quizStatus.icon}
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${quizStatus.color}-100 text-${quizStatus.color}-800`}>
                            {quizStatus.label}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {quiz.duration} minutes • {quiz.totalPoints} points
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${submissionStatus.color}-100 text-${submissionStatus.color}-800`}>
                          {submissionStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {quizStatus.status === 'active' && submissionStatus.status !== 'completed' ? (
                          <Link
                            to={submissionStatus.status === 'in-progress' 
                              ? `/student/submissions/${submissionStatus.submissionId}/continue` 
                              : `/student/quizzes/${quiz._id}/take`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {submissionStatus.status === 'in-progress' ? 'Continue' : 'Take Quiz'}
                          </Link>
                        ) : submissionStatus.status === 'completed' ? (
                          <Link
                            to={`/student/submissions/${submissionStatus.submissionId}`}
                            className="text-green-600 hover:text-green-900"
                          >
                            View Results
                          </Link>
                        ) : (
                          <span className="text-gray-400">
                            {quizStatus.status === 'upcoming' ? 'Not Available Yet' : 'Closed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizList;
