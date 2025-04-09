const User = require('../models/User');
const Course = require('../models/Course');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, department, studentId, facultyId, employeeId } = req.body;
    
    // Find user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    if (name) user.name = name;
    if (department !== undefined) user.department = department;
    
    // Update role-specific fields
    if (user.role === 'student' && studentId !== undefined) {
      user.studentId = studentId;
    }
    
    if (user.role === 'faculty' && facultyId !== undefined) {
      user.facultyId = facultyId;
    }
    
    if (user.role === 'management' && employeeId !== undefined) {
      user.employeeId = employeeId;
    }
    
    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(req.user.id).select('-password');
    
    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users (management only)
// @route   GET /api/users
// @access  Private (Management only)
exports.getUsers = async (req, res) => {
  try {
    const { role, department, search } = req.query;
    
    let query = {};
    
    // Filter by role
    if (role) {
      query.role = role;
    }
    
    // Filter by department
    if (department) {
      query.department = department;
    }
    
    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query).select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user by ID (management only)
// @route   GET /api/users/:id
// @access  Private (Management only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's courses
    const courses = await Course.find({
      $or: [
        { students: user._id },
        { faculty: user._id }
      ]
    }).select('name code');
    
    res.status(200).json({
      success: true,
      data: {
        user,
        courses
      }
    });
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user (management only)
// @route   PUT /api/users/:id
// @access  Private (Management only)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, department, studentId, facultyId, employeeId } = req.body;
    
    // Find user
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (department !== undefined) user.department = department;
    
    // Update role-specific fields
    if (studentId !== undefined) user.studentId = studentId;
    if (facultyId !== undefined) user.facultyId = facultyId;
    if (employeeId !== undefined) user.employeeId = employeeId;
    
    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(req.params.id).select('-password');
    
    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user (management only)
// @route   DELETE /api/users/:id
// @access  Private (Management only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is trying to delete themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    await user.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
