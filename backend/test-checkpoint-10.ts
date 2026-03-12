/**
 * Checkpoint 10 - Backend Core Functionality Verification
 * 
 * This script verifies:
 * 1. AI问答功能 (AI Chat)
 * 2. 攻略生成功能 (Itinerary Generation)
 * 3. 目的地管理功能 (Destination Management)
 * 4. 收藏功能 (Collection Management)
 * 5. API端点响应正确性
 * 6. 错误处理和边界情况
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];
let authToken: string = '';
let testUserId: string = '';
let testConversationId: string = '';
let testItineraryId: string = '';
let testDestinationId: string = '';
let testCollectionId: string = '';

// Helper functions
function logTest(name: string, passed: boolean, message: string, details?: any) {
  results.push({ name, passed, message, details });
  const status = passed ? '✓' : '✗';
  console.log(`${status} ${name}: ${message}`);
  if (details && !passed) {
    console.log('  Details:', JSON.stringify(details, null, 2));
  }
}

function setAuthToken(token: string) {
  authToken = token;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// 1. Health Check and Server Connectivity
// ============================================================================

async function testHealthCheck() {
  try {
    const response = await api.get('/health');
    const passed = response.status === 200 && response.data.status === 'ok';
    logTest(
      '1.1 Health Check',
      passed,
      passed ? 'Server is healthy' : 'Server health check failed',
      response.data
    );
    return passed;
  } catch (error) {
    logTest('1.1 Health Check', false, 'Failed to connect to server', error);
    return false;
  }
}

// ============================================================================
// 2. Authentication System Tests
// ============================================================================

async function testAuthSystem() {
  const timestamp = Date.now();
  const testEmail = `test${timestamp}@example.com`;
  const testPassword = 'Test1234';
  const testUsername = `TestUser${timestamp}`;

  // 2.1 User Registration
  try {
    const response = await api.post('/api/auth/register', {
      email: testEmail,
      password: testPassword,
      username: testUsername,
    });
    
    const passed = response.status === 201 && response.data.status === 'success' && response.data.data.token;
    if (passed) {
      setAuthToken(response.data.data.token);
      testUserId = response.data.data.user.id;
    }
    
    logTest(
      '2.1 User Registration',
      passed,
      passed ? 'User registered successfully' : 'Registration failed',
      { userId: testUserId }
    );
  } catch (error: any) {
    logTest('2.1 User Registration', false, 'Registration request failed', error.response?.data);
  }

  await sleep(500);

  // 2.2 Token Verification
  try {
    const response = await api.get('/api/auth/verify');
    const passed = response.status === 200 && response.data.status === 'success';
    logTest(
      '2.2 Token Verification',
      passed,
      passed ? 'Token verified successfully' : 'Token verification failed'
    );
  } catch (error: any) {
    logTest('2.2 Token Verification', false, 'Token verification failed', error.response?.data);
  }
}

// ============================================================================
// 3. AI Chat Functionality Tests
// ============================================================================

async function testAIChatFunctionality() {
  // 3.1 Send Chat Message (Authenticated)
  try {
    const response = await api.post('/api/chat', {
      message: '请推荐一个适合夏天旅游的海滨城市',
    });
    
    const passed = response.status === 200 && 
                   response.data.status === 'success' && 
                   response.data.data.conversationId &&
                   response.data.data.message;
    
    if (passed) {
      testConversationId = response.data.data.conversationId;
    }
    
    logTest(
      '3.1 AI Chat - Send Message (Authenticated)',
      passed,
      passed ? 'Chat message sent and response received' : 'Chat failed',
      { conversationId: testConversationId, responseLength: response.data.data.message?.length }
    );
  } catch (error: any) {
    logTest('3.1 AI Chat - Send Message', false, 'Chat request failed', error.response?.data);
  }

  await sleep(1000);

  // 3.2 Get Conversations List
  try {
    const response = await api.get('/api/chat/conversations');
    const passed = response.status === 200 && 
                   response.data.status === 'success' &&
                   Array.isArray(response.data.data.items);
    
    logTest(
      '3.2 AI Chat - Get Conversations List',
      passed,
      passed ? `Retrieved ${response.data.data.items.length} conversations` : 'Failed to get conversations',
      { count: response.data.data.items?.length }
    );
  } catch (error: any) {
    logTest('3.2 AI Chat - Get Conversations', false, 'Request failed', error.response?.data);
  }

  await sleep(500);

  // 3.3 Get Specific Conversation
  if (testConversationId) {
    try {
      const response = await api.get(`/api/chat/conversations/${testConversationId}`);
      const passed = response.status === 200 && 
                     response.data.status === 'success' &&
                     response.data.data._id === testConversationId &&
                     Array.isArray(response.data.data.messages);
      
      logTest(
        '3.3 AI Chat - Get Specific Conversation',
        passed,
        passed ? `Retrieved conversation with ${response.data.data.messages.length} messages` : 'Failed to get conversation',
        { messageCount: response.data.data.messages?.length }
      );
    } catch (error: any) {
      logTest('3.3 AI Chat - Get Conversation', false, 'Request failed', error.response?.data);
    }
  }

  await sleep(500);

  // 3.4 Chat Without Authentication
  try {
    const tempApi = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
    });
    
    const response = await tempApi.post('/api/chat', {
      message: '北京有什么好玩的地方？',
    });
    
    const passed = response.status === 200 && 
                   response.data.status === 'success' &&
                   response.data.data.message;
    
    logTest(
      '3.4 AI Chat - Unauthenticated User',
      passed,
      passed ? 'Unauthenticated chat works correctly' : 'Unauthenticated chat failed'
    );
  } catch (error: any) {
    logTest('3.4 AI Chat - Unauthenticated', false, 'Request failed', error.response?.data);
  }
}

// ============================================================================
// 4. Itinerary Generation Tests
// ============================================================================

async function testItineraryGeneration() {
  // 4.1 Generate Itinerary
  try {
    const response = await api.post('/api/itineraries/generate', {
      destination: '东京',
      days: 3,
      budget: 5000,
      preferences: ['美食', '文化'],
    });
    
    const passed = response.status === 200 && 
                   response.data.status === 'success' &&
                   response.data.data._id &&
                   response.data.data.destination === '东京' &&
                   response.data.data.days === 3 &&
                   Array.isArray(response.data.data.content);
    
    if (passed) {
      testItineraryId = response.data.data._id;
    }
    
    logTest(
      '4.1 Itinerary Generation',
      passed,
      passed ? `Generated ${response.data.data.days}-day itinerary` : 'Itinerary generation failed',
      { 
        itineraryId: testItineraryId,
        days: response.data.data.days,
        contentDays: response.data.data.content?.length
      }
    );
  } catch (error: any) {
    logTest('4.1 Itinerary Generation', false, 'Generation request failed', error.response?.data);
  }

  await sleep(1000);

  // 4.2 Verify Budget Constraint
  if (testItineraryId) {
    try {
      const response = await api.post('/api/itineraries/generate', {
        destination: '巴黎',
        days: 5,
        budget: 10000,
        preferences: ['购物', '艺术'],
      });
      
      const totalBudget = response.data.data.content?.reduce(
        (sum: number, day: any) => sum + (day.dailyBudget || 0), 
        0
      );
      
      const passed = response.status === 200 && totalBudget <= 10000;
      
      logTest(
        '4.2 Itinerary - Budget Constraint',
        passed,
        passed ? `Total budget ${totalBudget} within limit 10000` : 'Budget constraint violated',
        { totalBudget, limit: 10000 }
      );
    } catch (error: any) {
      logTest('4.2 Itinerary - Budget Constraint', false, 'Request failed', error.response?.data);
    }
  }
}

// ============================================================================
// 5. Destination Management Tests
// ============================================================================

async function testDestinationManagement() {
  // 5.1 Get Destinations List
  try {
    const response = await api.get('/api/destinations');
    const passed = response.status === 200 && 
                   response.data.status === 'success' &&
                   Array.isArray(response.data.data);
    
    if (passed && response.data.data.length > 0) {
      testDestinationId = response.data.data[0]._id;
    }
    
    logTest(
      '5.1 Destinations - Get List',
      passed,
      passed ? `Retrieved ${response.data.data.length} destinations` : 'Failed to get destinations',
      { count: response.data.data?.length }
    );
  } catch (error: any) {
    logTest('5.1 Destinations - Get List', false, 'Request failed', error.response?.data);
  }

  await sleep(500);

  // 5.2 Get Popular Destinations
  try {
    const response = await api.get('/api/destinations/popular');
    const passed = response.status === 200 && 
                   response.data.status === 'success' &&
                   Array.isArray(response.data.data) &&
                   response.data.data.length >= 1;
    
    logTest(
      '5.2 Destinations - Get Popular',
      passed,
      passed ? `Retrieved ${response.data.data.length} popular destinations` : 'Failed to get popular destinations',
      { count: response.data.data?.length }
    );
  } catch (error: any) {
    logTest('5.2 Destinations - Get Popular', false, 'Request failed', error.response?.data);
  }

  await sleep(500);

  // 5.3 Get Destination Details
  if (testDestinationId) {
    try {
      const response = await api.get(`/api/destinations/${testDestinationId}`);
      const passed = response.status === 200 && 
                     response.data.status === 'success' &&
                     response.data.data._id === testDestinationId &&
                     response.data.data.name &&
                     response.data.data.description;
      
      logTest(
        '5.3 Destinations - Get Details',
        passed,
        passed ? `Retrieved details for ${response.data.data.name}` : 'Failed to get destination details',
        { name: response.data.data.name }
      );
    } catch (error: any) {
      logTest('5.3 Destinations - Get Details', false, 'Request failed', error.response?.data);
    }
  }

  await sleep(500);

  // 5.4 Filter Destinations by Region
  try {
    const response = await api.get('/api/destinations?region=亚洲');
    const passed = response.status === 200 && 
                   response.data.status === 'success' &&
                   Array.isArray(response.data.data);
    
    logTest(
      '5.4 Destinations - Filter by Region',
      passed,
      passed ? `Filtered destinations: ${response.data.data.length} results` : 'Filter failed',
      { count: response.data.data?.length }
    );
  } catch (error: any) {
    logTest('5.4 Destinations - Filter', false, 'Request failed', error.response?.data);
  }

  await sleep(500);

  // 5.5 Sort Destinations
  try {
    const response = await api.get('/api/destinations?sortBy=popularity');
    const passed = response.status === 200 && 
                   response.data.status === 'success' &&
                   Array.isArray(response.data.data);
    
    logTest(
      '5.5 Destinations - Sort by Popularity',
      passed,
      passed ? 'Destinations sorted successfully' : 'Sort failed',
      { count: response.data.data?.length }
    );
  } catch (error: any) {
    logTest('5.5 Destinations - Sort', false, 'Request failed', error.response?.data);
  }
}

// ============================================================================
// 6. Collection Management Tests
// ============================================================================

async function testCollectionManagement() {
  // 6.1 Add Itinerary to Collection
  if (testItineraryId) {
    try {
      const response = await api.post('/api/collections', {
        itemId: testItineraryId,
        itemType: 'itinerary',
      });
      
      const passed = response.status === 201 && 
                     response.data.status === 'success' &&
                     response.data.data._id;
      
      if (passed) {
        testCollectionId = response.data.data._id;
      }
      
      logTest(
        '6.1 Collections - Add Itinerary',
        passed,
        passed ? 'Itinerary added to collection' : 'Failed to add to collection',
        { collectionId: testCollectionId }
      );
    } catch (error: any) {
      logTest('6.1 Collections - Add Itinerary', false, 'Request failed', error.response?.data);
    }

    await sleep(500);

    // 6.2 Test Idempotency - Add Same Item Again
    try {
      const response = await api.post('/api/collections', {
        itemId: testItineraryId,
        itemType: 'itinerary',
      });
      
      const passed = response.status === 200 && 
                     response.data.message?.includes('已收藏');
      
      logTest(
        '6.2 Collections - Idempotency Test',
        passed,
        passed ? 'Duplicate collection handled correctly' : 'Idempotency failed'
      );
    } catch (error: any) {
      logTest('6.2 Collections - Idempotency', false, 'Request failed', error.response?.data);
    }
  }

  await sleep(500);

  // 6.3 Get Collections List
  try {
    const response = await api.get('/api/collections');
    const passed = response.status === 200 && 
                   response.data.status === 'success' &&
                   Array.isArray(response.data.data);
    
    logTest(
      '6.3 Collections - Get List',
      passed,
      passed ? `Retrieved ${response.data.data.length} collections` : 'Failed to get collections',
      { count: response.data.data?.length }
    );
  } catch (error: any) {
    logTest('6.3 Collections - Get List', false, 'Request failed', error.response?.data);
  }

  await sleep(500);

  // 6.4 Filter Collections by Type
  try {
    const response = await api.get('/api/collections?type=itinerary');
    const passed = response.status === 200 && 
                   response.data.status === 'success' &&
                   Array.isArray(response.data.data);
    
    logTest(
      '6.4 Collections - Filter by Type',
      passed,
      passed ? `Filtered collections: ${response.data.data.length} itineraries` : 'Filter failed',
      { count: response.data.data?.length }
    );
  } catch (error: any) {
    logTest('6.4 Collections - Filter', false, 'Request failed', error.response?.data);
  }

  await sleep(500);

  // 6.5 Check Collection Status
  if (testItineraryId) {
    try {
      const response = await api.get(`/api/collections/check/${testItineraryId}`);
      const passed = response.status === 200 && 
                     response.data.status === 'success' &&
                     response.data.data.isCollected === true;
      
      logTest(
        '6.5 Collections - Check Status',
        passed,
        passed ? 'Collection status checked correctly' : 'Status check failed',
        { isCollected: response.data.data.isCollected }
      );
    } catch (error: any) {
      logTest('6.5 Collections - Check Status', false, 'Request failed', error.response?.data);
    }
  }

  await sleep(500);

  // 6.6 Remove from Collection
  if (testCollectionId) {
    try {
      const response = await api.delete(`/api/collections/${testCollectionId}`);
      const passed = response.status === 200 && response.data.status === 'success';
      
      logTest(
        '6.6 Collections - Remove Item',
        passed,
        passed ? 'Item removed from collection' : 'Failed to remove from collection'
      );
    } catch (error: any) {
      logTest('6.6 Collections - Remove', false, 'Request failed', error.response?.data);
    }
  }
}

// ============================================================================
// 7. Error Handling and Edge Cases Tests
// ============================================================================

async function testErrorHandling() {
  // 7.1 Invalid Authentication Token
  try {
    const tempApi = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        'Authorization': 'Bearer invalid_token_12345',
      },
    });
    
    await tempApi.get('/api/users/profile');
    logTest('7.1 Error - Invalid Token', false, 'Should have rejected invalid token');
  } catch (error: any) {
    const passed = error.response?.status === 401;
    logTest(
      '7.1 Error - Invalid Token',
      passed,
      passed ? 'Invalid token rejected correctly' : 'Wrong error response',
      { status: error.response?.status }
    );
  }

  await sleep(500);

  // 7.2 Missing Required Fields
  try {
    await api.post('/api/itineraries/generate', {
      destination: '上海',
      // Missing days and budget
    });
    logTest('7.2 Error - Missing Fields', false, 'Should have rejected missing fields');
  } catch (error: any) {
    const passed = error.response?.status === 400;
    logTest(
      '7.2 Error - Missing Required Fields',
      passed,
      passed ? 'Missing fields rejected correctly' : 'Wrong error response',
      { status: error.response?.status }
    );
  }

  await sleep(500);

  // 7.3 Non-existent Resource
  try {
    await api.get('/api/destinations/000000000000000000000000');
    logTest('7.3 Error - Non-existent Resource', false, 'Should have returned 404');
  } catch (error: any) {
    const passed = error.response?.status === 404;
    logTest(
      '7.3 Error - Non-existent Resource',
      passed,
      passed ? '404 error returned correctly' : 'Wrong error response',
      { status: error.response?.status }
    );
  }

  await sleep(500);

  // 7.4 Unauthorized Access
  try {
    const tempApi = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
    });
    
    await tempApi.get('/api/collections');
    logTest('7.4 Error - Unauthorized Access', false, 'Should have rejected unauthorized access');
  } catch (error: any) {
    const passed = error.response?.status === 401;
    logTest(
      '7.4 Error - Unauthorized Access',
      passed,
      passed ? 'Unauthorized access rejected correctly' : 'Wrong error response',
      { status: error.response?.status }
    );
  }

  await sleep(500);

  // 7.5 Invalid Data Type
  try {
    await api.post('/api/itineraries/generate', {
      destination: '北京',
      days: 'invalid', // Should be number
      budget: 5000,
    });
    logTest('7.5 Error - Invalid Data Type', false, 'Should have rejected invalid data type');
  } catch (error: any) {
    const passed = error.response?.status === 400;
    logTest(
      '7.5 Error - Invalid Data Type',
      passed,
      passed ? 'Invalid data type rejected correctly' : 'Wrong error response',
      { status: error.response?.status }
    );
  }
}

// ============================================================================
// 8. API Response Format Tests
// ============================================================================

async function testAPIResponseFormat() {
  // 8.1 Success Response Format
  try {
    const response = await api.get('/api/destinations/popular');
    const passed = response.data.status === 'success' &&
                   response.data.data !== undefined &&
                   response.headers['content-type']?.includes('application/json');
    
    logTest(
      '8.1 API Format - Success Response',
      passed,
      passed ? 'Success response format correct' : 'Response format incorrect',
      { 
        hasStatus: !!response.data.status,
        hasData: !!response.data.data,
        contentType: response.headers['content-type']
      }
    );
  } catch (error: any) {
    logTest('8.1 API Format - Success', false, 'Request failed', error.response?.data);
  }

  await sleep(500);

  // 8.2 Error Response Format
  try {
    await api.get('/api/destinations/invalid_id_format');
  } catch (error: any) {
    const passed = error.response?.data.status === 'error' &&
                   error.response?.data.message !== undefined;
    
    logTest(
      '8.2 API Format - Error Response',
      passed,
      passed ? 'Error response format correct' : 'Error format incorrect',
      { 
        hasStatus: !!error.response?.data.status,
        hasMessage: !!error.response?.data.message
      }
    );
  }

  await sleep(500);

  // 8.3 Pagination Format
  try {
    const response = await api.get('/api/chat/conversations');
    const passed = response.data.data.total !== undefined &&
                   response.data.data.page !== undefined &&
                   response.data.data.pageSize !== undefined &&
                   Array.isArray(response.data.data.items);
    
    logTest(
      '8.3 API Format - Pagination',
      passed,
      passed ? 'Pagination format correct' : 'Pagination format incorrect',
      { 
        hasTotal: response.data.data.total !== undefined,
        hasPage: response.data.data.page !== undefined,
        hasPageSize: response.data.data.pageSize !== undefined,
        hasItems: Array.isArray(response.data.data.items)
      }
    );
  } catch (error: any) {
    logTest('8.3 API Format - Pagination', false, 'Request failed', error.response?.data);
  }
}

// ============================================================================
// 9. Main Test Runner
// ============================================================================

async function runAllTests() {
  console.log('='.repeat(80));
  console.log('CHECKPOINT 10 - Backend Core Functionality Verification');
  console.log('='.repeat(80));
  console.log('');

  // Check if server is running
  console.log('1. Health Check and Server Connectivity');
  console.log('-'.repeat(80));
  const serverHealthy = await testHealthCheck();
  console.log('');

  if (!serverHealthy) {
    console.log('❌ Server is not running or not healthy. Please start the server first.');
    console.log('   Run: cd backend && npm run dev');
    process.exit(1);
  }

  // Run authentication tests
  console.log('2. Authentication System Tests');
  console.log('-'.repeat(80));
  await testAuthSystem();
  console.log('');

  // Run AI chat tests
  console.log('3. AI Chat Functionality Tests');
  console.log('-'.repeat(80));
  await testAIChatFunctionality();
  console.log('');

  // Run itinerary generation tests
  console.log('4. Itinerary Generation Tests');
  console.log('-'.repeat(80));
  await testItineraryGeneration();
  console.log('');

  // Run destination management tests
  console.log('5. Destination Management Tests');
  console.log('-'.repeat(80));
  await testDestinationManagement();
  console.log('');

  // Run collection management tests
  console.log('6. Collection Management Tests');
  console.log('-'.repeat(80));
  await testCollectionManagement();
  console.log('');

  // Run error handling tests
  console.log('7. Error Handling and Edge Cases Tests');
  console.log('-'.repeat(80));
  await testErrorHandling();
  console.log('');

  // Run API response format tests
  console.log('8. API Response Format Tests');
  console.log('-'.repeat(80));
  await testAPIResponseFormat();
  console.log('');

  // Print summary
  console.log('='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));
  
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  const passRate = ((passedTests / totalTests) * 100).toFixed(2);

  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} (${passRate}%)`);
  console.log(`Failed: ${failedTests}`);
  console.log('');

  if (failedTests > 0) {
    console.log('Failed Tests:');
    console.log('-'.repeat(80));
    results.filter(r => !r.passed).forEach(r => {
      console.log(`❌ ${r.name}: ${r.message}`);
    });
    console.log('');
  }

  console.log('='.repeat(80));
  
  if (passRate >= 90) {
    console.log('✅ CHECKPOINT PASSED - Backend core functionality is working correctly!');
  } else if (passRate >= 70) {
    console.log('⚠️  CHECKPOINT WARNING - Most features work but some issues need attention.');
  } else {
    console.log('❌ CHECKPOINT FAILED - Significant issues detected. Please review and fix.');
  }
  
  console.log('='.repeat(80));

  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
