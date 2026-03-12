import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types'

// Create axios instance
const client: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Store for toast notifications (will be set by App.vue)
let toastNotifier: ((message: string, type: string, title?: string) => void) | null = null

export function setToastNotifier(notifier: (message: string, type: string, title?: string) => void) {
  toastNotifier = notifier
}

// Helper function to extract error message from various error formats
function extractErrorMessage(error: AxiosError<ApiResponse<any>>): string {
  // Try to get message from API response
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  // Try to get message from error response data
  if (error.response?.data?.error) {
    return typeof error.response.data.error === 'string'
      ? error.response.data.error
      : error.response.data.error.message || '请求失败'
  }

  // Fallback to axios error message
  if (error.message) {
    return error.message
  }

  // Default message based on status code
  switch (error.response?.status) {
    case 400:
      return '请求参数错误'
    case 401:
      return '认证已过期，请重新登录'
    case 403:
      return '您没有权限执行此操作'
    case 404:
      return '请求的资源不存在'
    case 409:
      return '资源冲突，请稍后重试'
    case 429:
      return '请求过于频繁，请稍后再试'
    case 500:
      return '服务器内部错误'
    case 503:
      return '服务暂时不可用，请稍后重试'
    default:
      return '请求失败，请稍后重试'
  }
}

// Request interceptor - add Authorization header
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors
client.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    return response
  },
  (error: AxiosError<ApiResponse<any>>) => {
    const errorMessage = extractErrorMessage(error)
    const statusCode = error.response?.status

    // Handle 401 Unauthorized - redirect to login
    if (statusCode === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      toastNotifier?.(errorMessage, 'error', '认证失败')
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/login'
      }, 1000)
    } else if (statusCode === 403) {
      // Handle 403 Forbidden
      toastNotifier?.(errorMessage, 'error', '权限不足')
    } else if (statusCode === 429) {
      // Handle rate limiting
      toastNotifier?.(errorMessage, 'warning', '请求过于频繁')
    } else if (statusCode && statusCode >= 500) {
      // Handle server errors
      toastNotifier?.(errorMessage, 'error', '服务器错误')
    } else if (statusCode && statusCode >= 400) {
      // Handle client errors
      toastNotifier?.(errorMessage, 'error', '请求错误')
    } else if (error.code === 'ECONNABORTED') {
      // Handle timeout
      toastNotifier?.('请求超时，请检查网络连接', 'error', '连接超时')
    } else if (error.message === 'Network Error') {
      // Handle network errors
      toastNotifier?.('网络连接失败，请检查您的网络', 'error', '网络错误')
    } else {
      // Handle other errors
      toastNotifier?.(errorMessage, 'error', '错误')
    }

    return Promise.reject({
      status: statusCode,
      message: errorMessage,
      data: error.response?.data
    })
  }
)

export default client
