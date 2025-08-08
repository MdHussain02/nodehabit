const express = require('express');
const {
  updateFCMToken,
  updateNotificationPreferences,
  getNotificationPreferences,
  sendTestNotification,
  removeFCMToken
} = require('../controllers/notificationController');

const router = express.Router();

// Protect all routes
const { protect } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(protect);

// Update FCM token
router.post('/token', updateFCMToken);

// Remove FCM token
router.delete('/token', removeFCMToken);

// Update notification preferences
router.put('/preferences', updateNotificationPreferences);

// Get notification preferences
router.get('/preferences', getNotificationPreferences);

// Send test notification
router.post('/test', sendTestNotification);

module.exports = router; 