import request from 'supertest'
import express, { Application } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { responseFormatter } from '../../middleware/responseFormatter.js'
import { errorHandler } from '../../middleware/errorHandler.js'
import authRoutes from '../../routes/authRoutes.js'
import destinationRoutes from '../../routes/destinationRoutes.js'
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
  app.use('/api/destinations', destinationRoutes)
  
  // Error handler
  app.use(errorHandler)
})

beforeEach(async () => {
  // Register and login a test user
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      email: `dest-test-${Date.now()}@example.com`,
      password: 'Password123',
      username: 'destuser'
    })

  token = response.body.data.token
})

describe('Destination Management Integration Tests', () => {
  describe('Destination Browsing', () => {
    it('should retrieve list of destinations', async () => {
      const response = await request(app)
        .get('/api/destinations')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should retrieve destination by ID', async () => {
      // First get list of destinations
      const listResponse = await request(app)
        .get('/api/destinations')

      if (listResponse.body.data.length > 0) {
        const destinationId = listResponse.body.data[0]._id

        // Get specific destination
        const response = await request(app)
          .get(`/api/destinations/${destinationId}`)

        expect(response.status).toBe(200)
        expect(response.body.status).toBe('success')
        expect(response.body.data._id).toBe(destinationId)
        expect(response.body.data).toHaveProperty('name')
        expect(response.body.data).toHaveProperty('description')
        expect(response.body.data).toHaveProperty('attractions')
      }
    })

    it('should return 404 for non-existent destination', async () => {
      const response = await request(app)
        .get('/api/destinations/nonexistent-id')

      expect(response.status).toBe(404)
      expect(response.body.status).toBe('error')
    })

    it('should retrieve popular destinations', async () => {
      const response = await request(app)
        .get('/api/destinations/popular')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should filter destinations by region', async () => {
      const response = await request(app)
        .get('/api/destinations?region=亚洲')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should filter destinations by type', async () => {
      const response = await request(app)
        .get('/api/destinations?type=海滨')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should sort destinations by popularity', async () => {
      const response = await request(app)
        .get('/api/destinations?sortBy=popularity')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      
      // Verify sorting
      if (response.body.data.length > 1) {
        for (let i = 0; i < response.body.data.length - 1; i++) {
          expect(response.body.data[i].popularity).toBeGreaterThanOrEqual(
            response.body.data[i + 1].popularity
          )
        }
      }
    })

    it('should sort destinations by name', async () => {
      const response = await request(app)
        .get('/api/destinations?sortBy=name')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      
      // Verify sorting
      if (response.body.data.length > 1) {
        for (let i = 0; i < response.body.data.length - 1; i++) {
          expect(response.body.data[i].name.localeCompare(response.body.data[i + 1].name))
            .toBeLessThanOrEqual(0)
        }
      }
    })

    it('should include complete destination information', async () => {
      const response = await request(app)
        .get('/api/destinations')

      expect(response.status).toBe(200)
      
      if (response.body.data.length > 0) {
        const destination = response.body.data[0]
        expect(destination).toHaveProperty('name')
        expect(destination).toHaveProperty('region')
        expect(destination).toHaveProperty('country')
        expect(destination).toHaveProperty('description')
        expect(destination).toHaveProperty('attractions')
        expect(destination).toHaveProperty('bestTimeToVisit')
        expect(destination).toHaveProperty('averageBudget')
        expect(destination.averageBudget).toHaveProperty('min')
        expect(destination.averageBudget).toHaveProperty('max')
      }
    })
  })

  describe('Destination Collection Flow', () => {
    it('should add destination to collection', async () => {
      // Get a destination first
      const listResponse = await request(app)
        .get('/api/destinations')

      if (listResponse.body.data.length > 0) {
        const destinationId = listResponse.body.data[0]._id

        // Add to collection (using itinerary collection as proxy)
        const response = await request(app)
          .post('/api/collections')
          .set('Authorization', `Bearer ${token}`)
          .send({
            itemId: destinationId,
            itemType: 'itinerary'
          })

        expect(response.status).toBe(201)
        expect(response.body.status).toBe('success')
      }
    })

    it('should retrieve user collections', async () => {
      const response = await request(app)
        .get('/api/collections')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should check if item is collected', async () => {
      // Get a destination
      const listResponse = await request(app)
        .get('/api/destinations')

      if (listResponse.body.data.length > 0) {
        const destinationId = listResponse.body.data[0]._id

        // Check before adding
        const checkBefore = await request(app)
          .get(`/api/collections/check/${destinationId}`)
          .set('Authorization', `Bearer ${token}`)

        expect(checkBefore.status).toBe(200)
        expect(checkBefore.body.data).toHaveProperty('isCollected')
      }
    })
  })
})
