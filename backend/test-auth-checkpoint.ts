/**
 * Checkpoint Test Script - Authentication and User Management
 * Task 6: 检查点 - 认证和用户管理验证
 * 
 * This script tests:
 * 1. User registration flow (POST /api/auth/register)
 * 2. User login flow (POST /api/auth/login)
 * 3. Token verification (GET /api/auth/verify)
 * 4. Profile retrieval (GET /api/users/profile)
 * 5. Profile update (PUT /api/users/profile)
 * 6. Avatar upload (POST /api/users/avatar) with validation
 * 7. JWT authentication middleware protection
 * 8. Password encryption storage
 */

import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];
let testToken: string = '';
let testUserId: string = '';

// Helper function to add test result
function addResult(name: string, passed: boolean, message: string, details?: any) {
  results.push({ name, passed, message, details });
  const status = passed ? '✓' : '✗';
  console.log(`${status} ${name}: ${message}`);
  if (details) {
    console.log('  Details:', JSON.stringify(details, null, 2));
  }
}

