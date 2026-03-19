import client from './client'
import type { Destination, DestinationFilters, ApiResponse } from '@/types'
import { destinationCache, createCacheKey } from '@/utils/cache'

export const destinationAPI = {
  async getList(filters?: DestinationFilters) {
    const cacheKey = createCacheKey('destinations-list', filters || {})
    
    const cached = destinationCache.get(cacheKey)
    if (cached) {
      console.log('[Cache] Destination list hit')
      return cached
    }

    const response = await client.get<ApiResponse<Destination[]>>('/destinations', {
      params: filters
    })

    destinationCache.set(cacheKey, response)
    return response
  },

  async getById(id: string) {
    const cacheKey = `destination-${id}`
    
    const cached = destinationCache.get(cacheKey)
    if (cached) {
      console.log('[Cache] Destination hit:', id)
      return cached
    }

    const response = await client.get<ApiResponse<Destination>>(`/destinations/${id}`)
    
    destinationCache.set(cacheKey, response)
    return response
  },

  async getPopular(limit: number = 10) {
    const cacheKey = `destinations-popular-${limit}`
    
    const cached = destinationCache.get(cacheKey)
    if (cached) {
      console.log('[Cache] Popular destinations hit')
      return cached
    }

    const response = await client.get<ApiResponse<Destination[]>>('/destinations/popular', {
      params: { limit }
    })

    destinationCache.set(cacheKey, response)
    return response
  },

  async create(data: Partial<Destination>) {
    const response = await client.post<ApiResponse<Destination>>('/destinations', data)
    
    // 清除列表缓存
    destinationCache.clear()
    
    return response
  },

  async update(id: string, data: Partial<Destination>) {
    const response = await client.put<ApiResponse<Destination>>(`/destinations/${id}`, data)
    
    // 清除相关缓存
    destinationCache.delete(`destination-${id}`)
    destinationCache.clear() // 清除列表缓存
    
    return response
  },

  /**
   * 清除目的地缓存
   */
  clearCache() {
    destinationCache.clear()
  }
}
