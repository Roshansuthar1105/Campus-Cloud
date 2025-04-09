import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiBarChart2, FiPieChart, FiList } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PreferenceFormReports = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [form, setForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would fetch the form and submissions data from the API
        // const formResponse = await api.get(`/preference-forms/${id}`);
        // const submissionsResponse = await api.get(`/preference-forms/${id}/submissions`);
        // setForm(formResponse.data.data);
        // setSubmissions(submissionsResponse.data.data);
        
        // For now, we'll use mock data
        const mockForm = {
          _id: id,
          title: 'Course Feedback Form',
          description: 'Please provide your feedback on the course content, teaching methods, and overall experience.',
          course: {
            _id: 'course123',
            name: 'Introduction to Computer Science',
            code: 'CS101'
          },
          questions: [
            {
              _id: 'q1',
              text: 'How would you rate the overall quality of the course?',
              type: 'rating',
              required: true,
              options: [1, 2, 3, 4, 5]
            },
            {
              _id: 'q2',
              text: 'How would you rate the clarity of the course materials?',
              type: 'rating',
              required: true,
              options: [1, 2, 3, 4, 5]
            },
            {
              _id: 'q3',
              text: 'How would you rate the instructor\'s teaching effectiveness?',
              type: 'rating',
              required: true,
              options: [1, 2, 3, 4, 5]
            },
            {
              _id: 'q4',
              text: 'What aspects of the course did you find most valuable?',
              type: 'text',
              required: false
            },
            {
              _id: 'q5',
              text: 'What aspects of the course could be improved?',
              type: 'text',
              required: false
            },
            {
              _id: 'q6',
              text: 'Would you recommend this course to other students?',
              type: 'multiple-choice',
              required: true,
              options: [
                { _id: 'o1', text: 'Yes, definitely' },
                { _id: 'o2', text: 'Yes, with some reservations' },
                { _id: 'o3', text: 'No, not really' },
                { _id: 'o4', text: 'No, definitely not' }
              ]
            }
          ],
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
          // Generate random ratings between 3-5 with occasional lower ratings
          const q1Rating = Math.floor(Math.random() * 3) + 3; // 3-5
          const q2Rating = Math.floor(Math.random() * 3) + 3; // 3-5
          const q3Rating = Math.floor(Math.random() * 3) + 3; // 3-5
          
          // Occasionally add lower ratings for variety
          const lowerRating = i % 5 === 0;
          const finalQ1Rating = lowerRating ? Math.max(q1Rating - 2, 1) : q1Rating;
          const finalQ2Rating = lowerRating ? Math.max(q2Rating - 2, 1) : q2Rating;
          const finalQ3Rating = lowerRating ? Math.max(q3Rating - 2, 1) : q3Rating;
          
          // Generate random multiple choice answers with bias towards positive responses
          const mcOptions = ['o1', 'o1', 'o1', 'o2', 'o2', 'o3', 'o4']; // Weighted towards positive
          const randomMcIndex = Math.floor(Math.random() * mcOptions.length);
          const mcAnswer = mcOptions[randomMcIndex];
          
          // Generate submission date within the form's active period
          const startMs = new Date(mockForm.startDate).getTime();
          const endMs = new Date(mockForm.endDate).getTime();
          const randomMs = startMs + Math.random() * (endMs - startMs);
          const submissionDate = new Date(randomMs);
          
          // Text responses
          const positiveAspects = [
            'The practical coding exercises were very helpful.',
            'I enjoyed the interactive lectures and group discussions.',
            'The real-world examples made concepts easier to understand.',
            'The instructor was very knowledgeable and approachable.',
            'The course materials were well-organized and comprehensive.',
            'The assignments challenged me to think critically.',
            'The feedback on assignments was detailed and constructive.',
            'The pace of the course was perfect for learning the material.'
          ];
          
          const improvementAspects = [
            'More time could be spent on advanced topics.',
            'Additional resources for further learning would be beneficial.',
            'The pace was sometimes too fast for difficult concepts.',
            'More examples and practice problems would help.',
            'Some assignments were too time-consuming.',
            'More feedback on quizzes would be helpful.',
            'The textbook wasn\'t always clear on certain topics.',
            'More office hours would be appreciated.'
          ];
          
          const randomPositiveIndex = Math.floor(Math.random() * positiveAspects.length);
          const randomImprovementIndex = Math.floor(Math.random() * improvementAspects.length);
          
          mockSubmissions.push({
            _id: `sub${i + 1}`,
            formId: id,
            student: {
              _id: `student${i + 1}`,
              name: studentNames[i],
              email: studentNames[i].toLowerCase().replace(' ', '.') + '@example.com'
            },
            submittedAt: submissionDate,
            answers: {
              q1: finalQ1Rating.toString(),
              q2: finalQ2Rating.toString(),
              q3: finalQ3Rating.toString(),
              q4: positiveAspects[randomPositiveIndex],
              q5: improvementAspects[randomImprovementIndex],
              q6: mcAnswer
            }
          });
        }
        
        setForm(mockForm);
        setSubmissions(mockSubmissions);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load form data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const calculateStats = () => {
    if (!form || !submissions || submissions.length === 0) {
      return {
        totalSubmissions: 0,
        completionRate: 0,
        averageRatings: {},
        mcDistribution: {}
      };
    }
    
    const totalStudents = 25; // This would come from the API in a real app
    const completionRate = (submissions.length / totalStudents) * 100;
    
    // Calculate average ratings
    const ratingQuestions = form.questions.filter(q => q.type === 'rating');
    const averageRatings = {};
    const ratingDistribution = {};
    
    ratingQuestions.forEach(question => {
      const ratings = submissions
        .map(sub => parseInt(sub.answers[question._id], 10))
        .filter(rating => !isNaN(rating));
      
      if (ratings.length > 0) {
        const sum = ratings.reduce((a, b) => a + b, 0);
        averageRatings[question._id] = sum / ratings.length;
        
        // Calculate distribution
        ratingDistribution[question._id] = {};
        question.options.forEach(option => {
          ratingDistribution[question._id][option] = ratings.filter(r => r === option).length;
        });
      }
    });
    
    // Calculate multiple choice distribution
    const mcQuestions = form.questions.filter(q => q.type === 'multiple-choice');
    const mcDistribution = {};
    
    mcQuestions.forEach(question => {
      mcDistribution[question._id] = {};
      
      question.options.forEach(option => {
        const count = submissions.filter(sub => sub.answers[question._id] === option._id).length;
        mcDistribution[question._id][option._id] = {
          count,
          percentage: (count / submissions.length) * 100,
          text: option.text
        };
      });
    });
    
    return {
      totalSubmissions: submissions.length,
      totalStudents,
      completionRate,
      averageRatings,
      ratingDistribution,
      mcDistribution
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
                <dt className="text-sm font-medium text-gray-500 truncate">Completion Rate</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{Math.round(stats.completionRate)}%</dd>
                <p className="text-sm text-gray-500">{stats.totalSubmissions} out of {stats.totalStudents} students</p>
              </dl>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Average Rating</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {Object.values(stats.averageRatings).length > 0 
                    ? (Object.values(stats.averageRatings).reduce((a, b) => a + b, 0) / Object.values(stats.averageRatings).length).toFixed(1)
                    : 'N/A'
                  }
                </dd>
                <p className="text-sm text-gray-500">Across all rating questions</p>
              </dl>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Rating Questions</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {form.questions.filter(q => q.type === 'rating').map((question) => {
                const avgRating = stats.averageRatings[question._id] || 0;
                const distribution = stats.ratingDistribution[question._id] || {};
                
                return (
                  <div key={question._id} className="border-b border-gray-200 pb-6">
                    <h4 className="text-base font-medium text-gray-900">{question.text}</h4>
                    <div className="mt-2 flex items-center">
                      <span className="text-2xl font-bold text-indigo-600 mr-2">{avgRating.toFixed(1)}</span>
                      <span className="text-sm text-gray-500">out of 5</span>
                    </div>
                    
                    {/* Rating distribution visualization */}
                    <div className="mt-4">
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = distribution[rating] || 0;
                          const percentage = stats.totalSubmissions > 0 
                            ? (count / stats.totalSubmissions) * 100 
                            : 0;
                          
                          return (
                            <div key={rating} className="flex items-center">
                              <div className="w-8 text-sm font-medium text-gray-700">{rating}</div>
                              <div className="flex-1 ml-2">
                                <div className="bg-gray-200 rounded-full h-2.5 w-full">
                                  <div 
                                    className="bg-indigo-600 h-2.5 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="ml-2 w-12 text-sm text-gray-500 text-right">{count}</div>
                              <div className="ml-2 w-12 text-sm text-gray-500 text-right">{percentage.toFixed(0)}%</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Multiple Choice Questions</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {form.questions.filter(q => q.type === 'multiple-choice').map((question) => {
                const distribution = stats.mcDistribution[question._id] || {};
                
                return (
                  <div key={question._id} className="border-b border-gray-200 pb-6">
                    <h4 className="text-base font-medium text-gray-900">{question.text}</h4>
                    
                    {/* Multiple choice distribution visualization */}
                    <div className="mt-4">
                      <div className="space-y-2">
                        {question.options.map((option) => {
                          const data = distribution[option._id] || { count: 0, percentage: 0, text: option.text };
                          
                          return (
                            <div key={option._id} className="flex items-center">
                              <div className="w-40 text-sm font-medium text-gray-700 truncate">{data.text}</div>
                              <div className="flex-1 ml-2">
                                <div className="bg-gray-200 rounded-full h-2.5 w-full">
                                  <div 
                                    className="bg-indigo-600 h-2.5 rounded-full" 
                                    style={{ width: `${data.percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="ml-2 w-12 text-sm text-gray-500 text-right">{data.count}</div>
                              <div className="ml-2 w-12 text-sm text-gray-500 text-right">{data.percentage.toFixed(0)}%</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTextResponsesTab = () => {
    const textQuestions = form.questions.filter(q => q.type === 'text');
    
    return (
      <div>
        {textQuestions.map((question) => (
          <div key={question._id} className="mb-6 bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">{question.text}</h3>
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
                          — {submission.student.name}, {new Date(submission.submittedAt).toLocaleDateString()}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/faculty/preference-forms/${id}/submissions/${submission._id}`}
                        className="text-indigo-600 hover:text-indigo-900"
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
                onClick={() => navigate('/faculty/preference-forms')}
                className="text-sm text-red-700 hover:text-red-900 font-medium"
              >
                Return to Forms
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-10">
        <p>Form not found.</p>
        <button
          onClick={() => navigate('/faculty/preference-forms')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Return to Forms
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate(`/faculty/preference-forms/${id}`)}
            className="mr-4 text-indigo-600 hover:text-indigo-900"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{form.title} - Reports</h1>
            <p className="text-gray-600">{form.course.name} ({form.course.code})</p>
          </div>
        </div>
        <button
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <FiBarChart2 className="inline-block mr-2 -ml-1 h-5 w-5" />
            Summary
          </button>
          <button
            onClick={() => setActiveTab('text-responses')}
            className={`${
              activeTab === 'text-responses'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <FiPieChart className="inline-block mr-2 -ml-1 h-5 w-5" />
            Text Responses
          </button>
          <button
            onClick={() => setActiveTab('individual-responses')}
            className={`${
              activeTab === 'individual-responses'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <FiList className="inline-block mr-2 -ml-1 h-5 w-5" />
            Individual Responses
          </button>
        </nav>
      </div>

      {activeTab === 'summary' && renderSummaryTab()}
      {activeTab === 'text-responses' && renderTextResponsesTab()}
      {activeTab === 'individual-responses' && renderIndividualResponsesTab()}
    </div>
  );
};

export default PreferenceFormReports;
