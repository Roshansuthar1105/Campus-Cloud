const express = require('express');
const router = express.Router();
const { 
  getStudentDashboard,
  getFacultyDashboard,
  getManagementDashboard
} = require('../controllers/dashboardController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');

// All routes require authentication
router.use(protect);

// Get student dashboard
router.get('/student', authorize('student'), getStudentDashboard);

// Get faculty dashboard
router.get('/faculty', authorize('faculty'), getFacultyDashboard);

// Get management dashboard
router.get('/management', authorize('management'), getManagementDashboard);

module.exports = router;
