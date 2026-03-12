import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useDestinationStore } from '@/stores/destination'
import { useCollectionStore } from '@/stores/collection'
import * as destinationAPI from '@/api/destination'
import * as searchAPI from '@/api/search'
import * as collectionAPI from '@/api/collection'

// Mock the APIs
vi.mock('@/api/destination', () => ({
  getList: vi.fn(),
  getById: vi.fn(),
  getPopular: vi.fn()
}))

vi.mock('@/api/search', () => ({
  search: vi.fn(),
  searchDestinations: vi.fn(),
  searchItineraries: vi.fn(),
  searchConversations: vi.fn()
}))

vi.mock('@/api/collection', () => ({
  getList: vi.fn(),
  add: vi.fn(),
  remove: vi.fn(),
  check: vi.fn()
}))

describe('Frontend Destination Browsing and Search Integration Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Destination Browsing', () => {
    it('should load destinations list', async () => {
      const destinationStore = useDestinationStore()

      const mockResponse = {
        data: [
          {
            _id: 'dest-1',
            name: '巴黎',
            region: '欧洲',
            country: '法国',
            description: '浪漫之都',
            attractions: [],
            bestTimeToVisit: '4月-10月',
            averageBudget: { min: 5000, max: 15000, currency: 'CNY' },
            popularity: 95
          },
          {
            _id: 'dest-2',
            name: '伦敦',
            region: '欧洲',
            country: '英国',
            description: '历史名城',
            attractions: [],
            bestTimeToVisit: '5月-9月',
            averageBudget: { min: 6000, max: 16000, currency: 'CNY' },
            popularity: 90
          }
        ]
      }

      vi.mocked(destinationAPI.getList).mockResolvedValue(mockResponse)

      await destinationStore.loadDestinations()

      expect(destinationStore.destinations.length).toBe(2)
      expect(destinationStore.destinations[0].name).toBe('巴黎')
    })

    it('should load popular destinations', async () => {
      const destinationStore = useDestinationStore()

      const mockResponse = {
        data: [
          {
            _id: 'dest-1',
            name: '巴黎',
            region: '欧洲',
            country: '法国',
            description: '浪漫之都',
            attractions: [],
            bestTimeToVisit: '4月-10月',
            averageBudget: { min: 5000, max: 15000, currency: 'CNY' },
            popularity: 100
          }
        ]
      }

      vi.mocked(destinationAPI.getPopular).mockResolvedValue(mockResponse)

      await destinationStore.loadPopularDestinations(10)

      expect(destinationStore.popularDestinations.length).toBe(1)
      expect(destinationStore.popularDestinations[0].popularity).toBe(100)
    })

    it('should load specific destination', async () => {
      const destinationStore = useDestinationStore()

      const mockResponse = {
        data: {
          _id: 'dest-1',
          name: '巴黎',
          region: '欧洲',
          country: '法国',
          description: '浪漫之都',
          attractions: [
            {
              name: '埃菲尔铁塔',
              description: '标志性建筑',
              ticketPrice: 500
            }
          ],
          bestTimeToVisit: '4月-10月',
          averageBudget: { min: 5000, max: 15000, currency: 'CNY' },
          popularity: 95
        }
      }

      vi.mocked(destinationAPI.getById).mockResolvedValue(mockResponse)

      await destinationStore.loadDestination('dest-1')

      expect(destinationStore.selectedDestination?._id).toBe('dest-1')
      expect(destinationStore.selectedDestination?.attractions.length).toBeGreaterThan(0)
    })

    it('should filter destinations', async () => {
      const destinationStore = useDestinationStore()

      const mockResponse = {
        data: [
          {
            _id: 'dest-1',
            name: '巴黎',
            region: '欧洲',
            country: '法国',
            description: '浪漫之都',
            attractions: [],
            bestTimeToVisit: '4月-10月',
            averageBudget: { min: 5000, max: 15000, currency: 'CNY' },
            popularity: 95
          }
        ]
      }

      vi.mocked(destinationAPI.getList).mockResolvedValue(mockResponse)

      await destinationStore.loadDestinations({
        region: '欧洲'
      })

      expect(destinationStore.destinations.length).toBe(1)
      expect(destinationStore.destinations[0].region).toBe('欧洲')
    })

    it('should clear selected destination', () => {
      const destinationStore = useDestinationStore()

      destinationStore.selectedDestination = {
        _id: 'dest-1',
        name: '巴黎',
        region: '欧洲',
        country: '法国',
        description: '浪漫之都',
        attractions: [],
        bestTimeToVisit: '4月-10月',
        averageBudget: { min: 5000, max: 15000, currency: 'CNY' },
        popularity: 95
      }

      destinationStore.clearSelectedDestination()

      expect(destinationStore.selectedDestination).toBeNull()
    })

    it('should handle loading state', async () => {
      const destinationStore = useDestinationStore()

      const mockResponse = {
        data: []
      }

      vi.mocked(destinationAPI.getList).mockImplementation(
        () => new Promise(resolve => {
          setTimeout(() => resolve(mockResponse), 100)
        })
      )

      const promise = destinationStore.loadDestinations()
      expect(destinationStore.loading).toBe(true)

      await promise
      expect(destinationStore.loading).toBe(false)
    })
  })

  describe('Search Functionality', () => {
    it('should search destinations', async () => {
      const mockResponse = {
        data: [
          {
            _id: 'dest-1',
            name: '巴黎',
            region: '欧洲',
            country: '法国',
            description: '浪漫之都',
            attractions: [],
            bestTimeToVisit: '4月-10月',
            averageBudget: { min: 5000, max: 15000, currency: 'CNY' },
            popularity: 95
          }
        ]
      }

      vi.mocked(searchAPI.searchDestinations).mockResolvedValue(mockResponse)

      const result = await searchAPI.searchDestinations('巴黎')

      expect(result.data.length).toBeGreaterThan(0)
      expect(result.data[0].name).toContain('巴黎')
    })

    it('should search itineraries', async () => {
      const mockResponse = {
        data: [
          {
            _id: 'itinerary-1',
            destination: '巴黎',
            days: 3,
            budget: 10000,
            preferences: [],
            content: [],
            generatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      }

      vi.mocked(searchAPI.searchItineraries).mockResolvedValue(mockResponse)

      const result = await searchAPI.searchItineraries('巴黎')

      expect(result.data.length).toBeGreaterThan(0)
      expect(result.data[0].destination).toContain('巴黎')
    })

    it('should perform global search', async () => {
      const mockResponse = {
        data: {
          destinations: [
            {
              _id: 'dest-1',
              name: '巴黎',
              region: '欧洲',
              country: '法国',
              description: '浪漫之都',
              attractions: [],
              bestTimeToVisit: '4月-10月',
              averageBudget: { min: 5000, max: 15000, currency: 'CNY' },
              popularity: 95
            }
          ],
          itineraries: [],
          conversations: [],
          total: 1
        }
      }

      vi.mocked(searchAPI.search).mockResolvedValue(mockResponse)

      const result = await searchAPI.search('巴黎')

      expect(result.data.destinations).toBeDefined()
      expect(result.data.itineraries).toBeDefined()
      expect(result.data.conversations).toBeDefined()
    })

    it('should handle empty search results', async () => {
      const mockResponse = {
        data: {
          destinations: [],
          itineraries: [],
          conversations: [],
          total: 0
        }
      }

      vi.mocked(searchAPI.search).mockResolvedValue(mockResponse)

      const result = await searchAPI.search('nonexistent')

      expect(result.data.total).toBe(0)
    })
  })

  describe('Collection Integration', () => {
    it('should add destination to collection', async () => {
      const collectionStore = useCollectionStore()

      const mockResponse = {
        data: {
          _id: 'collection-1',
          itemId: 'dest-1',
          itemType: 'itinerary',
          createdAt: new Date().toISOString()
        }
      }

      vi.mocked(collectionAPI.add).mockResolvedValue(mockResponse)

      await collectionStore.addToCollection('dest-1', 'itinerary')

      expect(collectionStore.collections.length).toBe(1)
      expect(collectionStore.collections[0].itemId).toBe('dest-1')
    })

    it('should check if item is collected', async () => {
      const mockResponse = {
        data: {
          isCollected: true
        }
      }

      vi.mocked(collectionAPI.check).mockResolvedValue(mockResponse)

      const result = await collectionAPI.check('dest-1')

      expect(result.data.isCollected).toBe(true)
    })

    it('should remove item from collection', async () => {
      const collectionStore = useCollectionStore()

      // Set initial state
      collectionStore.collections = [
        {
          _id: 'collection-1',
          itemId: 'dest-1',
          itemType: 'itinerary',
          createdAt: new Date().toISOString()
        }
      ]

      vi.mocked(collectionAPI.remove).mockResolvedValue({ data: {} })

      await collectionStore.removeFromCollection('collection-1')

      expect(collectionStore.collections.length).toBe(0)
    })

    it('should load user collections', async () => {
      const collectionStore = useCollectionStore()

      const mockResponse = {
        data: [
          {
            _id: 'collection-1',
            itemId: 'itinerary-1',
            itemType: 'itinerary',
            createdAt: new Date().toISOString()
          }
        ]
      }

      vi.mocked(collectionAPI.getList).mockResolvedValue(mockResponse)

      await collectionStore.loadCollections()

      expect(collectionStore.collections.length).toBe(1)
    })
  })

  describe('Destination and Search Consistency', () => {
    it('should maintain destination state across operations', async () => {
      const destinationStore = useDestinationStore()

      const mockDestinations = {
        data: [
          {
            _id: 'dest-1',
            name: '巴黎',
            region: '欧洲',
            country: '法国',
            description: '浪漫之都',
            attractions: [],
            bestTimeToVisit: '4月-10月',
            averageBudget: { min: 5000, max: 15000, currency: 'CNY' },
            popularity: 95
          }
        ]
      }

      const mockPopular = {
        data: [
          {
            _id: 'dest-1',
            name: '巴黎',
            region: '欧洲',
            country: '法国',
            description: '浪漫之都',
            attractions: [],
            bestTimeToVisit: '4月-10月',
            averageBudget: { min: 5000, max: 15000, currency: 'CNY' },
            popularity: 95
          }
        ]
      }

      vi.mocked(destinationAPI.getList).mockResolvedValue(mockDestinations)
      vi.mocked(destinationAPI.getPopular).mockResolvedValue(mockPopular)

      // Load destinations
      await destinationStore.loadDestinations()
      expect(destinationStore.destinations.length).toBe(1)

      // Load popular destinations
      await destinationStore.loadPopularDestinations()
      expect(destinationStore.popularDestinations.length).toBe(1)

      // Both should be maintained
      expect(destinationStore.destinations.length).toBe(1)
      expect(destinationStore.popularDestinations.length).toBe(1)
    })
  })
})
