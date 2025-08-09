const Habit = require('../models/Habit');
const ErrorResponse = require('../utils/errorResponse');
const notificationService = require('../services/notificationService');

// @desc    Get all habits for user
// @route   GET /api/v1/habits
// @access  Private
exports.getHabits = async (req, res, next) => {
  try {
    const habits = await Habit.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: habits.length,
      data: habits,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single habit
// @route   GET /api/v1/habits/:id
// @access  Private
exports.getHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return next(new ErrorResponse(`Habit not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns the habit
    if (habit.user.toString() !== req.user.id) {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to access this habit`, 401));
    }

    res.status(200).json({
      success: true,
      data: habit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new habit
// @route   POST /api/v1/habits
// @access  Private
exports.createHabit = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    // Validate required fields
    const { name, created_time, target_time, icon_id, repeats } = req.body;

    if (!name || !created_time || !target_time || !icon_id || !repeats) {
      return next(new ErrorResponse('Please provide all required fields', 400));
    }

    // Validate that icon_id is a number
    if (typeof icon_id !== 'number') {
      return next(new ErrorResponse('Icon ID must be a number', 400));
    }

    // Validate that repeats is an array of numbers
    if (!Array.isArray(repeats) || !repeats.every(day => typeof day === 'number')) {
      return next(new ErrorResponse('Repeats must be an array of numbers', 400));
    }

    // Validate that repeats contains valid day numbers (0-6)
    if (!repeats.every(day => day >= 0 && day <= 6)) {
      return next(new ErrorResponse('Repeats must contain valid day numbers (0-6, where Monday=0)', 400));
    }

    const habit = await Habit.create(req.body);

    // Send notification for habit creation
    try {
      await notificationService.sendHabitCreationNotification(req.user.id, habit);
    } catch (notificationError) {
      console.error('Error sending habit creation notification:', notificationError);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      success: true,
      data: habit,
    });
  } catch (error) {
    next(error);
  }
}; 