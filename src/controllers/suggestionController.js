const User = require('../models/User');
const Habit = require('../models/Habit');
const ErrorResponse = require('../utils/errorResponse');
const { generateHabitSuggestions, analyzeHabitPatterns } = require('../services/aiService');
const notificationService = require('../services/notificationService');

// @desc    Get personalized habit suggestions
// @route   GET /api/v1/suggestions
// @access  Private
exports.getHabitSuggestions = async (req, res, next) => {
  try {
    const { maxSuggestions = 5, focusArea = 'general', category } = req.query;

    // Get user profile
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Get user's existing habits
    const existingHabits = await Habit.find({ user: req.user.id });

    // Prepare options for AI service
    const options = {
      maxSuggestions: parseInt(maxSuggestions),
      focusArea,
      category
    };

    // Generate suggestions using AI
    const suggestions = await generateHabitSuggestions(user, existingHabits, options);

    // Send notification for new suggestions if user has notifications enabled
    if (user.notifications && suggestions.length > 0) {
      try {
        await notificationService.sendPersonalizedSuggestionsNotification(req.user.id, suggestions);
      } catch (notificationError) {
        console.error('Error sending suggestions notification:', notificationError);
        // Don't fail the request if notification fails
      }
    }

    res.status(200).json({
      success: true,
      data: {
        suggestions,
        userProfile: {
          age: user.age,
          fitnessLevel: user.fitnessLevel,
          primaryGoal: user.primaryGoal,
          motivationLevel: user.motivationLevel
        },
        existingHabitsCount: existingHabits.length,
        options
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get habit analysis and insights
// @route   GET /api/v1/suggestions/analysis
// @access  Private
exports.getHabitAnalysis = async (req, res, next) => {
  try {
    // Get user profile
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Get user's existing habits
    const existingHabits = await Habit.find({ user: req.user.id });

    // Analyze patterns using AI
    const analysis = await analyzeHabitPatterns(user, existingHabits);

    // Calculate additional metrics
    const totalHabits = existingHabits.length;
    const activeHabits = existingHabits.filter(habit => habit.repeats.length > 0).length;
    const averageFrequency = totalHabits > 0 
      ? existingHabits.reduce((sum, habit) => sum + habit.repeats.length, 0) / totalHabits 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        analysis,
        metrics: {
          totalHabits,
          activeHabits,
          averageFrequency: Math.round(averageFrequency * 10) / 10,
          consistencyScore: analysis.consistency_score,
          balanceScore: analysis.balance_score
        },
        userProfile: {
          age: user.age,
          fitnessLevel: user.fitnessLevel,
          primaryGoal: user.primaryGoal,
          motivationLevel: user.motivationLevel
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get suggestions for specific category
// @route   GET /api/v1/suggestions/category/:category
// @access  Private
exports.getCategorySuggestions = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { maxSuggestions = 3 } = req.query;

    // Validate category
    const validCategories = ['fitness', 'nutrition', 'mental-health', 'sleep', 'lifestyle'];
    if (!validCategories.includes(category)) {
      return next(new ErrorResponse('Invalid category. Must be one of: fitness, nutrition, mental-health, sleep, lifestyle', 400));
    }

    // Get user profile
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Get user's existing habits
    const existingHabits = await Habit.find({ user: req.user.id });

    // Prepare options for AI service
    const options = {
      maxSuggestions: parseInt(maxSuggestions),
      focusArea: category,
      category
    };

    // Generate category-specific suggestions
    const suggestions = await generateHabitSuggestions(user, existingHabits, options);

    // Filter suggestions by category
    const categorySuggestions = suggestions.filter(suggestion => 
      suggestion.category === category
    );

    res.status(200).json({
      success: true,
      data: {
        category,
        suggestions: categorySuggestions,
        userProfile: {
          age: user.age,
          fitnessLevel: user.fitnessLevel,
          primaryGoal: user.primaryGoal,
          motivationLevel: user.motivationLevel
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get personalized recommendations based on user goals
// @route   GET /api/v1/suggestions/goal/:goal
// @access  Private
exports.getGoalBasedSuggestions = async (req, res, next) => {
  try {
    const { goal } = req.params;
    const { maxSuggestions = 5 } = req.query;

    // Validate goal
    const validGoals = ['weight-loss', 'muscle-gain', 'endurance', 'general-fitness'];
    if (!validGoals.includes(goal)) {
      return next(new ErrorResponse('Invalid goal. Must be one of: weight-loss, muscle-gain, endurance, general-fitness', 400));
    }

    // Get user profile
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Get user's existing habits
    const existingHabits = await Habit.find({ user: req.user.id });

    // Prepare options for AI service
    const options = {
      maxSuggestions: parseInt(maxSuggestions),
      focusArea: goal,
      goal
    };

    // Generate goal-specific suggestions
    const suggestions = await generateHabitSuggestions(user, existingHabits, options);

    res.status(200).json({
      success: true,
      data: {
        goal,
        suggestions,
        userProfile: {
          age: user.age,
          fitnessLevel: user.fitnessLevel,
          primaryGoal: user.primaryGoal,
          motivationLevel: user.motivationLevel
        },
        goalAlignment: {
          userGoal: user.primaryGoal,
          requestedGoal: goal,
          isAligned: user.primaryGoal === goal
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Create habit from suggestion
// @route   POST /api/v1/suggestions/create
// @access  Private
exports.createHabitFromSuggestion = async (req, res, next) => {
  try {
    const { name, target_time, icon_id, repeats, description } = req.body;

    // Validate required fields
    if (!name || !target_time || !icon_id || !repeats) {
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

    // Create the habit
    const habit = await Habit.create({
      name,
      created_time: new Date().toISOString(),
      target_time,
      icon_id,
      repeats,
      user: req.user.id
    });

    // Send notification for habit creation from suggestion
    try {
      await notificationService.sendHabitCreationNotification(req.user.id, habit);
    } catch (notificationError) {
      console.error('Error sending habit creation notification:', notificationError);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      success: true,
      data: {
        habit,
        description: description || 'Habit created from AI suggestion'
      }
    });

  } catch (error) {
    next(error);
  }
}; 