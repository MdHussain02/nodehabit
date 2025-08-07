const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { generateToken } = require('../utils/jwtUtils');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  const {
    name,
    email,
    password,
    confirmPassword,
    height,
    weight,
    age,
    gender,
    fitnessLevel,
    primaryGoal,
    wakeUpTime,
    sleepTime,
    preferredWorkoutTime,
    notifications = true,
    motivationLevel,
    weeklyGoal = '3',
  } = req.body;

  try {
    // Check if passwords match
    if (password !== confirmPassword) {
      return next(new ErrorResponse('Passwords do not match', 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('User already exists with this email', 400));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      height,
      weight,
      age,
      gender,
      fitnessLevel,
      primaryGoal,
      wakeUpTime,
      sleepTime,
      preferredWorkoutTime,
      notifications,
      motivationLevel,
      weeklyGoal,
    });

    // Create token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        height: user.height,
        weight: user.weight,
        age: user.age,
        gender: user.gender,
        fitnessLevel: user.fitnessLevel,
        primaryGoal: user.primaryGoal,
        wakeUpTime: user.wakeUpTime,
        sleepTime: user.sleepTime,
        preferredWorkoutTime: user.preferredWorkoutTime,
        notifications: user.notifications,
        motivationLevel: user.motivationLevel,
        weeklyGoal: user.weeklyGoal,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Create token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        height: user.height,
        weight: user.weight,
        age: user.age,
        gender: user.gender,
        fitnessLevel: user.fitnessLevel,
        primaryGoal: user.primaryGoal,
        wakeUpTime: user.wakeUpTime,
        sleepTime: user.sleepTime,
        preferredWorkoutTime: user.preferredWorkoutTime,
        notifications: user.notifications,
        motivationLevel: user.motivationLevel,
        weeklyGoal: user.weeklyGoal,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};
