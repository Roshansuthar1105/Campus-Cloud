const User = require('../models/User');

// Middleware to check if user has required role
exports.authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      // Check if user exists in request (set by auth middleware)
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, no token' });
      }

      // Get fresh user data from database to ensure role is up-to-date
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Check if user has one of the required roles
      if (!roles.includes(user.role)) {
        return res.status(403).json({ 
          message: `Access denied. ${user.role} role is not authorized to access this resource` 
        });
      }

      // Add full user object to request
      req.user = user;
      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      res.status(500).json({ message: 'Server error during role authorization' });
    }
  };
};

// Middleware to check if user is accessing their own resource
exports.isResourceOwner = (resourceModel) => {
  return async (req, res, next) => {
    try {
      // Get resource ID from request parameters
      const resourceId = req.params.id;
      
      if (!resourceId) {
        return res.status(400).json({ message: 'Resource ID is required' });
      }

      // Find the resource
      const resource = await resourceModel.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }

      // Check if user is the owner of the resource
      if (resource.createdBy && resource.createdBy.toString() !== req.user.id.toString()) {
        // Allow management role to access any resource
        if (req.user.role === 'management') {
          next();
          return;
        }
        
        // For faculty, check if they're accessing resources in their courses
        if (req.user.role === 'faculty' && resource.course) {
          const Course = require('../models/Course');
          const course = await Course.findById(resource.course);
          
          if (course && course.faculty.includes(req.user.id)) {
            next();
            return;
          }
        }
        
        return res.status(403).json({ message: 'Access denied. You are not the owner of this resource' });
      }

      next();
    } catch (error) {
      console.error('Resource owner check error:', error);
      res.status(500).json({ message: 'Server error during resource owner check' });
    }
  };
};
