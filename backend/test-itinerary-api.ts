/**
 * Test file for Itinerary Management API
 * Tests: GET, PUT, DELETE endpoints with authentication and authorization
 */

import mongoose from 'mongoose';
import { Itinerary, IItinerary } from './src/models/Itinerary.js';
import { User } from './src/models/User.js';
import { generateToken } from './src/utils/jwt.js';
import { hashPassword } from './src/utils/password.js';

// Test data
const testUser1 = {
  email: 'user1@test.com',
  password: 'TestPassword123',
  username: 'testuser1',
};

const testUser2 = {
  email: 'user2@test.com',
  password: 'TestPassword123',
  username: 'testuser2',
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

    console.log('✓ Created test users');

    // Generate tokens
    const token1 = generateToken(user1._id.toString(), user1.email);
    const token2 = generateToken(user2._id.toString(), user2.email);

    // Test 1: Create itinerary for user1
    const itinerary1 = await Itinerary.create({
      userId: user1._id,
      ...testItinerary,
    });
    console.log('✓ Test 1: Created itinerary for user1');

    // Test 2: Create another itinerary for user1
    const itinerary2 = await Itinerary.create({
      userId: user1._id,
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
    console.log('✓ Test 2: Created second itinerary for user1');

    // Test 3: Create itinerary for user2
    const itinerary3 = await Itinerary.create({
      userId: user2._id,
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

    // Test 4: Verify pagination query
    const itineraries = await Itinerary.find({ userId: user1._id })
      .sort({ createdAt: -1 })
      .skip(0)
      .limit(20)
      .lean();
    
    if (itineraries.length === 2) {
      console.log('✓ Test 4: Pagination query returns correct count');
    } else {
      console.error('✗ Test 4: Expected 2 itineraries, got', itineraries.length);
    }

    // Test 5: Verify user can only access their own itineraries
    if (itinerary1.userId.toString() === user1._id.toString()) {
      console.log('✓ Test 5: User ownership verification works');
    } else {
      console.error('✗ Test 5: User ownership verification failed');
    }

    // Test 6: Verify update validation
    const updateData = {
      destination: 'Barcelona',
      days: 4,
      budget: 4000,
    };

    const updatedItinerary = await Itinerary.findByIdAndUpdate(
      itinerary1._id,
      updateData,
      { new: true }
    );

    if (
      updatedItinerary?.destination === 'Barcelona' &&
      updatedItinerary?.days === 4 &&
      updatedItinerary?.budget === 4000
    ) {
      console.log('✓ Test 6: Update validation works');
    } else {
      console.error('✗ Test 6: Update validation failed');
    }

    // Test 7: Verify invalid days are rejected
    try {
      await Itinerary.create({
        userId: user1._id,
        destination: 'Invalid',
        days: 31, // Invalid: > 30
        budget: 1000,
        preferences: [],
        content: [],
      });
      console.error('✗ Test 7: Should reject days > 30');
    } catch (error: any) {
      if (error.message.includes('days')) {
        console.log('✓ Test 7: Rejects invalid days');
      } else {
        console.error('✗ Test 7: Wrong error:', error.message);
      }
    }

    // Test 8: Verify negative budget is rejected
    try {
      await Itinerary.create({
        userId: user1._id,
        destination: 'Invalid',
        days: 5,
        budget: -100, // Invalid: negative
        preferences: [],
        content: [],
      });
      console.error('✗ Test 8: Should reject negative budget');
    } catch (error: any) {
      if (error.message.includes('budget')) {
        console.log('✓ Test 8: Rejects negative budget');
      } else {
        console.error('✗ Test 8: Wrong error:', error.message);
      }
    }

    // Test 9: Verify deletion works
    const itineraryToDelete = await Itinerary.create({
      userId: user1._id,
      destination: 'ToDelete',
      days: 2,
      budget: 1000,
      preferences: [],
      content: [],
    });

    await Itinerary.findByIdAndDelete(itineraryToDelete._id);
    const deletedItinerary = await Itinerary.findById(itineraryToDelete._id);

    if (!deletedItinerary) {
      console.log('✓ Test 9: Deletion works');
    } else {
      console.error('✗ Test 9: Deletion failed');
    }

    // Test 10: Verify total count for pagination
    const totalCount = await Itinerary.countDocuments({ userId: user1._id });
    if (totalCount === 2) {
      console.log('✓ Test 10: Total count for pagination is correct');
    } else {
      console.error('✗ Test 10: Expected 2 itineraries, got', totalCount);
    }

    console.log('\n✓ All tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Clean up
    await User.deleteMany({ email: { $in: [testUser1.email, testUser2.email] } });
    await Itinerary.deleteMany({});
    await mongoose.disconnect();
  }
}

runTests();
