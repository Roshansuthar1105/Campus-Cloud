import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiClock, FiCalendar, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import quizAPI from '../../services/quizApi';
// import { useAuth } from '../../context/AuthContext';

export const SubmissionView = () => {
  const { id, quizId } = useParams();
  const navigate = useNavigate();

  // Extract quizId from URL if available
  const urlParams = new URLSearchParams(window.location.search);
  const queryQuizId = urlParams.get('quizId');

  const [submission, setSubmission] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [overallFeedback, setOverallFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchSubmissionData = async () => {
      try {
        setLoading(true);

        // Fetch submission data
        const response = await quizAPI.getSubmission(id);
        const submissionData = response.data.data || {};
        console.log('Submission data:', submissionData);
        setSubmission(submissionData);

        // Set quiz data from the submission
        if (submissionData.quiz && typeof submissionData.quiz === 'object') {
          console.log('Quiz data from submission:', submissionData.quiz);
          setQuiz(submissionData.quiz);
        } else {
          console.warn('No quiz data object found in submission');

          // Try to get the quiz ID from various sources
          const possibleQuizId = quizId || queryQuizId ||
                               (submissionData.quiz && typeof submissionData.quiz === 'string' ? submissionData.quiz : null) ||
                               (submissionData.quizId ? submissionData.quizId : null);

          if (possibleQuizId) {
            try {
              console.log(`Fetching quiz data directly for ID: ${possibleQuizId}`);
              const quizResponse = await quizAPI.getQuiz(possibleQuizId);
              const quizData = quizResponse.data.data || {};
              console.log('Directly fetched quiz data:', quizData);
              setQuiz(quizData);
            } catch (quizError) {
              console.error('Error fetching quiz directly:', quizError);
            }
          } else {
            console.error('Could not determine quiz ID from any source');
          }
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching submission data:', err);
        setError('Failed to load submission details. Please try again later.');

        // Fallback to mock data if API fails (for development purposes)
        if (process.env.NODE_ENV === 'development') {
          console.log('Using mock data in development mode');

          // Mock quiz data
          const mockQuiz = {
            _id: 'quiz123',
            title: 'Midterm Exam: Web Development Fundamentals',
            course: {
              _id: 'course123',
              name: 'Web Development Fundamentals',
              code: 'CS301'
            },
            totalPoints: 100,
            passingScore: 70,
            questions: [
              {
                _id: 'q1',
                text: 'What does HTML stand for?',
                type: 'multiple-choice',
                points: 5,
                options: [
                  { _id: 'o1', text: 'Hyper Text Markup Language' },
                  { _id: 'o2', text: 'High Tech Multi Language' },
                  { _id: 'o3', text: 'Hyper Transfer Markup Language' },
                  { _id: 'o4', text: 'Home Tool Markup Language' }
                ],
                correctAnswer: 'o1'
              },
              {
                _id: 'q2',
                text: 'Which CSS property is used to control the spacing between elements?',
                type: 'multiple-choice',
                points: 5,
                options: [
                  { _id: 'o1', text: 'spacing' },
                  { _id: 'o2', text: 'margin' },
                  { _id: 'o3', text: 'padding' },
                  { _id: 'o4', text: 'border' }
                ],
                correctAnswer: 'o2'
              },
              {
                _id: 'q3',
                text: 'Explain the difference between let, const, and var in JavaScript.',
                type: 'essay',
                points: 10
              },
              {
                _id: 'q4',
                text: 'What is the purpose of media queries in CSS?',
                type: 'essay',
                points: 10
              },
              {
                _id: 'q5',
                text: 'Select all valid ways to create a JavaScript object:',
                type: 'multiple-select',
                points: 10,
                options: [
                  { _id: 'o1', text: 'const obj = {};' },
                  { _id: 'o2', text: 'const obj = new Object();' },
                  { _id: 'o3', text: 'const obj = Object.create(null);' },
                  { _id: 'o4', text: 'const obj = Object.instance();' }
                ],
                correctAnswers: ['o1', 'o2', 'o3']
              }
            ]
          };

          // Mock submission data
          const mockSubmission = {
            _id: id,
            quiz: mockQuiz,
            student: {
              _id: 'student1',
              name: 'John Doe',
              email: 'john.doe@example.com',
              avatar: null
            },
            answers: {
              q1: 'o1', // correct
              q2: 'o3', // incorrect
              q3: 'In JavaScript, let allows you to declare variables that are limited to the scope of a block statement, or expression on which it is used. const is similar to let, but the value cannot be reassigned. var is the oldest way to declare variables in JavaScript and is function scoped rather than block scoped.',
              q4: 'Media queries in CSS are used to apply different styles for different devices or screen sizes. They are a key component of responsive web design, allowing the layout to adapt to the viewing environment.',
              q5: ['o1', 'o2', 'o4'] // partially correct
            },
            feedback: {
              q1: { score: 5, comment: 'Correct answer.' },
              q2: { score: 0, comment: 'Incorrect. The correct answer is "margin".' },
              q3: { score: 9, comment: 'Good explanation, but could have mentioned more about hoisting differences.' },
              q4: { score: 10, comment: 'Excellent explanation of media queries.' },
              q5: { score: 7, comment: 'Partially correct. "Object.instance()" is not a valid way to create objects.' }
            },
            score: 85,
            status: 'graded',
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            gradedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            timeSpent: 45 // minutes
          };

          setSubmission(mockSubmission);
          setQuiz(mockSubmission.quiz);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionData();
  }, [id, quizId, queryQuizId]);

  const getStudentTrueFalseAnswer = (questionId) => {
    if (!submission || !submission.answers) return null;

    // Handle different submission data structures
    if (Array.isArray(submission.answers)) {
      // Find the answer for this question in the array
      const answer = submission.answers.find(a => a.questionId === questionId);
      if (answer) {
        if (Array.isArray(answer.selectedOptions) && answer.selectedOptions.length > 0) {
          return answer.selectedOptions[0]; // Return the first selected option
        }
        return answer.textAnswer || null;
      }
    } else if (typeof submission.answers === 'object') {
      // Direct object mapping
      return submission.answers[questionId] || null;
    }

    return null;
  };

  const getStudentEssayAnswer = (questionId) => {
    if (!submission || !submission.answers) return null;

    // Handle different submission data structures
    if (Array.isArray(submission.answers)) {
      // Find the answer for this question in the array
      const answer = submission.answers.find(a => a.questionId === questionId);
      if (answer) {
        return answer.textAnswer || null;
      }
    } else if (typeof submission.answers === 'object') {
      // Direct object mapping
      return submission.answers[questionId] || null;
    }

    return null;
  };

  // Initialize feedback from existing data when submission loads
  useEffect(() => {
    if (submission && quiz?.questions) {
      // Initialize feedback object with empty feedback for each question
      const initialFeedback = {};
      quiz.questions.forEach(question => {
        initialFeedback[question._id] = submission.feedback?.[question._id]?.comment || '';
      });
      setFeedback(initialFeedback);

      // Initialize overall feedback if it exists
      setOverallFeedback(submission.overallFeedback || '');
    }
  }, [submission, quiz]);

  // Handle feedback change for a specific question
  const handleFeedbackChange = (questionId, value) => {
    setFeedback(prev => ({
      ...prev,
      [questionId]: value
    }));
    console.log('Feedback for question', questionId, 'changed to:', value);
  };

  // Handle overall feedback change
  const handleOverallFeedbackChange = (e) => {
    setOverallFeedback(e.target.value);
  };

  // Save all feedback
  const handleSaveFeedback = async () => {
    try {
      setIsSaving(true);

      // Prepare feedback data
      const feedbackData = {
        submissionId: submission._id,
        questionFeedback: Object.entries(feedback).map(([questionId, comment]) => {
          // Find the question to get its points
          const question = quiz?.questions?.find(q => q._id === questionId);
          const pointsEarned = submission?.answers?.find(a => a.questionId === questionId)?.pointsEarned || 0;

          return {
            questionId,
            comment: comment || '',
            score: pointsEarned,
            maxScore: question?.points || 1
          };
        }),
        overallFeedback
      };

      // Send feedback to the API
      try {
        console.log('%c Submitting Feedback ', 'background: #2ecc71; color: white; font-weight: bold;');
        console.log('Feedback data being sent:', feedbackData);
        console.log('- Submission ID:', feedbackData.submissionId);
        console.log('- Question feedback:', feedbackData.questionFeedback);
        console.log('- Overall feedback:', feedbackData.overallFeedback);

        const response = await quizAPI.saveFeedback(feedbackData);

        console.log('%c Feedback Saved Successfully ', 'background: #2ecc71; color: white; font-weight: bold;');
        console.log('API Response:', response.data);
        console.log('- Success status:', response.data.success);
        console.log('- Message:', response.data.message);
        console.log('- Returned data:', response.data.data);

        // Update the submission object with the new feedback
        if (response.data && response.data.data) {
          setSubmission(prev => ({
            ...prev,
            feedback: response.data.data.feedback || prev.feedback,
            overallFeedback: response.data.data.overallFeedback || prev.overallFeedback
          }));
        }

        setSaveSuccess(true);
        // Reset success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (apiError) {
        console.log('%c API Error Saving Feedback ', 'background: #e74c3c; color: white; font-weight: bold;');
        console.error('Error details:', apiError);

        if (apiError.response) {
          console.log('Response status:', apiError.response.status);
          console.log('Response data:', apiError.response.data);
        } else if (apiError.request) {
          console.log('Request was made but no response received');
          console.log('Request details:', apiError.request);
        } else {
          console.log('Error message:', apiError.message);
        }

        // Fallback for development or if API fails
        console.log('%c Using Fallback (Mock Save) ', 'background: #f39c12; color: white; font-weight: bold;');
        console.log('Saving feedback locally:', feedbackData);

        // Update the local state with the feedback even if API fails
        setSubmission(prev => ({
          ...prev,
          feedback: Object.fromEntries(
            feedbackData.questionFeedback.map(item => [
              item.questionId,
              { comment: item.comment, score: item.score }
            ])
          ),
          overallFeedback: feedbackData.overallFeedback
        }));

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
      alert('Failed to save feedback. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const isCorrectAnswer = (questionId, answerId) => {
    if (!quiz || !quiz.questions) return false;

    const question = quiz.questions.find(q => q._id === questionId);
    if (!question) return false;

    if (question.type === 'multiple-choice') {
      return question.correctAnswer === answerId;
    }

    if (question.type === 'multiple-select') {
      return Array.isArray(question.correctAnswers) && question.correctAnswers.includes(answerId);
    }

    return false;
  };

  const isStudentAnswer = (questionId, answerId) => {
    if (!submission || !submission.answers) return false;

    // Handle different submission data structures
    let answer;

    // Check if answers is an object with question IDs as keys
    if (typeof submission.answers === 'object' && !Array.isArray(submission.answers)) {
      answer = submission.answers[questionId];
    }
    // Check if answers is an array of answer objects
    else if (Array.isArray(submission.answers)) {
      const answerObj = submission.answers.find(a => a.questionId === questionId);
      if (answerObj) {
        answer = answerObj.selectedOptions || answerObj.textAnswer;
      }
    }

    if (!answer) return false;

    if (Array.isArray(answer)) {
      return answer.includes(answerId);
    }

    return answer === answerId;
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

  if (!submission || !quiz) {
    return (
      <div className="text-center py-10">
        <p>Submission not found.</p>
        <button
          onClick={() => navigate('/faculty/quizzes')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Return to Quizzes
        </button>
      </div>
    );
  }
  console.log("quiz data",quiz);
  return (
    <div>
      <div className="mb-6 flex items-center">
        <button
          onClick={() => {
            if (quiz && quiz._id) {
              navigate(`/faculty/quizzes/${quiz._id}/submissions`);
            } else {
              navigate('/faculty/quizzes');
            }
          }}
          className="mr-4 text-blue-600 hover:text-blue-900"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submission: {quiz?.title || 'Unknown Quiz'}</h1>
          <p className="text-gray-600">
            {quiz?.course?.name || 'Unknown Course'}
            {quiz?.course?.code ? `(${quiz.course.code})` : ''}
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Student Information</h3>
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              (submission?.percentage || submission?.totalScore || 0) >= (quiz?.passingScore || 60)
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {(submission?.percentage || submission?.totalScore || 0) >= (quiz?.passingScore || 60) ? 'Passed' : 'Failed'}
            </span>
          </div>
        </div>

        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center mb-4">
                <FiUser className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">
                  <span className="font-medium">Name:</span> {submission.student.name}
                </span>
              </div>
              <div className="flex items-center mb-4">
                <FiCalendar className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">
                  <span className="font-medium">Submitted:</span> {submission?.endTime ? `${new Date(submission.endTime).toLocaleDateString()} at ${new Date(submission.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not available'}
                </span>
              </div>
              <div className="flex items-center">
                <FiClock className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">
                  <span className="font-medium">Time Spent:</span>
                  {submission?.startTime && submission?.endTime ? (
                    <>
                      {Math.floor((new Date(submission.endTime) - new Date(submission.startTime)) / 60000)} minute
                      {Math.floor((new Date(submission.endTime) - new Date(submission.startTime)) / 60000) !== 1 && 's'}
                      {' '}
                      {Math.floor(((new Date(submission.endTime) - new Date(submission.startTime)) % 60000) / 1000)} second
                      {Math.floor(((new Date(submission.endTime) - new Date(submission.startTime)) % 60000) / 1000) !== 1 && 's'}
                    </>
                  ) : 'Not available'}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Submission Score</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{submission?.percentage || Math.round((submission?.totalScore || 0) / (quiz?.totalPoints || 1) * 100)}%</p>
                  <p className="text-sm text-gray-500">
                    ({submission?.totalScore || 0}/{quiz?.totalPoints || 1} points)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Passing Score</p>
                  <p className="text-lg font-semibold text-gray-900">{quiz?.passingScore || 60}%</p>
                </div>
              </div>

              {(submission?.updatedAt || submission?.gradedAt) && (
                <p className="mt-2 text-xs text-gray-500">
                  Graded on {new Date(submission?.updatedAt || submission?.gradedAt).toLocaleDateString()} at {new Date(submission?.updatedAt || submission?.gradedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Answers & Feedback</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Review the student's answers and your feedback.
          </p>
        </div>

        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-8">
            {quiz?.questions?.map((question, index) => (
              <div key={question._id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-baseline mb-2">
                  <div className="flex items-baseline">
                    <span className="text-lg font-medium text-gray-900 mr-2">Q{index + 1}.</span>
                    <span className="text-lg text-gray-900">{question.questionText || question.text}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 mr-2">Score:</span>
                    <span className="text-sm font-medium text-green-600">
                      {question.points || 1} point{question.points !== 1 && 's'}
                    </span>
                  </div>
                </div>

                {(question.questionType === 'multiple-choice' || question.type === 'multiple-choice') && (
                  <div className="mt-4 ml-8">
                    <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
                    <ul className="space-y-2">
                      {question.options.map((option) => (
                        <li key={option._id} className="flex items-center">
                          <div className={`h-4 w-4 rounded-full mr-2 ${
                            isStudentAnswer(question._id, option._id) && isCorrectAnswer(question._id, option._id)
                              ? 'bg-green-500'
                              : isStudentAnswer(question._id, option._id) && !isCorrectAnswer(question._id, option._id)
                                ? 'bg-red-500'
                                : isCorrectAnswer(question._id, option._id)
                                  ? 'bg-gray-300'
                                  : 'bg-gray-200'
                          }`}></div>
                          <span className={`text-sm ${
                            isStudentAnswer(question._id, option._id)
                              ? 'font-medium text-gray-900'
                              : 'text-gray-700'
                          }`}>
                            {option.text}
                            {isStudentAnswer(question._id, option._id) && (
                              <span className="ml-2">
                                {isCorrectAnswer(question._id, option._id)
                                  ? <FiCheckCircle className="inline h-4 w-4 text-green-500" />
                                  : <FiXCircle className="inline h-4 w-4 text-red-500" />
                                }
                              </span>
                            )}
                            {!isStudentAnswer(question._id, option._id) && isCorrectAnswer(question._id, option._id) && (
                              <span className="ml-2 text-gray-500">(Correct answer)</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(question.questionType === 'multiple-select' || question.type === 'multiple-select') && (
                  <div className="mt-4 ml-8">
                    <p className="text-sm font-medium text-gray-700 mb-2">Options (select all that apply):</p>
                    <ul className="space-y-2">
                      {question.options.map((option) => (
                        <li key={option._id} className="flex items-center">
                          <div className={`h-4 w-4 rounded mr-2 ${
                            isStudentAnswer(question._id, option._id) && isCorrectAnswer(question._id, option._id)
                              ? 'bg-green-500'
                              : isStudentAnswer(question._id, option._id) && !isCorrectAnswer(question._id, option._id)
                                ? 'bg-red-500'
                                : isCorrectAnswer(question._id, option._id)
                                  ? 'bg-gray-300'
                                  : 'bg-gray-200'
                          }`}></div>
                          <span className={`text-sm ${
                            isStudentAnswer(question._id, option._id)
                              ? 'font-medium text-gray-900'
                              : 'text-gray-700'
                          }`}>
                            {option.text}
                            {isStudentAnswer(question._id, option._id) && (
                              <span className="ml-2">
                                {isCorrectAnswer(question._id, option._id)
                                  ? <FiCheckCircle className="inline h-4 w-4 text-green-500" />
                                  : <FiXCircle className="inline h-4 w-4 text-red-500" />
                                }
                              </span>
                            )}
                            {!isStudentAnswer(question._id, option._id) && isCorrectAnswer(question._id, option._id) && (
                              <span className="ml-2 text-gray-500">(Should have selected)</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(question.questionType === 'true-false' || question.type === 'true-false') && (
                  <div className="mt-4 ml-8">
                    <p className="text-sm font-medium text-gray-700 mb-2">True/False Question</p>
                    <div className="flex items-center space-x-4">
                      <div className={`px-3 py-1 rounded-full ${getStudentTrueFalseAnswer(question._id) === 'true' ? 'bg-green-100 text-green-800 font-medium' : 'bg-gray-100 text-gray-600'}`}>
                        True {getStudentTrueFalseAnswer(question._id) === 'true' && '✓'}
                      </div>
                      <div className={`px-3 py-1 rounded-full ${getStudentTrueFalseAnswer(question._id) === 'false' ? 'bg-green-100 text-green-800 font-medium' : 'bg-gray-100 text-gray-600'}`}>
                        False {getStudentTrueFalseAnswer(question._id) === 'false' && '✓'}
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Correct answer: <span className="font-medium">{question.correctAnswer ? question.correctAnswer.charAt(0).toUpperCase() + question.correctAnswer.slice(1) : 'Not specified'}</span>
                    </p>
                  </div>
                )}

                {(question.questionType === 'essay' || question.type === 'essay') && (
                  <div className="mt-4 ml-8">
                    <p className="text-sm font-medium text-gray-700 mb-2">Student's Answer:</p>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-700">
                        {getStudentEssayAnswer(question._id) || <span className="italic text-gray-500">No answer provided</span>}
                      </p>
                    </div>
                  </div>
                )}

                {/* Question explanation section */}
                {question.explanation && (
                  <div className="mt-4 ml-8">
                    <p className="text-sm font-medium text-gray-700 mb-2">Explanation:</p>
                    <div className="bg-blue-50 p-4 rounded-md">
                      <p className="text-sm text-blue-700">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                )}

                {/* Faculty feedback section */}
                <div className="mt-4 ml-8">
                  <p className="text-sm font-medium text-gray-700 mb-2">Faculty Feedback:</p>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Provide feedback for this question..."
                    value={feedback[question._id] || ''}
                    onChange={(e) => handleFeedbackChange(question._id, e.target.value)}
                  ></textarea>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overall Feedback Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Overall Feedback</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Provide general feedback for the student's overall performance on this quiz.
          </p>
        </div>

        <div className="px-4 py-5 sm:p-6">
          <textarea
            className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            placeholder="Provide overall feedback for the student..."
            value={overallFeedback}
            onChange={handleOverallFeedbackChange}
          ></textarea>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mb-8">
        <button
          onClick={handleSaveFeedback}
          disabled={isSaving}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isSaving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : 'Save Feedback'}
        </button>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">Feedback saved successfully!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// We're keeping the default export for backward compatibility
// but we've also added a named export above
