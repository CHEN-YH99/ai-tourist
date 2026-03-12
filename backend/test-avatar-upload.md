# Avatar Upload API Test Guide

## Endpoint
`POST /api/users/avatar`

## Requirements
- User must be authenticated (JWT token required)
- File field name: `avatar`
- Supported formats: JPEG, PNG, WebP
- Maximum file size: 5MB

## Test Cases

### 1. Successful Upload
```bash
# First, login to get a token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'

# Use the token from the response
curl -X POST http://localhost:5000/api/users/avatar \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "avatar=@/path/to/image.jpg"
```

Expected Response:
```json
{
  "status": "success",
  "data": {
    "avatar": "/uploads/avatars/avatar-1234567890-123456789.jpg"
  },
  "message": "头像上传成功"
}
```

### 2. Missing File
```bash
curl -X POST http://localhost:5000/api/users/avatar \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected Response:
```json
{
  "status": "error",
  "message": "请上传头像文件"
}
```

### 3. Invalid File Type
```bash
curl -X POST http://localhost:5000/api/users/avatar \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "avatar=@/path/to/document.pdf"
```

Expected Response:
```json
{
  "status": "error",
  "message": "只允许上传JPEG、PNG或WebP格式的图片"
}
```

### 4. File Too Large (>5MB)
```bash
curl -X POST http://localhost:5000/api/users/avatar \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "avatar=@/path/to/large-image.jpg"
```

Expected Response:
```json
{
  "status": "error",
  "message": "File too large"
}
```

### 5. Unauthorized Access
```bash
curl -X POST http://localhost:5000/api/users/avatar \
  -F "avatar=@/path/to/image.jpg"
```

Expected Response:
```json
{
  "status": "error",
  "message": "未提供认证令牌"
}
```

## Verification Steps

1. **Start the server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Register a test user** (if not already registered)
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Password123","username":"testuser"}'
   ```

3. **Login and save the token**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Password123"}'
   ```

4. **Upload an avatar**
   - Create or download a test image (JPEG, PNG, or WebP)
   - Use the curl command from Test Case 1 with your token and image path

5. **Verify the upload**
   - Check that the file exists in `backend/uploads/avatars/`
   - Access the avatar URL: `http://localhost:5000/uploads/avatars/avatar-XXXXX.jpg`
   - Get user profile to verify avatar URL is saved:
     ```bash
     curl -X GET http://localhost:5000/api/users/profile \
       -H "Authorization: Bearer YOUR_TOKEN_HERE"
     ```

## Implementation Details

### Middleware Configuration
- **File size limit**: 5MB (5 * 1024 * 1024 bytes)
- **Allowed MIME types**: 
  - `image/jpeg`
  - `image/png`
  - `image/webp`
- **Storage**: Disk storage in `uploads/avatars/`
- **Filename format**: `avatar-{timestamp}-{random}.{ext}`

### Security Features
- JWT authentication required
- File type validation (MIME type check)
- File size validation
- Unique filename generation to prevent conflicts
- Static file serving configured in server.ts

### Error Handling
- Missing file: 400 Bad Request
- Invalid file type: 400 Bad Request
- File too large: Handled by multer (413 Payload Too Large)
- Unauthorized: 401 Unauthorized
- Server errors: 500 Internal Server Error

## Requirements Validation

✅ **需求 4.5**: 文件大小验证不超过5MB
- Implemented in `upload.ts` middleware with `limits.fileSize: 5 * 1024 * 1024`

✅ **需求 4.6**: 文件格式验证为JPEG、PNG或WebP
- Implemented in `upload.ts` middleware with `fileFilter` function checking MIME types
