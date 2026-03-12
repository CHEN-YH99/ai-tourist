import request from 'supertest'
import express, { Application } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { responseFormatter } from '../../middleware/responseFormatter.js'
import { errorHandler } from '../../middleware/errorHandler.js'
import authRoutes from '../../routes/authRoutes.js'
import aiRoutes from '../../routes/ai.js'
import destinationRoutes from '../../routes/destinationRoutes.js'
import searchRoutes from '../../routes/searchRoutes.js'
import { corsOptions } from '../../config/cors.js'
import { helmetOptions } from '../../config/security.js'

let app: Application
let token: string

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
  app.use('/api/destinations', destinationRoutes)
  app.use('/api/search', searchRoutes)
  
  // Error handler
  app.use(errorHandler)
})

beforeEach(async () => {
  // Register and login a test user
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      email: `search-test-${Date.now()}@example.com`,
      password: 'Password123',
      username: 'searchuser'
    })

  token = response.body.data.token
})

describe('Search Functionality Integration Tests', () => {
  describe('Global Search', () => {
    it('should search destinations by keyword', async () => {
      const response = await request(app)
        .get('/api/search?query=巴黎')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data).toHaveProperty('destinations')
      expect(response.body.data).toHaveProperty('itineraries')
      expect(response.body.data).toHaveProperty('conversations')
    })

    it('should search itineraries by keyword', async () => {
      // Create an itinerary first
      await request(app)
        .post('/api/itineraries/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          destination: '东京',
          days: 3,
          budget: 10000,
          preferences: []
        })

      // Search for it
      const response = await request(app)
        .get('/api/search?query=东京')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data.itineraries).toBeDefined()
    }, 20000)

    it('should search conversations by keyword', async () => {
      // Create a conversation first
      await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: '告诉我关于新加坡的信息'
        })

      // Search for it
      const response = await request(app)
        .get('/api/search?query=新加坡')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data.conversations).toBeDefined()
    }, 15000)

    it('should return empty results for non-matching query', async () => {
      const response = await request(app)
        .get('/api/search?query=xyznonexistentquery123')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data.destinations.length).toBe(0)
    })

    it('should reject empty search query', async () => {
      const response = await request(app)
        .get('/api/search?query=')

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('error')
    })

    it('should reject search without query parameter', async () => {
      const response = await request(app)
        .get('/api/search')

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('error')
    })

    it('should filter search results by type', async () => {
      const response = await request(app)
        .get('/api/search?query=巴黎&type=destination')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data).toHaveProperty('destinations')
    })

    it('should support fuzzy matching', async () => {
      // Search with partial keyword
      const response = await request(app)
        .get('/api/search?query=巴')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
    })

    it('should prioritize user own itineraries in search', async () => {
      // Create an itinerary
      const itineraryResponse = await request(app)
        .post('/api/itineraries/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({
          destination: '首尔',
          days: 2,
          budget: 5000,
          preferences: []
        })

      // Search for it
      const response = await request(app)
        .get('/api/search?query=首尔')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.data.itineraries.length).toBeGreaterThan(0)
      
      // First result should be the user's own itinerary
      const firstItinerary = response.body.data.itineraries[0]
      expect(firstItinerary.userId).toBe(token ? 'user-owned' : undefined)
    }, 20000)
  })

  describe('Specific Search Endpoints', () => {
    it('should search destinations specifically', async () => {
      const response = await request(app)
        .get('/api/search/destinations?query=巴黎')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should search itineraries specifically', async () => {
      const response = await request(app)
        .get('/api/search/itineraries?query=东京')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should search conversations specifically', async () => {
      const response = await request(app)
        .get('/api/search/conversations?query=旅游')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should reject specific search without query', async () => {
      const response = await request(app)
        .get('/api/search/destinations')

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('error')
    })
  })

  describe('Search Consistency', () => {
    it('should return consistent results for same query', async () => {
      const query = '巴黎'
      
      // First search
      const response1 = await request(app)
        .get(`/api/search?query=${query}`)

      // Second search
      const response2 = await request(app)
        .get(`/api/search?query=${query}`)

      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
      
      // Results should be identical (idempotent)
      expect(response1.body.data.destinations.length).toBe(response2.body.data.destinations.length)
    })

    it('should handle special characters in search', async () => {
      const response = await request(app)
        .get('/api/search?query=北京-上海')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
    })

    it('should handle whitespace in search query', async () => {
      const response = await request(app)
        .get('/api/search?query=  巴黎  ')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
    })

    it('should complete search within timeout', async () => {
      const startTime = Date.now()
      
      const response = await request(app)
        .get('/api/search?query=旅游')

      const duration = Date.now() - startTime
      
      expect(response.status).toBe(200)
      // Search should complete within 2 seconds (2000ms)
      expect(duration).toBeLessThan(2000)
    })
  })

  describe('Search Pagination', () => {
    it('should support pagination in search results', async () => {
      const response = await request(app)
        .get('/api/search?query=巴黎&page=1&pageSize=10')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.data).toHaveProperty('total')
    })

    it('should return correct page size', async () => {
      const response = await request(app)
        .get('/api/search?query=巴黎&pageSize=5')

      expect(response.status).toBe(200)
      const totalResults = 
        response.body.data.destinations.length +
        response.body.data.itineraries.length +
        response.body.data.conversations.length
      
      expect(totalResults).toBeLessThanOrEqual(5)
    })
  })
})
