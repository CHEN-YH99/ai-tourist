import request from 'supertest'
import express, { Application } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { responseFormatter } from '../../middleware/responseFormatter.js'
import { errorHandler } from '../../middleware/errorHandler.js'
import { apiLimiter } from '../../middleware/rateLimit.js'
import authRoutes from '../../routes/authRoutes.js'
import userRoutes from '../../routes/userRoutes.js'
import { corsOptions } from '../../config/cors.js'
import { helmetOptions } from '../../config/security.js'

let app: Application

beforeAll(() => {
  app = express()
  
  // Setup middleware
  app.use(helmet(helmetOptions))
  app.use(cors(corsOptions))
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))
  app.use(responseFormatter)
  
  // Setup routes
  app.use('/api/auth', authRoutes)
  app.use('/api/users', userRoutes)
  
  // Error handler
  app.use(errorHandler)
})

describe('Authentication Flow Integration Tests', () => {
  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123',
          username: 'testuser'
        })

      expect(response.status).toBe(201)
      expect(response.body.status).toBe('success')
      expect(response.body.data).toHaveProperty('token')
      expect(response.body.data).toHaveProperty('user')
      expect(response.body.data.user.email).toBe('test@example.com')
      expect(response.body.data.user.username).toBe('testuser')
    })

    it('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Password123',
          username: 'testuser'
        })

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('error')
    })

    it('should reject registration with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak',
          username: 'testuser'
        })

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('error')
    })

    it('should reject duplicate email registration', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'Password123',
          username: 'user1'
        })

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'Password123',
          username: 'user2'
        })

      expect(response.status).toBe(409)
      expect(response.body.status).toBe('error')
    })
  })

  describe('User Login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'login@example.com',
          password: 'Password123',
          username: 'loginuser'
        })
    })

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'Password123'
        })

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data).toHaveProperty('token')
      expect(response.body.data).toHaveProperty('user')
      expect(response.body.data.user.email).toBe('login@example.com')
    })

    it('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword'
        })

      expect(response.status).toBe(401)
      expect(response.body.status).toBe('error')
    })

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123'
        })

      expect(response.status).toBe(401)
      expect(response.body.status).toBe('error')
    })
  })

  describe('Token Verification', () => {
    let token: string

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'verify@example.com',
          password: 'Password123',
          username: 'verifyuser'
        })

      token = response.body.data.token
    })

    it('should verify valid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data).toHaveProperty('userId')
      expect(response.body.data).toHaveProperty('email')
    })

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')

      expect(response.status).toBe(401)
      expect(response.body.status).toBe('error')
    })

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token')

      expect(response.status).toBe(401)
      expect(response.body.status).toBe('error')
    })
  })

  describe('User Profile Management', () => {
    let token: string
    let userId: string

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'profile@example.com',
          password: 'Password123',
          username: 'profileuser'
        })

      token = response.body.data.token
      userId = response.body.data.user._id
    })

    it('should get user profile', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data.email).toBe('profile@example.com')
      expect(response.body.data.username).toBe('profileuser')
    })

    it('should update user profile', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'updateduser',
          preferences: ['美食', '文化']
        })

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data.username).toBe('updateduser')
      expect(response.body.data.preferences).toContain('美食')
    })

    it('should not allow email modification', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'newemail@example.com'
        })

      expect(response.status).toBe(200)
      // Email should not be updated
      const profileResponse = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)

      expect(profileResponse.body.data.email).toBe('profile@example.com')
    })

    it('should reject profile update without authentication', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .send({
          username: 'updateduser'
        })

      expect(response.status).toBe(401)
      expect(response.body.status).toBe('error')
    })
  })
})
