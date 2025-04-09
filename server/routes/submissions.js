const express = require('express');
const router = express.Router();
const { 
  startQuizAttempt,
  submitAnswer,
  completeSubmission,
  gradeSubmission
} = require('../controllers/quizSubmissionController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');

// All routes require authentication
router.use(protect);

// Start a quiz attempt
router.post('/start', authorize('student'), startQuizAttempt);

// Submit answer for a question
router.put('/:id/answer', authorize('student'), submitAnswer);

// Complete quiz submission
router.put('/:id/complete', authorize('student'), completeSubmission);

// Grade a submission
router.put('/:id/grade', authorize('faculty', 'management'), gradeSubmission);

module.exports = router;
