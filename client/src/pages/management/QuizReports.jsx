import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiBarChart2, FiPieChart, FiList } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const QuizReports = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    const fetchData = async () => {
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
          isPublished: true
        };
        
        // Generate 20 mock submissions with realistic data
        const mockSubmissions = [];
        const studentNames = [
          'John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Charlie Brown',
          'Diana Prince', 'Edward Jones', 'Fiona Miller', 'George Davis', 'Hannah Wilson',
          'Ian Taylor', 'Julia Roberts', 'Kevin Anderson', 'Laura Martin', 'Michael Scott',
          'Nancy Garcia', 'Oliver White', 'Patricia Lee', 'Quentin Thomas', 'Rachel Green'
        ];
        
        for (let i = 0; i < 20; i++) {
          // Generate random scores between 60-100 with occasional lower scores
          const score = Math.floor(Math.random() * 41) + 60; // 60-100
          
          // Occasionally add lower scores for variety
          const lowerScore = i % 5 === 0;
          const finalScore = lowerScore ? Math.max(score - 30, 30) : score;
          
          // Generate random time spent between 30-60 minutes
          const timeSpent = Math.floor(Math.random() * 31) + 30; // 30-60
          
          // Generate submission date within the quiz's active period
          const startMs = new Date(mockQuiz.startDate).getTime();
          const endMs = new Date(mockQuiz.endDate).getTime();
          const randomMs = startMs + Math.random() * (endMs - startMs);
          const submissionDate = new Date(randomMs);
          
          // Generate random answers
          const answers = {
            q1: ['o1', 'o2', 'o3', 'o4'][Math.floor(Math.random() * 4)],
            q2: 'Recursion is a method where the solution to a problem depends on solutions to smaller instances of the same problem.',
            q3: [
              ['o1', 'o2', 'o3'],
              ['o1', 'o2'],
              ['o1', 'o3'],
              ['o2', 'o3'],
              ['o1', 'o2', 'o4']
            ][Math.floor(Math.random() * 5)]
          };
          
          mockSubmissions.push({
            _id: `sub${i + 1}`,
            quizId: id,
            student: {
              _id: `student${i + 1}`,
              name: studentNames[i],
              email: studentNames[i].toLowerCase().replace(' ', '.') + '@example.com'
            },
            submittedAt: submissionDate,
            score: finalScore,
            timeSpent,
            answers,
            status: 'graded'
          });
        }
        
        setQuiz(mockQuiz);
        setSubmissions(mockSubmissions);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load quiz data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const calculateStats = () => {
    if (!quiz || !submissions || submissions.length === 0) {
      return {
        totalSubmissions: 0,
        completionRate: 0,
        averageScore: 0,
        passingRate: 0,
        scoreDistribution: {},
        questionPerformance: {}
      };
    }
    
    const totalStudents = 25; // This would come from the API in a real app
    const completionRate = (submissions.length / totalStudents) * 100;
    
    // Calculate average score
    const totalScore = submissions.reduce((sum, sub) => sum + sub.score, 0);
    const averageScore = totalScore / submissions.length;
    
    // Calculate passing rate
    const passedSubmissions = submissions.filter(sub => sub.score >= quiz.passingScore);
    const passingRate = (passedSubmissions.length / submissions.length) * 100;
    
    // Calculate score distribution
    const scoreDistribution = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      'Below 60': 0
    };
    
    submissions.forEach(sub => {
      if (sub.score >= 90) {
        scoreDistribution['90-100']++;
      } else if (sub.score >= 80) {
        scoreDistribution['80-89']++;
      } else if (sub.score >= 70) {
        scoreDistribution['70-79']++;
      } else if (sub.score >= 60) {
        scoreDistribution['60-69']++;
      } else {
        scoreDistribution['Below 60']++;
      }
    });
    
    // Calculate question performance
    const questionPerformance = {};
    
    if (quiz.questions) {
      quiz.questions.forEach(question => {
        if (question.type === 'multiple-choice' || question.type === 'multiple-select') {
          const correctCount = submissions.filter(sub => {
            if (question.type === 'multiple-choice') {
              return sub.answers[question._id] === question.correctAnswer;
            } else {
              const studentAnswer = sub.answers[question._id] || [];
              const correctAnswer = question.correctAnswer || [];
              
              // Check if arrays are equal (ignoring order)
              return (
                studentAnswer.length === correctAnswer.length &&
                correctAnswer.every(ans => studentAnswer.includes(ans))
              );
            }
          }).length;
          
          questionPerformance[question._id] = {
            correctCount,
            correctPercentage: (correctCount / submissions.length) * 100,
            questionText: question.text
          };
        }
      });
    }
    
    return {
      totalSubmissions: submissions.length,
      totalStudents,
      completionRate,
      averageScore,
      passingRate,
      scoreDistribution,
      questionPerformance
    };
  };

  const stats = calculateStats();

  const renderSummaryTab = () => {
    return (
      <div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Submissions</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalSubmissions}</dd>
              </dl>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Average Score</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.averageScore.toFixed(1)}%</dd>
              </dl>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Passing Rate</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.passingRate.toFixed(1)}%</dd>
                <p className="text-sm text-gray-500">Passing score: {quiz.passingScore}%</p>
              </dl>
            </div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Score Distribution</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                {Object.entries(stats.scoreDistribution).map(([range, count]) => {
                  const percentage = (count / stats.totalSubmissions) * 100;
                  
                  return (
                    <div key={range}>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-900">{range}</div>
                        <div className="text-sm text-gray-500">{count} students ({percentage.toFixed(1)}%)</div>
                      </div>
                      <div className="mt-1">
                        <div className="bg-gray-200 rounded-full h-2.5 w-full">
                          <div 
                            className="bg-purple-600 h-2.5 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 text-center">
                <div className="text-gray-500">
                  <FiPieChart className="mx-auto h-16 w-16 text-purple-400" />
                  <p className="mt-2 text-sm">Chart visualization would appear here in a real application.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Question Performance</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                {Object.entries(stats.questionPerformance).map(([questionId, data]) => {
                  const question = quiz.questions.find(q => q._id === questionId);
                  if (!question) return null;
                  
                  return (
                    <div key={questionId}>
                      <div className="text-sm font-medium text-gray-900 mb-2 line-clamp-2" title={data.questionText}>
                        {data.questionText}
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm text-gray-500">Correct Answers</div>
                        <div className="text-sm text-gray-900">{data.correctCount} ({data.correctPercentage.toFixed(1)}%)</div>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2.5 w-full">
                        <div 
                          className="bg-green-500 h-2.5 rounded-full" 
                          style={{ width: `${data.correctPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
                
                {Object.keys(stats.questionPerformance).length === 0 && (
                  <p className="text-gray-500 text-center">No objective questions to analyze.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Time Analysis</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <h4 className="text-base font-medium text-gray-900">Average Time Spent</h4>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {(submissions.reduce((sum, sub) => sum + sub.timeSpent, 0) / submissions.length).toFixed(1)} min
                </p>
                <p className="text-sm text-gray-500">Out of {quiz.timeLimit} min allowed</p>
              </div>
              
              <div>
                <h4 className="text-base font-medium text-gray-900">Fastest Completion</h4>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {Math.min(...submissions.map(sub => sub.timeSpent))} min
                </p>
              </div>
              
              <div>
                <h4 className="text-base font-medium text-gray-900">Slowest Completion</h4>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {Math.max(...submissions.map(sub => sub.timeSpent))} min
                </p>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <div className="text-gray-500">
                <FiBarChart2 className="mx-auto h-16 w-16 text-purple-400" />
                <p className="mt-2 text-sm">Time distribution chart would appear here in a real application.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEssayResponsesTab = () => {
    const essayQuestions = quiz.questions.filter(q => q.type === 'essay');
    
    if (essayQuestions.length === 0) {
      return (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">This quiz does not contain any essay questions.</p>
        </div>
      );
    }
    
    return (
      <div>
        {essayQuestions.map((question) => (
          <div key={question._id} className="mb-6 bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">{question.text}</h3>
              <p className="mt-1 text-sm text-gray-500">{question.points} points</p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              {submissions.filter(sub => sub.answers[question._id]).length === 0 ? (
                <p className="text-gray-500">No responses for this question.</p>
              ) : (
                <ul className="space-y-4">
                  {submissions
                    .filter(sub => sub.answers[question._id])
                    .map((submission) => (
                      <li key={`${submission._id}-${question._id}`} className="border-b border-gray-200 pb-4">
                        <p className="text-gray-700">{submission.answers[question._id]}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          — {submission.student.name}, Score: {submission.score}%
                        </p>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderIndividualResponsesTab = () => {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Individual Responses</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
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
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(`/management/quizzes/${id}`)}
            className="mr-4 text-purple-600 hover:text-purple-900"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title} - Reports</h1>
            <p className="text-gray-600">{quiz.course.name} ({quiz.course.code})</p>
          </div>
        </div>
        <button
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          <FiDownload className="mr-2 -ml-1 h-5 w-5" />
          Export Report
        </button>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('summary')}
            className={`${
              activeTab === 'summary'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <FiBarChart2 className="inline-block mr-2 -ml-1 h-5 w-5" />
            Summary
          </button>
          <button
            onClick={() => setActiveTab('essay-responses')}
            className={`${
              activeTab === 'essay-responses'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <FiPieChart className="inline-block mr-2 -ml-1 h-5 w-5" />
            Essay Responses
          </button>
          <button
            onClick={() => setActiveTab('individual-responses')}
            className={`${
              activeTab === 'individual-responses'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <FiList className="inline-block mr-2 -ml-1 h-5 w-5" />
            Individual Responses
          </button>
        </nav>
      </div>

      {activeTab === 'summary' && renderSummaryTab()}
      {activeTab === 'essay-responses' && renderEssayResponsesTab()}
      {activeTab === 'individual-responses' && renderIndividualResponsesTab()}
    </div>
  );
};

export default QuizReports;
