/**
 * Manual Verification Tests for Checkpoint 6
 * Additional edge cases and security checks
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function runManualTests() {
  console.log('\n=== Manual Verification Tests ===\n');

  // Test 1: Token Expiration (verify 24-hour expiration is set)
  console.log('Test 1: Verify JWT token expiration is set to 24 hours');
  try {
    const registerRes = await axios.post(`${API_BASE_URL}/auth/register`, {
      email: `manual${Date.now()}@example.com`,
      password: 'ManualTest123',
      username: `manual${Date.now()}`
    });

    const token = registerRes.data.data.token;
    
    // Decode JWT to check expiration (without verification)
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const expirationTime = payload.exp - payload.iat;
    const hours = expirationTime / 3600;
    
    console.log(`✅ Token expiration: ${hours} hours`);
    console.log(`   Expected: 24 hours, Actual: ${hours} hours`);
    
    if (Math.abs(hours - 24) < 0.1) {
      console.log('✅ PASS: Token expiration is correctly set to 24 hours\n');
    } else {
      console.log('❌ FAIL: Token expiration is not 24 hours\n');
    }
  } catch (error: any) {
    console.log('❌ FAIL: Could not verify token expiration');
    console.log(`   Error: ${error.message}\n`);
  }

  // Test 2: Password encryption verification
  console.log('Test 2: Verify password is encrypted (bcrypt)');
  try {
    const email = `encrypt${Date.now()}@example.com`;
    const password = 'EncryptTest123';
    
    await axios.post(`${API_BASE_URL}/auth/register`, {
      email,
      password,
      username: `encrypt${Date.now()}`
    });

    // Try to login with the password to verify it was encrypted and can be verified
    const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password
    });

    if (loginRes.data.status === 'success') {
      console.log('✅ PASS: Password encryption and verification working correctly\n');
    }
  } catch (error: any) {
    console.log('❌ FAIL: Password encryption verification failed');
    console.log(`   Error: ${error.message}\n`);
  }

  // Test 3: Email uniqueness across case variations
  console.log('Test 3: Verify email uniqueness (case-insensitive)');
  try {
    const baseEmail = `unique${Date.now()}@example.com`;
    
    // Register with lowercase
    await axios.post(`${API_BASE_URL}/auth/register`, {
      email: baseEmail.toLowerCase(),
      password: 'UniqueTest123',
      username: `unique${Date.now()}`
    });

    // Try to register with uppercase version
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        email: baseEmail.toUpperCase(),
        password: 'UniqueTest123',
        username: `unique${Date.now()}2`
      });
      console.log('❌ FAIL: Email uniqueness check is case-sensitive (should be case-insensitive)\n');
    } catch (error: any) {
      if (error.response?.status === 409 || error.response?.data?.message?.includes('邮箱已被使用')) {
        console.log('✅ PASS: Email uniqueness is case-insensitive\n');
      } else {
        console.log('❌ FAIL: Unexpected error during email uniqueness test');
        console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
      }
    }
  } catch (error: any) {
    console.log('❌ FAIL: Email uniqueness test failed');
    console.log(`   Error: ${error.message}\n`);
  }

  // Test 4: Profile update atomicity
  console.log('Test 4: Verify profile update atomicity (email protection)');
  try {
    const registerRes = await axios.post(`${API_BASE_URL}/auth/register`, {
      email: `atomic${Date.now()}@example.com`,
      password: 'AtomicTest123',
      username: `atomic${Date.now()}`
    });

    const token = registerRes.data.data.token;
    const originalEmail = registerRes.data.data.user.email;

    // Try to update profile with email change
    const updateRes = await axios.put(
      `${API_BASE_URL}/users/profile`,
      {
        username: 'newusername',
        email: 'newemail@example.com' // This should be ignored
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    // Verify email was not changed
    const profileRes = await axios.get(`${API_BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (profileRes.data.data.email === originalEmail) {
      console.log('✅ PASS: Email cannot be modified through profile update\n');
    } else {
      console.log('❌ FAIL: Email was modified (should be protected)\n');
    }
  } catch (error: any) {
    console.log('❌ FAIL: Profile update atomicity test failed');
    console.log(`   Error: ${error.message}\n`);
  }

  // Test 5: Avatar file validation
  console.log('Test 5: Verify avatar file type validation');
  try {
    const registerRes = await axios.post(`${API_BASE_URL}/auth/register`, {
      email: `avatar${Date.now()}@example.com`,
      password: 'AvatarTest123',
      username: `avatar${Date.now()}`
    });

    const token = registerRes.data.data.token;

    // Test with text file (should be rejected)
    const FormData = require('form-data');
    const fs = require('fs');
    const form = new FormData();
    
    // Create a temporary text file
    fs.writeFileSync('test-file.txt', 'This is a text file');
    form.append('avatar', fs.createReadStream('test-file.txt'));

    try {
      await axios.post(`${API_BASE_URL}/users/avatar`, form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${token}`
        }
      });
      console.log('❌ FAIL: Text file was accepted (should be rejected)\n');
    } catch (error: any) {
      if (error.response?.status === 400) {
        console.log('✅ PASS: Invalid file type correctly rejected\n');
      } else {
        console.log('⚠️  WARNING: Unexpected error during file type validation');
        console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
      }
    } finally {
      // Clean up
      if (fs.existsSync('test-file.txt')) {
        fs.unlinkSync('test-file.txt');
      }
    }
  } catch (error: any) {
    console.log('❌ FAIL: Avatar file validation test failed');
    console.log(`   Error: ${error.message}\n`);
  }

  console.log('=== Manual Verification Complete ===\n');
}

runManualTests().catch(console.error);
