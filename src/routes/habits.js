const express = require('express');
const { protect } = require('../middleware/auth');
const { 
  getHabits, 
  getHabit, 
  createHabit 
} = require('../controllers/habitController');

const router = express.Router();

// Protected routes
router.use(protect);

router.route('/')
  .get(getHabits)
  .post(createHabit);

router.route('/:id')
  .get(getHabit);

module.exports = router; 