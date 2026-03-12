import client from './client'
import type { Itinerary, ItineraryParams, ApiResponse, PaginatedResponse } from '@/types'

export const itineraryAPI = {
  generate(params: ItineraryParams) {
    return client.post<ApiResponse<Itinerary>>('/itineraries/generate', params)
  },

  getList(page: number = 1, pageSize: number = 20) {
    return client.get<ApiResponse<PaginatedResponse<Itinerary>>>('/itineraries', {
      params: { page, pageSize }
    })
  },

  getById(id: string) {
    return client.get<ApiResponse<Itinerary>>(`/itineraries/${id}`)
  },

  update(id: string, data: Partial<Itinerary>) {
    return client.put<ApiResponse<Itinerary>>(`/itineraries/${id}`, data)
  },

  delete(id: string) {
    return client.delete<ApiResponse<void>>(`/itineraries/${id}`)
  }
}
