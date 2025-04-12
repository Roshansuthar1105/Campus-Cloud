import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiHelpCircle } from 'react-icons/fi';
import quizAPI from '../../services/quizApi';

const QuizResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('%c Loading Quiz Results ', 'background: #9b59b6; color: white; font-weight: bold;');

    const fetchSubmission = async () => {
      try {
        setLoading(true);

        // Get the submission directly using the submission ID
        const submissionsResponse = await quizAPI.getQuizSubmissions(id);

        if (!submissionsResponse.data.data || submissionsResponse.data.data.length === 0) {
          throw new Error('Submission not found');
        }

        const userSubmission = submissionsResponse.data.data[0]; // Get the first (and only) submission
        setSubmission(userSubmission);

        // Get the quiz details
        const quizResponse = await quizAPI.getQuiz(userSubmission.quiz);
        setQuiz(quizResponse.data.data);

        // Log the submission data with feedback
        console.log('%c Submission Data Loaded ', 'background: #9b59b6; color: white; font-weight: bold;');
        console.log('Submission:', userSubmission);
        console.log('- Feedback:', userSubmission.feedback);
        console.log('- Overall Feedback:', userSubmission.overallFeedback);
        console.log('Quiz:', quizResponse.data.data);
        console.log(quizResponse.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching submission:', err);
        setError('Failed to load quiz results. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id]);

  // The question parameter is passed but not used directly in this function
  // It's kept for potential future use if we need to check question properties
  const getAnswerStatus = (question, answer) => {
    if (!answer) {
      return {
        status: 'unanswered',
        icon: <FiHelpCircle className="h-5 w-5 text-gray-400" />,
        color: 'gray'
      };
    }

    if (answer.isCorrect) {
      return {
        status: 'correct',
        icon: <FiCheckCircle className="h-5 w-5 text-green-500" />,
        color: 'green'
      };
    } else {
      return {
        status: 'incorrect',
        icon: <FiXCircle className="h-5 w-5 text-red-500" />,
        color: 'red'
      };
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

  if (!submission || !quiz) {
    return (
      <div className="text-center py-10">
        <p>Quiz results not found.</p>
        <button
          onClick={() => navigate('/student/quizzes')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Return to Quizzes
        </button>
      </div>
    );
  }

  const isPassing = submission.percentage >= quiz.passingScore;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate('/student/quizzes')}
          className="mr-4 text-blue-600 hover:text-blue-900"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quiz Results</h1>
          <p className="text-gray-600">{quiz.title}</p>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Summary</h2>
              <p className="text-sm text-gray-600">
                {quiz.course?.name} • Completed on {new Date(submission.endTime).toLocaleString()}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="inline-flex items-center px-4 py-2 rounded-md bg-gray-100">
                <span className="text-sm font-medium text-gray-700">Time Taken: </span>
                <span className="ml-2 text-sm text-gray-900">
                  {Math.round((new Date(submission.endTime) - new Date(submission.startTime)) / 60000)} minutes
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-gray-500">Score</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {submission.totalScore} / {quiz.totalPoints}
              </p>
              <p className="mt-1 text-lg font-medium text-gray-700">{submission.percentage.toFixed(1)}%</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-gray-500">Result</p>
              <p className={`mt-1 text-3xl font-semibold ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
                {isPassing ? 'PASS' : 'FAIL'}
              </p>
              <p className="mt-1 text-sm text-gray-500">Passing score: {quiz.passingScore}%</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-gray-500">Questions</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {submission.answers.filter(a => a.isCorrect).length} / {quiz.questions.length}
              </p>
              <p className="mt-1 text-sm text-gray-500">Correct</p>
            </div>
          </div>

          {submission.overallFeedback && (
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800">Feedback</h3>
              <p className="mt-1 text-sm text-blue-700">{submission.overallFeedback}</p>
            </div>
          )}
        </div>
      </div>

      {/* Question Details */}
      {quiz.allowReview && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Question Details</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {quiz.questions.map((question, index) => {
              const answer = submission.answers.find(a => a.questionId === question._id);
              const answerStatus = getAnswerStatus(question, answer);

              return (
                <div key={question._id} className="p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      {answerStatus.icon}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <h3 className="text-md font-medium text-gray-900">Question {index + 1}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${answerStatus.color}-100 text-${answerStatus.color}-800`}>
                          {answer ? `${answer.pointsEarned} / ${question.points} points` : '0 points'}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-gray-700">{question.questionText}</p>

                      {/* Multiple Choice */}
                      {question.questionType === 'multiple-choice' && (
                        <div className="mt-3 space-y-2">
                          {question.options.map((option, optionIndex) => {
                            const isSelected = answer?.selectedOptions.includes(option.text);
                            const isCorrect = option.isCorrect;

                            let optionClass = 'text-gray-700';
                            if (isSelected && isCorrect) {
                              optionClass = 'text-green-700 font-medium';
                            } else if (isSelected && !isCorrect) {
                              optionClass = 'text-red-700 font-medium';
                            } else if (!isSelected && isCorrect) {
                              optionClass = 'text-green-600';
                            }

                            return (
                              <div key={optionIndex} className="flex items-center">
                                <div className={`flex-shrink-0 h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
                                  {isSelected ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <span className={`ml-2 text-sm ${optionClass}`}>
                                  {option.text}
                                  {isCorrect && !isSelected && ' (Correct)'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* True/False */}
                      {question.questionType === 'true-false' && (
                        <div className="mt-3 space-y-2">
                          {['true', 'false'].map((option) => {
                            const isSelected = answer?.selectedOptions.includes(option);
                            const isCorrect = question.correctAnswer === option;

                            let optionClass = 'text-gray-700';
                            if (isSelected && isCorrect) {
                              optionClass = 'text-green-700 font-medium';
                            } else if (isSelected && !isCorrect) {
                              optionClass = 'text-red-700 font-medium';
                            } else if (!isSelected && isCorrect) {
                              optionClass = 'text-green-600';
                            }

                            return (
                              <div key={option} className="flex items-center">
                                <div className={`flex-shrink-0 h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
                                  {isSelected ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <span className={`ml-2 text-sm ${optionClass}`}>
                                  {option.charAt(0).toUpperCase() + option.slice(1)}
                                  {isCorrect && !isSelected && ' (Correct)'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Short Answer / Essay */}
                      {(question.questionType === 'short-answer' || question.questionType === 'essay') && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700">Your Answer:</p>
                          <div className="mt-1 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{answer?.textAnswer || 'No answer provided'}</p>
                          </div>
                        </div>
                      )}

                      {/* Explanation */}
                      {question.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md">
                          <p className="text-sm font-medium text-blue-800">Explanation:</p>
                          <p className="mt-1 text-sm text-blue-700">{question.explanation}</p>
                        </div>
                      )}

                      {/* Answer Feedback */}
                      {(() => {
                        // Determine if feedback exists and log it
                        const hasFeedback = answer?.feedback ||
                          (submission?.feedback &&
                            (typeof submission.feedback === 'object' &&
                              (submission.feedback[question._id]?.comment ||
                               typeof submission.feedback[question._id] === 'string' && submission.feedback[question._id])));

                        // Log feedback availability for debugging
                        if (hasFeedback) {
                          console.log(`Feedback found for question ${question._id}:`,
                            answer?.feedback ||
                            (typeof submission?.feedback?.[question._id] === 'string'
                              ? submission.feedback[question._id]
                              : submission?.feedback?.[question._id]?.comment));
                        }

                        return hasFeedback;
                      })() && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                          <p className="text-sm font-medium text-yellow-800">Instructor Feedback:</p>
                          <p className="mt-1 text-sm text-yellow-700 whitespace-pre-wrap">
                            {answer?.feedback ||
                             (typeof submission?.feedback?.[question._id] === 'string'
                              ? submission.feedback[question._id]
                              : submission?.feedback?.[question._id]?.comment)}
                              
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Overall Feedback Section */}
      {(() => {
        // Check if overall feedback exists and log it
        const hasOverallFeedback = submission?.overallFeedback && submission.overallFeedback.trim() !== '';

        if (hasOverallFeedback) {
          console.log('%c Overall Feedback Found ', 'background: #f1c40f; color: black; font-weight: bold;');
          console.log('Overall feedback content:', submission.overallFeedback);
        } else if (submission?.overallFeedback) {
          console.log('Overall feedback exists but is empty');
        } else {
          console.log('No overall feedback available');
        }

        return hasOverallFeedback;
      })() && (
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Instructor Feedback</h3>
          </div>

          <div className="px-4 py-5 sm:p-6 bg-yellow-50">
            <p className="text-sm font-medium text-yellow-800 mb-2">Overall Feedback:</p>
            <p className="text-sm text-yellow-700 whitespace-pre-wrap">{submission.overallFeedback}</p>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <Link
          to="/student/quizzes"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Return to Quizzes
        </Link>
      </div>
    </div>
  );
};

export default QuizResults;
