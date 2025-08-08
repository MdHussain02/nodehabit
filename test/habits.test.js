const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { expect } = require('chai');

// Test configuration
const BASE_URL = 'http://localhost:5000/api/v1/habits';

// Test suite for Habits API
describe('Habits API Tests', () => {
  let authToken;
  let testHabit;

  // Run before all tests
  before(async () => {
    // Create a test user and get auth token
    const testEmail = `testuser_${uuidv4().substring(0, 8)}@example.com`;
    
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

    // Register user and get token
    const registerResponse = await axios.post('http://localhost:5000/api/v1/auth/register', testUser);
    authToken = registerResponse.data.token;

    // Create a test habit
    testHabit = {
      name: 'Morning Exercise',
      created_time: new Date().toISOString(),
      target_time: new Date().toISOString(),
      icon_id: 1,
      repeats: [0, 1, 2, 3, 4] // Monday to Friday
    };
  });

  // Test habit creation
  describe('POST /habits', () => {
    it('should create a new habit with valid data', async () => {
      const response = await axios.post(BASE_URL, testHabit, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).to.equal(201);
      expect(response.data).to.have.property('success', true);
      expect(response.data).to.have.property('data');
      expect(response.data.data).to.have.property('name', 'Morning Exercise');
      expect(response.data.data).to.have.property('user');
      expect(response.data.data).to.have.property('_id'); // MongoDB auto-generated ID
    });

    it('should fail with 401 when no token is provided', async () => {
      try {
        await axios.post(BASE_URL, testHabit);
        throw new Error('Should have failed with 401');
      } catch (error) {
        expect(error.response.status).to.equal(401);
      }
    });

    it('should fail with 400 when required fields are missing', async () => {
      const invalidHabit = { name: 'Test Habit' }; // Missing required fields

      try {
        await axios.post(BASE_URL, invalidHabit, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        throw new Error('Should have failed with 400');
      } catch (error) {
        expect(error.response.status).to.equal(400);
      }
    });
  });

  // Test getting all habits
  describe('GET /habits', () => {
    it('should get all habits for authenticated user', async () => {
      const response = await axios.get(BASE_URL, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('success', true);
      expect(response.data).to.have.property('count');
      expect(response.data).to.have.property('data');
      expect(Array.isArray(response.data.data)).to.be.true;
    });

    it('should fail with 401 when no token is provided', async () => {
      try {
        await axios.get(BASE_URL);
        throw new Error('Should have failed with 401');
      } catch (error) {
        expect(error.response.status).to.equal(401);
      }
    });
  });

  // Test getting specific habit
  describe('GET /habits/:id', () => {
    it('should get a specific habit by ID', async () => {
      // First create a habit to get its ID
      const createResponse = await axios.post(BASE_URL, {
        name: 'Test Habit for GET',
        created_time: new Date().toISOString(),
        target_time: new Date().toISOString(),
        icon_id: 2,
        repeats: [1, 3, 5]
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const habitId = createResponse.data.data._id;

      // Now get the specific habit
      const response = await axios.get(`${BASE_URL}/${habitId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('success', true);
      expect(response.data).to.have.property('data');
      expect(response.data.data).to.have.property('_id', habitId);
      expect(response.data.data).to.have.property('name', 'Test Habit for GET');
    });

    it('should fail with 404 when habit not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId format but doesn't exist

      try {
        await axios.get(`${BASE_URL}/${fakeId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        throw new Error('Should have failed with 404');
      } catch (error) {
        expect(error.response.status).to.equal(404);
      }
    });
  });
}); 