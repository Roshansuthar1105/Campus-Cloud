const express = require('express');
const router = express.Router();
const {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizSubmissions,
  getQuizStats
} = require('../controllers/quizController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');

// All routes require authentication
router.use(protect);

// Get all quizzes and create quiz
router.route('/')
  .get(getQuizzes)
  .post(authorize('faculty', 'management'), createQuiz);

// Get, update and delete single quiz
router.route('/:id')
  .get(getQuiz)
  .put(authorize('faculty', 'management'), updateQuiz)
  .delete(authorize('faculty', 'management'), deleteQuiz);

// Get quiz submissions
router.route('/:id/submissions')
  .get(getQuizSubmissions);

// Get quiz statistics
router.route('/:id/stats')
  .get(authorize('faculty', 'management'), getQuizStats);

// Export quiz submissions
router.route('/:id/submissions/export')
  .get(authorize('faculty', 'management'), async (req, res) => {
    try {
      // Get quiz submissions
      const quiz = await require('../models/Quiz').findById(req.params.id);
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      // Check authorization
      if (req.user.role === 'faculty' && quiz.createdBy.toString() !== req.user.id) {
        const course = await require('../models/Course').findById(quiz.course);
        if (!course || !course.faculty.includes(req.user.id)) {
          return res.status(403).json({ message: 'Not authorized to export submissions for this quiz' });
        }
      }

      // Get submissions
      const submissions = await require('../models/QuizSubmission').find({ quiz: quiz._id })
        .populate('student', 'name email')
        .populate('gradedBy', 'name');

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

      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${quiz.title}_submissions.csv"`);

      // Send CSV content
      res.send(csvContent);
    } catch (error) {
      console.error('Error exporting quiz submissions:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;
