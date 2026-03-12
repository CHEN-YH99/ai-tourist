import client from './client'
import type { Destination, DestinationFilters, ApiResponse } from '@/types'

export const destinationAPI = {
  getList(filters?: DestinationFilters) {
    return client.get<ApiResponse<Destination[]>>('/destinations', {
      params: filters
    })
  },

  getById(id: string) {
    return client.get<ApiResponse<Destination>>(`/destinations/${id}`)
  },

  getPopular(limit: number = 10) {
    return client.get<ApiResponse<Destination[]>>('/destinations/popular', {
      params: { limit }
    })
  },

  create(data: Partial<Destination>) {
    return client.post<ApiResponse<Destination>>('/destinations', data)
  },

  update(id: string, data: Partial<Destination>) {
    return client.put<ApiResponse<Destination>>(`/destinations/${id}`, data)
  }
}
