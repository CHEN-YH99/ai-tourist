import client from './client'
import type { LoginDTO, RegisterDTO, UpdateProfileDTO, AuthResponse, UserProfile, ApiResponse } from '@/types'

export const authAPI = {
  register(data: RegisterDTO) {
    return client.post<ApiResponse<AuthResponse>>('/auth/register', data)
  },

  login(data: LoginDTO) {
    return client.post<ApiResponse<AuthResponse>>('/auth/login', data)
  },

  logout() {
    return client.post<ApiResponse<void>>('/auth/logout')
  },

  verify() {
    return client.get<ApiResponse<UserProfile>>('/auth/verify')
  },

  getProfile() {
    return client.get<ApiResponse<UserProfile>>('/users/profile')
  },

  updateProfile(data: UpdateProfileDTO) {
    return client.put<ApiResponse<UserProfile>>('/users/profile', data)
  },

  uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('avatar', file)
    return client.post<ApiResponse<{ avatar: string }>>('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  deleteAccount() {
    return client.delete<ApiResponse<void>>('/users/account')
  }
}
