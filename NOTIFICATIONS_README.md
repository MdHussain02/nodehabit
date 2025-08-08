# NodeHabit Push Notification System

This document describes the comprehensive push notification system implemented for the NodeHabit application using Firebase Cloud Messaging (FCM).

## 🚀 Features

### Notification Types
1. **AI-Based Habit Suggestions** - Notifications for new personalized habit suggestions
2. **Incomplete Habits Reminders** - Daily reminders for uncompleted habits
3. **Habit Completion** - Celebrations when habits are completed
4. **Streak Notifications** - Milestone celebrations for consistent habit tracking
5. **Daily Reminders** - Morning and evening habit reminders
6. **Weekly Progress Reports** - Weekly summary of habit completion
7. **Motivation Boost** - Random motivational messages throughout the day
8. **Time-Based Reminders** - Notifications when it's time for specific habits
9. **Streak at Risk** - Warnings when streaks are about to break

### Scheduled Notifications
- **Daily Morning Reminder** (8:00 AM UTC) - Shows today's habits
- **Daily Evening Reminder** (8:00 PM UTC) - Reminds of incomplete habits
- **Weekly Progress Report** (Sunday 9:00 AM UTC) - Weekly summary
- **Habit Time Reminders** (Every hour) - Time-specific habit reminders
- **Streak at Risk** (10:00 PM UTC) - Warnings for habits at risk
- **Motivation Notifications** (10 AM, 2 PM, 4 PM, 6 PM UTC) - Random motivation

## 🔧 Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable Cloud Messaging:
   - Go to Project Settings
   - Go to Cloud Messaging tab
   - Generate a new server key (if needed)

### 2. Firebase Service Account

1. In Firebase Console, go to Project Settings
2. Go to Service Accounts tab
3. Click "Generate new private key"
4. Download the JSON file
5. Add the JSON content to your `.env` file as `FIREBASE_SERVICE_ACCOUNT_KEY`

### 3. Environment Variables

Add these to your `.env` file:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your_project_id","private_key_id":"your_private_key_id","private_key":"your_private_key","client_email":"your_client_email","client_id":"your_client_id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"your_cert_url"}
```

### 4. Install Dependencies

```bash
npm install firebase-admin node-cron
```

## 📱 API Endpoints

### Notification Management

#### Update FCM Token
```http
POST /api/v1/notifications/token
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "fcmToken": "your_fcm_token_here"
}
```

#### Remove FCM Token
```http
DELETE /api/v1/notifications/token
Authorization: Bearer <JWT_TOKEN>
```

#### Update Notification Preferences
```http
PUT /api/v1/notifications/preferences
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "notifications": true
}
```

#### Get Notification Preferences
```http
GET /api/v1/notifications/preferences
Authorization: Bearer <JWT_TOKEN>
```

#### Send Test Notification
```http
POST /api/v1/notifications/test
Authorization: Bearer <JWT_TOKEN>
```

## 🔄 Integration with Existing Features

### Automatic Notifications

The notification system automatically sends notifications for:

1. **Habit Creation** - When a new habit is created
2. **AI Suggestions** - When new AI-powered suggestions are generated
3. **Habit Completion** - When habits are marked as complete (to be implemented)
4. **Streak Milestones** - When users reach streak milestones (to be implemented)

### Manual Notifications

You can manually trigger notifications using the notification service:

```javascript
const notificationService = require('./services/notificationService');

// Send custom notification
await notificationService.sendNotificationToUser(userId, {
  title: 'Custom Title',
  body: 'Custom message',
  type: 'custom',
  data: { customData: 'value' }
});
```

## 📊 Notification Scenarios

### 1. New AI Habit Suggestions
- **Trigger**: When AI generates new habit suggestions
- **Message**: "New Habit Suggestion! 💡 We found a perfect habit for you: [Habit Name]. Tap to learn more!"
- **Data**: Includes suggestion ID, category, and difficulty

### 2. Incomplete Habits Reminder
- **Trigger**: Daily at 8:00 PM UTC
- **Message**: "Don't forget your habits! ⏰ You have X habit(s) to complete: [Habit Names]"
- **Data**: Includes habit count and habit IDs

### 3. Habit Completion Celebration
- **Trigger**: When a habit is marked as complete
- **Message**: "Habit Completed! ✅ Great job completing [Habit Name]! You're building a better you!"
- **Data**: Includes habit name and completion timestamp

### 4. Streak Milestones
- **Trigger**: When users reach streak milestones (7, 30, 100 days)
- **Message**: "X Day Milestone! 🏆 Congratulations! You've maintained [Habit Name] for X days!"
- **Data**: Includes milestone number and habit name

### 5. Daily Morning Reminder
- **Trigger**: Daily at 8:00 AM UTC
- **Message**: "Your Habits Await! 📋 You have X habit(s) scheduled for today. Let's make today count!"
- **Data**: Includes habit count and habit IDs

### 6. Weekly Progress Report
- **Trigger**: Every Sunday at 9:00 AM UTC
- **Message**: "Weekly Progress Report 📊 You completed X/Y habits this week (Z% success rate)!"
- **Data**: Includes completion statistics

### 7. Motivation Boost
- **Trigger**: Random times during the day
- **Message**: Various motivational messages
- **Data**: Includes timestamp

### 8. Habit Time Reminder
- **Trigger**: When it's time for a specific habit
- **Message**: "Time for [Habit Name]! ⏰ It's time to complete your habit. Don't let this moment slip away!"
- **Data**: Includes habit name and target time

### 9. Streak at Risk
- **Trigger**: Daily at 10:00 PM UTC for habits at risk
- **Message**: "Your Streak is at Risk! ⚠️ Don't break your X-day streak with [Habit Name]! Complete it now!"
- **Data**: Includes current streak and habit name

## 🛠️ React Native Integration

### 1. Install Firebase in React Native

```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
```

### 2. Request Permissions

```javascript
import messaging from '@react-native-firebase/messaging';

async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}
```

### 3. Get FCM Token

```javascript
async function getFCMToken() {
  const fcmToken = await messaging().getToken();
  console.log('FCM Token:', fcmToken);
  
  // Send token to backend
  await updateFCMToken(fcmToken);
  return fcmToken;
}
```

### 4. Handle Notifications

```javascript
// Foreground messages
messaging().onMessage(async remoteMessage => {
  console.log('Received foreground message:', remoteMessage);
  // Show local notification
});

// Background messages
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Received background message:', remoteMessage);
});

// Notification opened
messaging().onNotificationOpenedApp(remoteMessage => {
  console.log('Notification opened app:', remoteMessage);
  // Navigate to appropriate screen based on notification type
});
```

### 5. Update FCM Token on Backend

```javascript
const updateFCMToken = async (fcmToken) => {
  try {
    const response = await fetch('/api/v1/notifications/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ fcmToken })
    });
    
    const data = await response.json();
    console.log('FCM token updated:', data);
  } catch (error) {
    console.error('Error updating FCM token:', error);
  }
};
```

## 🔧 Configuration

### Timezone Configuration
All scheduled notifications use UTC timezone. To change to local timezone:

```javascript
// In scheduledNotificationService.js
const job = cron.schedule('0 8 * * *', async () => {
  // Your notification logic
}, {
  timezone: 'America/New_York' // Change to your timezone
});
```

### Notification Channels (Android)
The system uses the channel ID `habit-notifications`. You can customize this in the notification service.

### Sound and Badge Configuration
- **Sound**: Uses default notification sound
- **Badge**: Increments badge count for iOS
- **Priority**: High priority for Android

## 🚨 Error Handling

The notification system includes comprehensive error handling:

1. **Firebase Initialization Errors** - Logged but doesn't crash the app
2. **Notification Send Errors** - Logged but doesn't affect main functionality
3. **Missing FCM Tokens** - Gracefully handled
4. **Invalid User IDs** - Proper error responses

## 📈 Monitoring

### Logs to Monitor
- Firebase initialization status
- Notification send success/failure rates
- Scheduled job execution status
- FCM token registration/removal

### Metrics to Track
- Notification delivery rates
- User engagement with notifications
- Notification preference changes
- Error rates by notification type

## 🔒 Security Considerations

1. **FCM Token Validation** - Tokens are validated before sending
2. **User Authorization** - All notification endpoints require authentication
3. **Rate Limiting** - Consider implementing rate limiting for notification endpoints
4. **Data Privacy** - Only necessary data is included in notifications

## 🧪 Testing

### Test Notifications
Use the test endpoint to verify notification setup:

```bash
curl -X POST http://localhost:5000/api/v1/notifications/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Manual Testing
You can manually trigger notifications for testing:

```javascript
const notificationService = require('./services/notificationService');

// Test different notification types
await notificationService.sendHabitCreationNotification(userId, habit);
await notificationService.sendStreakNotification(userId, habit, 7);
await notificationService.sendMotivationNotification(userId, "Test motivation message");
```

## 📝 Future Enhancements

1. **Rich Notifications** - Add images and action buttons
2. **Notification Templates** - Customizable notification messages
3. **Smart Timing** - AI-powered optimal notification timing
4. **Notification Analytics** - Track notification effectiveness
5. **A/B Testing** - Test different notification strategies
6. **User Segmentation** - Different notifications for different user types
7. **Notification Preferences** - Granular control over notification types
8. **Silent Notifications** - Background data updates without user notification

## 🤝 Support

For issues with the notification system:

1. Check Firebase Console for delivery status
2. Verify FCM token registration
3. Check server logs for error messages
4. Test with the test notification endpoint
5. Verify environment variables are correctly set

## 📚 Additional Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [React Native Firebase Documentation](https://rnfirebase.io/messaging/usage)
- [Node-Cron Documentation](https://github.com/node-cron/node-cron)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup) 