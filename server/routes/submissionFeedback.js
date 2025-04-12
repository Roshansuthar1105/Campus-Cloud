const express = require('express');
const router = express.Router();
const QuizSubmission = require('../models/QuizSubmission');
const { authenticateToken, isInstructor } = require('../middleware/auth');

/**
 * @route POST /api/submissions/feedback
 * @desc Save feedback for a quiz submission
 * @access Private (Instructors only)
 */
router.post('/feedback', [authenticateToken, isInstructor], async (req, res) => {
  try {
    const { submissionId, questionFeedback, overallFeedback } = req.body;

    if (!submissionId) {
      return res.status(400).json({ success: false, message: 'Submission ID is required' });
    }

    // Find the submission
    const submission = await QuizSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // Format and save the feedback
    // Initialize feedback object if it doesn't exist
    if (!submission.feedback) {
      submission.feedback = {};
    }

    // Process question feedback
    if (questionFeedback) {
      // Handle case where feedback is a string (legacy format)
      if (typeof questionFeedback === 'string') {
        console.log('Converting string feedback to object format');
        try {
          // Try to parse it as JSON
          const parsedFeedback = JSON.parse(questionFeedback);
          submission.feedback = parsedFeedback;
        } catch (e) {
          // If not valid JSON, store as general feedback
          submission.overallFeedback = questionFeedback;
        }
      }
      // Handle array of feedback items
      else if (Array.isArray(questionFeedback)) {
        questionFeedback.forEach(item => {
          if (!item || !item.questionId) return;

          // Handle different formats of feedback
          if (typeof item === 'string') {
            submission.feedback[item.questionId] = { comment: item, score: null };
          } else if (typeof item === 'object') {
            submission.feedback[item.questionId] = {
              comment: item.comment || '',
              score: item.score !== undefined ? item.score : null,
              maxScore: item.maxScore || null
            };
          }
        });
      }
      // Handle object format (direct mapping)
      else if (typeof questionFeedback === 'object') {
        submission.feedback = questionFeedback;
      }
    }

    // Save overall feedback
    if (overallFeedback !== undefined) {
      // If it's already a string, use it directly
      if (typeof overallFeedback === 'string') {
        submission.overallFeedback = overallFeedback;
      }
      // If it's an object, try to extract a meaningful string
      else if (typeof overallFeedback === 'object') {
        if (overallFeedback.comment) {
          submission.overallFeedback = overallFeedback.comment;
        } else {
          // Try to convert to JSON string if it's a complex object
          try {
            submission.overallFeedback = JSON.stringify(overallFeedback);
          } catch (e) {
            submission.overallFeedback = String(overallFeedback);
          }
        }
      }
      // For any other type, convert to string
      else {
        submission.overallFeedback = String(overallFeedback);
      }
    }

    // Log the final data that will be saved to the database
    console.log('Final feedback data being saved to database:');
    console.log('- Submission ID:', submission._id);
    console.log('- Feedback object:', JSON.stringify(submission.feedback, null, 2));
    console.log('- Overall feedback:', submission.overallFeedback);

    // Save the updated submission
    await submission.save();

    // Log confirmation of successful save
    console.log('Feedback successfully saved to database for submission:', submission._id);

    res.status(200).json({
      success: true,
      message: 'Feedback saved successfully',
      data: {
        feedback: submission.feedback,
        overallFeedback: submission.overallFeedback
      }
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
