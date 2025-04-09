const express = require('express');
const router = express.Router();
const { 
  getQuizzes, 
  getQuiz, 
  createQuiz, 
  updateQuiz, 
  deleteQuiz,
  getQuizSubmissions
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

module.exports = router;
