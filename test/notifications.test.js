// Set test environment
process.env.NODE_ENV = 'test';

const axios = require('axios');
const { expect } = require('chai');

const BASE_URL = 'http://localhost:5000/api/v1/notifications';
let authToken;
let userId;

describe('Notifications API Tests', () => {
  before(async () => {
    // Login to get auth token
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      authToken = loginResponse.data.token;
      userId = loginResponse.data.user._id;
    } catch (error) {
      // If login fails, register a new user
      const registerResponse = await axios.post('http://localhost:5000/api/v1/auth/register', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
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
      authToken = registerResponse.data.token;
      userId = registerResponse.data.user._id;
    }
  });

  describe('POST /notifications/token', () => {
    it('should update FCM token successfully', async () => {
      const fcmToken = 'test_fcm_token_' + Date.now();
      
      const response = await axios.post(`${BASE_URL}/token`, {
        fcmToken
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('success', true);
      expect(response.data.data).to.have.property('message', 'FCM token updated successfully');
      expect(response.data.data.user).to.have.property('id');
    });

    it('should fail with 400 when FCM token is missing', async () => {
      try {
        await axios.post(`${BASE_URL}/token`, {}, {
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
      try {
        await axios.post(`${BASE_URL}/token`, {
          fcmToken: 'test_token'
        }, {
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

  describe('DELETE /notifications/token', () => {
    it('should remove FCM token successfully', async () => {
      const response = await axios.delete(`${BASE_URL}/token`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('success', true);
      expect(response.data.data).to.have.property('message', 'FCM token removed successfully');
    });

    it('should fail with 401 when no token is provided', async () => {
      try {
        await axios.delete(`${BASE_URL}/token`);
        throw new Error('Should have failed with 401');
      } catch (error) {
        expect(error.response.status).to.equal(401);
      }
    });
  });

  describe('PUT /notifications/preferences', () => {
    it('should update notification preferences successfully', async () => {
      const response = await axios.put(`${BASE_URL}/preferences`, {
        notifications: false
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('success', true);
      expect(response.data.data).to.have.property('message', 'Notification preferences updated successfully');
      expect(response.data.data.user).to.have.property('notifications', false);
    });

    it('should fail with 400 when notifications is not boolean', async () => {
      try {
        await axios.put(`${BASE_URL}/preferences`, {
          notifications: 'not_boolean'
        }, {
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
      try {
        await axios.put(`${BASE_URL}/preferences`, {
          notifications: true
        }, {
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

  describe('GET /notifications/preferences', () => {
    it('should get notification preferences successfully', async () => {
      const response = await axios.get(`${BASE_URL}/preferences`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('success', true);
      expect(response.data.data).to.have.property('notifications');
      expect(response.data.data).to.have.property('fcmToken');
    });

    it('should fail with 401 when no token is provided', async () => {
      try {
        await axios.get(`${BASE_URL}/preferences`);
        throw new Error('Should have failed with 401');
      } catch (error) {
        expect(error.response.status).to.equal(401);
      }
    });
  });

  describe('POST /notifications/test', () => {
    beforeEach(async () => {
      // Ensure FCM token is set for testing
      await axios.post(`${BASE_URL}/token`, {
        fcmToken: 'test_fcm_token_for_testing'
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
    });

    it('should send test notification successfully', async () => {
      const response = await axios.post(`${BASE_URL}/test`, {}, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('success', true);
      expect(response.data.data).to.have.property('message', 'Test notification sent successfully');
      expect(response.data.data).to.have.property('messageId');
    });

    it('should fail with 400 when FCM token is not registered', async () => {
      // Remove FCM token first
      await axios.delete(`${BASE_URL}/token`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      try {
        await axios.post(`${BASE_URL}/test`, {}, {
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
      try {
        await axios.post(`${BASE_URL}/test`, {}, {
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

  describe('Integration Tests', () => {
    it('should handle complete notification flow', async () => {
      // 1. Set FCM token
      const fcmToken = 'integration_test_token_' + Date.now();
      await axios.post(`${BASE_URL}/token`, {
        fcmToken
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      // 2. Enable notifications
      await axios.put(`${BASE_URL}/preferences`, {
        notifications: true
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      // 3. Verify preferences
      const preferencesResponse = await axios.get(`${BASE_URL}/preferences`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(preferencesResponse.data.data.notifications).to.be.true;
      expect(preferencesResponse.data.data.fcmToken).to.equal('registered');

      // 4. Send test notification
      const testResponse = await axios.post(`${BASE_URL}/test`, {}, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      expect(testResponse.data.success).to.be.true;

      // 5. Disable notifications
      await axios.put(`${BASE_URL}/preferences`, {
        notifications: false
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      // 6. Remove FCM token
      await axios.delete(`${BASE_URL}/token`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
    });
  });
}); 