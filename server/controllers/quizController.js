const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const QuizSubmission = require('../models/QuizSubmission');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Private
exports.getQuizzes = async (req, res) => {
  try {
    let query = {};

    // Filter quizzes based on user role and query parameters
    if (req.query.course) {
      query.course = req.query.course;
    }

    if (req.user.role === 'faculty') {
      // Faculty can see quizzes they created
      query.createdBy = req.user.id;
    } else if (req.user.role === 'student') {
      // Students can see published quizzes for their courses
      query.isPublished = true;

      // Get student's courses
      const student = await User.findById(req.user.id);
      if (student && student.courses && student.courses.length > 0) {
        if (!req.query.course) {
          query.course = { $in: student.courses };
        }
      } else {
        // If student has no courses, return empty array
        return res.status(200).json({
          success: true,
          count: 0,
          data: []
        });
      }
    }
    // Management can see all quizzes (no additional filter)

    const quizzes = await Quiz.find(query)
      .populate('course', 'name code')
      .populate('createdBy', 'name')
      .populate('submissions', 'name email')
      .sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    console.error('Error getting quizzes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
// @access  Private
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('course', 'name code faculty students')
      .populate('createdBy', 'name')
      .populate('submissions', 'name email');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user has access to this quiz
    if (req.user.role === 'student') {
      // Students can only access published quizzes for their courses
      if (!quiz.isPublished) {
        return res.status(403).json({ message: 'Quiz is not published yet' });
      }

      // Check if student is enrolled in the course
      const course = await Course.findById(quiz.course);
      if (!course || !course.students.includes(req.user.id)) {
        return res.status(403).json({ message: 'Not authorized to access this quiz' });
      }

      // For students, don't send correct answers
      const quizForStudent = JSON.parse(JSON.stringify(quiz));
      if (quizForStudent.questions) {
        quizForStudent.questions.forEach(question => {
          delete question.correctAnswer;
          if (question.options) {
            question.options.forEach(option => {
              delete option.isCorrect;
            });
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: quizForStudent
      });
    }

    if (req.user.role === 'faculty') {
      // Faculty can only access quizzes they created or for courses they teach
      if (quiz.createdBy._id.toString() !== req.user.id) {
        const course = await Course.findById(quiz.course);
        if (!course || !course.faculty.includes(req.user.id)) {
          return res.status(403).json({ message: 'Not authorized to access this quiz' });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error getting quiz:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new quiz
// @route   POST /api/quizzes
// @access  Private (Faculty and Management only)
exports.createQuiz = async (req, res) => {
  try {
    // Add user to request body
    req.body.createdBy = req.user.id;

    // Validate course exists and user has access
    const course = await Course.findById(req.body.course);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (req.user.role === 'faculty' && !course.faculty.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to create quiz for this course' });
    }

    const quiz = await Quiz.create(req.body);

    // If quiz is published, create notifications for students
    if (quiz.isPublished) {
      await createQuizNotifications(quiz, course);
    }

    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error creating quiz:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Faculty who created the quiz and Management)
exports.updateQuiz = async (req, res) => {
  try {
    let quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user is authorized to update the quiz
    if (req.user.role === 'faculty' && quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this quiz' });
    }

    const wasPublished = quiz.isPublished;

    quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // If quiz is newly published, create notifications for students
    if (!wasPublished && quiz.isPublished) {
      const course = await Course.findById(quiz.course);
      if (course) {
        await createQuizNotifications(quiz, course);
      }
    }

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error updating quiz:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Faculty who created the quiz and Management)
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user is authorized to delete the quiz
    if (req.user.role === 'faculty' && quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this quiz' });
    }

    // Check if there are any submissions
    const submissions = await QuizSubmission.find({ quiz: quiz._id });

    if (submissions.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete quiz with existing submissions. Archive it instead.'
      });
    }

    await quiz.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get quiz submissions
// @route   GET /api/quizzes/:id/submissions
// @access  Private
exports.getQuizSubmissions = async (req, res) => {
  try {
    // First, check if the ID is a submission ID
    const submission = await QuizSubmission.findById(req.params.id);

    if (submission) {
      // If this is a submission ID, return just this submission
      // Check if user is authorized to view this submission
      if (req.user.role === 'student' && submission.student.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to view this submission' });
      }

      if (req.user.role === 'faculty') {
        // Get the quiz to check if faculty is authorized
        const quiz = await Quiz.findById(submission.quiz);
        if (!quiz) {
          return res.status(404).json({ message: 'Quiz not found' });
        }

        if (quiz.createdBy.toString() !== req.user.id) {
          const course = await Course.findById(quiz.course);
          if (!course || !course.faculty.includes(req.user.id)) {
            return res.status(403).json({ message: 'Not authorized to view this submission' });
          }
        }
      }

      // Populate the submission
      const populatedSubmission = await QuizSubmission.findById(submission._id)
        .populate('student', 'name email')
        .populate('gradedBy', 'name');

      return res.status(200).json({
        success: true,
        count: 1,
        data: [populatedSubmission] // Return as array for consistency with other responses
      });
    }

    // If not a submission ID, treat as a quiz ID
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user is authorized to view submissions
    if (req.user.role === 'faculty') {
      if (quiz.createdBy.toString() !== req.user.id) {
        const course = await Course.findById(quiz.course);
        if (!course || !course.faculty.includes(req.user.id)) {
          return res.status(403).json({ message: 'Not authorized to view submissions for this quiz' });
        }
      }
    } else if (req.user.role === 'student') {
      // Students can only view their own submissions
      const submissions = await QuizSubmission.find({
        quiz: quiz._id,
        student: req.user.id
      }).populate('student', 'name email');

      return res.status(200).json({
        success: true,
        count: submissions.length,
        data: submissions
      });
    }

    // For faculty and management, get all submissions
    const submissions = await QuizSubmission.find({ quiz: quiz._id })
      .populate('student', 'name email')
      .populate('gradedBy', 'name');

    // Include the count of submissions from the quiz.submissions array
    const submissionsCount = quiz.submissions ? quiz.submissions.length : 0;

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissionsCount: submissionsCount,
      data: submissions
    });
  } catch (error) {
    console.error('Error getting quiz submissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to create notifications for a quiz
async function createQuizNotifications(quiz, course) {
  try {
    if (!course.students || course.students.length === 0) {
      return;
    }

    const notification = new Notification({
      title: `New Quiz: ${quiz.title}`,
      message: `A new quiz has been published for ${course.name}. It will be available from ${new Date(quiz.startDate).toLocaleDateString()} to ${new Date(quiz.endDate).toLocaleDateString()}.`,
      type: 'quiz',
      priority: 'medium',
      recipients: course.students.map(studentId => ({
        user: studentId,
        read: false
      })),
      targetRole: 'student',
      relatedResource: {
        resourceType: 'quiz',
        resourceId: quiz._id
      },
      createdBy: quiz.createdBy
    });

    await notification.save();
  } catch (error) {
    console.error('Error creating quiz notifications:', error);
  }
}
