/**
 * Checkpoint 6: Authentication and User Management Verification
 * 
 * This script tests:
 * 1. Registration (POST /api/auth/register)
 * 2. Login (POST /api/auth/login)
 * 3. Profile management (GET/PUT /api/users/profile)
 * 4. Avatar upload (POST /api/users/avatar)
 * 5. JWT middleware protection
 */

import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = 'http://localhost:5000/api';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

// Helper function to log test results
function logTest(name: string, passed: boolean, error?: string, details?: any) {
  results.push({ name, passed, error, details });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}`);
  if (error) console.log(`  Error: ${error}`);
  if (details) console.log(`  Details:`, details);
}

// Generate unique test data
const timestamp = Date.now();
const testUser = {
  email: `test${timestamp}@example.com`,
  password: 'TestPass123',
  username: `testuser${timestamp}`
};

let authToken = '';
let userId = '';

async function test1_Registration() {
  console.log('\n=== Test 1: User Registration ===');
  
  try {
    // Test 1.1: Valid registration
    const response = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    
    if (response.status === 201 && response.data.status === 'success') {
      authToken = response.data.data.token;
      userId = response.data.data.user._id;
      logTest('1.1 Valid registration', true, undefined, {
        userId,
        hasToken: !!authToken
      });
    } else {
      logTest('1.1 Valid registration', false, 'Unexpected response format');
    }
  } catch (error) {
    const err = error as AxiosError;
    logTest('1.1 Valid registration', false, err.message);
  }

  try {
    // Test 1.2: Duplicate email rejection
    await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    logTest('1.2 Duplicate email rejection', false, 'Should have rejected duplicate email');
  } catch (error) {
    const err = error as AxiosError<any>;
    if (err.response?.status === 409 || err.response?.data?.message?.includes('邮箱')) {
      logTest('1.2 Duplicate email rejection', true);
    } else {
      logTest('1.2 Duplicate email rejection', false, `Wrong error: ${err.response?.data?.message}`);
    }
  }

  try {
    // Test 1.3: Invalid email format
    await axios.post(`${API_BASE_URL}/auth/register`, {
      email: 'invalid-email',
      password: 'TestPass123',
      username: 'testuser'
    });
    logTest('1.3 Invalid email format rejection', false, 'Should have rejected invalid email');
  } catch (error) {
    const err = error as AxiosError<any>;
    if (err.response?.status === 400) {
      logTest('1.3 Invalid email format rejection', true);
    } else {
      logTest('1.3 Invalid email format rejection', false, `Wrong status: ${err.response?.status}`);
    }
  }

  try {
    // Test 1.4: Weak password rejection
    await axios.post(`${API_BASE_URL}/auth/register`, {
      email: `weak${timestamp}@example.com`,
      password: 'weak',
      username: 'weakuser'
    });
    logTest('1.4 Weak password rejection', false, 'Should have rejected weak password');
  } catch (error) {
    const err = error as AxiosError<any>;
    if (err.response?.status === 400) {
      logTest('1.4 Weak password rejection', true);
    } else {
      logTest('1.4 Weak password rejection', false, `Wrong status: ${err.response?.status}`);
    }
  }
}

async function test2_Login() {
  console.log('\n=== Test 2: User Login ===');

  try {
    // Test 2.1: Valid login
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });

    if (response.status === 200 && response.data.data.token) {
      authToken = response.data.data.token; // Update token
      logTest('2.1 Valid login', true, undefined, { hasToken: !!authToken });
    } else {
      logTest('2.1 Valid login', false, 'No token returned');
    }
  } catch (error) {
    const err = error as AxiosError;
    logTest('2.1 Valid login', false, err.message);
  }

  try {
    // Test 2.2: Invalid password
    await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testUser.email,
      password: 'WrongPassword123'
    });
    logTest('2.2 Invalid password rejection', false, 'Should have rejected wrong password');
  } catch (error) {
    const err = error as AxiosError<any>;
    if (err.response?.status === 401) {
      logTest('2.2 Invalid password rejection', true);
    } else {
      logTest('2.2 Invalid password rejection', false, `Wrong status: ${err.response?.status}`);
    }
  }

  try {
    // Test 2.3: Non-existent user
    await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'nonexistent@example.com',
      password: 'TestPass123'
    });
    logTest('2.3 Non-existent user rejection', false, 'Should have rejected non-existent user');
  } catch (error) {
    const err = error as AxiosError<any>;
    if (err.response?.status === 401) {
      logTest('2.3 Non-existent user rejection', true);
    } else {
      logTest('2.3 Non-existent user rejection', false, `Wrong status: ${err.response?.status}`);
    }
  }
}

async function test3_JWTAuthentication() {
  console.log('\n=== Test 3: JWT Authentication ===');

  try {
    // Test 3.1: Access protected route with valid token
    const response = await axios.get(`${API_BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.status === 200 && response.data.data.email === testUser.email) {
      logTest('3.1 Valid token access', true);
    } else {
      logTest('3.1 Valid token access', false, 'Unexpected response');
    }
  } catch (error) {
    const err = error as AxiosError;
    logTest('3.1 Valid token access', false, err.message);
  }

  try {
    // Test 3.2: Access protected route without token
    await axios.get(`${API_BASE_URL}/users/profile`);
    logTest('3.2 No token rejection', false, 'Should have rejected request without token');
  } catch (error) {
    const err = error as AxiosError<any>;
    if (err.response?.status === 401) {
      logTest('3.2 No token rejection', true);
    } else {
      logTest('3.2 No token rejection', false, `Wrong status: ${err.response?.status}`);
    }
  }

  try {
    // Test 3.3: Access protected route with invalid token
    await axios.get(`${API_BASE_URL}/users/profile`, {
      headers: { Authorization: 'Bearer invalid-token-12345' }
    });
    logTest('3.3 Invalid token rejection', false, 'Should have rejected invalid token');
  } catch (error) {
    const err = error as AxiosError<any>;
    if (err.response?.status === 401) {
      logTest('3.3 Invalid token rejection', true);
    } else {
      logTest('3.3 Invalid token rejection', false, `Wrong status: ${err.response?.status}`);
    }
  }
}

async function test4_ProfileManagement() {
  console.log('\n=== Test 4: Profile Management ===');

  try {
    // Test 4.1: Get profile
    const response = await axios.get(`${API_BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.status === 200 && response.data.data.email === testUser.email) {
      logTest('4.1 Get profile', true, undefined, {
        username: response.data.data.username,
        email: response.data.data.email
      });
    } else {
      logTest('4.1 Get profile', false, 'Unexpected response');
    }
  } catch (error) {
    const err = error as AxiosError;
    logTest('4.1 Get profile', false, err.message);
  }

  try {
    // Test 4.2: Update profile (username and preferences)
    const updateData = {
      username: `updated${timestamp}`,
      preferences: ['美食', '文化', '冒险']
    };

    const response = await axios.put(`${API_BASE_URL}/users/profile`, updateData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.status === 200 && response.data.data.username === updateData.username) {
      logTest('4.2 Update profile', true, undefined, {
        newUsername: response.data.data.username,
        preferences: response.data.data.preferences
      });
    } else {
      logTest('4.2 Update profile', false, 'Update failed');
    }
  } catch (error) {
    const err = error as AxiosError;
    logTest('4.2 Update profile', false, err.message);
  }

  try {
    // Test 4.3: Attempt to update email (should be ignored/rejected)
    try {
      const response = await axios.put(`${API_BASE_URL}/users/profile`, {
        email: 'newemail@example.com'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      // If request succeeds, verify email hasn't changed
      const profileResponse = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (profileResponse.data.data.email === testUser.email) {
        logTest('4.3 Email update protection', true, undefined, {
          emailUnchanged: true
        });
      } else {
        logTest('4.3 Email update protection', false, 'Email was changed');
      }
    } catch (updateError) {
      // If request is rejected with 400, that's also valid protection
      const err = updateError as AxiosError<any>;
      if (err.response?.status === 400) {
        logTest('4.3 Email update protection', true, undefined, {
          rejectedWithError: true
        });
      } else {
        throw updateError;
      }
    }
  } catch (error) {
    const err = error as AxiosError;
    logTest('4.3 Email update protection', false, err.message);
  }
}

async function test5_AvatarUpload() {
  console.log('\n=== Test 5: Avatar Upload ===');

  // Create a test image file
  const testImagePath = path.join(__dirname, 'test-avatar.jpg');
  const testImageBuffer = Buffer.from(
    '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
    'base64'
  );
  fs.writeFileSync(testImagePath, testImageBuffer);

  try {
    // Test 5.1: Valid avatar upload
    const formData = new FormData();
    formData.append('avatar', fs.createReadStream(testImagePath));

    const response = await axios.post(`${API_BASE_URL}/users/avatar`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${authToken}`
      }
    });

    if (response.status === 200 && response.data.data.avatar) {
      logTest('5.1 Valid avatar upload', true, undefined, {
        avatarUrl: response.data.data.avatar
      });
    } else {
      logTest('5.1 Valid avatar upload', false, 'No avatar URL returned');
    }
  } catch (error) {
    const err = error as AxiosError<any>;
    logTest('5.1 Valid avatar upload', false, err.response?.data?.message || err.message);
  }

  try {
    // Test 5.2: Upload without authentication
    const formData = new FormData();
    formData.append('avatar', fs.createReadStream(testImagePath));

    await axios.post(`${API_BASE_URL}/users/avatar`, formData, {
      headers: formData.getHeaders()
    });
    logTest('5.2 Avatar upload without auth rejection', false, 'Should have rejected unauthenticated upload');
  } catch (error) {
    const err = error as AxiosError<any>;
    if (err.response?.status === 401) {
      logTest('5.2 Avatar upload without auth rejection', true);
    } else {
      logTest('5.2 Avatar upload without auth rejection', false, `Wrong status: ${err.response?.status}`);
    }
  }

  // Test 5.3: File size validation (create a large file)
  try {
    const largeFilePath = path.join(__dirname, 'test-large-avatar.jpg');
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
    fs.writeFileSync(largeFilePath, largeBuffer);

    const formData = new FormData();
    formData.append('avatar', fs.createReadStream(largeFilePath));

    await axios.post(`${API_BASE_URL}/users/avatar`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${authToken}`
      }
    });
    
    fs.unlinkSync(largeFilePath);
    logTest('5.3 Large file rejection (>5MB)', false, 'Should have rejected file >5MB');
  } catch (error) {
    const err = error as AxiosError<any>;
    if (err.response?.status === 400 || err.code === 'ERR_BAD_REQUEST') {
      logTest('5.3 Large file rejection (>5MB)', true);
    } else {
      logTest('5.3 Large file rejection (>5MB)', false, `Wrong error: ${err.message}`);
    }
  }

  // Test 5.4: Invalid file type
  try {
    const txtFilePath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(txtFilePath, 'This is not an image');

    const formData = new FormData();
    formData.append('avatar', fs.createReadStream(txtFilePath));

    await axios.post(`${API_BASE_URL}/users/avatar`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${authToken}`
      }
    });
    
    fs.unlinkSync(txtFilePath);
    logTest('5.4 Invalid file type rejection', false, 'Should have rejected non-image file');
  } catch (error) {
    const err = error as AxiosError<any>;
    if (err.response?.status === 400) {
      logTest('5.4 Invalid file type rejection', true);
    } else {
      logTest('5.4 Invalid file type rejection', false, `Wrong error: ${err.message}`);
    }
  }

  // Cleanup
  if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath);
}

async function test6_PasswordSecurity() {
  console.log('\n=== Test 6: Password Security ===');

  try {
    // Test 6.1: Verify password is encrypted in database
    // We can't directly check the database, but we can verify that:
    // 1. Login works with correct password
    // 2. The password in the response (if any) is not the plain text
    
    const response = await axios.get(`${API_BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    // Password should not be in the response
    if (!response.data.data.password) {
      logTest('6.1 Password not exposed in API', true);
    } else {
      logTest('6.1 Password not exposed in API', false, 'Password field present in response');
    }
  } catch (error) {
    const err = error as AxiosError;
    logTest('6.1 Password not exposed in API', false, err.message);
  }
}

async function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('CHECKPOINT 6 TEST SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`\nTotal Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}`);
      if (r.error) console.log(`    Error: ${r.error}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  
  if (failed === 0) {
    console.log('✅ ALL TESTS PASSED! Authentication and user management are working correctly.');
  } else {
    console.log('⚠️  SOME TESTS FAILED. Please review the issues above.');
  }
  console.log('='.repeat(60) + '\n');
}

async function runAllTests() {
  console.log('Starting Checkpoint 6: Authentication and User Management Verification');
  console.log('API Base URL:', API_BASE_URL);
  console.log('Test User:', testUser.email);

  try {
    await test1_Registration();
    await test2_Login();
    await test3_JWTAuthentication();
    await test4_ProfileManagement();
    await test5_AvatarUpload();
    await test6_PasswordSecurity();
  } catch (error) {
    console.error('Unexpected error during tests:', error);
  }

  await printSummary();
}

// Run tests
runAllTests().catch(console.error);
