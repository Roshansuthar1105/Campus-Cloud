const User = require('../models/User');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const QuizSubmission = require('../models/QuizSubmission');
const PreferenceForm = require('../models/PreferenceForm');
const PreferenceSubmission = require('../models/PreferenceSubmission');
const Notification = require('../models/Notification');

// @desc    Get student dashboard data
// @route   GET /api/dashboard/student
// @access  Private (Students only)
exports.getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get student's courses
    const student = await User.findById(userId).populate('courses', 'name code');
    
    // Get upcoming quizzes
    const now = new Date();
    const upcomingQuizzes = await Quiz.find({
      course: { $in: student.courses.map(course => course._id) },
      isPublished: true,
      endDate: { $gte: now }
    })
      .populate('course', 'name code')
      .sort({ startDate: 1 })
      .limit(5);
    
    // Get recent quiz submissions
    const recentSubmissions = await QuizSubmission.find({
      student: userId
    })
      .populate('quiz', 'title totalPoints')
      .sort({ submittedAt: -1 })
      .limit(5);
    
    // Get active preference forms
    const activeForms = await PreferenceForm.find({
      isPublished: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { targetAudience: 'all' },
        { targetAudience: 'students' },
        { 
          targetAudience: 'specific-course',
          course: { $in: student.courses.map(course => course._id) }
        }
      ]
    })
      .sort({ endDate: 1 })
      .limit(5);
    
    // Get unread notifications count
    const unreadNotificationsCount = await Notification.countDocuments({
      'recipients.user': userId,
      'recipients.read': false
    });
    
    // Get course statistics
    const courseStats = await Promise.all(
      student.courses.map(async (course) => {
        const quizzes = await Quiz.find({
          course: course._id,
          isPublished: true
        });
        
        const submissions = await QuizSubmission.find({
          student: userId,
          quiz: { $in: quizzes.map(quiz => quiz._id) }
        });
        
        const completedQuizzes = submissions.length;
        const totalQuizzes = quizzes.length;
        
        // Calculate average score
        let averageScore = 0;
        if (completedQuizzes > 0) {
          const totalScore = submissions.reduce((sum, submission) => sum + submission.percentage, 0);
          averageScore = totalScore / completedQuizzes;
        }
        
        return {
          course: {
            _id: course._id,
            name: course.name,
            code: course.code
          },
          completedQuizzes,
          totalQuizzes,
          averageScore
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: {
        courses: student.courses,
        upcomingQuizzes,
        recentSubmissions,
        activeForms,
        unreadNotificationsCount,
        courseStats
      }
    });
  } catch (error) {
    console.error('Error getting student dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get faculty dashboard data
// @route   GET /api/dashboard/faculty
// @access  Private (Faculty only)
exports.getFacultyDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get faculty's courses
    const courses = await Course.find({ faculty: userId });
    
    // Get recent quizzes created by faculty
    const recentQuizzes = await Quiz.find({ createdBy: userId })
      .populate('course', 'name code')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get quizzes that need grading
    const quizzesNeedingGrading = await QuizSubmission.find({
      status: 'completed',
      isGraded: false,
      quiz: { $in: await Quiz.find({ createdBy: userId }).distinct('_id') }
    })
      .populate('quiz', 'title')
      .populate('student', 'name')
      .sort({ submittedAt: 1 })
      .limit(5);
    
    // Get recent preference forms created by faculty
    const recentForms = await PreferenceForm.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get unread notifications count
    const unreadNotificationsCount = await Notification.countDocuments({
      'recipients.user': userId,
      'recipients.read': false
    });
    
    // Get course statistics
    const courseStats = await Promise.all(
      courses.map(async (course) => {
        const studentCount = course.students.length;
        
        const quizzes = await Quiz.find({
          course: course._id,
          isPublished: true
        });
        
        const submissions = await QuizSubmission.find({
          quiz: { $in: quizzes.map(quiz => quiz._id) }
        });
        
        // Calculate submission rate
        let submissionRate = 0;
        if (quizzes.length > 0 && studentCount > 0) {
          const expectedSubmissions = quizzes.length * studentCount;
          submissionRate = (submissions.length / expectedSubmissions) * 100;
        }
        
        // Calculate average score
        let averageScore = 0;
        if (submissions.length > 0) {
          const totalScore = submissions.reduce((sum, submission) => sum + submission.percentage, 0);
          averageScore = totalScore / submissions.length;
        }
        
        return {
          course: {
            _id: course._id,
            name: course.name,
            code: course.code
          },
          studentCount,
          quizCount: quizzes.length,
          submissionRate,
          averageScore
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: {
        courses,
        recentQuizzes,
        quizzesNeedingGrading,
        recentForms,
        unreadNotificationsCount,
        courseStats
      }
    });
  } catch (error) {
    console.error('Error getting faculty dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get management dashboard data
// @route   GET /api/dashboard/management
// @access  Private (Management only)
exports.getManagementDashboard = async (req, res) => {
  try {
    // Get user counts by role
    const userCounts = {
      students: await User.countDocuments({ role: 'student' }),
      faculty: await User.countDocuments({ role: 'faculty' }),
      management: await User.countDocuments({ role: 'management' }),
      total: await User.countDocuments({})
    };
    
    // Get course count
    const courseCount = await Course.countDocuments({});
    
    // Get active courses
    const activeCourses = await Course.find({ isActive: true })
      .populate('faculty', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get quiz statistics
    const quizStats = {
      total: await Quiz.countDocuments({}),
      published: await Quiz.countDocuments({ isPublished: true }),
      upcoming: await Quiz.countDocuments({
        startDate: { $gt: new Date() }
      }),
      active: await Quiz.countDocuments({
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      }),
      completed: await Quiz.countDocuments({
        endDate: { $lt: new Date() }
      })
    };
    
    // Get form statistics
    const formStats = {
      total: await PreferenceForm.countDocuments({}),
      published: await PreferenceForm.countDocuments({ isPublished: true }),
      active: await PreferenceForm.countDocuments({
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      })
    };
    
    // Get recent submissions
    const recentSubmissions = await QuizSubmission.find({})
      .populate('quiz', 'title')
      .populate('student', 'name')
      .sort({ submittedAt: -1 })
      .limit(10);
    
    // Get department statistics
    const departments = await User.distinct('department');
    const departmentStats = await Promise.all(
      departments.filter(dept => dept).map(async (department) => {
        const studentCount = await User.countDocuments({
          role: 'student',
          department
        });
        
        const facultyCount = await User.countDocuments({
          role: 'faculty',
          department
        });
        
        const courseCount = await Course.countDocuments({ department });
        
        return {
          department,
          studentCount,
          facultyCount,
          courseCount
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: {
        userCounts,
        courseCount,
        activeCourses,
        quizStats,
        formStats,
        recentSubmissions,
        departmentStats
      }
    });
  } catch (error) {
    console.error('Error getting management dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
