const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { expect } = require('chai');

// Test configuration
const BASE_URL = 'http://localhost:5000/api/v1/auth';

// Test suite for Authentication API
describe('Authentication API Tests', () => {
  // Test user data
  let testUser;
  let authToken = '';

  // Run before all tests
  before(() => {
    // Generate unique test data for each test run
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
  });

  // Test registration
  describe('POST /register', () => {
    it('should register a new user with valid data', async () => {
      const response = await axios.post(`${BASE_URL}/register`, testUser);
      
      expect(response.status).to.equal(201);
      expect(response.data).to.have.property('token');
      expect(response.data).to.have.property('user');
      expect(response.data.user).to.have.property('email', testUser.email);
      
      // Store the token for subsequent tests
      authToken = response.data.token;
    });

    it('should fail with 400 if required fields are missing', async () => {
      try {
        await axios.post(`${BASE_URL}/register`, { name: 'Incomplete User' });
        throw new Error('Should have failed with 400');
      } catch (error) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data).to.have.property('success', false);
        expect(error.response.data).to.have.property('error');
      }
    });

    it('should fail with 400 if passwords do not match', async () => {
      const invalidUser = { ...testUser, email: `test_${uuidv4().substring(0, 5)}@example.com`, confirmPassword: 'different' };
      
      try {
        await axios.post(`${BASE_URL}/register`, invalidUser);
        throw new Error('Should have failed with 400');
      } catch (error) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data).to.have.property('success', false);
        expect(error.response.data).to.have.property('error');
      }
    });
  });

  // Test login
  describe('POST /login', () => {
    it('should login with valid credentials', async () => {
      const response = await axios.post(`${BASE_URL}/login`, {
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('token');
      
      // Update the auth token
      authToken = response.data.token;
    });

    it('should fail with 401 for invalid credentials', async () => {
      try {
        await axios.post(`${BASE_URL}/login`, {
          email: testUser.email,
          password: 'wrongpassword',
        });
        throw new Error('Should have failed with 401');
      } catch (error) {
        expect(error.response.status).to.equal(401);
      }
    });
  });

  // Test protected route
  describe('GET /me', () => {
    it('should return user data with valid token', async () => {
      const response = await axios.get(`${BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('success', true);
      expect(response.data.data).to.have.property('_id');
      expect(response.data.data).to.have.property('email', testUser.email);
    });

    it('should fail with 500 without token', async () => {
      try {
        await axios.get(`${BASE_URL}/me`);
        throw new Error('Should have failed with 500');
      } catch (error) {
        expect(error.response.status).to.equal(500);
      }
    });
  });
});
