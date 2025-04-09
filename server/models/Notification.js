const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['quiz', 'preference', 'announcement', 'grade', 'system'],
    default: 'system'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  recipients: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    read: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    }
  }],
  targetRole: {
    type: String,
    enum: ['all', 'student', 'faculty', 'management'],
    default: 'all'
  },
  relatedResource: {
    resourceType: {
      type: String,
      enum: ['quiz', 'preference', 'course', 'user']
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  expiresAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
