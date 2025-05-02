const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/emailService');
const sendLoginNotification = require('../utils/loginNotification');

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
        isGoogleAccount: user.isGoogleAccount,
        lastLogin: user.lastLogin
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
    // if (user.isGoogleAccount) {
    //   return res.status(400).json({
    //     message: 'This account uses Google Sign-In. Please login with Google.'
    //   });
    // }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login time
    user.lastLogin = Date.now();
    await user.save();

    // Send login notification email
    try {
      await sendLoginNotification(user, req);
    } catch (emailError) {
      console.error('Error sending login notification:', emailError);
      // Continue with login even if email fails
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

    // Get reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Create a more user-friendly email template
    const message = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          .header {
            background-color: #4f46e5;
            color: white;
            padding: 10px 20px;
            border-radius: 5px 5px 0 0;
            text-align: center;
          }
          .content {
            padding: 20px;
          }
          .button {
            display: inline-block;
            background-color: #4f46e5;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <p>Hello ${user.name},</p>
            <p>You are receiving this email because a password reset was requested for your account at Campus Cloud.</p>
            <p>Please click the button below to reset your password. This link will expire in 30 minutes.</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button" target="_blank">Reset Your Password</a>
            </p>
            <p>If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>
            <p>If the button above doesn't work, copy and paste the following URL into your browser:</p>
            <p>${resetUrl}</p>
          </div>
          <div class="footer">
            <p>This is an automated email, please do not reply.</p>
            <p>&copy; ${new Date().getFullYear()} Campus Cloud. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      // Try to send the email
      const emailResult = await sendEmail({
        email: user.email,
        subject: 'Password Reset Request - Campus Cloud',
        html: message
      });

      // Check if this is a test email or a real email
      if (emailResult.isTestEmail && emailResult.previewUrl) {
        console.log('Email preview URL:', emailResult.previewUrl);
        return res.status(200).json({
          success: true,
          message: 'Email sent (test mode)',
          previewUrl: emailResult.previewUrl
        });
      }

      // If it's a real email
      return res.status(200).json({
        success: true,
        message: 'Password reset email sent to your email address. Please check your inbox and follow the instructions to reset your password.'
      });
    } catch (err) {
      console.error('Unexpected error in forgot password flow:', err);

      // Reset the token fields since the email failed
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      // Return a generic error message
      return res.status(500).json({
        message: 'An unexpected error occurred. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
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
      return res.status(400).json({ message: 'Invalid or expired token. Please request a new password reset.' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // If this is a Google account, we're now setting a password for it
    // This doesn't affect their ability to sign in with Google
    if (user.isGoogleAccount) {
      // We don't need to change isGoogleAccount flag as they can still use Google to sign in
      console.log(`Setting password for Google account user: ${user.email}`);
    }

    await user.save();

    // Create a notification for the user
    try {
      const Notification = require('../models/Notification');

      const notification = new Notification({
        title: 'Password Updated',
        message: 'Your password has been successfully updated. If you did not make this change, please contact support immediately.',
        type: 'system',
        priority: 'high',
        recipients: [{ user: user._id, read: false }],
        targetRole: user.role
      });

      await notification.save();
    } catch (notificationError) {
      console.error('Error creating password reset notification:', notificationError);
      // Continue with the password reset even if notification creation fails
    }

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
