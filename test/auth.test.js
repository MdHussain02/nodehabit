const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Test configuration
const BASE_URL = 'http://localhost:5000/api/v1/auth';

// Generate a unique email for testing
const testEmail = `testuser_${uuidv4().substring(0, 8)}@example.com`;

// Test user data
const testUser = {
  name: 'Test User',
  email: testEmail,
  password: 'password123',
  confirmPassword: 'password123',
  height: 175,
  weight: 70,
  age: 25,
  gender: 'male',
  fitnessLevel: 'beginner',
  primaryGoal: 'weight-loss',
  wakeUpTime: '07:00',
  sleepTime: '23:00',
  preferredWorkoutTime: '18:00',
  notifications: true,
  motivationLevel: 'high',
  weeklyGoal: '4',
};

// Variable to store the auth token
let authToken = '';

// Test registration
const testRegistration = async () => {
  try {
    console.log('Testing registration...');
    const response = await axios.post(`${BASE_URL}/register`, testUser);
    
    console.log('✅ Registration successful!');
    console.log('User registered with ID:', response.data.user.id);
    
    // Store the token for the login test
    authToken = response.data.token;
    return true;
  } catch (error) {
    console.error('❌ Registration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
};

// Test login
const testLogin = async () => {
  try {
    console.log('\nTesting login...');
    const response = await axios.post(`${BASE_URL}/login`, {
      email: testUser.email,
      password: testUser.password,
    });
    
    console.log('✅ Login successful!');
    console.log('User token:', response.data.token);
    
    // Store the token for the protected route test
    authToken = response.data.token;
    return true;
  } catch (error) {
    console.error('❌ Login failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
};

// Test protected route
const testProtectedRoute = async () => {
  try {
    console.log('\nTesting protected route...');
    const response = await axios.get(`${BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    
    console.log('✅ Protected route accessed successfully!');
    console.log('User data:', response.data.data);
    return true;
  } catch (error) {
    console.error('❌ Failed to access protected route:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
};

// Run all tests
const runTests = async () => {
  console.log('🚀 Starting API tests...\n');
  
  // Run registration test
  const registrationSuccess = await testRegistration();
  
  // Only continue if registration was successful
  if (registrationSuccess) {
    // Run login test
    const loginSuccess = await testLogin();
    
    // Only test protected route if login was successful
    if (loginSuccess) {
      await testProtectedRoute();
    }
  }
  
  console.log('\n🏁 All tests completed!');
};

// Start the tests
runTests();
