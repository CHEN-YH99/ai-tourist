import client from './client'
import type { ApiResponse } from '@/types'

export interface RouteMapResponse {
  message: string
  imageUrl?: string
  timestamp: Date
}

export const routeMapAPI = {
  generateRouteMap(content: string) {
    return client.post<ApiResponse<RouteMapResponse>>('/route-map/generate', {
      content
    })
  }
}
