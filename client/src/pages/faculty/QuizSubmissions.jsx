import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiEye, FiCheck, FiX, FiClock, FiSearch, FiFilter, FiDownload } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const QuizSubmissions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would fetch the quiz data from the API
        // const quizResponse = await api.get(`/quizzes/${id}`);
        // setQuiz(quizResponse.data.data);
        
        // For now, we'll use mock data
        const mockQuiz = {
          _id: id,
          title: 'Midterm Exam: Web Development Fundamentals',
          course: {
            _id: 'course123',
            name: 'Web Development Fundamentals',
            code: 'CS301'
          },
          totalPoints: 100,
          passingScore: 70,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        };
        
        setQuiz(mockQuiz);
        
        // Fetch submissions
        // In a real app, you would fetch the submissions from the API
        // const submissionsResponse = await api.get(`/quizzes/${id}/submissions`);
        // setSubmissions(submissionsResponse.data.data);
        
        // For now, we'll use mock submissions
        const mockSubmissions = [
          {
            _id: 'sub1',
            student: {
              _id: 'student1',
              name: 'John Doe',
              email: 'john.doe@example.com',
              avatar: null
            },
            score: 85,
            status: 'graded',
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            gradedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            timeSpent: 45 // minutes
          },
          {
            _id: 'sub2',
            student: {
              _id: 'student2',
              name: 'Jane Smith',
              email: 'jane.smith@example.com',
              avatar: null
            },
            score: 92,
            status: 'graded',
            submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            gradedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            timeSpent: 52 // minutes
          },
          {
            _id: 'sub3',
            student: {
              _id: 'student3',
              name: 'Michael Johnson',
              email: 'michael.johnson@example.com',
              avatar: null
            },
            score: 78,
            status: 'graded',
            submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
            gradedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            timeSpent: 58 // minutes
          },
          {
            _id: 'sub4',
            student: {
              _id: 'student4',
              name: 'Emily Davis',
              email: 'emily.davis@example.com',
              avatar: null
            },
            score: null,
            status: 'pending',
            submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            gradedAt: null,
            timeSpent: 49 // minutes
          },
          {
            _id: 'sub5',
            student: {
              _id: 'student5',
              name: 'Robert Wilson',
              email: 'robert.wilson@example.com',
              avatar: null
            },
            score: 65,
            status: 'graded',
            submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            gradedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
            timeSpent: 60 // minutes
          }
        ];
        
        setSubmissions(mockSubmissions);
        setError(null);
      } catch (err) {
        console.error('Error fetching quiz submissions:', err);
        setError('Failed to load quiz submissions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [id]);

  const handleGradeSubmission = (submissionId) => {
    navigate(`/faculty/submissions/${submissionId}/grade`);
  };

  const handleViewSubmission = (submissionId) => {
    navigate(`/faculty/submissions/${submissionId}/view`);
  };

  const handleExportSubmissions = () => {
    // In a real app, this would trigger an API call to export the submissions
    alert('This would export the submissions to a CSV or Excel file in a real application.');
  };

  // Filter and sort submissions
  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          submission.student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || submission.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'asc' 
        ? new Date(a.submittedAt) - new Date(b.submittedAt)
        : new Date(b.submittedAt) - new Date(a.submittedAt);
    } else if (sortBy === 'name') {
      return sortOrder === 'asc'
        ? a.student.name.localeCompare(b.student.name)
        : b.student.name.localeCompare(a.student.name);
    } else if (sortBy === 'score') {
      // Handle null scores (pending submissions)
      if (a.score === null && b.score === null) return 0;
      if (a.score === null) return sortOrder === 'asc' ? -1 : 1;
      if (b.score === null) return sortOrder === 'asc' ? 1 : -1;
      
      return sortOrder === 'asc' ? a.score - b.score : b.score - a.score;
    }
    return 0;
  });

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
            onClick={() => navigate(`/faculty/quizzes/${id}`)}
            className="mr-4 text-blue-600 hover:text-blue-900"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Submissions: {quiz.title}</h1>
            <p className="text-gray-600">{quiz.course.name} ({quiz.course.code})</p>
          </div>
        </div>
        <button
          onClick={handleExportSubmissions}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiDownload className="mr-2 -ml-0.5 h-4 w-4" />
          Export Submissions
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="w-full md:w-1/3">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search by student name or email"
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
              <div className="w-full md:w-auto">
                <label htmlFor="filter" className="sr-only">
                  Filter by Status
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiFilter className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="filter"
                    name="filter"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Submissions</option>
                    <option value="graded">Graded</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              
              <div className="w-full md:w-auto">
                <label htmlFor="sort" className="sr-only">
                  Sort By
                </label>
                <select
                  id="sort"
                  name="sort"
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                  }}
                >
                  <option value="date-desc">Date (Newest First)</option>
                  <option value="date-asc">Date (Oldest First)</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="score-desc">Score (High to Low)</option>
                  <option value="score-asc">Score (Low to High)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submission Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Spent
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedSubmissions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No submissions found matching your criteria.
                  </td>
                </tr>
              ) : (
                sortedSubmissions.map((submission) => (
                  <tr key={submission._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {submission.student.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={submission.student.avatar}
                              alt={submission.student.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {submission.student.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{submission.student.name}</div>
                          <div className="text-sm text-gray-500">{submission.student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.submittedAt).toLocaleDateString()} at {new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <FiClock className="mr-1.5 h-4 w-4 text-gray-400" />
                        {submission.timeSpent} minutes
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {submission.score !== null ? (
                        <div className="text-sm font-medium">
                          <span className={`${submission.score >= quiz.passingScore ? 'text-green-600' : 'text-red-600'}`}>
                            {submission.score}%
                          </span>
                          <span className="text-gray-500 ml-1">
                            ({Math.round(submission.score * quiz.totalPoints / 100)}/{quiz.totalPoints})
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not graded</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {submission.status === 'graded' ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          <FiCheck className="mr-1 h-4 w-4" /> Graded
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          <FiClock className="mr-1 h-4 w-4" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {submission.status === 'pending' ? (
                        <button
                          onClick={() => handleGradeSubmission(submission._id)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Grade
                        </button>
                      ) : (
                        <button
                          onClick={() => handleViewSubmission(submission._id)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuizSubmissions;
