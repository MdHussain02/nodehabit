const { expect } = require('chai');
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1/choices';

describe('Choices API Tests', () => {
  it('should return all profile choices', async () => {
    const response = await axios.get(BASE_URL);
    
    expect(response.status).to.equal(200);
    expect(response.data).to.have.property('status', true);
    expect(response.data).to.have.property('message', 'Profile choices fetched');
    expect(response.data).to.have.property('data');
    
    // Check if all expected categories are present
    const { data } = response.data;
    expect(data).to.have.all.keys([
      'gender',
      'fitness_level',
      'motivation_level',
      'preferred_workout_time',
      'primary_goal'
    ]);
    
    // Check if each category has the expected structure
    Object.values(data).forEach(category => {
      expect(category).to.be.an('array');
      category.forEach(item => {
        expect(item).to.have.property('value');
        expect(item).to.have.property('label');
      });
    });
  });
});
