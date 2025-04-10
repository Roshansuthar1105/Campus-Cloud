import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiBarChart2, FiUsers, FiClock, FiCalendar, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const QuizDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    completionRate: 0
  });

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would fetch the quiz data from the API
        // const response = await api.get(`/quizzes/${id}`);
        // setQuiz(response.data.data);
        
        // For now, we'll use mock data
        const mockQuiz = {
          _id: id,
          title: 'Midterm Exam: Web Development Fundamentals',
          description: 'This quiz covers HTML, CSS, JavaScript basics, and responsive design principles.',
          course: {
            _id: 'course123',
            name: 'Web Development Fundamentals',
            code: 'CS301'
          },
          timeLimit: 60, // in minutes
          totalPoints: 100,
          passingScore: 70,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          questions: [
            {
              _id: 'q1',
              text: 'What does HTML stand for?',
              type: 'multiple-choice',
              points: 5,
              options: [
                { _id: 'o1', text: 'Hyper Text Markup Language' },
                { _id: 'o2', text: 'High Tech Multi Language' },
                { _id: 'o3', text: 'Hyper Transfer Markup Language' },
                { _id: 'o4', text: 'Home Tool Markup Language' }
              ],
              correctAnswer: 'o1'
            },
            {
              _id: 'q2',
              text: 'Which CSS property is used to control the spacing between elements?',
              type: 'multiple-choice',
              points: 5,
              options: [
                { _id: 'o1', text: 'spacing' },
                { _id: 'o2', text: 'margin' },
                { _id: 'o3', text: 'padding' },
                { _id: 'o4', text: 'border' }
              ],
              correctAnswer: 'o2'
            },
            {
              _id: 'q3',
              text: 'Explain the difference between let, const, and var in JavaScript.',
              type: 'essay',
              points: 10
            },
            {
              _id: 'q4',
              text: 'What is the purpose of media queries in CSS?',
              type: 'essay',
              points: 10
            },
            {
              _id: 'q5',
              text: 'Select all valid ways to create a JavaScript object:',
              type: 'multiple-select',
              points: 10,
              options: [
                { _id: 'o1', text: 'const obj = {};' },
                { _id: 'o2', text: 'const obj = new Object();' },
                { _id: 'o3', text: 'const obj = Object.create(null);' },
                { _id: 'o4', text: 'const obj = Object.instance();' }
              ],
              correctAnswers: ['o1', 'o2', 'o3']
            }
          ],
          published: true,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
        };
        
        setQuiz(mockQuiz);
        
        // Fetch quiz statistics
        // In a real app, you would fetch the stats from the API
        // const statsResponse = await api.get(`/quizzes/${id}/stats`);
        // setStats(statsResponse.data.data);
        
        // For now, we'll use mock stats
        const mockStats = {
          totalSubmissions: 45,
          averageScore: 78.5,
          highestScore: 98,
          lowestScore: 52,
          completionRate: 85 // percentage
        };
        
        setStats(mockStats);
        
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

  const handleEditQuiz = () => {
    navigate(`/faculty/quizzes/${id}/edit`);
  };

  const handleViewSubmissions = () => {
    navigate(`/faculty/quizzes/${id}/submissions`);
  };

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
                onClick={() => navigate('/faculty/quizzes')}
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
          onClick={() => navigate('/faculty/quizzes')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Return to Quizzes
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/faculty/quizzes')}
            className="mr-4 text-blue-600 hover:text-blue-900"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-gray-600">{quiz.course.name} ({quiz.course.code})</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleEditQuiz}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiEdit className="mr-2 -ml-0.5 h-4 w-4" />
            Edit Quiz
          </button>
          <button
            onClick={handleViewSubmissions}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FiUsers className="mr-2 -ml-0.5 h-4 w-4" />
            View Submissions
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Quiz Details</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">{quiz.description}</p>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center mb-4">
                <FiClock className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">Time Limit: {quiz.timeLimit} minutes</span>
              </div>
              <div className="flex items-center mb-4">
                <FiCalendar className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">Due Date: {new Date(quiz.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center mb-4">
                <FiBarChart2 className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">Total Points: {quiz.totalPoints}</span>
              </div>
              <div className="flex items-center">
                {quiz.published ? (
                  <FiCheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <FiXCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span className="text-sm text-gray-700">Status: {quiz.published ? 'Published' : 'Draft'}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Quiz Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Total Submissions</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.totalSubmissions}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Completion Rate</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.completionRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Average Score</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.averageScore}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Passing Score</p>
                  <p className="text-lg font-semibold text-gray-900">{quiz.passingScore}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Questions</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Total: {quiz.questions.length} questions ({quiz.totalPoints} points)
          </p>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-8">
            {quiz.questions.map((question, index) => (
              <div key={question._id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-baseline mb-2">
                  <div className="flex items-baseline">
                    <span className="text-lg font-medium text-gray-900 mr-2">Q{index + 1}.</span>
                    <span className="text-lg text-gray-900">{question.text}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-500">{question.points} pts</span>
                </div>
                
                {question.type === 'multiple-choice' && (
                  <div className="mt-4 ml-8">
                    <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
                    <ul className="space-y-2">
                      {question.options.map((option) => (
                        <li key={option._id} className="flex items-center">
                          <div className={`h-4 w-4 rounded-full mr-2 ${option._id === question.correctAnswer ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                          <span className={`text-sm ${option._id === question.correctAnswer ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                            {option.text}
                            {option._id === question.correctAnswer && ' (Correct)'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {question.type === 'multiple-select' && (
                  <div className="mt-4 ml-8">
                    <p className="text-sm font-medium text-gray-700 mb-2">Options (select all that apply):</p>
                    <ul className="space-y-2">
                      {question.options.map((option) => (
                        <li key={option._id} className="flex items-center">
                          <div className={`h-4 w-4 rounded mr-2 ${question.correctAnswers.includes(option._id) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                          <span className={`text-sm ${question.correctAnswers.includes(option._id) ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                            {option.text}
                            {question.correctAnswers.includes(option._id) && ' (Correct)'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {question.type === 'essay' && (
                  <div className="mt-4 ml-8">
                    <p className="text-sm font-medium text-gray-700 mb-2">Essay Question</p>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-500 italic">Students will provide a written response to this question.</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDetail;
