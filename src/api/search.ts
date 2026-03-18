import client from './client'
import type { SearchResults, SearchFilters, Destination, Itinerary, Conversation, ApiResponse } from '@/types'

export const searchAPI = {
  search(query: string, filters?: SearchFilters) {
    return client.get<ApiResponse<SearchResults>>('/search', {
      params: { q: query, ...filters }
    })
  },

  searchDestinations(query: string) {
    return client.get<ApiResponse<Destination[]>>('/search/destinations', {
      params: { q: query }
    })
  },

  searchItineraries(query: string) {
    return client.get<ApiResponse<Itinerary[]>>('/search/itineraries', {
      params: { q: query }
    })
  },

  searchConversations(query: string) {
    return client.get<ApiResponse<Conversation[]>>('/search/conversations', {
      params: { q: query }
    })
  }
}
