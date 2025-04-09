const Quiz = require('../models/Quiz');
const QuizSubmission = require('../models/QuizSubmission');
const Course = require('../models/Course');
const Notification = require('../models/Notification');

// @desc    Start a quiz attempt
// @route   POST /api/submissions/start
// @access  Private (Students only)
exports.startQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.body;

    if (!quizId) {
      return res.status(400).json({ message: 'Quiz ID is required' });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if quiz is published
    if (!quiz.isPublished) {
      return res.status(400).json({ message: 'Quiz is not published yet' });
    }

    // Check if quiz is active
    const now = new Date();
    if (now < new Date(quiz.startDate)) {
      return res.status(400).json({ message: 'Quiz has not started yet' });
    }

    if (now > new Date(quiz.endDate)) {
      return res.status(400).json({ message: 'Quiz has ended' });
    }

    // Check if student is enrolled in the course
    const course = await Course.findById(quiz.course);
    if (!course || !course.students.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to take this quiz' });
    }

    // Check if student already has a submission in progress
    let submission = await QuizSubmission.findOne({
      quiz: quizId,
      student: req.user.id,
      status: 'in-progress'
    });

    if (submission) {
      return res.status(200).json({
        success: true,
        message: 'Quiz attempt already in progress',
        data: submission
      });
    }

    // Check if student has already completed the quiz
    const completedSubmission = await QuizSubmission.findOne({
      quiz: quizId,
      student: req.user.id,
      status: { $in: ['completed', 'graded'] }
    });

    if (completedSubmission && !quiz.allowMultipleAttempts) {
      return res.status(400).json({ message: 'You have already completed this quiz' });
    }

    // Create a new submission
    submission = await QuizSubmission.create({
      quiz: quizId,
      student: req.user.id,
      startTime: now,
      status: 'in-progress',
      answers: quiz.questions.map(question => ({
        questionId: question._id,
        selectedOptions: [],
        textAnswer: '',
        isCorrect: false,
        pointsEarned: 0
      }))
    });

    res.status(201).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error starting quiz attempt:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit answer for a question
// @route   PUT /api/submissions/:id/answer
// @access  Private (Students only)
exports.submitAnswer = async (req, res) => {
  try {
    const { questionId, selectedOptions, textAnswer } = req.body;

    if (!questionId) {
      return res.status(400).json({ message: 'Question ID is required' });
    }

    const submission = await QuizSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if user is the owner of the submission
    if (submission.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this submission' });
    }

    // Check if submission is still in progress
    if (submission.status !== 'in-progress') {
      return res.status(400).json({ message: 'Cannot modify a completed submission' });
    }

    // Get the quiz to check the question
    const quiz = await Quiz.findById(submission.quiz);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Find the question in the quiz
    const question = quiz.questions.find(q => q._id.toString() === questionId);

    if (!question) {
      return res.status(404).json({ message: 'Question not found in quiz' });
    }

    // Find the answer in the submission
    const answerIndex = submission.answers.findIndex(a => a.questionId.toString() === questionId);

    if (answerIndex === -1) {
      // If answer doesn't exist, create it
      submission.answers.push({
        questionId,
        selectedOptions: selectedOptions || [],
        textAnswer: textAnswer || ''
      });
    } else {
      // Update existing answer
      if (selectedOptions) {
        submission.answers[answerIndex].selectedOptions = selectedOptions;
      }

      if (textAnswer !== undefined) {
        submission.answers[answerIndex].textAnswer = textAnswer;
      }
    }

    // Auto-grade multiple-choice, multiple-select, and true-false questions
    if (['multiple-choice', 'multiple-select', 'true-false'].includes(question.questionType)) {
      const answer = submission.answers.find(a => a.questionId.toString() === questionId);

      if (question.questionType === 'multiple-choice' && question.options && question.options.length > 0) {
        // For single-answer multiple-choice questions
        const correctOptionId = question.options
          .findIndex(option => option.isCorrect)
          .toString();

        // Check if selected option matches the correct option
        const isCorrect = selectedOptions[0] === correctOptionId;

        answer.isCorrect = isCorrect;
        answer.pointsEarned = isCorrect ? question.points : 0;
      } else if (question.questionType === 'multiple-select' && question.options && question.options.length > 0) {
        // For multiple-select questions
        const correctOptionIds = question.options
          .map((option, index) => option.isCorrect ? index.toString() : null)
          .filter(id => id !== null);

        // Check if selected options match correct options exactly
        const isCorrect =
          selectedOptions.length === correctOptionIds.length &&
          selectedOptions.every(optionId => correctOptionIds.includes(optionId));

        answer.isCorrect = isCorrect;
        answer.pointsEarned = isCorrect ? question.points : 0;
      } else if (question.questionType === 'true-false') {
        // For true-false questions
        const isCorrect = selectedOptions[0] === question.correctAnswer;
        answer.isCorrect = isCorrect;
        answer.pointsEarned = isCorrect ? question.points : 0;
      }
    }

    await submission.save();

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Complete quiz submission
// @route   PUT /api/submissions/:id/complete
// @access  Private (Students only)
exports.completeSubmission = async (req, res) => {
  try {
    const submission = await QuizSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if user is the owner of the submission
    if (submission.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this submission' });
    }

    // Check if submission is still in progress
    if (submission.status !== 'in-progress') {
      return res.status(400).json({ message: 'Submission is already completed' });
    }

    // Get the quiz
    const quiz = await Quiz.findById(submission.quiz);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Update submission status
    submission.status = 'completed';
    submission.endTime = new Date();

    // Auto-grade objective questions
    let totalScore = 0;
    let totalPossibleScore = 0;

    for (const question of quiz.questions) {
      totalPossibleScore += question.points;

      const answer = submission.answers.find(a => a.questionId.toString() === question._id.toString());

      if (!answer) continue;

      if (question.questionType === 'multiple-choice' || question.questionType === 'true-false') {
        // These should already be graded in submitAnswer
        totalScore += answer.pointsEarned || 0;
      }
      // Essay and short-answer questions need manual grading
    }

    // Check if all questions are auto-graded
    const needsManualGrading = quiz.questions.some(q =>
      q.questionType === 'essay' || q.questionType === 'short-answer'
    );

    if (!needsManualGrading) {
      submission.isGraded = true;
      submission.status = 'graded';
      submission.totalScore = totalScore;
      submission.percentage = (totalScore / totalPossibleScore) * 100;
    }

    await submission.save();

    // Create notification for faculty if manual grading is needed
    if (needsManualGrading) {
      const course = await Course.findById(quiz.course);

      if (course && course.faculty.length > 0) {
        const notification = new Notification({
          title: 'Quiz Submission Needs Grading',
          message: `A submission for "${quiz.title}" by ${req.user.name} needs manual grading.`,
          type: 'quiz',
          priority: 'medium',
          recipients: course.faculty.map(facultyId => ({
            user: facultyId,
            read: false
          })),
          targetRole: 'faculty',
          relatedResource: {
            resourceType: 'quiz',
            resourceId: quiz._id
          },
          createdBy: req.user.id
        });

        await notification.save();
      }
    }

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error completing submission:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Grade a submission
// @route   PUT /api/submissions/:id/grade
// @access  Private (Faculty and Management only)
exports.gradeSubmission = async (req, res) => {
  try {
    const { answers, feedback } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers array is required' });
    }

    const submission = await QuizSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Get the quiz
    const quiz = await Quiz.findById(submission.quiz);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user is authorized to grade this submission
    if (req.user.role === 'faculty') {
      const course = await Course.findById(quiz.course);

      if (!course || !course.faculty.includes(req.user.id)) {
        return res.status(403).json({ message: 'Not authorized to grade submissions for this quiz' });
      }
    }

    // Update answers with grading information
    let totalScore = 0;

    for (const gradedAnswer of answers) {
      const answerIndex = submission.answers.findIndex(a =>
        a.questionId.toString() === gradedAnswer.questionId
      );

      if (answerIndex !== -1) {
        submission.answers[answerIndex].isCorrect = gradedAnswer.isCorrect;
        submission.answers[answerIndex].pointsEarned = gradedAnswer.pointsEarned;
        submission.answers[answerIndex].feedback = gradedAnswer.feedback;

        totalScore += gradedAnswer.pointsEarned;
      }
    }

    // Update submission
    submission.totalScore = totalScore;
    submission.percentage = (totalScore / quiz.totalPoints) * 100;
    submission.status = 'graded';
    submission.isGraded = true;
    submission.gradedBy = req.user.id;
    submission.gradedAt = new Date();

    if (feedback) {
      submission.feedback = feedback;
    }

    await submission.save();

    // Create notification for student
    const notification = new Notification({
      title: 'Quiz Graded',
      message: `Your submission for "${quiz.title}" has been graded.`,
      type: 'grade',
      priority: 'medium',
      recipients: [{
        user: submission.student,
        read: false
      }],
      targetRole: 'student',
      relatedResource: {
        resourceType: 'quiz',
        resourceId: quiz._id
      },
      createdBy: req.user.id
    });

    await notification.save();

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
