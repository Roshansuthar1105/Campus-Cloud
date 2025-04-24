import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiDownload, FiUsers, FiBarChart2, FiEye, FiCalendar, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const QuizDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    completionRate: 0,
    averageScore: 0
  });

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);

        // Fetch quiz data
        const quizResponse = await api.get(`/quizzes/${id}`);
        const quizData = quizResponse.data.data;
        setQuiz(quizData);

        // Fetch submissions data
        const submissionsResponse = await api.get(`/quizzes/${id}/submissions`);
        const submissionsData = submissionsResponse.data.data;
        setSubmissions(submissionsData);

        // Fetch stats data
        try {
          const statsResponse = await api.get(`/quizzes/${id}/stats`);
          const statsData = statsResponse.data.data;
          setStats(statsData);
        } catch (statsError) {
          console.error('Error fetching stats, calculating locally:', statsError);

          // Calculate statistics locally if API fails
          const totalStudents = quizData.course?.students?.length || 0;
          const completionRate = totalStudents > 0 ? (submissionsData.length / totalStudents) * 100 : 0;

          // Calculate average score from graded submissions
          const gradedSubmissions = submissionsData.filter(sub => sub.status === 'graded');
          const totalScore = gradedSubmissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
          const averageScore = gradedSubmissions.length > 0 ? totalScore / gradedSubmissions.length : 0;

          setStats({
            totalSubmissions: submissionsData.length,
            totalStudents,
            completionRate,
            averageScore
          });
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching quiz data:', err);
        setError('Failed to load quiz details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [id]);

  const getQuizStatus = () => {
    if (!quiz) return '';

    const now = new Date();
    const startDate = new Date(quiz.startDate);
    const endDate = new Date(quiz.endDate);

    if (!quiz.isPublished) {
      return 'draft';
    } else if (now < startDate) {
      return 'upcoming';
    } else if (now >= startDate && now <= endDate) {
      return 'active';
    } else {
      return 'ended';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'gray';
      case 'upcoming': return 'yellow';
      case 'active': return 'green';
      case 'ended': return 'red';
      default: return 'gray';
    }
  };

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
                onClick={() => navigate('/management/quizzes')}
                className="text-sm text-red-700 hover:text-red-900 font-medium"
              >
                Return to Quizzes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-10">
        <p>Quiz not found.</p>
        <button
          onClick={() => navigate('/management/quizzes')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Return to Quizzes
        </button>
      </div>
    );
  }

  const status = getQuizStatus();
  const statusColor = getStatusColor(status);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/management/quizzes')}
            className="mr-4 text-purple-600 hover:text-purple-900"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-gray-600">{quiz.course.name} ({quiz.course.code})</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/management/quizzes/${id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <FiEdit2 className="mr-2 -ml-1 h-5 w-5" />
            Edit Quiz
          </Link>
          <Link
            to={`/management/quizzes/${id}/reports`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <FiBarChart2 className="mr-2 -ml-1 h-5 w-5" />
            View Reports
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quiz Details */}
        <div className="bg-white shadow rounded-lg overflow-hidden lg:col-span-2">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Quiz Details</h3>
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${statusColor}-100 text-${statusColor}-800`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{quiz.description || 'No description provided.'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Date Range</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <FiCalendar className="inline-block mr-1" />
                  {quiz.startDate ? new Date(quiz.startDate).toLocaleDateString() : 'Not set'} - {quiz.endDate ? new Date(quiz.endDate).toLocaleDateString() : 'Not set'}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Published</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {quiz.isPublished ? (
                    <span className="inline-flex items-center">
                      <FiCheckCircle className="mr-1.5 h-4 w-4 text-green-500" />
                      Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center">
                      <FiXCircle className="mr-1.5 h-4 w-4 text-red-500" />
                      No
                    </span>
                  )}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Time Limit</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {quiz.timeLimit ? `${quiz.timeLimit} minutes` : 'No time limit'}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Passing Score</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {quiz.passingScore !== undefined && quiz.passingScore !== null ? `${quiz.passingScore}%` : 'Not set'}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Created By</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {quiz.createdBy?.name || 'Unknown'}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Created On</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : 'Unknown'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Submission Stats */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Submission Stats</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Total Submissions</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalSubmissions || 0}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Completion Rate</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{Math.round(stats.completionRate || 0)}%</dd>
                <p className="text-sm text-gray-500">{stats.totalSubmissions || 0} out of {stats.totalStudents || 0} students</p>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Average Score</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{(stats.averageScore || 0).toFixed(1)}%</dd>
              </div>
            </dl>
            <div className="mt-6">
              <Link
                to={`/management/quizzes/${id}/reports`}
                className="text-purple-600 hover:text-purple-900 text-sm font-medium"
              >
                View detailed reports →
              </Link>
            </div>
          </div>
        </div>

        {/* Quiz Questions */}
        <div className="bg-white shadow rounded-lg overflow-hidden lg:col-span-3">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Quiz Questions</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {quiz.questions && quiz.questions.length > 0 ? (quiz.questions.map((question, index) => (
                <div key={question._id} className="border-b border-gray-200 pb-6">
                  <div className="mb-2">
                    <span className="text-lg font-medium text-gray-900 mr-2">{index + 1}.</span>
                    <span className="text-lg text-gray-900">{question.text}</span>
                    <span className="ml-2 text-sm text-gray-500">({question.points} points)</span>
                  </div>

                  {question.type === 'multiple-choice' && question.options && question.options.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {question.options.map((option) => (
                        <div key={option._id} className="flex items-center">
                          <div className={`h-4 w-4 rounded-full ${question.correctAnswer && option._id === question.correctAnswer ? 'bg-green-500' : 'border border-gray-300'}`}></div>
                          <span className={`ml-3 block text-sm ${question.correctAnswer && option._id === question.correctAnswer ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                            {option.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'multiple-select' && question.options && question.options.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {question.options.map((option) => (
                        <div key={option._id} className="flex items-center">
                          <div className={`h-4 w-4 rounded-sm ${question.correctAnswer && Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option._id) ? 'bg-green-500' : 'border border-gray-300'}`}></div>
                          <span className={`ml-3 block text-sm ${question.correctAnswer && Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option._id) ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                            {option.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'essay' && (
                    <div className="mt-4">
                      <div className="border border-gray-300 rounded-md p-2 bg-gray-50 h-24">
                        <p className="text-sm text-gray-500 italic">Essay question - manually graded</p>
                      </div>
                    </div>
                  )}
                </div>
              ))) : (
                <p className="text-gray-500 text-center py-4">No questions available for this quiz.</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white shadow rounded-lg overflow-hidden lg:col-span-3">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Submissions</h3>
            <Link
              to={`/management/quizzes/${id}/submissions`}
              className="text-purple-600 hover:text-purple-900 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {submissions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No submissions yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted On
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time Spent
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
                    {submissions.map((submission) => (
                      <tr key={submission._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{submission.student?.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{submission.student?.email || 'No email'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {submission.submittedAt ? new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {submission.score !== undefined && submission.score !== null ? `${submission.score}%` : 'Not graded'}
                          </div>
                          {submission.score !== undefined && submission.score !== null && (
                            <div className="text-sm text-gray-500">
                              {submission.score >= quiz.passingScore ? 'Passed' : 'Failed'}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {submission.timeSpent ? `${submission.timeSpent} min` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            submission.status === 'graded' ? 'bg-green-100 text-green-800' :
                            submission.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                            submission.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {submission.status ? submission.status.charAt(0).toUpperCase() + submission.status.slice(1) : 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/management/quizzes/${id}/submissions/${submission._id}`}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            <FiEye className="inline-block mr-1" />
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDetail;
