import request from 'supertest'
import express, { Application } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { responseFormatter } from '../../middleware/responseFormatter.js'
import { errorHandler } from '../../middleware/errorHandler.js'
import authRoutes from '../../routes/authRoutes.js'
import aiRoutes from '../../routes/ai.js'
import { corsOptions } from '../../config/cors.js'
import { helmetOptions } from '../../config/security.js'

let app: Application
let token: string
let userId: string

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
  app.use('/api', aiRoutes)
  
  // Error handler
  app.use(errorHandler)
})

beforeEach(async () => {
  // Register and login a test user
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      email: `ai-test-${Date.now()}@example.com`,
      password: 'Password123',
      username: 'aiuser'
    })

  token = response.body.data.token
  userId = response.body.data.user._id
})

describe('AI Q&A and Itinerary Generation Integration Tests', () => {
  describe('AI Q&A Flow', () => {
    it('should send a message and receive response', async () => {
      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: '请告诉我关于巴黎的信息'
        })

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data).toHaveProperty('conversationId')
      expect(response.body.data).toHaveProperty('message')
      expect(response.body.data.message).toBeTruthy()
    }, 15000)

    it('should allow unauthenticated users to ask questions', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({
          message: '旅游的最佳时间是什么时候？'
        })

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data).toHaveProperty('message')
    }, 15000)

    it('should save conversation for authenticated users', async () => {
      const chatResponse = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: '巴黎有哪些著名景点？'
        })

      const conversationId = chatResponse.body.data.conversationId

      // Retrieve the conversation
      const getResponse = await request(app)
        .get(`/api/chat/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(getResponse.status).toBe(200)
      expect(getResponse.body.status).toBe('success')
      expect(getResponse.body.data._id).toBe(conversationId)
      expect(getResponse.body.data.messages.length).toBeGreaterThan(0)
    }, 15000)

    it('should maintain conversation history', async () => {
      // First message
      const response1 = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: '我想去欧洲旅游'
        })

      const conversationId = response1.body.data.conversationId

      // Second message in same conversation
      const response2 = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: '你能推荐一些景点吗？',
          conversationId
        })

      expect(response2.status).toBe(200)

      // Verify conversation has both messages
      const getResponse = await request(app)
        .get(`/api/chat/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(getResponse.body.data.messages.length).toBeGreaterThanOrEqual(2)
    }, 20000)

    it('should list user conversations', async () => {
      // Create a conversation
      await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: '告诉我关于日本的信息'
        })

      // List conversations
      const response = await request(app)
        .get('/api/chat/conversations')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data).toHaveProperty('items')
      expect(Array.isArray(response.body.data.items)).toBe(true)
    }, 15000)

    it('should delete a conversation', async () => {
      // Create a conversation
      const createResponse = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: '我想了解泰国'
        })

      const conversationId = createResponse.body.data.conversationId

      // Delete the conversation
      const deleteResponse = await request(app)
        .delete(`/api/chat/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(deleteResponse.status).toBe(200)
      expect(deleteResponse.body.status).toBe('success')

      // Verify it's deleted
      const getResponse = await request(app)
        .get(`/api/chat/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(getResponse.status).toBe(404)
    }, 15000)
  })

  describe('Itinerary Generation Flow', () => {
    it('should generate an itinerary with valid parameters', async () => {
      const response = await request(app)
        .post('/api/itineraries/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          destination: '巴黎',
          days: 3,
          budget: 10000,
          preferences: ['美食', '文化']
        })

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data).toHaveProperty('_id')
      expect(response.body.data.destination).toBe('巴黎')
      expect(response.body.data.days).toBe(3)
      expect(response.body.data.budget).toBe(10000)
      expect(response.body.data.content).toBeDefined()
      expect(Array.isArray(response.body.data.content)).toBe(true)
    }, 20000)

    it('should generate itinerary with correct day count', async () => {
      const response = await request(app)
        .post('/api/itineraries/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          destination: '东京',
          days: 5,
          budget: 15000,
          preferences: ['冒险']
        })

      expect(response.status).toBe(200)
      expect(response.body.data.content.length).toBe(5)
      
      // Verify each day has activities
      response.body.data.content.forEach((day: any) => {
        expect(day.day).toBeGreaterThan(0)
        expect(day.activities).toBeDefined()
        expect(Array.isArray(day.activities)).toBe(true)
      })
    }, 20000)

    it('should respect budget constraint', async () => {
      const response = await request(app)
        .post('/api/itineraries/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          destination: '曼谷',
          days: 3,
          budget: 5000,
          preferences: []
        })

      expect(response.status).toBe(200)
      const totalBudget = response.body.data.content.reduce(
        (sum: number, day: any) => sum + day.dailyBudget,
        0
      )
      expect(totalBudget).toBeLessThanOrEqual(5000)
    }, 20000)

    it('should include meals and activities in itinerary', async () => {
      const response = await request(app)
        .post('/api/itineraries/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          destination: '首尔',
          days: 2,
          budget: 8000,
          preferences: ['美食']
        })

      expect(response.status).toBe(200)
      const firstDay = response.body.data.content[0]
      
      expect(firstDay.activities).toBeDefined()
      expect(firstDay.activities.length).toBeGreaterThan(0)
      expect(firstDay.meals).toBeDefined()
      expect(firstDay.meals.length).toBeGreaterThan(0)
    }, 20000)

    it('should retrieve generated itinerary', async () => {
      // Generate itinerary
      const generateResponse = await request(app)
        .post('/api/itineraries/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          destination: '新加坡',
          days: 2,
          budget: 6000,
          preferences: []
        })

      const itineraryId = generateResponse.body.data._id

      // Retrieve itinerary
      const getResponse = await request(app)
        .get(`/api/itineraries/${itineraryId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(getResponse.status).toBe(200)
      expect(getResponse.body.status).toBe('success')
      expect(getResponse.body.data._id).toBe(itineraryId)
      expect(getResponse.body.data.destination).toBe('新加坡')
    }, 20000)

    it('should list user itineraries', async () => {
      // Generate an itinerary
      await request(app)
        .post('/api/itineraries/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          destination: '悉尼',
          days: 3,
          budget: 12000,
          preferences: []
        })

      // List itineraries
      const response = await request(app)
        .get('/api/itineraries')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data).toHaveProperty('items')
      expect(Array.isArray(response.body.data.items)).toBe(true)
    }, 20000)

    it('should delete an itinerary', async () => {
      // Generate itinerary
      const generateResponse = await request(app)
        .post('/api/itineraries/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          destination: '迪拜',
          days: 2,
          budget: 8000,
          preferences: []
        })

      const itineraryId = generateResponse.body.data._id

      // Delete itinerary
      const deleteResponse = await request(app)
        .delete(`/api/itineraries/${itineraryId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(deleteResponse.status).toBe(200)
      expect(deleteResponse.body.status).toBe('success')

      // Verify it's deleted
      const getResponse = await request(app)
        .get(`/api/itineraries/${itineraryId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(getResponse.status).toBe(404)
    }, 20000)
  })
})
