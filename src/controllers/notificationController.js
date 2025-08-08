const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const notificationService = require('../services/notificationService');

// @desc    Update FCM token for user
// @route   POST /api/v1/notifications/token
// @access  Private
exports.updateFCMToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return next(new ErrorResponse('FCM token is required', 400));
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fcmToken },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'FCM token updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          notifications: user.notifications
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update notification preferences
// @route   PUT /api/v1/notifications/preferences
// @access  Private
exports.updateNotificationPreferences = async (req, res, next) => {
  try {
    const { notifications } = req.body;

    if (typeof notifications !== 'boolean') {
      return next(new ErrorResponse('Notifications must be a boolean value', 400));
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { notifications },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'Notification preferences updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          notifications: user.notifications
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get notification preferences
// @route   GET /api/v1/notifications/preferences
// @access  Private
exports.getNotificationPreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        notifications: user.notifications,
        fcmToken: user.fcmToken ? 'registered' : 'not_registered'
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Send test notification
// @route   POST /api/v1/notifications/test
// @access  Private
exports.sendTestNotification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (!user.fcmToken) {
      return next(new ErrorResponse('FCM token not registered', 400));
    }

    const testNotification = {
      title: 'Test Notification! 🧪',
      body: 'This is a test notification from NodeHabit. If you received this, notifications are working!',
      type: 'test',
      data: {
        timestamp: new Date().toISOString()
      }
    };

    const result = await notificationService.sendNotificationToUser(user._id, testNotification);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: {
          message: 'Test notification sent successfully',
          messageId: result.messageId
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    next(error);
  }
};

// @desc    Remove FCM token
// @route   DELETE /api/v1/notifications/token
// @access  Private
exports.removeFCMToken = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fcmToken: null },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'FCM token removed successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          notifications: user.notifications
        }
      }
    });

  } catch (error) {
    next(error);
  }
}; 