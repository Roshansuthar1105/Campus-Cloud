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
        
        // In a real app, you would fetch the quiz and submissions data from the API
        // const quizResponse = await api.get(`/quizzes/${id}`);
        // const submissionsResponse = await api.get(`/quizzes/${id}/submissions`);
        // setQuiz(quizResponse.data.data);
        // setSubmissions(submissionsResponse.data.data);
        
        // For now, we'll use mock data
        const mockQuiz = {
          _id: id,
          title: 'Midterm Examination',
          description: 'Comprehensive midterm covering all topics from weeks 1-8.',
          course: {
            _id: 'course123',
            name: 'Introduction to Computer Science',
            code: 'CS101'
          },
          questions: [
            {
              _id: 'q1',
              text: 'What is the time complexity of binary search?',
              type: 'multiple-choice',
              options: [
                { _id: 'o1', text: 'O(1)' },
                { _id: 'o2', text: 'O(log n)' },
                { _id: 'o3', text: 'O(n)' },
                { _id: 'o4', text: 'O(n log n)' }
              ],
              correctAnswer: 'o2',
              points: 5
            },
            {
              _id: 'q2',
              text: 'Explain the concept of recursion and provide an example.',
              type: 'essay',
              points: 10
            },
            {
              _id: 'q3',
              text: 'Which of the following are valid data structures? (Select all that apply)',
              type: 'multiple-select',
              options: [
                { _id: 'o1', text: 'Array' },
                { _id: 'o2', text: 'Linked List' },
                { _id: 'o3', text: 'Queue' },
                { _id: 'o4', text: 'Branch' }
              ],
              correctAnswer: ['o1', 'o2', 'o3'],
              points: 5
            }
          ],
          timeLimit: 60,
          passingScore: 70,
          startDate: new Date(2023, 10, 1),
          endDate: new Date(2023, 11, 15),
          isPublished: true,
          createdAt: new Date(2023, 9, 15),
          createdBy: {
            _id: 'faculty123',
            name: 'Professor Johnson'
          }
        };
        
        const mockSubmissions = [
          {
            _id: 'sub1',
            quizId: id,
            student: {
              _id: 'student1',
              name: 'John Doe',
              email: 'john.doe@example.com'
            },
            submittedAt: new Date(2023, 10, 5),
            score: 85,
            timeSpent: 45,
            answers: {
              q1: 'o2',
              q2: 'Recursion is a method where the solution to a problem depends on solutions to smaller instances of the same problem. Example: factorial function.',
              q3: ['o1', 'o2', 'o3']
            },
            status: 'graded'
          },
          {
            _id: 'sub2',
            quizId: id,
            student: {
              _id: 'student2',
              name: 'Jane Smith',
              email: 'jane.smith@example.com'
            },
            submittedAt: new Date(2023, 10, 7),
            score: 92,
            timeSpent: 52,
            answers: {
              q1: 'o2',
              q2: 'Recursion is when a function calls itself. A classic example is calculating factorial: n! = n * (n-1)!',
              q3: ['o1', 'o2', 'o3']
            },
            status: 'graded'
          },
          {
            _id: 'sub3',
            quizId: id,
            student: {
              _id: 'student3',
              name: 'Bob Johnson',
              email: 'bob.johnson@example.com'
            },
            submittedAt: new Date(2023, 10, 10),
            score: 68,
            timeSpent: 58,
            answers: {
              q1: 'o3',
              q2: 'Recursion is when a function calls itself until it reaches a base case.',
              q3: ['o1', 'o2', 'o4']
            },
            status: 'graded'
          }
        ];
        
        setQuiz(mockQuiz);
        setSubmissions(mockSubmissions);
        
        // Calculate statistics
        const totalStudents = 25; // This would come from the API in a real app
        const completionRate = (mockSubmissions.length / totalStudents) * 100;
        const totalScore = mockSubmissions.reduce((sum, sub) => sum + sub.score, 0);
        const averageScore = totalScore / mockSubmissions.length;
        
        setStats({
          totalSubmissions: mockSubmissions.length,
          totalStudents,
          completionRate,
          averageScore
        });
        
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
                  {new Date(quiz.startDate).toLocaleDateString()} - {new Date(quiz.endDate).toLocaleDateString()}
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
                  {quiz.timeLimit} minutes
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Passing Score</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {quiz.passingScore}%
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Created By</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {quiz.createdBy.name}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Created On</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(quiz.createdAt).toLocaleDateString()}
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
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalSubmissions}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Completion Rate</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{Math.round(stats.completionRate)}%</dd>
                <p className="text-sm text-gray-500">{stats.totalSubmissions} out of {stats.totalStudents} students</p>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Average Score</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.averageScore.toFixed(1)}%</dd>
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
              {quiz.questions.map((question, index) => (
                <div key={question._id} className="border-b border-gray-200 pb-6">
                  <div className="mb-2">
                    <span className="text-lg font-medium text-gray-900 mr-2">{index + 1}.</span>
                    <span className="text-lg text-gray-900">{question.text}</span>
                    <span className="ml-2 text-sm text-gray-500">({question.points} points)</span>
                  </div>

                  {question.type === 'multiple-choice' && (
                    <div className="mt-4 space-y-2">
                      {question.options.map((option) => (
                        <div key={option._id} className="flex items-center">
                          <div className={`h-4 w-4 rounded-full ${option._id === question.correctAnswer ? 'bg-green-500' : 'border border-gray-300'}`}></div>
                          <span className={`ml-3 block text-sm ${option._id === question.correctAnswer ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                            {option.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'multiple-select' && (
                    <div className="mt-4 space-y-2">
                      {question.options.map((option) => (
                        <div key={option._id} className="flex items-center">
                          <div className={`h-4 w-4 rounded-sm ${question.correctAnswer.includes(option._id) ? 'bg-green-500' : 'border border-gray-300'}`}></div>
                          <span className={`ml-3 block text-sm ${question.correctAnswer.includes(option._id) ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
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
              ))}
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
                          <div className="text-sm font-medium text-gray-900">{submission.student.name}</div>
                          <div className="text-sm text-gray-500">{submission.student.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {submission.score}%
                          </div>
                          <div className="text-sm text-gray-500">
                            {submission.score >= quiz.passingScore ? 'Passed' : 'Failed'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {submission.timeSpent} min
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            submission.status === 'graded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
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
