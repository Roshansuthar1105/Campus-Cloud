const express = require('express');
const router = express.Router();
const {
  getFacultyReports,
  getManagementReports,
  exportFacultyReport,
  exportManagementReport
} = require('../controllers/reportController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');

// All routes require authentication
router.use(protect);

// Get faculty reports
router.get('/faculty', authorize('faculty'), getFacultyReports);

// Export faculty reports
router.get('/faculty/export', authorize('faculty'), exportFacultyReport);

// Get management reports
router.get('/management', authorize('management'), getManagementReports);

// Export management reports
router.get('/management/export', authorize('management'), exportManagementReport);

module.exports = router;
