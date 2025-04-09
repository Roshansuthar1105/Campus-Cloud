const express = require('express');
const router = express.Router();
const { 
  getPreferenceForms, 
  getPreferenceForm, 
  createPreferenceForm, 
  updatePreferenceForm, 
  deletePreferenceForm,
  getFormSubmissions,
  submitPreferenceForm
} = require('../controllers/preferenceController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');

// All routes require authentication
router.use(protect);

// Get all forms and create form
router.route('/')
  .get(getPreferenceForms)
  .post(authorize('faculty', 'management'), createPreferenceForm);

// Get, update and delete single form
router.route('/:id')
  .get(getPreferenceForm)
  .put(authorize('faculty', 'management'), updatePreferenceForm)
  .delete(authorize('faculty', 'management'), deletePreferenceForm);

// Get form submissions
router.route('/:id/submissions')
  .get(authorize('faculty', 'management'), getFormSubmissions);

// Submit form
router.route('/:id/submit')
  .post(submitPreferenceForm);

module.exports = router;
