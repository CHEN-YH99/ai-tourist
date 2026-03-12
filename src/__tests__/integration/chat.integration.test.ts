import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useChatStore } from '@/stores/chat'
import * as chatAPI from '@/api/chat'

// Mock the API
vi.mock('@/api/chat', () => ({
  sendMessage: vi.fn(),
  getConversations: vi.fn(),
  getConversation: vi.fn(),
  deleteConversation: vi.fn()
}))

describe('Frontend AI Q&A Integration Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Chat Message Flow', () => {
    it('should send a message and receive response', async () => {
      const chatStore = useChatStore()

      const mockResponse = {
        data: {
          conversationId: 'conv-1',
          message: '巴黎是法国的首都，以其艺术、文化和美食而闻名。',
          timestamp: new Date().toISOString()
        }
      }

      vi.mocked(chatAPI.sendMessage).mockResolvedValue(mockResponse)

      const result = await chatStore.sendMessage('告诉我关于巴黎的信息')

      expect(result).toHaveProperty('conversationId')
      expect(result).toHaveProperty('message')
      expect(result.message).toBeTruthy()
    })

    it('should maintain conversation history', async () => {
      const chatStore = useChatStore()

      const mockResponse1 = {
        data: {
          conversationId: 'conv-1',
          message: '我可以帮助您规划欧洲之旅。',
          timestamp: new Date().toISOString()
        }
      }

      const mockResponse2 = {
        data: {
          conversationId: 'conv-1',
          message: '巴黎、伦敦和罗马都是很好的选择。',
          timestamp: new Date().toISOString()
        }
      }

      vi.mocked(chatAPI.sendMessage)
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2)

      // First message
      await chatStore.sendMessage('我想去欧洲旅游')

      // Second message in same conversation
      await chatStore.sendMessage('你能推荐一些景点吗？', 'conv-1')

      expect(chatAPI.sendMessage).toHaveBeenCalledTimes(2)
    })

    it('should handle message sending error', async () => {
      const chatStore = useChatStore()

      const error = new Error('Failed to send message')
      vi.mocked(chatAPI.sendMessage).mockRejectedValue(error)

      try {
        await chatStore.sendMessage('测试消息')
      } catch (e) {
        expect(e).toBeDefined()
      }
    })

    it('should update sending state', async () => {
      const chatStore = useChatStore()

      const mockResponse = {
        data: {
          conversationId: 'conv-1',
          message: '测试回复',
          timestamp: new Date().toISOString()
        }
      }

      vi.mocked(chatAPI.sendMessage).mockImplementation(
        () => new Promise(resolve => {
          setTimeout(() => resolve(mockResponse), 100)
        })
      )

      const promise = chatStore.sendMessage('测试')
      expect(chatStore.sending).toBe(true)

      await promise
      expect(chatStore.sending).toBe(false)
    })
  })

  describe('Conversation Management', () => {
    it('should load conversations list', async () => {
      const chatStore = useChatStore()

      const mockResponse = {
        data: {
          items: [
            {
              _id: 'conv-1',
              title: '关于巴黎',
              messages: [],
              createdAt: new Date().toISOString()
            },
            {
              _id: 'conv-2',
              title: '关于伦敦',
              messages: [],
              createdAt: new Date().toISOString()
            }
          ],
          total: 2,
          page: 1,
          pageSize: 20
        }
      }

      vi.mocked(chatAPI.getConversations).mockResolvedValue(mockResponse)

      await chatStore.loadConversations()

      expect(chatStore.conversations.length).toBe(2)
      expect(chatStore.conversations[0]._id).toBe('conv-1')
    })

    it('should load specific conversation', async () => {
      const chatStore = useChatStore()

      const mockResponse = {
        data: {
          _id: 'conv-1',
          title: '关于巴黎',
          messages: [
            {
              role: 'user',
              content: '告诉我关于巴黎的信息',
              timestamp: new Date().toISOString()
            },
            {
              role: 'assistant',
              content: '巴黎是法国的首都...',
              timestamp: new Date().toISOString()
            }
          ],
          createdAt: new Date().toISOString()
        }
      }

      vi.mocked(chatAPI.getConversation).mockResolvedValue(mockResponse)

      await chatStore.loadConversation('conv-1')

      expect(chatStore.currentConversation?._id).toBe('conv-1')
      expect(chatStore.currentConversation?.messages.length).toBe(2)
    })

    it('should delete conversation', async () => {
      const chatStore = useChatStore()

      // Set initial state
      chatStore.conversations = [
        {
          _id: 'conv-1',
          title: '关于巴黎',
          messages: [],
          createdAt: new Date().toISOString()
        }
      ]

      vi.mocked(chatAPI.deleteConversation).mockResolvedValue({ data: {} })

      await chatStore.deleteConversation('conv-1')

      expect(chatStore.conversations.length).toBe(0)
    })

    it('should clear current conversation', () => {
      const chatStore = useChatStore()

      chatStore.currentConversation = {
        _id: 'conv-1',
        title: '测试',
        messages: [],
        createdAt: new Date().toISOString()
      }

      chatStore.clearCurrentConversation()

      expect(chatStore.currentConversation).toBeNull()
    })

    it('should handle loading state', async () => {
      const chatStore = useChatStore()

      const mockResponse = {
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 20
        }
      }

      vi.mocked(chatAPI.getConversations).mockImplementation(
        () => new Promise(resolve => {
          setTimeout(() => resolve(mockResponse), 100)
        })
      )

      const promise = chatStore.loadConversations()
      expect(chatStore.loading).toBe(true)

      await promise
      expect(chatStore.loading).toBe(false)
    })
  })

  describe('Conversation Persistence', () => {
    it('should maintain conversation state across operations', async () => {
      const chatStore = useChatStore()

      const mockConversations = {
        data: {
          items: [
            {
              _id: 'conv-1',
              title: '关于巴黎',
              messages: [],
              createdAt: new Date().toISOString()
            }
          ],
          total: 1,
          page: 1,
          pageSize: 20
        }
      }

      const mockConversation = {
        data: {
          _id: 'conv-1',
          title: '关于巴黎',
          messages: [
            {
              role: 'user',
              content: '告诉我关于巴黎',
              timestamp: new Date().toISOString()
            }
          ],
          createdAt: new Date().toISOString()
        }
      }

      vi.mocked(chatAPI.getConversations).mockResolvedValue(mockConversations)
      vi.mocked(chatAPI.getConversation).mockResolvedValue(mockConversation)

      // Load conversations
      await chatStore.loadConversations()
      expect(chatStore.conversations.length).toBe(1)

      // Load specific conversation
      await chatStore.loadConversation('conv-1')
      expect(chatStore.currentConversation?._id).toBe('conv-1')

      // Conversations list should still be there
      expect(chatStore.conversations.length).toBe(1)
    })
  })
})
