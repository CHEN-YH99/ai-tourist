# Authentication API Endpoints

## Overview
This document describes the authentication API endpoints implemented for the AI Travel Assistant system.

## Endpoints

### 1. POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "username": "John Doe",
  "avatar": "https://example.com/avatar.jpg",
  "preferences": ["beach", "culture"],
  "contactInfo": {
    "phone": "+1234567890",
    "wechat": "wechat_id"
  }
}
```

**Validation Rules:**
- Email: Must be valid email format
- Password: Minimum 8 characters, must contain letters and numbers
- Username: Required, 2-50 characters

**Success Response (201):**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "username": "John Doe",
      "avatar": "https://example.com/avatar.jpg",
      "preferences": ["beach", "culture"],
      "contactInfo": {
        "phone": "+1234567890",
        "wechat": "wechat_id"
      }
    }
  }
}
```

**Error Responses:**
- 400: Validation error (invalid email format, weak password, etc.)
- 409: Email already registered

---

### 2. POST /api/auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Validation Rules:**
- Email: Must be valid email format
- Password: Required

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "username": "John Doe",
      "avatar": "https://example.com/avatar.jpg",
      "preferences": ["beach", "culture"],
      "contactInfo": {
        "phone": "+1234567890",
        "wechat": "wechat_id"
      }
    }
  }
}
```

**Error Responses:**
- 400: Validation error
- 401: Invalid email or password

---

### 3. POST /api/auth/logout
Logout current user (client-side token removal).

**Request Body:** None

**Success Response (200):**
```json
{
  "status": "success",
  "message": "登出成功"
}
```

**Note:** JWT tokens are stateless. Logout is primarily handled on the client side by removing the token from storage.

---

### 4. GET /api/auth/verify
Verify if the current JWT token is valid.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- 401: Token missing, invalid, or expired

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "username": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

### Verify Token
```bash
curl -X GET http://localhost:5000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout
```

## Requirements Coverage

This implementation satisfies the following requirements:

- **需求 3.1**: User registration with email, password, and username
- **需求 3.2**: Email format validation
- **需求 3.3**: Password strength validation (min 8 chars, letters + numbers)
- **需求 3.4**: Email uniqueness check
- **需求 3.5**: User login with JWT token generation
- **需求 3.6**: Password encryption using bcrypt
- **需求 3.8**: JWT token expiration (24 hours)
- **需求 3.9**: Authentication middleware for protected routes
