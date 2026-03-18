import { chatClient } from './client'
import type { Itinerary, ItineraryParams, ApiResponse, PaginatedResponse } from '@/types'

export const itineraryAPI = {
  generate(params: ItineraryParams) {
    // Use chatClient for longer timeout (60 seconds)
    return chatClient.post<ApiResponse<Itinerary>>('/itineraries/generate', params)
  },

  getList(page: number = 1, pageSize: number = 20) {
    return chatClient.get<ApiResponse<PaginatedResponse<Itinerary>>>('/itineraries', {
      params: { page, pageSize }
    })
  },

  getById(id: string) {
    return chatClient.get<ApiResponse<Itinerary>>(`/itineraries/${id}`)
  },

  update(id: string, data: Partial<Itinerary>) {
    return chatClient.put<ApiResponse<Itinerary>>(`/itineraries/${id}`, data)
  },

  delete(id: string) {
    return chatClient.delete<ApiResponse<void>>(`/itineraries/${id}`)
  }
}
