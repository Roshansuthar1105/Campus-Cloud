const User=require('../models/User')
const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getUserNotifications = async (req, res) => {
  try {
    // Find notifications where the user is a recipient
    const notifications = await Notification.find({
      'recipients.user': req.user.id,
      $or: [
        { targetRole: 'all' },
        { targetRole: req.user.role }
      ]
    }).sort({ createdAt: -1 });
    
    // Process notifications to include read status for the current user
    const processedNotifications = notifications.map(notification => {
      const userRecipient = notification.recipients.find(
        recipient => recipient.user.toString() === req.user.id
      );
      
      return {
        _id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        read: userRecipient ? userRecipient.read : false,
        readAt: userRecipient ? userRecipient.readAt : null,
        relatedResource: notification.relatedResource,
        createdAt: notification.createdAt
      };
    });
    
    res.status(200).json({
      success: true,
      count: processedNotifications.length,
      data: processedNotifications
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Find the recipient entry for the current user
    const recipientIndex = notification.recipients.findIndex(
      recipient => recipient.user.toString() === req.user.id
    );
    
    if (recipientIndex === -1) {
      return res.status(403).json({ message: 'Not authorized to access this notification' });
    }
    
    // Update the read status
    notification.recipients[recipientIndex].read = true;
    notification.recipients[recipientIndex].readAt = new Date();
    
    await notification.save();
    
    res.status(200).json({
      success: true,
      data: {
        _id: notification._id,
        read: true,
        readAt: notification.recipients[recipientIndex].readAt
      }
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    // Find all unread notifications for the user
    const notifications = await Notification.find({
      'recipients.user': req.user.id,
      'recipients.read': false
    });
    
    // Update each notification
    for (const notification of notifications) {
      const recipientIndex = notification.recipients.findIndex(
        recipient => recipient.user.toString() === req.user.id
      );
      
      if (recipientIndex !== -1) {
        notification.recipients[recipientIndex].read = true;
        notification.recipients[recipientIndex].readAt = new Date();
        await notification.save();
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Marked ${notifications.length} notifications as read`
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create notification (for management only)
// @route   POST /api/notifications
// @access  Private (Management only)
exports.createNotification = async (req, res) => {
  try {
    const { title, message, type, priority, targetRole, recipients } = req.body;
    
    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }
    
    // Create notification
    const notification = new Notification({
      title,
      message,
      type: type || 'announcement',
      priority: priority || 'medium',
      targetRole: targetRole || 'all',
      createdBy: req.user.id
    });
    
    // Add recipients
    if (recipients && Array.isArray(recipients)) {
      // Add specific recipients
      notification.recipients = recipients.map(userId => ({
        user: userId,
        read: false
      }));
    } else {
      // Add recipients based on targetRole
      let users = [];
      
      if (targetRole === 'all') {
        users = await User.find({});
      } else if (targetRole) {
        users = await User.find({ role: targetRole });
      } else {
        users = await User.find({});
      }
      
      notification.recipients = users.map(user => ({
        user: user._id,
        read: false
      }));
    }
    
    await notification.save();
    
    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
