const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getHabitSuggestions,
  getHabitAnalysis,
  getCategorySuggestions,
  getGoalBasedSuggestions,
  createHabitFromSuggestion
} = require('../controllers/suggestionController');

const router = express.Router();

// Protected routes
router.use(protect);

// Get personalized habit suggestions
router.get('/', getHabitSuggestions);

// Get habit analysis and insights
router.get('/analysis', getHabitAnalysis);

// Get suggestions for specific category
router.get('/category/:category', getCategorySuggestions);

// Get goal-based suggestions
router.get('/goal/:goal', getGoalBasedSuggestions);

// Create habit from suggestion
router.post('/create', createHabitFromSuggestion);

module.exports = router; 