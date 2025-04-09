const PreferenceForm = require('../models/PreferenceForm');
const PreferenceSubmission = require('../models/PreferenceSubmission');
const Course = require('../models/Course');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all preference forms
// @route   GET /api/preferences
// @access  Private
exports.getPreferenceForms = async (req, res) => {
  try {
    let query = {};
    
    // Filter forms based on user role and query parameters
    if (req.query.course) {
      query.course = req.query.course;
    }
    
    if (req.query.department) {
      query.department = req.query.department;
    }
    
    if (req.user.role === 'faculty') {
      // Faculty can see forms they created
      query.createdBy = req.user.id;
    } else if (req.user.role === 'student') {
      // Students can see published forms for their courses or department
      query.isPublished = true;
      
      // Forms targeted at all users or students
      query.$or = [
        { targetAudience: 'all' },
        { targetAudience: 'students' }
      ];
      
      // Add course-specific forms if student has courses
      const student = await User.findById(req.user.id);
      if (student && student.courses && student.courses.length > 0) {
        query.$or.push({
          targetAudience: 'specific-course',
          course: { $in: student.courses }
        });
      }
      
      // Add department-specific forms
      if (student && student.department) {
        query.$or.push({
          department: student.department
        });
      }
    }
    // Management can see all forms (no additional filter)
    
    const forms = await PreferenceForm.find(query)
      .populate('course', 'name code')
      .populate('createdBy', 'name')
      .sort({ startDate: -1 });
    
    res.status(200).json({
      success: true,
      count: forms.length,
      data: forms
    });
  } catch (error) {
    console.error('Error getting preference forms:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single preference form
// @route   GET /api/preferences/:id
// @access  Private
exports.getPreferenceForm = async (req, res) => {
  try {
    const form = await PreferenceForm.findById(req.params.id)
      .populate('course', 'name code')
      .populate('createdBy', 'name');
    
    if (!form) {
      return res.status(404).json({ message: 'Preference form not found' });
    }
    
    // Check if user has access to this form
    if (req.user.role === 'student') {
      // Students can only access published forms
      if (!form.isPublished) {
        return res.status(403).json({ message: 'Form is not published yet' });
      }
      
      // Check if student is in the target audience
      if (form.targetAudience === 'faculty') {
        return res.status(403).json({ message: 'This form is for faculty only' });
      }
      
      if (form.targetAudience === 'specific-course') {
        const student = await User.findById(req.user.id);
        if (!student || !student.courses || !student.courses.includes(form.course._id)) {
          return res.status(403).json({ message: 'This form is for a specific course you are not enrolled in' });
        }
      }
      
      if (form.department && form.department !== '') {
        const student = await User.findById(req.user.id);
        if (!student || student.department !== form.department) {
          return res.status(403).json({ message: 'This form is for a different department' });
        }
      }
    } else if (req.user.role === 'faculty') {
      // Faculty can access forms they created or forms targeted at faculty
      if (form.createdBy._id.toString() !== req.user.id && 
          form.targetAudience !== 'all' && 
          form.targetAudience !== 'faculty') {
        return res.status(403).json({ message: 'Not authorized to access this form' });
      }
    }
    
    // Check if user has already submitted this form
    const existingSubmission = await PreferenceSubmission.findOne({
      form: form._id,
      user: req.user.id
    });
    
    const formData = {
      ...form.toObject(),
      hasSubmitted: !!existingSubmission,
      allowMultipleSubmissions: form.allowMultipleSubmissions
    };
    
    res.status(200).json({
      success: true,
      data: formData
    });
  } catch (error) {
    console.error('Error getting preference form:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new preference form
// @route   POST /api/preferences
// @access  Private (Faculty and Management only)
exports.createPreferenceForm = async (req, res) => {
  try {
    // Add user to request body
    req.body.createdBy = req.user.id;
    
    // Validate course if specified
    if (req.body.targetAudience === 'specific-course' && req.body.course) {
      const course = await Course.findById(req.body.course);
      
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      if (req.user.role === 'faculty' && !course.faculty.includes(req.user.id)) {
        return res.status(403).json({ message: 'Not authorized to create form for this course' });
      }
    }
    
    const form = await PreferenceForm.create(req.body);
    
    // If form is published, create notifications for target audience
    if (form.isPublished) {
      await createFormNotifications(form);
    }
    
    res.status(201).json({
      success: true,
      data: form
    });
  } catch (error) {
    console.error('Error creating preference form:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update preference form
// @route   PUT /api/preferences/:id
// @access  Private (Faculty who created the form and Management)
exports.updatePreferenceForm = async (req, res) => {
  try {
    let form = await PreferenceForm.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({ message: 'Preference form not found' });
    }
    
    // Check if user is authorized to update the form
    if (req.user.role === 'faculty' && form.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this form' });
    }
    
    // Check if form has submissions
    const submissions = await PreferenceSubmission.find({ form: form._id });
    
    if (submissions.length > 0) {
      // If form has submissions, only allow updating certain fields
      const allowedUpdates = ['endDate', 'isPublished'];
      
      // Filter out disallowed fields
      Object.keys(req.body).forEach(key => {
        if (!allowedUpdates.includes(key)) {
          delete req.body[key];
        }
      });
    }
    
    const wasPublished = form.isPublished;
    
    form = await PreferenceForm.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    // If form is newly published, create notifications
    if (!wasPublished && form.isPublished) {
      await createFormNotifications(form);
    }
    
    res.status(200).json({
      success: true,
      data: form
    });
  } catch (error) {
    console.error('Error updating preference form:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete preference form
// @route   DELETE /api/preferences/:id
// @access  Private (Faculty who created the form and Management)
exports.deletePreferenceForm = async (req, res) => {
  try {
    const form = await PreferenceForm.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({ message: 'Preference form not found' });
    }
    
    // Check if user is authorized to delete the form
    if (req.user.role === 'faculty' && form.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this form' });
    }
    
    // Check if form has submissions
    const submissions = await PreferenceSubmission.find({ form: form._id });
    
    if (submissions.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete form with existing submissions. Archive it instead.' 
      });
    }
    
    await form.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting preference form:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get form submissions
// @route   GET /api/preferences/:id/submissions
// @access  Private (Faculty who created the form and Management)
exports.getFormSubmissions = async (req, res) => {
  try {
    const form = await PreferenceForm.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({ message: 'Preference form not found' });
    }
    
    // Check if user is authorized to view submissions
    if (req.user.role === 'faculty' && form.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view submissions for this form' });
    }
    
    // Get submissions
    const submissions = await PreferenceSubmission.find({ form: form._id })
      .populate('user', 'name email role department');
    
    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    console.error('Error getting form submissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit preference form
// @route   POST /api/preferences/:id/submit
// @access  Private
exports.submitPreferenceForm = async (req, res) => {
  try {
    const { answers, isAnonymous } = req.body;
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers array is required' });
    }
    
    const form = await PreferenceForm.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({ message: 'Preference form not found' });
    }
    
    // Check if form is published
    if (!form.isPublished) {
      return res.status(400).json({ message: 'Form is not published yet' });
    }
    
    // Check if form is active
    const now = new Date();
    if (now < new Date(form.startDate)) {
      return res.status(400).json({ message: 'Form is not active yet' });
    }
    
    if (now > new Date(form.endDate)) {
      return res.status(400).json({ message: 'Form has ended' });
    }
    
    // Check if user is in the target audience
    if (req.user.role === 'student' && form.targetAudience === 'faculty') {
      return res.status(403).json({ message: 'This form is for faculty only' });
    }
    
    if (req.user.role === 'faculty' && form.targetAudience === 'students') {
      return res.status(403).json({ message: 'This form is for students only' });
    }
    
    if (form.targetAudience === 'specific-course') {
      const user = await User.findById(req.user.id);
      if (!user || !user.courses || !user.courses.includes(form.course)) {
        return res.status(403).json({ message: 'This form is for a specific course you are not part of' });
      }
    }
    
    // Check if user has already submitted this form
    const existingSubmission = await PreferenceSubmission.findOne({
      form: form._id,
      user: req.user.id
    });
    
    if (existingSubmission && !form.allowMultipleSubmissions) {
      return res.status(400).json({ message: 'You have already submitted this form' });
    }
    
    // Process answers
    const processedAnswers = [];
    
    for (const answer of answers) {
      // Find the question in the form
      const question = form.questions.find(q => q._id.toString() === answer.questionId);
      
      if (!question) {
        return res.status(400).json({ message: `Question with ID ${answer.questionId} not found in form` });
      }
      
      // Validate required questions
      if (question.isRequired && 
          (!answer.selectedOptions || answer.selectedOptions.length === 0) && 
          (!answer.textAnswer || answer.textAnswer.trim() === '') &&
          (!answer.ratingValue)) {
        return res.status(400).json({ message: `Question "${question.questionText}" is required` });
      }
      
      processedAnswers.push({
        questionId: answer.questionId,
        questionText: question.questionText,
        selectedOptions: answer.selectedOptions || [],
        textAnswer: answer.textAnswer || '',
        ratingValue: answer.ratingValue
      });
    }
    
    // Create submission
    const submission = await PreferenceSubmission.create({
      form: form._id,
      user: isAnonymous && form.allowAnonymous ? null : req.user.id,
      isAnonymous: isAnonymous && form.allowAnonymous,
      answers: processedAnswers,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error submitting preference form:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to create notifications for a form
async function createFormNotifications(form) {
  try {
    let recipients = [];
    
    if (form.targetAudience === 'all') {
      // Get all users
      const users = await User.find({});
      recipients = users.map(user => ({
        user: user._id,
        read: false
      }));
    } else if (form.targetAudience === 'students') {
      // Get all students
      const students = await User.find({ role: 'student' });
      recipients = students.map(student => ({
        user: student._id,
        read: false
      }));
    } else if (form.targetAudience === 'faculty') {
      // Get all faculty
      const faculty = await User.find({ role: 'faculty' });
      recipients = faculty.map(faculty => ({
        user: faculty._id,
        read: false
      }));
    } else if (form.targetAudience === 'specific-course' && form.course) {
      // Get course students
      const course = await Course.findById(form.course);
      if (course && course.students && course.students.length > 0) {
        recipients = course.students.map(studentId => ({
          user: studentId,
          read: false
        }));
      }
    }
    
    if (recipients.length > 0) {
      const notification = new Notification({
        title: `New Form: ${form.title}`,
        message: `A new preference form has been published. It will be available from ${new Date(form.startDate).toLocaleDateString()} to ${new Date(form.endDate).toLocaleDateString()}.`,
        type: 'preference',
        priority: 'medium',
        recipients,
        targetRole: form.targetAudience === 'faculty' ? 'faculty' : 'student',
        relatedResource: {
          resourceType: 'preference',
          resourceId: form._id
        },
        createdBy: form.createdBy
      });
      
      await notification.save();
    }
  } catch (error) {
    console.error('Error creating form notifications:', error);
  }
}
