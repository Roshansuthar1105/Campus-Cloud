import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PreferenceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would fetch the form data from the API
        // const response = await api.get(`/preference-forms/${id}`);
        // setForm(response.data.data);
        
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
          endDate: new Date(2023, 11, 15)
        };
        
        setForm(mockForm);
        
        // Initialize answers object
        const initialAnswers = {};
        mockForm.questions.forEach(question => {
          initialAnswers[question._id] = '';
        });
        setAnswers(initialAnswers);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching form data:', err);
        setError('Failed to load form. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [id]);

  const handleInputChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const validateForm = () => {
    const requiredQuestions = form.questions.filter(q => q.required);
    const unansweredQuestions = requiredQuestions.filter(q => !answers[q._id]);
    
    if (unansweredQuestions.length > 0) {
      setError(`Please answer all required questions. (${unansweredQuestions.length} remaining)`);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // In a real app, you would submit the form data to the API
      // await api.post(`/preference-forms/${id}/submit`, { answers });
      
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Form submitted successfully!');
      
      // Redirect to the form list after a short delay
      setTimeout(() => {
        navigate('/student/preference-forms');
      }, 2000);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-10">
        <p>Form not found.</p>
        <button
          onClick={() => navigate('/student/preference-forms')}
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
          onClick={() => navigate('/student/preference-forms')}
          className="mr-4 text-blue-600 hover:text-blue-900"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
          <p className="text-gray-600">{form.course.name} ({form.course.code})</p>
        </div>
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

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiCheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-6">
            <p className="text-gray-700">{form.description}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {form.questions.map((question, index) => (
                <div key={question._id} className="border-b border-gray-200 pb-6">
                  <div className="mb-2 flex items-baseline">
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
                          <label key={option} className="flex flex-col items-center">
                            <input
                              type="radio"
                              name={`question_${question._id}`}
                              value={option}
                              checked={answers[question._id] === option.toString()}
                              onChange={() => handleInputChange(question._id, option.toString())}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                            />
                            <span className="mt-1 text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {question.type === 'text' && (
                    <div className="mt-4">
                      <textarea
                        rows={4}
                        name={`question_${question._id}`}
                        value={answers[question._id] || ''}
                        onChange={(e) => handleInputChange(question._id, e.target.value)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  )}

                  {question.type === 'multiple-choice' && (
                    <div className="mt-4 space-y-2">
                      {question.options.map((option) => (
                        <div key={option._id} className="flex items-center">
                          <input
                            id={`question_${question._id}_option_${option._id}`}
                            name={`question_${question._id}`}
                            type="radio"
                            value={option._id}
                            checked={answers[question._id] === option._id}
                            onChange={() => handleInputChange(question._id, option._id)}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                          />
                          <label
                            htmlFor={`question_${question._id}_option_${option._id}`}
                            className="ml-3 block text-sm text-gray-700"
                          >
                            {option.text}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/student/preference-forms')}
                className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {submitting ? 'Submitting...' : (
                  <>
                    <FiSave className="mr-2 -ml-1 h-5 w-5" />
                    Submit Form
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PreferenceForm;
