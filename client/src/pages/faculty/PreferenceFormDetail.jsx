import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiDownload, FiUsers, FiBarChart2, FiEye, FiCalendar, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PreferenceFormDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [form, setForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    completionRate: 0,
    averageRatings: {}
  });

  useEffect(() => {
    const fetchFormData = async () => {
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
          isPublished: true,
          createdAt: new Date(2023, 9, 15)
        };
        
        const mockSubmissions = [
          {
            _id: 'sub1',
            formId: id,
            student: {
              _id: 'student1',
              name: 'John Doe',
              email: 'john.doe@example.com'
            },
            submittedAt: new Date(2023, 10, 5),
            answers: {
              q1: '4',
              q2: '5',
              q3: '4',
              q4: 'The practical coding exercises and real-world examples were very helpful in understanding the concepts.',
              q5: 'More time could be spent on advanced topics and additional resources for further learning would be beneficial.',
              q6: 'o1'
            }
          },
          {
            _id: 'sub2',
            formId: id,
            student: {
              _id: 'student2',
              name: 'Jane Smith',
              email: 'jane.smith@example.com'
            },
            submittedAt: new Date(2023, 10, 7),
            answers: {
              q1: '5',
              q2: '4',
              q3: '5',
              q4: 'The interactive lectures and group discussions were very engaging and helped me understand complex topics.',
              q5: 'The pace was sometimes too fast, especially for the more difficult concepts.',
              q6: 'o1'
            }
          },
          {
            _id: 'sub3',
            formId: id,
            student: {
              _id: 'student3',
              name: 'Bob Johnson',
              email: 'bob.johnson@example.com'
            },
            submittedAt: new Date(2023, 10, 10),
            answers: {
              q1: '3',
              q2: '3',
              q3: '4',
              q4: 'The assignments were challenging but helped reinforce the concepts learned in class.',
              q5: 'More examples and practice problems would be helpful.',
              q6: 'o2'
            }
          }
        ];
        
        setForm(mockForm);
        setSubmissions(mockSubmissions);
        
        // Calculate statistics
        const totalStudents = 25; // This would come from the API in a real app
        const completionRate = (mockSubmissions.length / totalStudents) * 100;
        
        // Calculate average ratings
        const ratingQuestions = mockForm.questions.filter(q => q.type === 'rating');
        const averageRatings = {};
        
        ratingQuestions.forEach(question => {
          const ratings = mockSubmissions
            .map(sub => parseInt(sub.answers[question._id], 10))
            .filter(rating => !isNaN(rating));
          
          if (ratings.length > 0) {
            const sum = ratings.reduce((a, b) => a + b, 0);
            averageRatings[question._id] = sum / ratings.length;
          }
        });
        
        // Calculate multiple choice distribution
        const mcQuestions = mockForm.questions.filter(q => q.type === 'multiple-choice');
        const mcDistribution = {};
        
        mcQuestions.forEach(question => {
          mcDistribution[question._id] = {};
          
          question.options.forEach(option => {
            const count = mockSubmissions.filter(sub => sub.answers[question._id] === option._id).length;
            mcDistribution[question._id][option._id] = count;
          });
        });
        
        setStats({
          totalSubmissions: mockSubmissions.length,
          totalStudents,
          completionRate,
          averageRatings,
          mcDistribution
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching form data:', err);
        setError('Failed to load form details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [id]);

  const getFormStatus = () => {
    if (!form) return '';
    
    const now = new Date();
    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);
    
    if (!form.isPublished) {
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

  const status = getFormStatus();
  const statusColor = getStatusColor(status);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/faculty/preference-forms')}
            className="mr-4 text-indigo-600 hover:text-indigo-900"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
            <p className="text-gray-600">{form.course.name} ({form.course.code})</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/faculty/preference-forms/${id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiEdit2 className="mr-2 -ml-1 h-5 w-5" />
            Edit Form
          </Link>
          <Link
            to={`/faculty/preference-forms/${id}/reports`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiBarChart2 className="mr-2 -ml-1 h-5 w-5" />
            View Reports
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form Details */}
        <div className="bg-white shadow rounded-lg overflow-hidden lg:col-span-2">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Form Details</h3>
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${statusColor}-100 text-${statusColor}-800`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{form.description || 'No description provided.'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Date Range</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <FiCalendar className="inline-block mr-1" />
                  {new Date(form.startDate).toLocaleDateString()} - {new Date(form.endDate).toLocaleDateString()}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Published</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {form.isPublished ? (
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
                <dt className="text-sm font-medium text-gray-500">Created On</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(form.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Questions</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {form.questions.length}
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
                <dt className="text-sm font-medium text-gray-500">Average Ratings</dt>
                <dd className="mt-1">
                  <ul className="space-y-1">
                    {Object.entries(stats.averageRatings).map(([questionId, rating]) => {
                      const question = form.questions.find(q => q._id === questionId);
                      return (
                        <li key={questionId} className="text-sm">
                          <span className="font-medium">{question?.text.substring(0, 30)}...</span>: {rating.toFixed(1)}/5
                        </li>
                      );
                    })}
                  </ul>
                </dd>
              </div>
            </dl>
            <div className="mt-6">
              <Link
                to={`/faculty/preference-forms/${id}/reports`}
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                View detailed reports →
              </Link>
            </div>
          </div>
        </div>

        {/* Form Preview */}
        <div className="bg-white shadow rounded-lg overflow-hidden lg:col-span-3">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Form Preview</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {form.questions.map((question, index) => (
                <div key={question._id} className="border-b border-gray-200 pb-6">
                  <div className="mb-2">
                    <span className="text-lg font-medium text-gray-900 mr-2">{index + 1}.</span>
                    <span className="text-lg text-gray-900">{question.text}</span>
                    {question.required && (
                      <span className="ml-1 text-red-500">*</span>
                    )}
                  </div>

                  {question.type === 'rating' && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between max-w-md">
                        <span className="text-sm text-gray-500">Poor</span>
                        <span className="text-sm text-gray-500">Excellent</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between max-w-md">
                        {question.options.map((option) => (
                          <div key={option} className="flex flex-col items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                              {option}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {question.type === 'text' && (
                    <div className="mt-4">
                      <div className="border border-gray-300 rounded-md p-2 bg-gray-50 h-24"></div>
                    </div>
                  )}

                  {question.type === 'multiple-choice' && (
                    <div className="mt-4 space-y-2">
                      {question.options.map((option) => (
                        <div key={option._id} className="flex items-center">
                          <div className="h-4 w-4 rounded-full border border-gray-300"></div>
                          <span className="ml-3 block text-sm text-gray-700">
                            {option.text}
                          </span>
                        </div>
                      ))}
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
              to={`/faculty/preference-forms/${id}/submissions`}
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
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

export default PreferenceFormDetail;
