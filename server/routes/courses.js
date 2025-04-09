const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  addStudentsToCourse,
  removeStudentFromCourse,
  getStudentCourses,
  getFacultyCourses
} = require('../controllers/courseController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');

// All routes require authentication
router.use(protect);

// Get student courses
router.route('/student')
  .get(authorize('student'), getStudentCourses);

// Get faculty courses
router.route('/faculty')
  .get(authorize('faculty'), getFacultyCourses);

// Get all courses and create course
router.route('/')
  .get(getCourses)
  .post(authorize('faculty', 'management'), createCourse);

// Get, update and delete single course
router.route('/:id')
  .get(getCourse)
  .put(authorize('faculty', 'management'), updateCourse)
  .delete(authorize('management'), deleteCourse);

// Add students to course
router.route('/:id/students')
  .post(authorize('faculty', 'management'), addStudentsToCourse);

// Remove student from course
router.route('/:id/students/:studentId')
  .delete(authorize('faculty', 'management'), removeStudentFromCourse);

module.exports = router;
