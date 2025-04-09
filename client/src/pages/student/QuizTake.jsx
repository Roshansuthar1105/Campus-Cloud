import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiClock, FiArrowLeft, FiArrowRight, FiSave, FiCheckCircle } from 'react-icons/fi';
import quizAPI from '../../services/quizApi';

const QuizTake = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);

        // Fetch quiz details
        const quizResponse = await quizAPI.getQuiz(id);
        setQuiz(quizResponse.data.data);

        // Start quiz attempt
        const startResponse = await quizAPI.startQuizAttempt(id);
        setSubmission(startResponse.data.data);

        // Initialize answers from submission
        const initialAnswers = {};
        startResponse.data.data.answers.forEach(answer => {
          initialAnswers[answer.questionId] = {
            selectedOptions: answer.selectedOptions || [],
            textAnswer: answer.textAnswer || ''
          };
        });
        setAnswers(initialAnswers);

        // Set timer
        setTimeLeft(quizResponse.data.data.duration * 60); // Convert minutes to seconds

        setError(null);
      } catch (err) {
        console.error('Error starting quiz:', err);
        setError(err.response?.data?.message || 'Failed to start quiz. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();

    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            // Auto-submit when time is up
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours > 0 ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, type, value) => {
    setAnswers(prev => {
      const updatedAnswers = { ...prev };

      if (!updatedAnswers[questionId]) {
        updatedAnswers[questionId] = {
          selectedOptions: [],
          textAnswer: ''
        };
      }

      if (type === 'option') {
        // For single-answer multiple choice
        // Replace the array with the new selection
        updatedAnswers[questionId].selectedOptions = [value];
      } else if (type === 'multiple-select') {
        // For multiple-select questions
        // Use the array of selected options directly
        updatedAnswers[questionId].selectedOptions = value;
      } else if (type === 'text') {
        // For text/essay questions
        updatedAnswers[questionId].textAnswer = value;
      } else if (type === 'true-false') {
        // For true/false questions
        updatedAnswers[questionId].selectedOptions = [value];
      }

      return updatedAnswers;
    });

    // Auto-save answer after a short delay
    setSaveStatus('saving');
    const saveTimeout = setTimeout(() => {
      saveAnswer(questionId);
    }, 1000);

    return () => clearTimeout(saveTimeout);
  };

  const saveAnswer = async (questionId) => {
    if (!submission || !answers[questionId]) return;

    try {
      const answerData = {
        questionId,
        selectedOptions: answers[questionId].selectedOptions,
        textAnswer: answers[questionId].textAnswer
      };

      await quizAPI.submitAnswer(submission._id, answerData);
      setSaveStatus('saved');

      // Reset save status after a delay
      setTimeout(() => {
        setSaveStatus(null);
      }, 2000);
    } catch (err) {
      console.error('Error saving answer:', err);
      setSaveStatus('error');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!submission) return;

    if (!window.confirm('Are you sure you want to submit this quiz? You cannot change your answers after submission.')) {
      return;
    }

    try {
      setSubmitting(true);

      // Save current answer if needed
      if (quiz && quiz.questions[currentQuestionIndex]) {
        const currentQuestionId = quiz.questions[currentQuestionIndex]._id;
        await saveAnswer(currentQuestionId);
      }

      // Submit the quiz
      await quizAPI.completeSubmission(submission._id);

      // Navigate to results page
      navigate(`/student/submissions/${submission._id}`);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err.response?.data?.message || 'Failed to submit quiz. Please try again.');
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
                onClick={() => navigate('/student/quizzes')}
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

  if (!quiz || !submission) {
    return (
      <div className="text-center py-10">
        <p>Quiz not found or not available.</p>
        <button
          onClick={() => navigate('/student/quizzes')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Return to Quizzes
        </button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion._id] || { selectedOptions: [], textAnswer: '' };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Quiz Header */}
        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-sm text-gray-600">
                {quiz.course?.name} • {quiz.totalPoints} points
              </p>
            </div>
            <div className="mt-2 md:mt-0 flex items-center">
              <div className={`flex items-center ${timeLeft < 300 ? 'text-red-600' : 'text-blue-600'}`}>
                <FiClock className="mr-1 h-5 w-5" />
                <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
              </div>
              {saveStatus && (
                <div className="ml-4 text-sm">
                  {saveStatus === 'saving' && <span className="text-yellow-600">Saving...</span>}
                  {saveStatus === 'saved' && (
                    <span className="text-green-600 flex items-center">
                      <FiCheckCircle className="mr-1 h-4 w-4" /> Saved
                    </span>
                  )}
                  {saveStatus === 'error' && <span className="text-red-600">Save failed</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigation */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((question, index) => (
              <button
                key={question._id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentQuestionIndex === index
                    ? 'bg-blue-600 text-white'
                    : answers[question._id]?.selectedOptions.length > 0 || answers[question._id]?.textAnswer
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium text-gray-900">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </h2>
              <span className="text-sm text-gray-500">{currentQuestion.points} points</span>
            </div>
            <p className="text-gray-800">{currentQuestion.questionText}</p>
          </div>

          {/* Question Type Specific UI */}
          <div className="mb-8">
            {currentQuestion.questionType === 'multiple-choice' && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="radio"
                      id={`option-${index}`}
                      name={`question-${currentQuestion._id}`}
                      checked={currentAnswer.selectedOptions.includes(index.toString())}
                      onChange={() => handleAnswerChange(currentQuestion._id, 'option', index.toString())}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor={`option-${index}`} className="ml-3 block text-sm text-gray-700">
                      {option.text}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {currentQuestion.questionType === 'multiple-select' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-2">Select all that apply</p>
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`multi-option-${index}`}
                      name={`question-${currentQuestion._id}-option-${index}`}
                      checked={currentAnswer.selectedOptions.includes(index.toString())}
                      onChange={(e) => {
                        const selectedOptions = [...currentAnswer.selectedOptions];
                        if (e.target.checked) {
                          if (!selectedOptions.includes(index.toString())) {
                            selectedOptions.push(index.toString());
                          }
                        } else {
                          const optionIndex = selectedOptions.indexOf(index.toString());
                          if (optionIndex !== -1) {
                            selectedOptions.splice(optionIndex, 1);
                          }
                        }
                        handleAnswerChange(currentQuestion._id, 'multiple-select', selectedOptions);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`multi-option-${index}`} className="ml-3 block text-sm text-gray-700">
                      {option.text}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {currentQuestion.questionType === 'true-false' && (
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="true"
                    name={`question-${currentQuestion._id}`}
                    checked={currentAnswer.selectedOptions.includes('true')}
                    onChange={() => handleAnswerChange(currentQuestion._id, 'true-false', 'true')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="true" className="ml-3 block text-sm text-gray-700">
                    True
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="false"
                    name={`question-${currentQuestion._id}`}
                    checked={currentAnswer.selectedOptions.includes('false')}
                    onChange={() => handleAnswerChange(currentQuestion._id, 'true-false', 'false')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="false" className="ml-3 block text-sm text-gray-700">
                    False
                  </label>
                </div>
              </div>
            )}

            {(currentQuestion.questionType === 'short-answer' || currentQuestion.questionType === 'essay') && (
              <div>
                <textarea
                  rows={currentQuestion.questionType === 'essay' ? 6 : 2}
                  value={currentAnswer.textAnswer}
                  onChange={(e) => handleAnswerChange(currentQuestion._id, 'text', e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder={`Enter your ${currentQuestion.questionType === 'essay' ? 'essay' : 'answer'} here...`}
                />
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md ${
                currentQuestionIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              <FiArrowLeft className="mr-2 -ml-1 h-5 w-5" />
              Previous
            </button>

            <div className="flex space-x-4">
              {currentQuestionIndex < quiz.questions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                  <FiArrowRight className="ml-2 -mr-1 h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  {submitting ? 'Submitting...' : (
                    <>
                      <FiSave className="mr-2 -ml-1 h-5 w-5" />
                      Submit Quiz
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTake;
