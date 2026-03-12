import client from './client'
import type { Collection, CollectionType, ApiResponse } from '@/types'

export const collectionAPI = {
  getList(type?: CollectionType) {
    return client.get<ApiResponse<Collection[]>>('/collections', {
      params: type ? { type } : {}
    })
  },

  add(itemId: string, itemType: CollectionType) {
    return client.post<ApiResponse<Collection>>('/collections', {
      itemId,
      itemType
    })
  },

  remove(id: string) {
    return client.delete<ApiResponse<void>>(`/collections/${id}`)
  },

  check(itemId: string) {
    return client.get<ApiResponse<{ isCollected: boolean }>>(`/collections/check/${itemId}`)
  }
}
