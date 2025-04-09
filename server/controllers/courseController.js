const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res) => {
  try {
    let query = {};

    // Filter courses based on user role
    if (req.user.role === 'faculty') {
      // Faculty can see courses they teach
      query = { faculty: req.user.id };
    } else if (req.user.role === 'student') {
      // Students can see courses they're enrolled in
      query = { students: req.user.id };
    }
    // Management can see all courses (no filter)

    const courses = await Course.find(query)
      .populate('faculty', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get student courses
// @route   GET /api/courses/student
// @access  Private (Student only)
exports.getStudentCourses = async (req, res) => {
  try {
    // Ensure the user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only students can access this endpoint.'
      });
    }

    // Find courses where the student is enrolled
    const courses = await Course.find({ students: req.user.id })
      .populate('faculty', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get faculty courses
// @route   GET /api/courses/faculty
// @access  Private (Faculty only)
exports.getFacultyCourses = async (req, res) => {
  try {
    // Ensure the user is a faculty member
    if (req.user.role !== 'faculty') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only faculty can access this endpoint.'
      });
    }

    // Find courses where the faculty is assigned
    const courses = await Course.find({ faculty: req.user.id })
      .populate('students', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get student courses
// @route   GET /api/courses/student
// @access  Private (Student only)
exports.getStudentCourses = async (req, res) => {
  try {
    // Ensure the user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only students can access this endpoint.'
      });
    }

    // Find courses where the student is enrolled
    const courses = await Course.find({ students: req.user.id })
      .populate('faculty', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get faculty courses
// @route   GET /api/courses/faculty
// @access  Private (Faculty only)
exports.getFacultyCourses = async (req, res) => {
  try {
    // Ensure the user is a faculty member
    if (req.user.role !== 'faculty') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only faculty can access this endpoint.'
      });
    }

    // Find courses where the faculty is assigned
    const courses = await Course.find({ faculty: req.user.id })
      .populate('students', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('faculty', 'name email')
      .populate('students', 'name email')
      .populate('createdBy', 'name');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user has access to this course
    if (req.user.role === 'student' && !course.students.some(student => student._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to access this course' });
    }

    if (req.user.role === 'faculty' && !course.faculty.some(faculty => faculty._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to access this course' });
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error getting course:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Faculty and Management only)
exports.createCourse = async (req, res) => {
  try {
    // Add user to request body
    req.body.createdBy = req.user.id;

    // If faculty is creating the course, add them to faculty array
    if (req.user.role === 'faculty') {
      req.body.faculty = [req.user.id];
    }

    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error creating course:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Faculty who teach the course and Management)
exports.updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is authorized to update the course
    if (req.user.role === 'faculty' && !course.faculty.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error updating course:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Management only)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await course.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add students to course
// @route   POST /api/courses/:id/students
// @access  Private (Faculty who teach the course and Management)
exports.addStudentsToCourse = async (req, res) => {
  try {
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ message: 'Please provide an array of student IDs' });
    }

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is authorized to update the course
    if (req.user.role === 'faculty' && !course.faculty.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    // Verify all students exist and have student role
    const students = await User.find({
      _id: { $in: studentIds },
      role: 'student'
    });

    if (students.length !== studentIds.length) {
      return res.status(400).json({ message: 'One or more student IDs are invalid' });
    }

    // Add students to course
    for (const studentId of studentIds) {
      if (!course.students.includes(studentId)) {
        course.students.push(studentId);
      }
    }

    await course.save();

    // Also update the students' courses array
    for (const student of students) {
      if (!student.courses.includes(course._id)) {
        student.courses.push(course._id);
        await student.save();
      }
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error adding students to course:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove student from course
// @route   DELETE /api/courses/:id/students/:studentId
// @access  Private (Faculty who teach the course and Management)
exports.removeStudentFromCourse = async (req, res) => {
  try {
    const { studentId } = req.params;

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is authorized to update the course
    if (req.user.role === 'faculty' && !course.faculty.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    // Remove student from course
    course.students = course.students.filter(id => id.toString() !== studentId);
    await course.save();

    // Also update the student's courses array
    const student = await User.findById(studentId);
    if (student) {
      student.courses = student.courses.filter(id => id.toString() !== course._id.toString());
      await student.save();
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error removing student from course:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
