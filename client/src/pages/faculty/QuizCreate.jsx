import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft } from 'react-icons/fi';
import quizAPI from '../../services/quizApi';
import courseAPI from '../../services/courseApi';

const QuizCreate = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    duration: 60,
    startDate: '',
    endDate: '',
    passingScore: 60,
    isPublished: false,
    allowReview: true,
    randomizeQuestions: false,
    showResults: true,
    questions: []
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseAPI.getCourses();
        setCourses(response.data.data);
        
        // Set default course if available
        if (response.data.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            course: response.data.data[0]._id
          }));
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
      }
    };

    fetchCourses();
    
    // Set default dates (today and tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setFormData(prev => ({
      ...prev,
      startDate: today.toISOString().split('T')[0],
      endDate: tomorrow.toISOString().split('T')[0]
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...formData.questions];
    const options = [...updatedQuestions[questionIndex].options];
    
    options[optionIndex] = {
      ...options[optionIndex],
      [field]: field === 'isCorrect' ? value : value
    };
    
    updatedQuestions[questionIndex].options = options;
    
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: '',
          questionType: 'multiple-choice',
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ],
          correctAnswer: '',
          points: 1,
          explanation: ''
        }
      ]
    }));
  };

  const removeQuestion = (index) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options.push({ text: '', isCorrect: false });
    
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Quiz title is required');
      }
      
      if (!formData.course) {
        throw new Error('Please select a course');
      }
      
      if (!formData.startDate || !formData.endDate) {
        throw new Error('Start and end dates are required');
      }
      
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        throw new Error('End date must be after start date');
      }
      
      if (formData.questions.length === 0) {
        throw new Error('Quiz must have at least one question');
      }
      
      // Validate questions
      for (let i = 0; i < formData.questions.length; i++) {
        const question = formData.questions[i];
        
        if (!question.questionText.trim()) {
          throw new Error(`Question ${i + 1} text is required`);
        }
        
        if (question.questionType === 'multiple-choice') {
          if (question.options.length < 2) {
            throw new Error(`Question ${i + 1} must have at least 2 options`);
          }
          
          if (!question.options.some(option => option.isCorrect)) {
            throw new Error(`Question ${i + 1} must have at least one correct answer`);
          }
          
          for (let j = 0; j < question.options.length; j++) {
            if (!question.options[j].text.trim()) {
              throw new Error(`Option ${j + 1} for Question ${i + 1} text is required`);
            }
          }
        } else if (question.questionType === 'true-false') {
          if (!question.correctAnswer) {
            throw new Error(`Question ${i + 1} must have a correct answer`);
          }
        }
      }
      
      // Format dates for API
      const formattedData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };
      
      // Submit to API
      const response = await quizAPI.createQuiz(formattedData);
      
      setSuccess('Quiz created successfully!');
      
      // Redirect to quiz list after a short delay
      setTimeout(() => {
        navigate('/faculty/quizzes');
      }, 1500);
    } catch (err) {
      console.error('Error creating quiz:', err);
      setError(err.message || 'Failed to create quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate('/faculty/quizzes')}
          className="mr-4 text-indigo-600 hover:text-indigo-900"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Quiz</h1>
          <p className="text-gray-600">Create a new quiz for your students</p>
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

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quiz Details</h2>
          
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Quiz Title *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter quiz instructions or description"
                />
              </div>
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
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Duration (minutes) *
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="duration"
                  id="duration"
                  min="1"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
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
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="passingScore" className="block text-sm font-medium text-gray-700">
                Passing Score (%)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="passingScore"
                  id="passingScore"
                  min="0"
                  max="100"
                  value={formData.passingScore}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="isPublished"
                    name="isPublished"
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={handleChange}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="isPublished" className="font-medium text-gray-700">
                    Publish Quiz
                  </label>
                  <p className="text-gray-500">Make this quiz visible to students</p>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="allowReview"
                    name="allowReview"
                    type="checkbox"
                    checked={formData.allowReview}
                    onChange={handleChange}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="allowReview" className="font-medium text-gray-700">
                    Allow Review
                  </label>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="randomizeQuestions"
                    name="randomizeQuestions"
                    type="checkbox"
                    checked={formData.randomizeQuestions}
                    onChange={handleChange}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="randomizeQuestions" className="font-medium text-gray-700">
                    Randomize Questions
                  </label>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="showResults"
                    name="showResults"
                    type="checkbox"
                    checked={formData.showResults}
                    onChange={handleChange}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="showResults" className="font-medium text-gray-700">
                    Show Results
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiPlus className="mr-2 -ml-1 h-4 w-4" />
              Add Question
            </button>
          </div>

          {formData.questions.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No questions added yet. Click "Add Question" to start.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-medium text-gray-900">Question {questionIndex + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeQuestion(questionIndex)}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <FiTrash2 className="mr-1 -ml-0.5 h-4 w-4" />
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <label htmlFor={`question-${questionIndex}-text`} className="block text-sm font-medium text-gray-700">
                        Question Text *
                      </label>
                      <div className="mt-1">
                        <textarea
                          id={`question-${questionIndex}-text`}
                          value={question.questionText}
                          onChange={(e) => handleQuestionChange(questionIndex, 'questionText', e.target.value)}
                          rows={2}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor={`question-${questionIndex}-type`} className="block text-sm font-medium text-gray-700">
                        Question Type *
                      </label>
                      <div className="mt-1">
                        <select
                          id={`question-${questionIndex}-type`}
                          value={question.questionType}
                          onChange={(e) => handleQuestionChange(questionIndex, 'questionType', e.target.value)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        >
                          <option value="multiple-choice">Multiple Choice</option>
                          <option value="true-false">True/False</option>
                          <option value="short-answer">Short Answer</option>
                          <option value="essay">Essay</option>
                        </select>
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor={`question-${questionIndex}-points`} className="block text-sm font-medium text-gray-700">
                        Points *
                      </label>
                      <div className="mt-1">
                        <input
                          type="number"
                          id={`question-${questionIndex}-points`}
                          value={question.points}
                          onChange={(e) => handleQuestionChange(questionIndex, 'points', parseInt(e.target.value))}
                          min="1"
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>

                    {question.questionType === 'multiple-choice' && (
                      <div className="sm:col-span-6">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Options *
                          </label>
                          <button
                            type="button"
                            onClick={() => addOption(questionIndex)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <FiPlus className="mr-1 -ml-0.5 h-4 w-4" />
                            Add Option
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`question-${questionIndex}-option-${optionIndex}-correct`}
                                checked={option.isCorrect}
                                onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'isCorrect', e.target.checked)}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                              />
                              <input
                                type="text"
                                id={`question-${questionIndex}-option-${optionIndex}-text`}
                                value={option.text}
                                onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'text', e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                required
                              />
                              {question.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(questionIndex, optionIndex)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {question.questionType === 'true-false' && (
                      <div className="sm:col-span-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Correct Answer *
                        </label>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id={`question-${questionIndex}-true`}
                              name={`question-${questionIndex}-answer`}
                              value="true"
                              checked={question.correctAnswer === 'true'}
                              onChange={() => handleQuestionChange(questionIndex, 'correctAnswer', 'true')}
                              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                            />
                            <label htmlFor={`question-${questionIndex}-true`} className="ml-2 block text-sm text-gray-700">
                              True
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id={`question-${questionIndex}-false`}
                              name={`question-${questionIndex}-answer`}
                              value="false"
                              checked={question.correctAnswer === 'false'}
                              onChange={() => handleQuestionChange(questionIndex, 'correctAnswer', 'false')}
                              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                            />
                            <label htmlFor={`question-${questionIndex}-false`} className="ml-2 block text-sm text-gray-700">
                              False
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="sm:col-span-6">
                      <label htmlFor={`question-${questionIndex}-explanation`} className="block text-sm font-medium text-gray-700">
                        Explanation (Optional)
                      </label>
                      <div className="mt-1">
                        <textarea
                          id={`question-${questionIndex}-explanation`}
                          value={question.explanation}
                          onChange={(e) => handleQuestionChange(questionIndex, 'explanation', e.target.value)}
                          rows={2}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Explain the correct answer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/faculty/quizzes')}
            className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Creating...' : (
              <>
                <FiSave className="mr-2 -ml-1 h-5 w-5" />
                Create Quiz
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizCreate;
