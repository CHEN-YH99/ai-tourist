import client from './client'
import type { SearchResults, SearchFilters, Destination, Itinerary, Conversation, ApiResponse } from '@/types'

export const searchAPI = {
  search(query: string, filters?: SearchFilters) {
    return client.get<ApiResponse<SearchResults>>('/search', {
      params: { query, ...filters }
    })
  },

  searchDestinations(query: string) {
    return client.get<ApiResponse<Destination[]>>('/search/destinations', {
      params: { query }
    })
  },

  searchItineraries(query: string) {
    return client.get<ApiResponse<Itinerary[]>>('/search/itineraries', {
      params: { query }
    })
  },

  searchConversations(query: string) {
    return client.get<ApiResponse<Conversation[]>>('/search/conversations', {
      params: { query }
    })
  }
}
