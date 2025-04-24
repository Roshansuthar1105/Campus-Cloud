import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiX, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import api from '../../services/api';
import quizAPI from '../../services/quizApi';

const SubmissionView = () => {
  const { id, submissionId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [overallFeedback, setOverallFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Feedback saved successfully');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch the submission data using the quizAPI service
        const submissionResponse = await quizAPI.getSubmission(submissionId);
        const submissionData = submissionResponse.data.data;
        setSubmission(submissionData);

        // The quiz data is already populated in the submission response
        if (submissionData.quiz) {
          setQuiz(submissionData.quiz);
        } else {
          // Fallback: fetch the quiz data separately if not populated
          const quizResponse = await api.get(`/quizzes/${id}`);
          const quizData = quizResponse.data.data;
          setQuiz(quizData);
        }

        // Initialize feedback from existing data
        if (submissionData.feedback) {
          const initialFeedback = {};
          Object.entries(submissionData.feedback).forEach(([questionId, feedbackData]) => {
            initialFeedback[questionId] = feedbackData.comment || '';
          });
          setFeedback(initialFeedback);
        }

        // Initialize overall feedback
        if (submissionData.overallFeedback) {
          setOverallFeedback(submissionData.overallFeedback);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching submission data:', err);
        setError('Failed to load submission details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, submissionId]);

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

      // Save feedback via API
      try {
        await quizAPI.provideFeedback(feedbackData);

        // Update local state
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

        setSuccessMessage('Feedback saved successfully');
        setSaveSuccess(true);
      } catch (apiError) {
        console.error('API Error saving feedback:', apiError);

        // Fallback for development or if API fails
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

        setSuccessMessage('Feedback saved locally (API error)');
        setSaveSuccess(true);
      }
    } catch (err) {
      console.error('Error saving feedback:', err);
      setSuccessMessage('Error saving feedback');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiX className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!submission || !quiz) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiX className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">Submission or quiz data not found.</p>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to render the student's answer based on question type
  const renderStudentAnswer = (question, answer) => {
    if (!answer) {
      return <p className="text-gray-500 italic">No answer provided</p>;
    }

    switch (question.type) {
      case 'multiple-choice':
        const selectedOption = question.options?.find(opt => opt._id === answer);
        return (
          <div className="flex items-center">
            <div className={`h-4 w-4 rounded-full ${answer === question.correctAnswer ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="ml-3 text-sm text-gray-700">
              {selectedOption?.text || 'Unknown option'}
            </span>
            {answer !== question.correctAnswer && (
              <div className="ml-6 flex items-center">
                <div className="h-4 w-4 rounded-full bg-green-500"></div>
                <span className="ml-3 text-sm text-gray-700">
                  {question.options?.find(opt => opt._id === question.correctAnswer)?.text || 'Unknown correct option'}
                </span>
              </div>
            )}
          </div>
        );

      case 'multiple-select':
        const selectedOptions = Array.isArray(answer) ? answer : [answer];
        const correctOptions = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];

        const isCorrect = selectedOptions.length === correctOptions.length &&
                          correctOptions.every(opt => selectedOptions.includes(opt));

        return (
          <div>
            <div className="flex items-center mb-2">
              {isCorrect ? (
                <FiCheckCircle className="text-green-500 mr-2" />
              ) : (
                <FiXCircle className="text-red-500 mr-2" />
              )}
              <span className="text-sm font-medium">
                {isCorrect ? 'Correct' : 'Incorrect'}
              </span>
            </div>
            <div className="space-y-2">
              {question.options?.map(option => (
                <div key={option._id} className="flex items-center">
                  <div className={`h-4 w-4 rounded-sm ${
                    selectedOptions.includes(option._id) && correctOptions.includes(option._id)
                      ? 'bg-green-500' // Correct selection
                      : selectedOptions.includes(option._id) && !correctOptions.includes(option._id)
                        ? 'bg-red-500' // Incorrect selection
                        : !selectedOptions.includes(option._id) && correctOptions.includes(option._id)
                          ? 'border-2 border-green-500' // Missed correct option
                          : 'border border-gray-300' // Not selected, not correct
                  }`}></div>
                  <span className="ml-3 text-sm text-gray-700">{option.text}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'true-false':
        const tfAnswer = answer === 'true' || answer === true;
        const correctAnswer = question.correctAnswer === 'true' || question.correctAnswer === true;
        return (
          <div>
            <div className="flex items-center mb-2">
              {tfAnswer === correctAnswer ? (
                <FiCheckCircle className="text-green-500 mr-2" />
              ) : (
                <FiXCircle className="text-red-500 mr-2" />
              )}
              <span className="text-sm font-medium">
                {tfAnswer === correctAnswer ? 'Correct' : 'Incorrect'}
              </span>
            </div>
            <div className="flex items-center">
              <div className={`h-4 w-4 rounded-full ${tfAnswer ? 'bg-blue-500' : 'border border-gray-300'}`}></div>
              <span className="ml-3 text-sm text-gray-700">True</span>
            </div>
            <div className="flex items-center mt-2">
              <div className={`h-4 w-4 rounded-full ${!tfAnswer ? 'bg-blue-500' : 'border border-gray-300'}`}></div>
              <span className="ml-3 text-sm text-gray-700">False</span>
            </div>
            {tfAnswer !== correctAnswer && (
              <div className="mt-2 text-sm text-gray-500">
                Correct answer: {correctAnswer ? 'True' : 'False'}
              </div>
            )}
          </div>
        );

      case 'essay':
        return (
          <div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{answer}</p>
          </div>
        );

      default:
        return <p className="text-gray-500 italic">Answer format not supported</p>;
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate(`/management/quizzes/${id}/reports`)}
          className="mr-4 text-purple-600 hover:text-purple-900"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submission: {quiz?.title || 'Unknown Quiz'}</h1>
          <p className="text-gray-600">
            {quiz?.course?.name || 'Unknown Course'}
            {quiz?.course?.code ? ` (${quiz.course.code})` : ''}
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiCheck className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Student Information</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{submission.student?.name || 'Unknown'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{submission.student?.email || 'Unknown'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Submission Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'Unknown'}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Time Spent</dt>
              <dd className="mt-1 text-sm text-gray-900">{submission.timeSpent ? `${submission.timeSpent} minutes` : 'Unknown'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Score</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {submission.score !== undefined && submission.score !== null
                  ? `${submission.score}% (${submission.score >= quiz.passingScore ? 'Passed' : 'Failed'})`
                  : 'Not graded'}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  submission.status === 'graded' ? 'bg-green-100 text-green-800' :
                  submission.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                  submission.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {submission.status ? submission.status.charAt(0).toUpperCase() + submission.status.slice(1) : 'Unknown'}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Answers & Feedback</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-8">
            {quiz?.questions?.map((question, index) => {
              const answer = submission.answers?.find(a => a.questionId === question._id)?.selectedOptions ||
                             submission.answers?.find(a => a.questionId === question._id)?.textAnswer ||
                             submission.answers?.[question._id];

              return (
                <div key={question._id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-baseline mb-2">
                    <div className="flex items-baseline">
                      <span className="text-lg font-medium text-gray-900 mr-2">Q{index + 1}.</span>
                      <span className="text-lg text-gray-900">{question.text}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 mr-2">Points:</span>
                      <span className="text-sm font-medium text-green-600">
                        {question.points || 1} point{question.points !== 1 && 's'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 bg-gray-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Student's Answer:</h4>
                    {renderStudentAnswer(question, answer)}
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Feedback:</h4>
                    <textarea
                      value={feedback[question._id] || ''}
                      onChange={(e) => handleFeedbackChange(question._id, e.target.value)}
                      className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      rows="3"
                      placeholder="Provide feedback for this answer..."
                    ></textarea>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Overall Feedback:</h4>
            <textarea
              value={overallFeedback}
              onChange={handleOverallFeedbackChange}
              className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
              rows="4"
              placeholder="Provide overall feedback for this submission..."
            ></textarea>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSaveFeedback}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              {isSaving ? 'Saving...' : 'Save Feedback'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionView;
