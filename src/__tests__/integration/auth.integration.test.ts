import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import * as authAPI from '@/api/auth'

// Mock the API
vi.mock('@/api/auth', () => ({
  register: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  getProfile: vi.fn(),
  updateProfile: vi.fn()
}))

describe('Frontend Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('User Registration and Login', () => {
    it('should register a new user successfully', async () => {
      const authStore = useAuthStore()
      
      const mockResponse = {
        data: {
          token: 'test-token-123',
          user: {
            _id: 'user-1',
            email: 'test@example.com',
            username: 'testuser',
            preferences: []
          }
        }
      }

      vi.mocked(authAPI.register).mockResolvedValue(mockResponse)

      await authStore.register({
        email: 'test@example.com',
        password: 'Password123',
        username: 'testuser'
      })

      expect(authStore.token).toBe('test-token-123')
      expect(authStore.user?.email).toBe('test@example.com')
      expect(authStore.isAuthenticated).toBe(true)
      expect(localStorage.getItem('token')).toBe('test-token-123')
    })

    it('should login with correct credentials', async () => {
      const authStore = useAuthStore()
      
      const mockResponse = {
        data: {
          token: 'login-token-456',
          user: {
            _id: 'user-2',
            email: 'login@example.com',
            username: 'loginuser',
            preferences: []
          }
        }
      }

      vi.mocked(authAPI.login).mockResolvedValue(mockResponse)

      await authStore.login({
        email: 'login@example.com',
        password: 'Password123'
      })

      expect(authStore.token).toBe('login-token-456')
      expect(authStore.user?.email).toBe('login@example.com')
      expect(authStore.isAuthenticated).toBe(true)
    })

    it('should handle login failure', async () => {
      const authStore = useAuthStore()
      
      const error = new Error('Invalid credentials')
      vi.mocked(authAPI.login).mockRejectedValue(error)

      try {
        await authStore.login({
          email: 'wrong@example.com',
          password: 'WrongPassword'
        })
      } catch (e) {
        expect(authStore.isAuthenticated).toBe(false)
        expect(authStore.token).toBeNull()
      }
    })

    it('should logout user', async () => {
      const authStore = useAuthStore()
      
      // Set initial state
      authStore.token = 'test-token'
      authStore.user = {
        _id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        preferences: []
      }

      await authStore.logout()

      expect(authStore.token).toBeNull()
      expect(authStore.user).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
      expect(localStorage.getItem('token')).toBeNull()
    })
  })

  describe('Profile Management', () => {
    it('should fetch user profile', async () => {
      const authStore = useAuthStore()
      authStore.token = 'test-token'

      const mockResponse = {
        data: {
          _id: 'user-1',
          email: 'profile@example.com',
          username: 'profileuser',
          preferences: ['美食', '文化']
        }
      }

      vi.mocked(authAPI.getProfile).mockResolvedValue(mockResponse)

      await authStore.fetchProfile()

      expect(authStore.user?.email).toBe('profile@example.com')
      expect(authStore.user?.preferences).toContain('美食')
    })

    it('should update user profile', async () => {
      const authStore = useAuthStore()
      authStore.user = {
        _id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        preferences: []
      }

      const mockResponse = {
        data: {
          _id: 'user-1',
          email: 'test@example.com',
          username: 'updateduser',
          preferences: ['冒险']
        }
      }

      vi.mocked(authAPI.updateProfile).mockResolvedValue(mockResponse)

      await authStore.updateProfile({
        username: 'updateduser',
        preferences: ['冒险']
      })

      expect(authStore.user?.username).toBe('updateduser')
      expect(authStore.user?.preferences).toContain('冒险')
    })

    it('should maintain user preferences', async () => {
      const authStore = useAuthStore()
      
      const mockResponse = {
        data: {
          token: 'test-token',
          user: {
            _id: 'user-1',
            email: 'test@example.com',
            username: 'testuser',
            preferences: ['美食', '文化', '冒险']
          }
        }
      }

      vi.mocked(authAPI.register).mockResolvedValue(mockResponse)

      await authStore.register({
        email: 'test@example.com',
        password: 'Password123',
        username: 'testuser'
      })

      expect(authStore.userPreferences).toEqual(['美食', '文化', '冒险'])
    })
  })

  describe('Token Persistence', () => {
    it('should persist token to localStorage', async () => {
      const authStore = useAuthStore()
      
      const mockResponse = {
        data: {
          token: 'persistent-token',
          user: {
            _id: 'user-1',
            email: 'test@example.com',
            username: 'testuser',
            preferences: []
          }
        }
      }

      vi.mocked(authAPI.login).mockResolvedValue(mockResponse)

      await authStore.login({
        email: 'test@example.com',
        password: 'Password123'
      })

      expect(localStorage.getItem('token')).toBe('persistent-token')
    })

    it('should restore token from localStorage on init', () => {
      localStorage.setItem('token', 'restored-token')
      
      const authStore = useAuthStore()
      
      expect(authStore.token).toBe('restored-token')
    })

    it('should clear token from localStorage on logout', async () => {
      localStorage.setItem('token', 'test-token')
      
      const authStore = useAuthStore()
      authStore.token = 'test-token'
      authStore.user = {
        _id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        preferences: []
      }

      await authStore.logout()

      expect(localStorage.getItem('token')).toBeNull()
    })
  })
})
