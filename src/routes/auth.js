const express = require('express');
const { check } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({
      min: 6,
    }),
    check('confirmPassword', 'Passwords do not match').custom(
      (value, { req }) => value === req.body.password
    ),
    check('height', 'Height is required').isNumeric(),
    check('weight', 'Weight is required').isNumeric(),
    check('age', 'Age is required').isNumeric(),
    check('gender', 'Gender is required').isIn(['male', 'female', 'other']),
    check('fitnessLevel', 'Fitness level is required').isIn([
      'beginner',
      'intermediate',
      'advanced',
    ]),
    check('primaryGoal', 'Primary goal is required').isIn([
      'weight-loss',
      'muscle-gain',
      'endurance',
      'general-fitness',
    ]),
    check('wakeUpTime', 'Wake up time is required').not().isEmpty(),
    check('sleepTime', 'Sleep time is required').not().isEmpty(),
    check('preferredWorkoutTime', 'Preferred workout time is required').not().isEmpty(),
    check('motivationLevel', 'Motivation level is required').isIn([
      'low',
      'medium',
      'high',
    ]),
  ],
  register
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  login
);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
