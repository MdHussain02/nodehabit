# 🚀 Quick Start: NodeHabit Push Notifications

Get your push notification system up and running in 5 minutes!

## ⚡ Quick Setup

### 1. Install Dependencies
```bash
npm install firebase-admin node-cron
```

### 2. Setup Firebase
```bash
npm run setup-firebase
```
Follow the interactive prompts to configure Firebase.

### 3. Start the Server
```bash
npm run dev
```

### 4. Test Notifications
```bash
# Register FCM token
curl -X POST http://localhost:5000/api/v1/notifications/token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fcmToken": "test_token"}'

# Send test notification
curl -X POST http://localhost:5000/api/v1/notifications/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📱 React Native Integration

### 1. Install Firebase
```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
```

### 2. Request Permissions
```javascript
import messaging from '@react-native-firebase/messaging';

async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED;
  
  if (enabled) {
    const fcmToken = await messaging().getToken();
    await updateFCMToken(fcmToken);
  }
}
```

### 3. Handle Notifications
```javascript
// Foreground messages
messaging().onMessage(async remoteMessage => {
  console.log('Received notification:', remoteMessage);
});

// Background messages
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background notification:', remoteMessage);
});
```

## 🎯 Notification Types Available

- ✅ **AI Habit Suggestions** - New personalized habits
- ✅ **Incomplete Habits** - Daily reminders
- ✅ **Habit Completion** - Celebration notifications
- ✅ **Streak Milestones** - Achievement celebrations
- ✅ **Daily Reminders** - Morning/evening reminders
- ✅ **Weekly Progress** - Weekly summaries
- ✅ **Motivation Boost** - Random motivation
- ✅ **Time Reminders** - Specific habit times
- ✅ **Streak at Risk** - Warning notifications

## 🔧 Configuration

### Environment Variables
```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### Timezone (Optional)
Edit `src/services/scheduledNotificationService.js` to change timezone:
```javascript
timezone: 'America/New_York' // Change to your timezone
```

## 🧪 Testing

### Manual Testing
```javascript
const notificationService = require('./services/notificationService');

// Test different notifications
await notificationService.sendHabitCreationNotification(userId, habit);
await notificationService.sendStreakNotification(userId, habit, 7);
await notificationService.sendMotivationNotification(userId, "Test message");
```

### API Testing
```bash
# Test all notification endpoints
npm test test/notifications.test.js
```

## 📊 Monitoring

### Check Logs
- Firebase initialization status
- Notification send success/failure
- Scheduled job execution

### Firebase Console
- Go to Firebase Console > Cloud Messaging
- Check message delivery status
- Monitor token registration

## 🆘 Troubleshooting

### Common Issues

1. **Firebase not initialized**
   - Check environment variables
   - Verify service account JSON

2. **Notifications not sending**
   - Check FCM token registration
   - Verify user notification preferences

3. **Scheduled notifications not working**
   - Check server timezone
   - Verify cron job status

### Debug Commands
```bash
# Check notification preferences
curl -X GET http://localhost:5000/api/v1/notifications/preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test notification
curl -X POST http://localhost:5000/api/v1/notifications/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📚 Next Steps

1. **Read Full Documentation**: `NOTIFICATIONS_README.md`
2. **Customize Notifications**: Edit `src/services/notificationService.js`
3. **Add Rich Notifications**: Implement images and action buttons
4. **Analytics**: Track notification effectiveness
5. **A/B Testing**: Test different notification strategies

## 🎉 You're Ready!

Your NodeHabit app now has a comprehensive push notification system! 

- ✅ Firebase configured
- ✅ Notifications integrated
- ✅ Scheduled reminders active
- ✅ React Native ready

Start building amazing user experiences with personalized, timely notifications! 🚀 