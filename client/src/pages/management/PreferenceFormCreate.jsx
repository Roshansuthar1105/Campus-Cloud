import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiPlus, FiTrash2, FiMove } from 'react-icons/fi';
import api from '../../services/api';
import courseAPI from '../../services/courseApi';
import { useAuth } from '../../context/AuthContext';

const PreferenceFormCreate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = !!id;
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    startDate: '',
    endDate: '',
    isPublished: false,
    questions: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all courses
        const coursesResponse = await courseAPI.getCourses();
        setCourses(coursesResponse.data.data);
        
        if (isEditMode) {
          // In a real app, you would fetch the form data from the API
          // const formResponse = await api.get(`/preference-forms/${id}`);
          // const formData = formResponse.data.data;
          
          // For now, we'll use mock data
          const mockForm = {
            _id: id,
            title: 'Course Feedback Form',
            description: 'Please provide your feedback on the course content, teaching methods, and overall experience.',
            course: coursesResponse.data.data[0]?._id,
            startDate: '2023-11-01',
            endDate: '2023-12-15',
            isPublished: false,
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
                text: 'What aspects of the course did you find most valuable?',
                type: 'text',
                required: false
              },
              {
                _id: 'q4',
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
            ]
          };
          
          setFormData(mockForm);
        } else if (coursesResponse.data.data.length > 0) {
          // Set default course if available
          setFormData(prev => ({
            ...prev,
            course: coursesResponse.data.data[0]._id
          }));
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...formData.questions];
    const question = updatedQuestions[questionIndex];
    
    if (question.type === 'rating') {
      // For rating questions, options are just numbers
      const options = [...question.options];
      options[optionIndex] = parseInt(value, 10);
      updatedQuestions[questionIndex] = {
        ...question,
        options
      };
    } else if (question.type === 'multiple-choice') {
      // For multiple choice, options are objects with _id and text
      const options = [...question.options];
      options[optionIndex] = {
        ...options[optionIndex],
        text: value
      };
      updatedQuestions[questionIndex] = {
        ...question,
        options
      };
    }
    
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const addQuestion = () => {
    const newQuestion = {
      _id: `new_${Date.now()}`,
      text: '',
      type: 'text',
      required: false
    };
    
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion]
    });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions.splice(index, 1);
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...formData.questions];
    const question = updatedQuestions[questionIndex];
    
    if (question.type === 'rating') {
      // For rating questions, add the next number
      const currentMax = Math.max(...question.options, 0);
      updatedQuestions[questionIndex] = {
        ...question,
        options: [...question.options, currentMax + 1]
      };
    } else if (question.type === 'multiple-choice') {
      // For multiple choice, add a new option object
      const newOption = {
        _id: `new_option_${Date.now()}`,
        text: ''
      };
      updatedQuestions[questionIndex] = {
        ...question,
        options: question.options ? [...question.options, newOption] : [newOption]
      };
    }
    
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...formData.questions];
    const question = updatedQuestions[questionIndex];
    
    const options = [...question.options];
    options.splice(optionIndex, 1);
    
    updatedQuestions[questionIndex] = {
      ...question,
      options
    };
    
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const handleTypeChange = (index, newType) => {
    const updatedQuestions = [...formData.questions];
    const question = updatedQuestions[index];
    
    // Initialize appropriate options based on type
    let options;
    if (newType === 'rating') {
      options = [1, 2, 3, 4, 5];
    } else if (newType === 'multiple-choice') {
      options = [
        { _id: `new_option_${Date.now()}_1`, text: '' },
        { _id: `new_option_${Date.now()}_2`, text: '' }
      ];
    } else {
      options = undefined;
    }
    
    updatedQuestions[index] = {
      ...question,
      type: newType,
      options
    };
    
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const moveQuestion = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === formData.questions.length - 1)
    ) {
      return;
    }
    
    const updatedQuestions = [...formData.questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [updatedQuestions[index], updatedQuestions[newIndex]] = [updatedQuestions[newIndex], updatedQuestions[index]];
    
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Form title is required');
      return false;
    }
    
    if (!formData.course) {
      setError('Please select a course');
      return false;
    }
    
    if (!formData.startDate) {
      setError('Start date is required');
      return false;
    }
    
    if (!formData.endDate) {
      setError('End date is required');
      return false;
    }
    
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('End date must be after start date');
      return false;
    }
    
    if (formData.questions.length === 0) {
      setError('Form must have at least one question');
      return false;
    }
    
    for (let i = 0; i < formData.questions.length; i++) {
      const question = formData.questions[i];
      
      if (!question.text.trim()) {
        setError(`Question ${i + 1} text is required`);
        return false;
      }
      
      if (question.type === 'multiple-choice') {
        if (!question.options || question.options.length < 2) {
          setError(`Question ${i + 1} must have at least 2 options`);
          return false;
        }
        
        for (let j = 0; j < question.options.length; j++) {
          if (!question.options[j].text.trim()) {
            setError(`Option ${j + 1} for Question ${i + 1} text is required`);
            return false;
          }
        }
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // In a real app, you would submit the form data to the API
      // if (isEditMode) {
      //   await api.put(`/preference-forms/${id}`, formData);
      // } else {
      //   await api.post('/preference-forms', formData);
      // }
      
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(`Form ${isEditMode ? 'updated' : 'created'} successfully!`);
      
      // Redirect to the form list after a short delay
      setTimeout(() => {
        navigate('/management/preference-forms');
      }, 2000);
    } catch (err) {
      console.error('Error saving form:', err);
      setError(`Failed to ${isEditMode ? 'update' : 'create'} form. Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate('/management/preference-forms')}
          className="mr-4 text-purple-600 hover:text-purple-900"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Preference Form' : 'Create New Preference Form'}
          </h1>
          <p className="text-gray-600">
            {isEditMode ? 'Update form details and questions' : 'Design a new feedback or preference form'}
          </p>
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
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Form Title *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Brief description of the form's purpose.
                </p>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                  Course *
                </label>
                <div className="mt-1">
                  <select
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.name} ({course.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="isPublished"
                      name="isPublished"
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={handleInputChange}
                      className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="isPublished" className="font-medium text-gray-700">
                      Publish Form
                    </label>
                    <p className="text-gray-500">Make this form available to students during the specified date range.</p>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date *
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date *
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <FiPlus className="mr-2 -ml-0.5 h-4 w-4" />
              Add Question
            </button>
          </div>

          {formData.questions.length === 0 ? (
            <div className="mt-4 bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">No questions added yet. Click "Add Question" to get started.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {formData.questions.map((question, index) => (
                <div key={question._id} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-6">
                            <div className="flex justify-between">
                              <label htmlFor={`question-${index}-text`} className="block text-sm font-medium text-gray-700">
                                Question {index + 1} *
                              </label>
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => moveQuestion(index, 'up')}
                                  disabled={index === 0}
                                  className={`p-1 rounded-md ${
                                    index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'
                                  }`}
                                >
                                  <FiMove className="h-4 w-4 rotate-90" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveQuestion(index, 'down')}
                                  disabled={index === formData.questions.length - 1}
                                  className={`p-1 rounded-md ${
                                    index === formData.questions.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'
                                  }`}
                                >
                                  <FiMove className="h-4 w-4 -rotate-90" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeQuestion(index)}
                                  className="p-1 rounded-md text-red-500 hover:text-red-700"
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <div className="mt-1">
                              <input
                                type="text"
                                id={`question-${index}-text`}
                                value={question.text}
                                onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                                className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor={`question-${index}-type`} className="block text-sm font-medium text-gray-700">
                              Question Type *
                            </label>
                            <div className="mt-1">
                              <select
                                id={`question-${index}-type`}
                                value={question.type}
                                onChange={(e) => handleTypeChange(index, e.target.value)}
                                className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              >
                                <option value="text">Text Response</option>
                                <option value="rating">Rating Scale</option>
                                <option value="multiple-choice">Multiple Choice</option>
                              </select>
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  id={`question-${index}-required`}
                                  checked={question.required}
                                  onChange={(e) => handleQuestionChange(index, 'required', e.target.checked)}
                                  type="checkbox"
                                  className="focus:ring-purple-500 h-4 w-4 text-purple-600 border-gray-300 rounded"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor={`question-${index}-required`} className="font-medium text-gray-700">
                                  Required
                                </label>
                                <p className="text-gray-500">Students must answer this question to submit the form.</p>
                              </div>
                            </div>
                          </div>

                          {(question.type === 'rating' || question.type === 'multiple-choice') && (
                            <div className="sm:col-span-6">
                              <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium text-gray-700">
                                  {question.type === 'rating' ? 'Rating Options' : 'Answer Options'} *
                                </label>
                                <button
                                  type="button"
                                  onClick={() => addOption(index)}
                                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                >
                                  <FiPlus className="mr-1 -ml-0.5 h-3 w-3" />
                                  Add Option
                                </button>
                              </div>
                              <div className="mt-2 space-y-2">
                                {question.options?.map((option, optionIndex) => (
                                  <div key={question.type === 'rating' ? optionIndex : option._id} className="flex items-center">
                                    <div className="flex-1">
                                      {question.type === 'rating' ? (
                                        <input
                                          type="number"
                                          min="1"
                                          value={option}
                                          onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                                          className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        />
                                      ) : (
                                        <input
                                          type="text"
                                          value={option.text}
                                          onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                                          placeholder={`Option ${optionIndex + 1}`}
                                          className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        />
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeOption(index, optionIndex)}
                                      className="ml-2 p-1 rounded-md text-red-500 hover:text-red-700"
                                    >
                                      <FiTrash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/management/preference-forms')}
            className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            {saving ? 'Saving...' : (
              <>
                <FiSave className="mr-2 -ml-1 h-5 w-5" />
                {isEditMode ? 'Update Form' : 'Create Form'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PreferenceFormCreate;
