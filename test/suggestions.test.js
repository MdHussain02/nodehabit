const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { expect } = require('chai');

// Test configuration
const BASE_URL = 'http://localhost:5000/api/v1/suggestions';

// Mock Gemini API key for testing
process.env.GEMINI_API_KEY = 'test-key';

// Test suite for Suggestions API
describe('Suggestions API Tests', () => {
  let authToken;
  let testUser;

  // Run before all tests
  before(async () => {
    // Create a test user and get auth token
    const testEmail = `testuser_${uuidv4().substring(0, 8)}@example.com`;

    testUser = {
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
  });

  // Test getting habit suggestions
  describe('GET /suggestions', () => {
    it('should get personalized habit suggestions', async () => {
      const response = await axios.get(BASE_URL, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('success', true);
      expect(response.data).to.have.property('data');
      expect(response.data.data).to.have.property('suggestions');
      expect(response.data.data).to.have.property('userProfile');
      expect(Array.isArray(response.data.data.suggestions)).to.be.true;
    });

    it('should get suggestions with custom parameters', async () => {
      const response = await axios.get(`${BASE_URL}?maxSuggestions=3&focusArea=fitness`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).to.equal(200);
      expect(response.data.data).to.have.property('options');
      expect(response.data.data.options).to.have.property('maxSuggestions', 3);
      expect(response.data.data.options).to.have.property('focusArea', 'fitness');
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

  // Test getting habit analysis
  describe('GET /suggestions/analysis', () => {
    it('should get habit analysis and insights', async () => {
      const response = await axios.get(`${BASE_URL}/analysis`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('success', true);
      expect(response.data.data).to.have.property('analysis');
      expect(response.data.data).to.have.property('metrics');
      expect(response.data.data.analysis).to.have.property('strengths');
      expect(response.data.data.analysis).to.have.property('gaps');
      expect(response.data.data.analysis).to.have.property('recommendations');
    });

    it('should fail with 401 when no token is provided', async () => {
      try {
        await axios.get(`${BASE_URL}/analysis`);
        throw new Error('Should have failed with 401');
      } catch (error) {
        expect(error.response.status).to.equal(401);
      }
    });
  });

  // Test getting category-specific suggestions
  describe('GET /suggestions/category/:category', () => {
    it('should get fitness category suggestions', async () => {
      const response = await axios.get(`${BASE_URL}/category/fitness`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).to.equal(200);
      expect(response.data.data).to.have.property('category', 'fitness');
      expect(response.data.data).to.have.property('suggestions');
      expect(Array.isArray(response.data.data.suggestions)).to.be.true;
    });

    it('should get nutrition category suggestions', async () => {
      const response = await axios.get(`${BASE_URL}/category/nutrition`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).to.equal(200);
      expect(response.data.data).to.have.property('category', 'nutrition');
    });

    it('should fail with 400 for invalid category', async () => {
      try {
        await axios.get(`${BASE_URL}/category/invalid-category`, {
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

  // Test getting goal-based suggestions
  describe('GET /suggestions/goal/:goal', () => {
    it('should get weight-loss goal suggestions', async () => {
      const response = await axios.get(`${BASE_URL}/goal/weight-loss`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).to.equal(200);
      expect(response.data.data).to.have.property('goal', 'weight-loss');
      expect(response.data.data).to.have.property('suggestions');
      expect(response.data.data).to.have.property('goalAlignment');
    });

    it('should get muscle-gain goal suggestions', async () => {
      const response = await axios.get(`${BASE_URL}/goal/muscle-gain`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).to.equal(200);
      expect(response.data.data).to.have.property('goal', 'muscle-gain');
    });

    it('should fail with 400 for invalid goal', async () => {
      try {
        await axios.get(`${BASE_URL}/goal/invalid-goal`, {
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

  // Test creating habit from suggestion
  describe('POST /suggestions/create', () => {
    it('should create a habit from suggestion', async () => {
      const habitData = {
        name: 'Morning Stretching',
        target_time: new Date().toISOString(),
        icon_id: 1,
        repeats: [0, 1, 2, 3, 4],
        description: 'Created from AI suggestion'
      };

      const response = await axios.post(`${BASE_URL}/create`, habitData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).to.equal(201);
      expect(response.data).to.have.property('success', true);
      expect(response.data.data).to.have.property('habit');
      expect(response.data.data.habit).to.have.property('name', 'Morning Stretching');
      expect(response.data.data.habit).to.have.property('_id');
    });

    it('should fail with 400 when required fields are missing', async () => {
      const invalidHabit = {
        name: 'Test Habit'
        // Missing required fields
      };

      try {
        await axios.post(`${BASE_URL}/create`, invalidHabit, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        throw new Error('Should have failed with 400');
      } catch (error) {
        expect(error.response.status).to.equal(400);
      }
    });

    it('should fail with 401 when no token is provided', async () => {
      const habitData = {
        name: 'Test Habit',
        target_time: new Date().toISOString(),
        icon_id: 1,
        repeats: [0, 1, 2]
      };

      try {
        await axios.post(`${BASE_URL}/create`, habitData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        throw new Error('Should have failed with 401');
      } catch (error) {
        expect(error.response.status).to.equal(401);
      }
    });
  });
}); 