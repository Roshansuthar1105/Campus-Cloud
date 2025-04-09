const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  selectedOptions: [{
    type: String
  }],
  textAnswer: {
    type: String
  },
  isCorrect: {
    type: Boolean
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  feedback: {
    type: String
  }
});

const QuizSubmissionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [AnswerSchema],
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  totalScore: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'graded', 'overdue'],
    default: 'in-progress'
  },
  isGraded: {
    type: Boolean,
    default: false
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: {
    type: Date
  },
  feedback: {
    type: String
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
QuizSubmissionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate total score and percentage if the quiz is completed
  if (this.status === 'completed' || this.status === 'graded') {
    if (this.answers && this.answers.length > 0) {
      this.totalScore = this.answers.reduce((sum, answer) => sum + (answer.pointsEarned || 0), 0);
      
      // Get the quiz to calculate percentage
      mongoose.model('Quiz').findById(this.quiz)
        .then(quiz => {
          if (quiz && quiz.totalPoints > 0) {
            this.percentage = (this.totalScore / quiz.totalPoints) * 100;
          }
          next();
        })
        .catch(err => {
          console.error('Error calculating quiz percentage:', err);
          next();
        });
    } else {
      next();
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('QuizSubmission', QuizSubmissionSchema);
