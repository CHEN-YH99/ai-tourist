import client from './client'
import type { SearchResults, SearchFilters, Destination, Itinerary, Conversation, ApiResponse } from '@/types'
import { searchCache, createCacheKey } from '@/utils/cache'

export const searchAPI = {
  async search(query: string, filters?: SearchFilters) {
    const cacheKey = createCacheKey('search', { query, ...filters })
    
    // 尝试从缓存获取
    const cached = searchCache.get(cacheKey)
    if (cached) {
      console.log('[Cache] Search hit:', query)
      return cached
    }

    // 执行请求
    const response = await client.get<ApiResponse<SearchResults>>('/search', {
      params: { q: query, ...filters }
    })

    // 缓存结果
    searchCache.set(cacheKey, response)
    return response
  },

  async searchDestinations(query: string) {
    const cacheKey = createCacheKey('search-destinations', { query })
    
    const cached = searchCache.get(cacheKey)
    if (cached) {
      console.log('[Cache] Destination search hit:', query)
      return cached
    }

    const response = await client.get<ApiResponse<Destination[]>>('/search/destinations', {
      params: { q: query }
    })

    searchCache.set(cacheKey, response)
    return response
  },

  async searchItineraries(query: string) {
    const cacheKey = createCacheKey('search-itineraries', { query })
    
    const cached = searchCache.get(cacheKey)
    if (cached) {
      console.log('[Cache] Itinerary search hit:', query)
      return cached
    }

    const response = await client.get<ApiResponse<Itinerary[]>>('/search/itineraries', {
      params: { q: query }
    })

    searchCache.set(cacheKey, response)
    return response
  },

  async searchConversations(query: string) {
    const cacheKey = createCacheKey('search-conversations', { query })
    
    const cached = searchCache.get(cacheKey)
    if (cached) {
      console.log('[Cache] Conversation search hit:', query)
      return cached
    }

    const response = await client.get<ApiResponse<Conversation[]>>('/search/conversations', {
      params: { q: query }
    })

    searchCache.set(cacheKey, response)
    return response
  },

  /**
   * 清除搜索缓存
   */
  clearCache() {
    searchCache.clear()
  }
}
