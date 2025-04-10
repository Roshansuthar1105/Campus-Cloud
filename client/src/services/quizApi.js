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
      const submissionsResponse = await api.get(`/quizzes/${quizId}/submissions`);
      const submissions = submissionsResponse.data.data || [];

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
      const submissionsResponse = await api.get(`/quizzes/${quizId}/submissions`);
      const submissions = submissionsResponse.data.data || [];

      // Calculate statistics
      const gradedSubmissions = submissions.filter(sub => sub.status === 'graded');
      const totalSubmissions = submissions.length;
      const scores = gradedSubmissions.map(sub => sub.score || 0);

      const stats = {
        totalSubmissions,
        averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
        highestScore: scores.length > 0 ? Math.max(...scores) : 0,
        lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
        completionRate: totalSubmissions > 0 ? (gradedSubmissions.length / totalSubmissions) * 100 : 0
      };

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
          // Return the submission in the same format as a direct API call would
          return {
            data: {
              success: true,
              data: submission
            }
          };
        }
      } catch (error) {
        console.log(`Error checking quiz ${quiz._id} for submission:`, error);
      }
    }

    // If we get here, the submission wasn't found
    throw new Error('Submission not found');
  }
};

export default quizAPI;
