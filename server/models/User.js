const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    // Not required for Google OAuth users
  },
  avatar: {
    type: String
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'management'],
    default: 'student'
  },
  department: {
    type: String,
    default: ''
  },
  studentId: {
    type: String,
    sparse: true // Only indexed if the field exists
  },
  facultyId: {
    type: String,
    sparse: true
  },
  employeeId: {
    type: String,
    sparse: true
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  googleId: {
    type: String
  },
  isGoogleAccount: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  lastLogin: {
    type: Date,
    default: null
  },
  receiveLoginNotifications: {
    type: Boolean,
    default: true
  },
  receiveEmailUpdates: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
