import client from './client'
import type { Conversation, ApiResponse, PaginatedResponse } from '@/types'

export const chatAPI = {
  sendMessage(data: { message: string; conversationId?: string }) {
    return client.post<ApiResponse<{ conversationId: string; message: string; timestamp: Date }>>(
      '/chat',
      data
    )
  },

  getConversations(page: number = 1, pageSize: number = 20) {
    return client.get<ApiResponse<PaginatedResponse<Conversation>>>('/chat/conversations', {
      params: { page, pageSize }
    })
  },

  getConversation(id: string) {
    return client.get<ApiResponse<Conversation>>(`/chat/conversations/${id}`)
  },

  deleteConversation(id: string) {
    return client.delete<ApiResponse<void>>(`/chat/conversations/${id}`)
  }
}
