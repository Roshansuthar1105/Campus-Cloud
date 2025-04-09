const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  description: {
    type: String
  }
});

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['multiple-choice', 'checkbox', 'dropdown', 'text', 'rating'],
    default: 'multiple-choice'
  },
  options: [OptionSchema],
  isRequired: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number
  }
});

const PreferenceFormSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  questions: [QuestionSchema],
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'faculty', 'specific-course'],
    default: 'all'
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  department: {
    type: String
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  allowAnonymous: {
    type: Boolean,
    default: false
  },
  allowMultipleSubmissions: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
PreferenceFormSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set order for questions if not already set
  if (this.questions && this.questions.length > 0) {
    this.questions.forEach((question, index) => {
      if (!question.order) {
        question.order = index + 1;
      }
    });
  }
  
  next();
});

module.exports = mongoose.model('PreferenceForm', PreferenceFormSchema);
