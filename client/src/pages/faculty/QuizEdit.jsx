import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft } from 'react-icons/fi';
import quizAPI from '../../services/quizApi';
import courseAPI from '../../services/courseApi';

const QuizEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch courses
        const coursesResponse = await courseAPI.getCourses();
        setCourses(coursesResponse.data.data);

        // Fetch quiz data
        const quizResponse = await quizAPI.getQuiz(id);
        const quiz = quizResponse.data.data;

        // Format dates for form
        const startDate = new Date(quiz.startDate);
        const endDate = new Date(quiz.endDate);

        setFormData({
          ...quiz,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        });

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];

    // If changing question type, we need to update the options structure
    if (field === 'questionType') {
      const currentType = updatedQuestions[index].questionType;
      const newType = value;

      // Initialize appropriate options based on the new question type
      if (newType === 'multiple-choice') {
        // Single answer multiple choice
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          questionType: newType,
          options: updatedQuestions[index].options?.length > 0
            ? updatedQuestions[index].options.map(opt => ({ ...opt, isCorrect: false }))
            : [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
              ],
          correctAnswer: ''
        };
      } else if (newType === 'multiple-select') {
        // Multiple answer multiple choice
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          questionType: newType,
          options: updatedQuestions[index].options?.length > 0
            ? updatedQuestions[index].options
            : [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
              ],
          correctAnswer: []
        };
      } else if (newType === 'true-false') {
        // True/False question
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          questionType: newType,
          options: [],
          correctAnswer: ''
        };
      } else if (newType === 'short-answer') {
        // Short answer question
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          questionType: newType,
          options: [],
          correctAnswer: ''
        };
      }
    } else {
      // For other fields, just update the value
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value
      };
    }

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
      [field]: value
    };

    updatedQuestions[questionIndex].options = options;

    // For multiple-choice (single answer), ensure only one option is selected
    if (field === 'isCorrect' && value === true && updatedQuestions[questionIndex].questionType === 'multiple-choice') {
      // Unselect all other options
      updatedQuestions[questionIndex].options = options.map((opt, idx) => {
        if (idx !== optionIndex) {
          return { ...opt, isCorrect: false };
        }
        return opt;
      });
    }

    // For multiple-select, update the correctAnswer array
    if (field === 'isCorrect' && updatedQuestions[questionIndex].questionType === 'multiple-select') {
      const correctOptions = updatedQuestions[questionIndex].options
        .filter(opt => opt.isCorrect)
        .map((_, idx) => idx.toString());

      updatedQuestions[questionIndex].correctAnswer = correctOptions;
    }

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
    setSubmitting(true);
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
          if (!question.options || question.options.length < 2) {
            throw new Error(`Question ${i + 1} must have at least 2 options`);
          }

          const hasCorrectOption = question.options.some(option => option.isCorrect);
          if (!hasCorrectOption) {
            throw new Error(`Question ${i + 1} must have at least one correct option`);
          }

          for (let j = 0; j < question.options.length; j++) {
            if (!question.options[j].text.trim()) {
              throw new Error(`Option ${j + 1} for Question ${i + 1} text is required`);
            }
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
      await quizAPI.updateQuiz(id, formattedData);

      setSuccess('Quiz updated successfully!');

      // Redirect to quiz list after a short delay
      setTimeout(() => {
        navigate('/faculty/quizzes');
      }, 1500);
    } catch (err) {
      console.error('Error updating quiz:', err);
      setError(err.message || 'Failed to update quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Edit Quiz</h1>
          <p className="text-gray-600">Update quiz details and questions</p>
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
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quiz Details</h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Quiz Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                Course *
              </label>
              <select
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                required
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date *
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Duration (minutes) *
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                min="1"
                value={formData.duration}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="passingScore" className="block text-sm font-medium text-gray-700">
                Passing Score (%) *
              </label>
              <input
                type="number"
                id="passingScore"
                name="passingScore"
                min="0"
                max="100"
                value={formData.passingScore}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div className="sm:col-span-2">
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

            <div>
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
                  <p className="text-gray-500">Students can review their answers after submission</p>
                </div>
              </div>
            </div>

            <div>
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
                  <p className="text-gray-500">Show results to students after grading</p>
                </div>
              </div>
            </div>

            <div>
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
                  <p className="text-gray-500">Present questions in random order</p>
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
            <div className="text-center py-4">
              <p className="text-gray-500">No questions added yet. Click "Add Question" to get started.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-base font-medium text-gray-900">Question {questionIndex + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeQuestion(questionIndex)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor={`question-${questionIndex}-text`} className="block text-sm font-medium text-gray-700">
                        Question Text *
                      </label>
                      <input
                        type="text"
                        id={`question-${questionIndex}-text`}
                        value={question.questionText}
                        onChange={(e) => handleQuestionChange(questionIndex, 'questionText', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor={`question-${questionIndex}-type`} className="block text-sm font-medium text-gray-700">
                        Question Type *
                      </label>
                      <select
                        id={`question-${questionIndex}-type`}
                        value={question.questionType}
                        onChange={(e) => handleQuestionChange(questionIndex, 'questionType', e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="multiple-choice">Multiple Choice (Single Answer)</option>
                        <option value="multiple-select">Multiple Choice (Multiple Answers)</option>
                        <option value="true-false">True/False</option>
                        <option value="short-answer">Short Answer</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor={`question-${questionIndex}-points`} className="block text-sm font-medium text-gray-700">
                        Points *
                      </label>
                      <input
                        type="number"
                        id={`question-${questionIndex}-points`}
                        min="1"
                        value={question.points}
                        onChange={(e) => handleQuestionChange(questionIndex, 'points', parseInt(e.target.value, 10))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>

                    {(question.questionType === 'multiple-choice' || question.questionType === 'multiple-select') && (
                      <div className="sm:col-span-2">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Options * {question.questionType === 'multiple-select' && '(Select all that apply)'}
                          </label>
                          <button
                            type="button"
                            onClick={() => addOption(questionIndex)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <FiPlus className="mr-1 -ml-0.5 h-3 w-3" />
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
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => removeOption(questionIndex, optionIndex)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {question.questionType === 'true-false' && (
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Correct Answer *
                        </label>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id={`question-${questionIndex}-true`}
                              name={`question-${questionIndex}-correct`}
                              checked={question.correctAnswer === 'true'}
                              onChange={() => handleQuestionChange(questionIndex, 'correctAnswer', 'true')}
                              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                            />
                            <label htmlFor={`question-${questionIndex}-true`} className="ml-3 block text-sm font-medium text-gray-700">
                              True
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id={`question-${questionIndex}-false`}
                              name={`question-${questionIndex}-correct`}
                              checked={question.correctAnswer === 'false'}
                              onChange={() => handleQuestionChange(questionIndex, 'correctAnswer', 'false')}
                              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                            />
                            <label htmlFor={`question-${questionIndex}-false`} className="ml-3 block text-sm font-medium text-gray-700">
                              False
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="sm:col-span-2">
                      <label htmlFor={`question-${questionIndex}-explanation`} className="block text-sm font-medium text-gray-700">
                        Explanation (Optional)
                      </label>
                      <textarea
                        id={`question-${questionIndex}-explanation`}
                        value={question.explanation || ''}
                        onChange={(e) => handleQuestionChange(questionIndex, 'explanation', e.target.value)}
                        rows={2}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={() => navigate('/faculty/quizzes')}
            className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {submitting ? 'Saving...' : (
              <>
                <FiSave className="mr-2 -ml-1 h-5 w-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizEdit;
