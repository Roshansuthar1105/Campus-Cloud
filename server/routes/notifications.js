const express = require('express');
const router = express.Router();
const { 
  getUserNotifications, 
  markAsRead, 
  markAllAsRead,
  createNotification
} = require('../controllers/notificationController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');

// All routes require authentication
router.use(protect);

// Get user notifications
router.get('/', getUserNotifications);

// Mark all notifications as read
router.put('/read-all', markAllAsRead);

// Mark notification as read
router.put('/:id/read', markAsRead);

// Create notification (management only)
router.post('/', authorize('management'), createNotification);

module.exports = router;
