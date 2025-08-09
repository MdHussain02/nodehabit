const axios = require('axios');

async function testScheduledNotifications() {
  try {
    console.log('🧪 Testing Scheduled Notifications...\n');

    // First, register a test user
    console.log('1. Registering test user...');
    const registerResponse = await axios.post('http://localhost:5000/api/v1/auth/register', {
      name: 'Scheduled Test User',
      email: 'scheduled-test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      height: 170,
      weight: 70,
      age: 25,
      gender: 'male',
      fitnessLevel: 'beginner',
      primaryGoal: 'general-fitness',
      wakeUpTime: '07:00',
      sleepTime: '23:00',
      preferredWorkoutTime: '18:00',
      motivationLevel: 'medium'
    });
    
    const token = registerResponse.data.token;
    console.log('✅ User registered successfully\n');

    // Set FCM token
    console.log('2. Setting FCM token...');
    await axios.post('http://localhost:5000/api/v1/notifications/token', {
      fcmToken: 'test_fcm_token_scheduled'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ FCM token set successfully\n');

    // Check jobs status
    console.log('3. Checking scheduled jobs status...');
    const jobsStatusResponse = await axios.get('http://localhost:5000/api/v1/notifications/jobs-status', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('📊 Jobs Status:', JSON.stringify(jobsStatusResponse.data.data, null, 2));
    console.log('✅ Jobs status retrieved\n');

    // Trigger manual test notification
    console.log('4. Triggering manual test notification...');
    const triggerResponse = await axios.post('http://localhost:5000/api/v1/notifications/trigger-test', {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('📱 Manual Test Result:', JSON.stringify(triggerResponse.data.data, null, 2));
    console.log('✅ Manual test notification triggered\n');

    console.log('🎉 Test completed successfully!');
    console.log('\n📝 What happens next:');
    console.log('- Test notifications will be sent every 2 minutes automatically');
    console.log('- You can stop them using: POST /api/v1/notifications/stop-test');
    console.log('- You can start them again using: POST /api/v1/notifications/start-test');
    console.log('- Check status using: GET /api/v1/notifications/jobs-status');

  } catch (error) {
    console.error('❌ Error:', error.response ? error.response.data : error.message);
  }
}

testScheduledNotifications(); 