const Habit = require('../models/Habit');
const ErrorResponse = require('../utils/errorResponse');
const notificationService = require('../services/notificationService');

// @desc    Get all habits for user
// @route   GET /api/v1/habits
// @access  Private
exports.getHabits = async (req, res, next) => {
  try {
    // Determine target date (UTC)
    const { date } = req.query;
    let dayIndex; // Monday=0 ... Sunday=6
    if (date) {
      // Expect strict YYYY-MM-DD; build an explicit UTC date to avoid TZ ambiguity
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return next(new ErrorResponse('Invalid date. Use YYYY-MM-DD (UTC).', 400));
      }
      const parsed = new Date(`${date}T00:00:00.000Z`);
      if (Number.isNaN(parsed.getTime())) {
        return next(new ErrorResponse('Invalid date. Use YYYY-MM-DD (UTC).', 400));
      }
      // JS getUTCDay: 0=Sun ... 6=Sat. Convert to Monday=0 ... Sunday=6
      const jsDay = parsed.getUTCDay();
      dayIndex = (jsDay + 6) % 7;
    } else {
      const now = new Date();
      const jsDay = now.getUTCDay();
      dayIndex = (jsDay + 6) % 7;
    }

    const habits = await Habit.find({
      user: req.user.id,
      // handle both numeric and string representations in repeats
      $or: [
        { repeats: { $in: [dayIndex] } },
        { repeats: { $in: [String(dayIndex)] } }
      ]
    }).sort({ createdAt: -1 });

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

    // Compute status fields
    const completions = Array.isArray(habit.completions) ? habit.completions : [];
    const todayYMD = new Date().toISOString().slice(0, 10); // UTC YYYY-MM-DD
    const completedToday = completions.some(c => {
      const d = new Date(c.timestamp);
      return !isNaN(d) && d.toISOString().slice(0, 10) === todayYMD;
    });
    const lastCompletion = completions.length > 0 ? completions[completions.length - 1] : null;

    const habitObj = habit.toObject();
    habitObj.completed = completedToday;
    habitObj.last_completion = lastCompletion;

    res.status(200).json({
      success: true,
      data: habitObj,
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
    const { name, created_time, target_time, icon_id } = req.body;
    let { repeats, day } = req.body;

    if (!name || !created_time || !target_time || !icon_id) {
      return next(new ErrorResponse('Please provide all required fields', 400));
    }

    // Normalize single day -> repeats
    if (!repeats && (day === 0 || day === 1 || day === 2 || day === 3 || day === 4 || day === 5 || day === 6)) {
      repeats = [day];
      req.body.repeats = repeats;
    }

    if (!repeats) {
      return next(new ErrorResponse('Please provide repeats array or a single day (0-6, Monday=0)', 400));
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

// @desc    Mark habit as done (create a completion)
// @route   POST /api/v1/habits/:id/mark
// @access  Private
exports.markHabitDone = async (req, res, next) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return next(new ErrorResponse(`Habit not found with id of ${req.params.id}`, 404));
    }

    // Ensure user owns the habit
    if (habit.user.toString() !== req.user.id) {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to modify this habit`, 401));
    }

    // Use provided timestamp or now
    const completionTimestamp = typeof req.body?.timestamp === 'string' ? req.body.timestamp : new Date().toISOString();

    // Validate timestamp
    if (isNaN(Date.parse(completionTimestamp))) {
      return next(new ErrorResponse('Please provide a valid ISO timestamp in UTC for timestamp', 400));
    }

    // Determine if completion is on time compared to target_time (time-of-day match within tolerance)
    const toleranceMinutes = 30; // configurable window
    const completionDate = new Date(completionTimestamp);
    const targetDate = new Date(habit.target_time);

    const minutes = (d) => d.getUTCHours() * 60 + d.getUTCMinutes();
    const diffMinutes = Math.abs(minutes(completionDate) - minutes(targetDate));
    const onTime = diffMinutes <= toleranceMinutes;

    // Append completion
    habit.completions = habit.completions || [];
    habit.completions.push({ timestamp: completionTimestamp, on_time: onTime });
    await habit.save();

    res.status(201).json({
      success: true,
      data: {
        habit_id: habit._id,
        completion: { timestamp: completionTimestamp, on_time: onTime },
      },
    });
  } catch (error) {
    next(error);
  }
};