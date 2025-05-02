const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  completeGoogleAuth
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Register and login routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', logout);

// Password reset routes
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Google OAuth completion route
router.put('/google-complete', protect, completeGoogleAuth);

// Google OAuth routes
router.get(
  '/google',
  (req, res, next) => {
    console.log('Google auth route hit');
    console.log('Headers:', req.headers);
    next();
  },
  (req, res, next) => {
    try {
      passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
        failWithError: true
      })(req, res, next);
    } catch (error) {
      console.error('Error in Google authentication:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  }
);

router.get(
  '/google/callback',
  (req, res, next) => {
    console.log('Google callback route hit');
    console.log('Query params:', req.query);
    next();
  },
  (req, res, next) => {
    passport.authenticate('google', {
      session: false,
      failureRedirect: '/'
    })(req, res, next);
  },
  (req, res) => {
    try {
      console.log('=== Google Authentication Successful ===');
      console.log('User ID:', req.user.id);
      console.log('User Email:', req.user.email);
      console.log('User Name:', req.user.name);
      console.log('Is Google Account:', req.user.isGoogleAccount);
      console.log('Has Password:', !!req.user.password);
      console.log('Current Role:', req.user.role);
      console.log('Department:', req.user.department || 'Not set');

      // Generate JWT token
      console.log('Generating JWT token...');
      const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
      });
      console.log('Token generated successfully');

      // Check if this is a new Google user that needs to complete profile
      const isNewUser = req.user.isGoogleAccount && !req.user.password;
      console.log('Is new Google user that needs to complete profile:', isNewUser);
      console.log('Redirect destination:', isNewUser ? 'Google Auth Complete page' : 'Dashboard');

      // For production deployment with different domains, we need to handle cookies differently
      if (process.env.NODE_ENV === 'production') {
        // In production, we'll redirect with the token in the URL
        // This is because cross-domain cookies won't work between Netlify and Render
        const redirectUrl = isNewUser
          ? `${process.env.CLIENT_URL}/google-auth-complete?token=${token}`
          : `${process.env.CLIENT_URL}/auth-callback?token=${token}`;
        console.log('Production redirect with token in URL:', redirectUrl);
        return res.redirect(redirectUrl);
      } else {
        // In development, we can use cookies
        res.cookie('token', token, {
          expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
          ),
          httpOnly: false, // Allow JavaScript access
          secure: false,
          sameSite: 'lax' // Allow cross-site cookie for the redirect
        });
        console.log('Development: Token set in cookie:', token.substring(0, 10) + '...');
      }

      // Redirect to frontend (only for development, production redirect is handled above)
      if (process.env.NODE_ENV !== 'production') {
        const redirectUrl = isNewUser
          ? `${process.env.CLIENT_URL}/google-auth-complete`
          : `${process.env.CLIENT_URL}/dashboard`;
        console.log('Development: Redirecting to:', redirectUrl);
        res.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('Error in callback handler:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
  }
);

module.exports = router;
