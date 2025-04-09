import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import quizAPI from '../../services/quizApi';

const QuizGrading = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [student, setStudent] = useState(null);
  const [gradingData, setGradingData] = useState({
    answers: [],
    feedback: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        
        // Get the submission
        const response = await quizAPI.getQuizSubmissions(id);
        const submissionData = response.data.data.find(sub => sub._id === id);
        
        if (!submissionData) {
          throw new Error('Submission not found');
        }
        
        setSubmission(submissionData);
        setStudent(submissionData.student);
        
        // Get the quiz details
        const quizResponse = await quizAPI.getQuiz(submissionData.quiz);
        setQuiz(quizResponse.data.data);
        
        // Initialize grading data
        setGradingData({
          answers: submissionData.answers.map(answer => ({
            questionId: answer.questionId,
            isCorrect: answer.isCorrect || false,
            pointsEarned: answer.pointsEarned || 0,
            feedback: answer.feedback || ''
          })),
          feedback: submissionData.feedback || ''
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching submission:', err);
        setError('Failed to load submission. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id]);

  const handleAnswerGradeChange = (questionId, field, value) => {
    setGradingData(prev => {
      const updatedAnswers = [...prev.answers];
      const answerIndex = updatedAnswers.findIndex(a => a.questionId === questionId);
      
      if (answerIndex !== -1) {
        updatedAnswers[answerIndex] = {
          ...updatedAnswers[answerIndex],
          [field]: field === 'pointsEarned' ? Number(value) : value
        };
      }
      
      return {
        ...prev,
        answers: updatedAnswers
      };
    });
  };

  const handleFeedbackChange = (e) => {
    setGradingData(prev => ({
      ...prev,
      feedback: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      await quizAPI.gradeSubmission(id, gradingData);
      setSuccess('Submission graded successfully!');
      
      // Refresh submission data
      const response = await quizAPI.getQuizSubmissions(id);
      const updatedSubmission = response.data.data.find(sub => sub._id === id);
      setSubmission(updatedSubmission);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/faculty/quizzes');
      }, 2000);
    } catch (err) {
      console.error('Error grading submission:', err);
      setError(err.response?.data?.message || 'Failed to grade submission. Please try again.');
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

  if (!submission || !quiz || !student) {
    return (
      <div className="text-center py-10">
        <p>Submission not found or not available for grading.</p>
        <button
          onClick={() => navigate('/faculty/quizzes')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Return to Quizzes
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate('/faculty/quizzes')}
          className="mr-4 text-indigo-600 hover:text-indigo-900"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grade Submission</h1>
          <p className="text-gray-600">{quiz.title}</p>
        </div>
      </div>

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

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Submission Details</h2>
              <p className="text-sm text-gray-600">
                Student: {student.name} ({student.email})
              </p>
              <p className="text-sm text-gray-600">
                Submitted: {new Date(submission.endTime).toLocaleString()}
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
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Grade Questions</h2>
            <p className="text-sm text-gray-600">
              Review and grade each question. Objective questions are auto-graded.
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {quiz.questions.map((question, index) => {
              const answer = submission.answers.find(a => a.questionId === question._id);
              const gradingAnswer = gradingData.answers.find(a => a.questionId === question._id);
              
              if (!answer || !gradingAnswer) return null;
              
              const isObjective = question.questionType === 'multiple-choice' || question.questionType === 'true-false';
              const needsManualGrading = !isObjective;
              
              return (
                <div key={question._id} className="p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      {gradingAnswer.isCorrect ? (
                        <FiCheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <FiXCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <h3 className="text-md font-medium text-gray-900">Question {index + 1}</h3>
                        <div className="flex items-center">
                          <input
                            type="number"
                            min="0"
                            max={question.points}
                            value={gradingAnswer.pointsEarned}
                            onChange={(e) => handleAnswerGradeChange(question._id, 'pointsEarned', e.target.value)}
                            className="w-16 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                            disabled={isObjective && submission.isGraded}
                          />
                          <span className="ml-2 text-sm text-gray-500">/ {question.points} points</span>
                        </div>
                      </div>
                      
                      <p className="mt-2 text-sm text-gray-700">{question.questionText}</p>
                      
                      {/* Multiple Choice */}
                      {question.questionType === 'multiple-choice' && (
                        <div className="mt-3 space-y-2">
                          {question.options.map((option, optionIndex) => {
                            const isSelected = answer.selectedOptions.includes(option.text);
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
                                <div className={`flex-shrink-0 h-5 w-5 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`}>
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
                                  {isCorrect && ' (Correct)'}
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
                            const isSelected = answer.selectedOptions.includes(option);
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
                                <div className={`flex-shrink-0 h-5 w-5 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`}>
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
                                  {isCorrect && ' (Correct)'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Short Answer / Essay */}
                      {(question.questionType === 'short-answer' || question.questionType === 'essay') && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700">Student's Answer:</p>
                          <div className="mt-1 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{answer.textAnswer || 'No answer provided'}</p>
                          </div>
                          
                          <div className="mt-3 flex items-center">
                            <div className="flex items-center mr-4">
                              <input
                                id={`correct-${question._id}`}
                                type="radio"
                                checked={gradingAnswer.isCorrect}
                                onChange={() => handleAnswerGradeChange(question._id, 'isCorrect', true)}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                              />
                              <label htmlFor={`correct-${question._id}`} className="ml-2 block text-sm text-gray-700">
                                Correct
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id={`incorrect-${question._id}`}
                                type="radio"
                                checked={!gradingAnswer.isCorrect}
                                onChange={() => handleAnswerGradeChange(question._id, 'isCorrect', false)}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                              />
                              <label htmlFor={`incorrect-${question._id}`} className="ml-2 block text-sm text-gray-700">
                                Incorrect
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Answer Feedback */}
                      <div className="mt-3">
                        <label htmlFor={`feedback-${question._id}`} className="block text-sm font-medium text-gray-700">
                          Feedback for Student (Optional)
                        </label>
                        <div className="mt-1">
                          <textarea
                            id={`feedback-${question._id}`}
                            value={gradingAnswer.feedback}
                            onChange={(e) => handleAnswerGradeChange(question._id, 'feedback', e.target.value)}
                            rows={2}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Provide feedback on this answer..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <label htmlFor="overall-feedback" className="block text-sm font-medium text-gray-700">
              Overall Feedback (Optional)
            </label>
            <div className="mt-1">
              <textarea
                id="overall-feedback"
                value={gradingData.feedback}
                onChange={handleFeedbackChange}
                rows={4}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Provide overall feedback on the submission..."
              />
            </div>
          </div>
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
            disabled={submitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {submitting ? 'Submitting...' : (
              <>
                <FiSave className="mr-2 -ml-1 h-5 w-5" />
                Submit Grades
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizGrading;
