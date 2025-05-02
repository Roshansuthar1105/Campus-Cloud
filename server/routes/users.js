const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');
const {
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');

// Get user profile
router.get('/profile', protect, getUserProfile);

// Update user profile
router.put('/profile', protect, updateUserProfile);

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is using Google OAuth
    if (user.isGoogleAccount) {
      return res.status(400).json({
        message: 'Password change not available for Google accounts'
      });
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get user settings
// @route   GET /api/users/settings
// @access  Private
router.get('/settings', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user settings
    res.status(200).json({
      success: true,
      settings: {
        receiveLoginNotifications: user.receiveLoginNotifications !== false, // Default to true if not set
        receiveEmailUpdates: user.receiveEmailUpdates !== false // Default to true if not set
      }
    });
  } catch (error) {
    console.error('Error getting user settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
router.put('/settings', protect, async (req, res) => {
  try {
    const { receiveLoginNotifications, receiveEmailUpdates } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user settings
    user.receiveLoginNotifications = receiveLoginNotifications;
    user.receiveEmailUpdates = receiveEmailUpdates;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        receiveLoginNotifications: user.receiveLoginNotifications,
        receiveEmailUpdates: user.receiveEmailUpdates
      }
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Management-only routes
router.route('/')
  .get(protect, authorize('management'), getUsers);

router.route('/:id')
  .get(protect, authorize('management'), getUserById)
  .put(protect, authorize('management'), updateUser)
  .delete(protect, authorize('management'), deleteUser);

module.exports = router;
