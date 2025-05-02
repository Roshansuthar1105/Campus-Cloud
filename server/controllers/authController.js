const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/emailService');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Set token cookie
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = generateToken(user._id);

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        department: user.department,
        isGoogleAccount: user.isGoogleAccount
      }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'student',
      department = '',
      studentId,
      facultyId,
      employeeId
    } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate role
    if (!['student', 'faculty', 'management'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Create user with role and additional fields
    const userData = {
      name,
      email,
      password,
      role,
      department
    };

    // Add role-specific IDs if provided
    if (role === 'student' && studentId) userData.studentId = studentId;
    if (role === 'faculty' && facultyId) userData.facultyId = facultyId;
    if (role === 'management' && employeeId) userData.employeeId = employeeId;

    // Create user
    user = await User.create(userData);

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is a Google account
    if (user.isGoogleAccount) {
      return res.status(400).json({
        message: 'This account uses Google Sign-In. Please login with Google.'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: 'No user with that email' });
    }

    // Check if user is a Google account
    if (user.isGoogleAccount) {
      return res.status(400).json({
        message: 'This account uses Google Sign-In. Password reset is not available.'
      });
    }

    // Get reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const message = `
      <h1>Password Reset</h1>
      <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
      <p>Please click on the following link to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset',
        html: message
      });

      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Complete Google OAuth user registration
// @route   PUT /api/auth/google-complete
// @access  Private
exports.completeGoogleAuth = async (req, res, next) => {
  console.log('Google Auth Completion endpoint called');

  try {
    // Get user from middleware
    console.log('User ID from token:', req.user.id);
    const user = await User.findById(req.user.id);

    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Processing Google account completion for user:', user.email);
    console.log('Is Google Account:', user.isGoogleAccount);
    console.log('Has password:', !!user.password);

    // Check if user is a Google account
    if (!user.isGoogleAccount) {
      console.log('Rejected: User is not a Google account');
      return res.status(400).json({
        message: 'This endpoint is only for Google accounts'
      });
    }

    // Check if user already has a password set
    if (user.password) {
      console.log('Rejected: Google account already has a password set');
      return res.status(400).json({
        message: 'Google account profile is already complete'
      });
    }

    console.log('Google account validation passed, proceeding with profile completion');

    const {
      password,
      role,
      department,
      studentId,
      facultyId,
      employeeId
    } = req.body;

    // Validate role - only allow student or faculty roles
    if (!['student', 'faculty'].includes(role)) {
      console.log('Rejected: Invalid role specified or attempted to set management role:', role);
      return res.status(400).json({ message: 'Invalid role specified. Only student or faculty roles are allowed.' });
    }

    // Update user information
    user.password = password;
    user.role = role;
    user.department = department || '';

    // Clear existing IDs
    user.studentId = undefined;
    user.facultyId = undefined;
    // Don't clear employeeId as it's not settable through this endpoint

    // Set role-specific ID
    if (role === 'student' && studentId) {
      user.studentId = studentId;
    } else if (role === 'faculty' && facultyId) {
      user.facultyId = facultyId;
    }
    // Management role and employeeId cannot be set through this endpoint

    await user.save();

    console.log('Google account profile completed successfully');
    console.log('Updated user role:', user.role);
    console.log('Updated user department:', user.department);
    console.log('ID field set based on role:',
      user.role === 'student' ? `studentId: ${user.studentId}` :
      user.role === 'faculty' ? `facultyId: ${user.facultyId}` :
      'No ID field (management role not allowed)');

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Error completing Google account profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
