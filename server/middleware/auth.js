const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate JWT token
exports.authenticateToken = exports.protect = async (req, res, next) => {
  console.log('Authenticating token...');
  let token;

  // Check for token in cookies or authorization header
  console.log('Checking for token...');
  console.log('Cookies:', req.cookies);
  console.log('Authorization header:', req.headers.authorization);

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log('Token found in cookies');
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token found in authorization header');
  } else {
    console.log('No token found in cookies or authorization header');
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify token
    console.log('Verifying token...');
    console.log('JWT Secret exists:', !!process.env.JWT_SECRET);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully');
    console.log('Decoded token:', decoded);

    // Get user from the token
    console.log('Looking up user with ID:', decoded.id);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      console.log('User not found in database');
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('User found:', user.name, 'Role:', user.role);
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Middleware to check if user is an instructor
exports.isInstructor = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user has role of faculty or management
    console.log('User role:', req.user.role);
    if (req.user.role === 'faculty' || req.user.role === 'management') {
      next();
    } else {
      res.status(403).json({ message: `Not authorized. Required role: faculty or management. Your role: ${req.user.role}` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
