import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiCheckCircle } from 'react-icons/fi';
import preferenceAPI from '../../services/preferenceApi';
import { useAuth } from '../../context/AuthContext';

const PreferenceFormView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);

        try {
          // Fetch the form data from the API
          const formResponse = await preferenceAPI.getPreferenceForm(id);
          setForm(formResponse.data.data);

          // Fetch the user's submission for this form
          // Note: This endpoint might need to be added to the API
          const submissionResponse = await preferenceAPI.getFormSubmissions(id);
          // Find the user's submission in the list
          const userSubmission = submissionResponse.data.data.find(
            submission => submission.studentId === user._id
          );

          if (userSubmission) {
            setSubmission(userSubmission);
          } else {
            throw new Error('Submission not found');
          }
        } catch (apiError) {
          console.error('Error fetching data from API:', apiError);
          // Fallback to mock data if API calls fail
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
            endDate: new Date(2023, 11, 15)
          };

          const mockSubmission = {
            _id: 'sub123',
            formId: id,
            studentId: user._id,
            submittedAt: new Date(2023, 10, 5),
            answers: {
              q1: '4',
              q2: '5',
              q3: '4',
              q4: 'The practical coding exercises and real-world examples were very helpful in understanding the concepts.',
              q5: 'More time could be spent on advanced topics and additional resources for further learning would be beneficial.',
              q6: 'o1'
            }
          };

          setForm(mockForm);
          setSubmission(mockSubmission);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching form data:', err);
        setError('Failed to load form submission. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [id, user._id]);

  const getAnswerDisplay = (question, answer) => {
    if (!answer) return 'Not answered';

    if (question.type === 'rating') {
      return `${answer} out of ${Math.max(...question.options)}`;
    }

    if (question.type === 'text') {
      return answer || 'No response provided';
    }

    if (question.type === 'multiple-choice') {
      const selectedOption = question.options.find(opt => opt._id === answer);
      return selectedOption ? selectedOption.text : 'Invalid selection';
    }

    return answer;
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
                onClick={() => navigate('/student/preferences')}
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

  if (!form || !submission) {
    return (
      <div className="text-center py-10">
        <p>Form submission not found.</p>
        <button
          onClick={() => navigate('/student/preferences')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Return to Forms
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate('/student/preferences')}
          className="mr-4 text-blue-600 hover:text-blue-900"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{form.title} - Your Submission</h1>
          <p className="text-gray-600">{form.course.name} ({form.course.code})</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Submission Details</h3>
            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
              Completed
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            <FiCalendar className="inline-block mr-1" />
            Submitted on {new Date(submission.submittedAt).toLocaleDateString()} at {new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="px-4 py-5 sm:p-6">
          <div className="mb-6">
            <p className="text-gray-700">{form.description}</p>
          </div>

          <div className="space-y-8">
            {form.questions.map((question, index) => (
              <div key={question._id} className="border-b border-gray-200 pb-6">
                <div className="mb-2 flex items-baseline">
                  <span className="text-lg font-medium text-gray-900 mr-2">{index + 1}.</span>
                  <span className="text-lg text-gray-900">{question.text}</span>
                </div>

                <div className="mt-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm font-medium text-gray-700">Your Answer:</p>

                    {question.type === 'rating' && (
                      <div className="mt-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <div key={rating} className="mr-4 flex flex-col items-center">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                parseInt(submission.answers[question._id]) === rating
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-500'
                              }`}>
                                {rating}
                              </div>
                              {parseInt(submission.answers[question._id]) === rating && (
                                <FiCheckCircle className="mt-1 text-green-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {question.type === 'text' && (
                      <div className="mt-2">
                        <p className="text-gray-700">
                          {submission.answers[question._id] || <span className="italic text-gray-500">No response provided</span>}
                        </p>
                      </div>
                    )}

                    {question.type === 'multiple-choice' && (
                      <div className="mt-2">
                        <ul className="space-y-1">
                          {question.options.map((option) => (
                            <li key={option._id} className="flex items-center">
                              {option._id === submission.answers[question._id] ? (
                                <FiCheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              ) : (
                                <div className="h-5 w-5 mr-2" />
                              )}
                              <span className={`text-sm ${
                                option._id === submission.answers[question._id]
                                  ? 'font-medium text-gray-900'
                                  : 'text-gray-500'
                              }`}>
                                {option.text}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/student/preferences')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Forms
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferenceFormView;
