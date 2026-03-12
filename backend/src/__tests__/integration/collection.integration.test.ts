import request from 'supertest'
import express, { Application } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { responseFormatter } from '../../middleware/responseFormatter.js'
import { errorHandler } from '../../middleware/errorHandler.js'
import authRoutes from '../../routes/authRoutes.js'
import aiRoutes from '../../routes/ai.js'
import collectionRoutes from '../../routes/collectionRoutes.js'
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
  app.use('/api/collections', collectionRoutes)
  
  // Error handler
  app.use(errorHandler)
})

beforeEach(async () => {
  // Register and login a test user
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      email: `coll-test-${Date.now()}@example.com`,
      password: 'Password123',
      username: 'colluser'
    })

  token = response.body.data.token
  userId = response.body.data.user._id
})

describe('Collection Functionality Integration Tests', () => {
  describe('Collection Operations', () => {
    let itineraryId: string
    let conversationId: string

    beforeEach(async () => {
      // Generate an itinerary
      const itineraryResponse = await request(app)
        .post('/api/itineraries/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          destination: '巴黎',
          days: 2,
          budget: 5000,
          preferences: []
        })

      itineraryId = itineraryResponse.body.data._id

      // Create a conversation
      const chatResponse = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: '告诉我关于巴黎的信息'
        })

      conversationId = chatResponse.body.data.conversationId
    }, 20000)

    it('should add itinerary to collection', async () => {
      const response = await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${token}`)
        .send({
          itemId: itineraryId,
          itemType: 'itinerary'
        })

      expect(response.status).toBe(201)
      expect(response.body.status).toBe('success')
      expect(response.body.data).toHaveProperty('_id')
      expect(response.body.data.itemId).toBe(itineraryId)
      expect(response.body.data.itemType).toBe('itinerary')
    })

    it('should add conversation to collection', async () => {
      const response = await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${token}`)
        .send({
          itemId: conversationId,
          itemType: 'conversation'
        })

      expect(response.status).toBe(201)
      expect(response.body.status).toBe('success')
      expect(response.body.data.itemId).toBe(conversationId)
      expect(response.body.data.itemType).toBe('conversation')
    })

    it('should prevent duplicate collections (idempotent)', async () => {
      // Add to collection first time
      const response1 = await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${token}`)
        .send({
          itemId: itineraryId,
          itemType: 'itinerary'
        })

      expect(response1.status).toBe(201)

      // Try to add same item again
      const response2 = await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${token}`)
        .send({
          itemId: itineraryId,
          itemType: 'itinerary'
        })

      // Should either return 409 or indicate already collected
      expect([201, 409]).toContain(response2.status)
    })

    it('should retrieve user collections', async () => {
      // Add items to collection
      await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${token}`)
        .send({
          itemId: itineraryId,
          itemType: 'itinerary'
        })

      await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${token}`)
        .send({
          itemId: conversationId,
          itemType: 'conversation'
        })

      // Retrieve collections
      const response = await request(app)
        .get('/api/collections')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data.length).toBeGreaterThanOrEqual(2)
    })

    it('should filter collections by type', async () => {
      // Add both types
      await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${token}`)
        .send({
          itemId: itineraryId,
          itemType: 'itinerary'
        })

      await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${token}`)
        .send({
          itemId: conversationId,
          itemType: 'conversation'
        })

      // Filter by itinerary type
      const response = await request(app)
        .get('/api/collections?type=itinerary')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      
      // All items should be itineraries
      response.body.data.forEach((item: any) => {
        expect(item.itemType).toBe('itinerary')
      })
    })

    it('should remove item from collection', async () => {
      // Add to collection
      const addResponse = await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${token}`)
        .send({
          itemId: itineraryId,
          itemType: 'itinerary'
        })

      const collectionId = addResponse.body.data._id

      // Remove from collection
      const deleteResponse = await request(app)
        .delete(`/api/collections/${collectionId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(deleteResponse.status).toBe(200)
      expect(deleteResponse.body.status).toBe('success')

      // Verify it's removed
      const listResponse = await request(app)
        .get('/api/collections')
        .set('Authorization', `Bearer ${token}`)

      const found = listResponse.body.data.find((c: any) => c._id === collectionId)
      expect(found).toBeUndefined()
    })

    it('should check if item is collected', async () => {
      // Add to collection
      await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${token}`)
        .send({
          itemId: itineraryId,
          itemType: 'itinerary'
        })

      // Check if collected
      const response = await request(app)
        .get(`/api/collections/check/${itineraryId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data.isCollected).toBe(true)
    })

    it('should return false for uncollected items', async () => {
      const response = await request(app)
        .get(`/api/collections/check/${itineraryId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.isCollected).toBe(false)
    })

    it('should require authentication for collection operations', async () => {
      const response = await request(app)
        .post('/api/collections')
        .send({
          itemId: itineraryId,
          itemType: 'itinerary'
        })

      expect(response.status).toBe(401)
      expect(response.body.status).toBe('error')
    })

    it('should maintain collection order by creation time', async () => {
      // Add first item
      await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${token}`)
        .send({
          itemId: itineraryId,
          itemType: 'itinerary'
        })

      // Add second item
      const itinerary2Response = await request(app)
        .post('/api/itineraries/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          destination: '伦敦',
          days: 2,
          budget: 5000,
          preferences: []
        })

      await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${token}`)
        .send({
          itemId: itinerary2Response.body.data._id,
          itemType: 'itinerary'
        })

      // Retrieve collections
      const response = await request(app)
        .get('/api/collections')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      // Most recent should be first (descending order)
      if (response.body.data.length >= 2) {
        const first = new Date(response.body.data[0].createdAt)
        const second = new Date(response.body.data[1].createdAt)
        expect(first.getTime()).toBeGreaterThanOrEqual(second.getTime())
      }
    }, 25000)
  })
})
