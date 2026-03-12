/**
 * Integration test for Itinerary API endpoints
 * Tests HTTP endpoints with authentication and authorization
 */

import axios, { AxiosInstance } from 'axios';
import mongoose from 'mongoose';
import { User } from './src/models/User.js';
import { Itinerary } from './src/models/Itinerary.js';
import { hashPassword } from './src/utils/password.js';
import { generateToken } from './src/utils/jwt.js';

const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser1 = {
  email: 'endpoint-test-user1@test.com',
  password: 'TestPassword123',
  username: 'endpointtestuser1',
};

const testUser2 = {
  email: 'endpoint-test-user2@test.com',
  password: 'TestPassword123',
  username: 'endpointtestuser2',
};

const testItinerary = {
  destination: 'Paris',
  days: 5,
  budget: 5000,
  preferences: ['culture', 'food'],
  content: [
    {
      day: 1,
      activities: [
        {
          time: '09:00',
          name: 'Eiffel Tower',
          description: 'Visit the iconic Eiffel Tower',
          location: 'Champ de Mars',
          cost: 50,
          duration: '2 hours',
        },
      ],
      meals: [
        {
          type: 'lunch' as const,
          restaurant: 'Cafe de Flore',
          cuisine: 'French',
          estimatedCost: 30,
        },
      ],
      accommodation: 'Hotel Le Marais',
      dailyBudget: 500,
    },
  ],
};

async function runTests() {
  let user1Id: string;
  let user2Id: string;
  let token1: string;
  let token2: string;
  let itinerary1Id: string;
  let itinerary2Id: string;

  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-travel-assistant-test';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // Clean up test data
    await User.deleteMany({ email: { $in: [testUser1.email, testUser2.email] } });
    await Itinerary.deleteMany({});
    console.log('✓ Cleaned up test data');

    // Create test users
    const hashedPassword1 = await hashPassword(testUser1.password);
    const hashedPassword2 = await hashPassword(testUser2.password);

    const user1 = await User.create({
      email: testUser1.email,
      password: hashedPassword1,
      username: testUser1.username,
    });

    const user2 = await User.create({
      email: testUser2.email,
      password: hashedPassword2,
      username: testUser2.username,
    });

    user1Id = user1._id.toString();
    user2Id = user2._id.toString();

    // Generate tokens
    token1 = generateToken(user1Id, user1.email);
    token2 = generateToken(user2Id, user2.email);

    console.log('✓ Created test users and tokens');

    // Create axios instances with auth headers
    const client1 = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        Authorization: `Bearer ${token1}`,
      },
    });

    const client2 = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        Authorization: `Bearer ${token2}`,
      },
    });

    // Test 1: Create itinerary for user1
    const createResponse1 = await Itinerary.create({
      userId: user1Id,
      ...testItinerary,
    });
    itinerary1Id = createResponse1._id.toString();
    console.log('✓ Test 1: Created itinerary for user1');

    // Test 2: Create second itinerary for user1
    const createResponse2 = await Itinerary.create({
      userId: user1Id,
      destination: 'Tokyo',
      days: 7,
      budget: 8000,
      preferences: ['food', 'technology'],
      content: [
        {
          day: 1,
          activities: [],
          meals: [],
          dailyBudget: 1000,
        },
      ],
    });
    itinerary2Id = createResponse2._id.toString();
    console.log('✓ Test 2: Created second itinerary for user1');

    // Test 3: Create itinerary for user2
    const createResponse3 = await Itinerary.create({
      userId: user2Id,
      destination: 'Rome',
      days: 3,
      budget: 3000,
      preferences: ['history'],
      content: [
        {
          day: 1,
          activities: [],
          meals: [],
          dailyBudget: 1000,
        },
      ],
    });
    console.log('✓ Test 3: Created itinerary for user2');

    // Test 4: GET /api/itineraries - Get list with pagination
    const listResponse = await client1.get('/itineraries?page=1&pageSize=20');
    if (
      listResponse.status === 200 &&
      listResponse.data.status === 'success' &&
      listResponse.data.data.items.length === 2 &&
      listResponse.data.data.total === 2 &&
      listResponse.data.data.page === 1 &&
      listResponse.data.data.pageSize === 20
    ) {
      console.log('✓ Test 4: GET /api/itineraries returns paginated list');
    } else {
      console.error('✗ Test 4: Unexpected response:', listResponse.data);
    }

    // Test 5: GET /api/itineraries/:id - Get specific itinerary
    const getResponse = await client1.get(`/itineraries/${itinerary1Id}`);
    if (
      getResponse.status === 200 &&
      getResponse.data.status === 'success' &&
      getResponse.data.data._id === itinerary1Id &&
      getResponse.data.data.destination === 'Paris'
    ) {
      console.log('✓ Test 5: GET /api/itineraries/:id returns specific itinerary');
    } else {
      console.error('✗ Test 5: Unexpected response:', getResponse.data);
    }

    // Test 6: PUT /api/itineraries/:id - Update itinerary
    const updateResponse = await client1.put(`/itineraries/${itinerary1Id}`, {
      destination: 'Barcelona',
      days: 4,
      budget: 4000,
    });
    if (
      updateResponse.status === 200 &&
      updateResponse.data.status === 'success' &&
      updateResponse.data.data.destination === 'Barcelona' &&
      updateResponse.data.data.days === 4 &&
      updateResponse.data.data.budget === 4000
    ) {
      console.log('✓ Test 6: PUT /api/itineraries/:id updates itinerary');
    } else {
      console.error('✗ Test 6: Unexpected response:', updateResponse.data);
    }

    // Test 7: Authorization check - user2 cannot access user1's itinerary
    try {
      await client2.get(`/itineraries/${itinerary1Id}`);
      console.error('✗ Test 7: Should deny access to other user\'s itinerary');
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.log('✓ Test 7: Authorization check prevents access to other user\'s itinerary');
      } else {
        console.error('✗ Test 7: Wrong error status:', error.response?.status);
      }
    }

    // Test 8: Authorization check - user2 cannot update user1's itinerary
    try {
      await client2.put(`/itineraries/${itinerary1Id}`, {
        destination: 'London',
      });
      console.error('✗ Test 8: Should deny update to other user\'s itinerary');
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.log('✓ Test 8: Authorization check prevents update to other user\'s itinerary');
      } else {
        console.error('✗ Test 8: Wrong error status:', error.response?.status);
      }
    }

    // Test 9: Authorization check - user2 cannot delete user1's itinerary
    try {
      await client2.delete(`/itineraries/${itinerary1Id}`);
      console.error('✗ Test 9: Should deny deletion of other user\'s itinerary');
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.log('✓ Test 9: Authorization check prevents deletion of other user\'s itinerary');
      } else {
        console.error('✗ Test 9: Wrong error status:', error.response?.status);
      }
    }

    // Test 10: DELETE /api/itineraries/:id - Delete itinerary
    const deleteResponse = await client1.delete(`/itineraries/${itinerary2Id}`);
    if (deleteResponse.status === 200 && deleteResponse.data.status === 'success') {
      console.log('✓ Test 10: DELETE /api/itineraries/:id deletes itinerary');
    } else {
      console.error('✗ Test 10: Unexpected response:', deleteResponse.data);
    }

    // Test 11: Verify deleted itinerary is gone
    try {
      await client1.get(`/itineraries/${itinerary2Id}`);
      console.error('✗ Test 11: Should return 404 for deleted itinerary');
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('✓ Test 11: Deleted itinerary returns 404');
      } else {
        console.error('✗ Test 11: Wrong error status:', error.response?.status);
      }
    }

    // Test 12: Unauthenticated request should fail
    try {
      await axios.get(`${API_BASE_URL}/itineraries`);
      console.error('✗ Test 12: Should deny unauthenticated request');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('✓ Test 12: Unauthenticated request returns 401');
      } else {
        console.error('✗ Test 12: Wrong error status:', error.response?.status);
      }
    }

    // Test 13: Invalid pagination parameters
    const invalidPageResponse = await client1.get('/itineraries?page=0&pageSize=0');
    if (
      invalidPageResponse.status === 200 &&
      invalidPageResponse.data.data.page >= 1 &&
      invalidPageResponse.data.data.pageSize >= 1
    ) {
      console.log('✓ Test 13: Invalid pagination parameters are corrected');
    } else {
      console.error('✗ Test 13: Unexpected response:', invalidPageResponse.data);
    }

    // Test 14: Update with invalid data
    try {
      await client1.put(`/itineraries/${itinerary1Id}`, {
        days: 31, // Invalid: > 30
      });
      console.error('✗ Test 14: Should reject invalid days');
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log('✓ Test 14: Invalid update data is rejected');
      } else {
        console.error('✗ Test 14: Wrong error status:', error.response?.status);
      }
    }

    // Test 15: Update with negative budget
    try {
      await client1.put(`/itineraries/${itinerary1Id}`, {
        budget: -100,
      });
      console.error('✗ Test 15: Should reject negative budget');
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log('✓ Test 15: Negative budget is rejected');
      } else {
        console.error('✗ Test 15: Wrong error status:', error.response?.status);
      }
    }

    console.log('\n✓ All endpoint tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Clean up
    await User.deleteMany({ email: { $in: [testUser1.email, testUser2.email] } });
    await Itinerary.deleteMany({});
    await mongoose.disconnect();
  }
}

// Wait for server to be ready
setTimeout(runTests, 2000);
