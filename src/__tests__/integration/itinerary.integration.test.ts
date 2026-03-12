import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useItineraryStore } from '@/stores/itinerary'
import * as itineraryAPI from '@/api/itinerary'

// Mock the API
vi.mock('@/api/itinerary', () => ({
  generate: vi.fn(),
  getList: vi.fn(),
  getById: vi.fn(),
  delete: vi.fn()
}))

describe('Frontend Itinerary Generation Integration Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Itinerary Generation', () => {
    it('should generate itinerary with valid parameters', async () => {
      const itineraryStore = useItineraryStore()

      const mockResponse = {
        data: {
          _id: 'itinerary-1',
          destination: '巴黎',
          days: 3,
          budget: 10000,
          preferences: ['美食'],
          content: [
            {
              day: 1,
              activities: [
                {
                  time: '09:00',
                  name: '埃菲尔铁塔',
                  description: '参观标志性的埃菲尔铁塔',
                  location: '战神广场',
                  cost: 500,
                  duration: '2小时'
                }
              ],
              meals: [
                {
                  type: 'breakfast',
                  restaurant: '花神咖啡馆',
                  cuisine: '法式',
                  estimatedCost: 100
                }
              ],
              accommodation: '巴黎酒店',
              dailyBudget: 3000
            }
          ],
          generatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }

      vi.mocked(itineraryAPI.generate).mockResolvedValue(mockResponse)

      const result = await itineraryStore.generateItinerary({
        destination: '巴黎',
        days: 3,
        budget: 10000,
        preferences: ['美食']
      })

      expect(result._id).toBe('itinerary-1')
      expect(result.destination).toBe('巴黎')
      expect(result.days).toBe(3)
      expect(result.content.length).toBe(3)
    })

    it('should include activities and meals in itinerary', async () => {
      const itineraryStore = useItineraryStore()

      const mockResponse = {
        data: {
          _id: 'itinerary-2',
          destination: '东京',
          days: 2,
          budget: 8000,
          preferences: [],
          content: [
            {
              day: 1,
              activities: [
                {
                  time: '10:00',
                  name: '浅草寺',
                  description: '参观古老的浅草寺',
                  location: '浅草',
                  cost: 0,
                  duration: '1.5小时'
                }
              ],
              meals: [
                {
                  type: 'lunch',
                  restaurant: '寿司店',
                  cuisine: '日式',
                  estimatedCost: 200
                }
              ],
              accommodation: '东京酒店',
              dailyBudget: 4000
            }
          ],
          generatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }

      vi.mocked(itineraryAPI.generate).mockResolvedValue(mockResponse)

      const result = await itineraryStore.generateItinerary({
        destination: '东京',
        days: 2,
        budget: 8000,
        preferences: []
      })

      expect(result.content[0].activities.length).toBeGreaterThan(0)
      expect(result.content[0].meals.length).toBeGreaterThan(0)
    })

    it('should respect budget constraint', async () => {
      const itineraryStore = useItineraryStore()

      const mockResponse = {
        data: {
          _id: 'itinerary-3',
          destination: '曼谷',
          days: 3,
          budget: 5000,
          preferences: [],
          content: [
            {
              day: 1,
              activities: [],
              meals: [],
              accommodation: '曼谷酒店',
              dailyBudget: 1500
            },
            {
              day: 2,
              activities: [],
              meals: [],
              accommodation: '曼谷酒店',
              dailyBudget: 1500
            },
            {
              day: 3,
              activities: [],
              meals: [],
              accommodation: '曼谷酒店',
              dailyBudget: 1500
            }
          ],
          generatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }

      vi.mocked(itineraryAPI.generate).mockResolvedValue(mockResponse)

      const result = await itineraryStore.generateItinerary({
        destination: '曼谷',
        days: 3,
        budget: 5000,
        preferences: []
      })

      const totalBudget = result.content.reduce((sum, day) => sum + day.dailyBudget, 0)
      expect(totalBudget).toBeLessThanOrEqual(5000)
    })

    it('should handle generation error', async () => {
      const itineraryStore = useItineraryStore()

      const error = new Error('Failed to generate itinerary')
      vi.mocked(itineraryAPI.generate).mockRejectedValue(error)

      try {
        await itineraryStore.generateItinerary({
          destination: '巴黎',
          days: 3,
          budget: 10000,
          preferences: []
        })
      } catch (e) {
        expect(e).toBeDefined()
      }
    })

    it('should update generating state', async () => {
      const itineraryStore = useItineraryStore()

      const mockResponse = {
        data: {
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
      }

      vi.mocked(itineraryAPI.generate).mockImplementation(
        () => new Promise(resolve => {
          setTimeout(() => resolve(mockResponse), 100)
        })
      )

      const promise = itineraryStore.generateItinerary({
        destination: '巴黎',
        days: 3,
        budget: 10000,
        preferences: []
      })

      expect(itineraryStore.generating).toBe(true)

      await promise
      expect(itineraryStore.generating).toBe(false)
    })
  })

  describe('Itinerary Management', () => {
    it('should load itineraries list', async () => {
      const itineraryStore = useItineraryStore()

      const mockResponse = {
        data: {
          items: [
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
          ],
          total: 1,
          page: 1,
          pageSize: 20
        }
      }

      vi.mocked(itineraryAPI.getList).mockResolvedValue(mockResponse)

      await itineraryStore.loadItineraries()

      expect(itineraryStore.itineraries.length).toBe(1)
      expect(itineraryStore.itineraries[0].destination).toBe('巴黎')
    })

    it('should load specific itinerary', async () => {
      const itineraryStore = useItineraryStore()

      const mockResponse = {
        data: {
          _id: 'itinerary-1',
          destination: '伦敦',
          days: 2,
          budget: 6000,
          preferences: [],
          content: [],
          generatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }

      vi.mocked(itineraryAPI.getById).mockResolvedValue(mockResponse)

      await itineraryStore.loadItinerary('itinerary-1')

      expect(itineraryStore.currentItinerary?._id).toBe('itinerary-1')
      expect(itineraryStore.currentItinerary?.destination).toBe('伦敦')
    })

    it('should delete itinerary', async () => {
      const itineraryStore = useItineraryStore()

      // Set initial state
      itineraryStore.itineraries = [
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

      vi.mocked(itineraryAPI.delete).mockResolvedValue({ data: {} })

      await itineraryStore.deleteItinerary('itinerary-1')

      expect(itineraryStore.itineraries.length).toBe(0)
    })

    it('should handle loading state', async () => {
      const itineraryStore = useItineraryStore()

      const mockResponse = {
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 20
        }
      }

      vi.mocked(itineraryAPI.getList).mockImplementation(
        () => new Promise(resolve => {
          setTimeout(() => resolve(mockResponse), 100)
        })
      )

      const promise = itineraryStore.loadItineraries()
      expect(itineraryStore.loading).toBe(true)

      await promise
      expect(itineraryStore.loading).toBe(false)
    })
  })

  describe('Itinerary Persistence', () => {
    it('should maintain current itinerary across operations', async () => {
      const itineraryStore = useItineraryStore()

      const mockItinerary = {
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

      const mockResponse = {
        data: mockItinerary
      }

      vi.mocked(itineraryAPI.getById).mockResolvedValue(mockResponse)

      await itineraryStore.loadItinerary('itinerary-1')

      expect(itineraryStore.currentItinerary).toEqual(mockItinerary)

      // Load another itinerary
      const mockItinerary2 = {
        ...mockItinerary,
        _id: 'itinerary-2',
        destination: '伦敦'
      }

      vi.mocked(itineraryAPI.getById).mockResolvedValue({
        data: mockItinerary2
      })

      await itineraryStore.loadItinerary('itinerary-2')

      expect(itineraryStore.currentItinerary?._id).toBe('itinerary-2')
      expect(itineraryStore.currentItinerary?.destination).toBe('伦敦')
    })
  })
})
