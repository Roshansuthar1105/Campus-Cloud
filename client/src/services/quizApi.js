import api from './api';

// Quiz API calls
const quizAPI = {
  // Get all quizzes
  getQuizzes: async (params) => {
    return await api.get('/quizzes', { params });
  },

  // Get single quiz
  getQuiz: async (id) => {
    return await api.get(`/quizzes/${id}`);
  },

  // Create quiz
  createQuiz: async (quizData) => {
    return await api.post('/quizzes', quizData);
  },

  // Update quiz
  updateQuiz: async (id, quizData) => {
    return await api.put(`/quizzes/${id}`, quizData);
  },

  // Delete quiz
  deleteQuiz: async (id) => {
    return await api.delete(`/quizzes/${id}`);
  },

  // Get quiz submissions
  getQuizSubmissions: async (id) => {
    return await api.get(`/quizzes/${id}/submissions`);
  },

  // Start quiz attempt
  startQuizAttempt: async (quizId) => {
    return await api.post('/submissions/start', { quizId });
  },

  // Submit answer
  submitAnswer: async (submissionId, answerData) => {
    return await api.put(`/submissions/${submissionId}/answer`, answerData);
  },

  // Complete quiz submission
  completeSubmission: async (submissionId) => {
    return await api.put(`/submissions/${submissionId}/complete`);
  },

  // Grade submission
  gradeSubmission: async (submissionId, gradingData) => {
    return await api.put(`/submissions/${submissionId}/grade`, gradingData);
  },

  // Export quiz submissions as CSV
  exportQuizSubmissions: async (quizId) => {
    try {
      return await api.get(`/quizzes/${quizId}/submissions/export`, {
        responseType: 'blob'
      });
    } catch (error) {
      console.error('Error exporting submissions:', error);

      // If the endpoint doesn't exist, create a CSV manually
      console.log(`Creating CSV manually for quiz ID: ${quizId}`);
      const submissionsResponse = await api.get(`/quizzes/${quizId}/submissions`);
      const submissions = submissionsResponse.data.data || [];
      console.log(`Found ${submissions.length} submissions for CSV export`);

      // Create CSV content
      let csvContent = 'Student Name,Email,Submission Date,Time Spent,Score,Status\n';

      submissions.forEach(submission => {
        const studentName = submission.student?.name || 'Unknown';
        const email = submission.student?.email || 'Unknown';
        const submissionDate = submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'N/A';
        const timeSpent = submission.timeSpent || 'N/A';
        const score = submission.score !== null ? `${submission.score}%` : 'Not graded';
        const status = submission.status || 'Unknown';

        csvContent += `"${studentName}","${email}","${submissionDate}","${timeSpent}","${score}","${status}"\n`;
      });

      // Create a blob from the CSV content
      const blob = new Blob([csvContent], { type: 'text/csv' });

      return { data: blob };
    }
  },

  // Get quiz statistics
  getQuizStats: async (quizId) => {
    try {
      return await api.get(`/quizzes/${quizId}/stats`);
    } catch (error) {
      console.error('Error fetching quiz stats:', error);

      // If the endpoint doesn't exist, calculate stats manually
      console.log(`Calculating stats manually for quiz ID: ${quizId}`);
      const submissionsResponse = await api.get(`/quizzes/${quizId}/submissions`);
      const submissions = submissionsResponse.data.data || [];
      console.log(`Found ${submissions.length} submissions for quiz`);

      // Calculate statistics
      const gradedSubmissions = submissions.filter(sub => sub.status === 'graded');
      console.log(`Found ${gradedSubmissions.length} graded submissions`);
      const totalSubmissions = submissions.length;
      const scores = gradedSubmissions.map(sub => sub.score || 0);
      console.log('Scores:', scores);

      const stats = {
        totalSubmissions,
        averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
        highestScore: scores.length > 0 ? Math.max(...scores) : 0,
        lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
        completionRate: totalSubmissions > 0 ? (gradedSubmissions.length / totalSubmissions) * 100 : 0
      };

      console.log('Calculated stats:', stats);

      return {
        data: {
          success: true,
          data: stats
        }
      };
    }
  },

  // Get submission details
  getSubmission: async (submissionId) => {
    // First, we need to find which quiz this submission belongs to
    // We'll get all quizzes and check their submissions
    const quizzesResponse = await api.get('/quizzes');
    const quizzes = quizzesResponse.data.data || [];

    // For each quiz, check if it has the submission we're looking for
    for (const quiz of quizzes) {
      try {
        const submissionsResponse = await api.get(`/quizzes/${quiz._id}/submissions`);
        const submissions = submissionsResponse.data.data || [];

        // Find the submission with the matching ID
        const submission = submissions.find(sub => sub._id === submissionId);

        if (submission) {
          // Get the full quiz data
          console.log(`Getting full quiz data for quiz ID: ${quiz._id}`);
          const quizResponse = await api.get(`/quizzes/${quiz._id}`);
          console.log('Quiz response:', quizResponse.data);
          const fullQuizData = quizResponse.data.data || {};
          console.log('Full quiz data:', fullQuizData);

          // Create a new submission object with the full quiz data
          const enhancedSubmission = {
            ...submission,
            quiz: fullQuizData
          };
          console.log('Enhanced submission with quiz data:', enhancedSubmission);

          // Return the enhanced submission in the same format as a direct API call would
          return {
            data: {
              success: true,
              data: enhancedSubmission
            }
          };
        }
      } catch (error) {
        console.log(`Error checking quiz ${quiz._id} for submission:`, error);
      }
    }

    // If we get here, the submission wasn't found
    throw new Error('Submission not found');
  },

  // Save feedback for a submission
  saveFeedback: async (feedbackData) => {
    // Create a copy of the data to avoid modifying the original
    const formattedData = { ...feedbackData };

    // Format question feedback if needed
    if (formattedData.questionFeedback) {
      formattedData.questionFeedback = formattedData.questionFeedback.map(item => {
        // If feedback is a string, we need the questionId from elsewhere
        // This case should not happen with our current implementation
        // but we handle it just in case
        if (typeof item === 'string') {
          console.warn('Received string feedback without questionId:', item);
          return {
            questionId: '', // This would need to be provided separately
            comment: item,
            score: null // Add a default score if needed
          };
        }

        // If feedback is already an object but missing required fields
        if (typeof item === 'object') {
          return {
            questionId: item.questionId || '',
            comment: item.comment || '',
            score: item.score !== undefined ? item.score : null
          };
        }

        return item;
      });
    }

    // Format overall feedback if it's not a string
    if (formattedData.overallFeedback && typeof formattedData.overallFeedback !== 'string') {
      formattedData.overallFeedback = String(formattedData.overallFeedback);
    }

    // Ensure submissionId is present
    if (!formattedData.submissionId) {
      throw new Error('Submission ID is required');
    }

    // Log the formatted data for debugging
    console.log('%c Sending Feedback Data to API ', 'background: #3498db; color: white; font-weight: bold;');
    console.log('Original data:', feedbackData);
    console.log('Formatted data:', formattedData);
    console.log('Submission ID:', formattedData.submissionId);
    console.log('Question feedback:', formattedData.questionFeedback);
    console.log('Overall feedback:', formattedData.overallFeedback);

    return await api.post('/submissions/feedback', formattedData);
  }
};

export default quizAPI;
