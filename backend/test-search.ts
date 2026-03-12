import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import mongoose from 'mongoose';
import { SearchService } from './src/services/searchService.js';
import { Destination } from './src/models/Destination.js';
import { Itinerary } from './src/models/Itinerary.js';
import { Conversation } from './src/models/Conversation.js';
import { User } from './src/models/User.js';

async function testSearch() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-assistant-dev');
    console.log('✓ Connected to MongoDB');

    const searchService = new SearchService();

    // Test 1: Search destinations
    console.log('\n--- Test 1: Search Destinations ---');
    const destinations = await searchService.searchDestinations('东京');
    console.log(`Found ${destinations.length} destinations matching "东京"`);
    if (destinations.length > 0) {
      console.log(`First result: ${destinations[0].name}`);
    }

    // Test 2: Global search
    console.log('\n--- Test 2: Global Search ---');
    const results = await searchService.search('东京');
    console.log(`Total results: ${results.total}`);
    console.log(`- Destinations: ${results.destinations.length}`);
    console.log(`- Itineraries: ${results.itineraries.length}`);
    console.log(`- Conversations: ${results.conversations.length}`);

    // Test 3: Search with type filter
    console.log('\n--- Test 3: Search with Type Filter ---');
    const destOnly = await searchService.search('东京', undefined, { type: 'destination' });
    console.log(`Destination-only results: ${destOnly.total}`);

    // Test 4: Empty search validation
    console.log('\n--- Test 4: Empty Search Validation ---');
    try {
      await searchService.search('');
      console.log('✗ Should have thrown error for empty search');
    } catch (error: any) {
      console.log(`✓ Correctly rejected empty search: ${error.message}`);
    }

    // Test 5: Search timeout (should complete within 2 seconds)
    console.log('\n--- Test 5: Search Timeout Test ---');
    const startTime = Date.now();
    const timeoutResults = await searchService.search('test');
    const duration = Date.now() - startTime;
    console.log(`Search completed in ${duration}ms (should be < 2000ms)`);
    if (duration < 2000) {
      console.log('✓ Search completed within timeout');
    } else {
      console.log('✗ Search exceeded timeout');
    }

    console.log('\n✓ All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testSearch();
