/**
 * Frontend error handling composable
 * 前端错误处理可组合函数
 */

import { ref } from 'vue'

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export interface ErrorDetails {
  type: ErrorType
  message: string
  userMessage: string
  retryable: boolean
  statusCode?: number
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: any): string {
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  const statusCode = error.response?.status

  switch (statusCode) {
    case 400:
      return '请求参数有误，请检查后重试'
    case 401:
      return '登录已过期，请重新登录'
    case 403:
      return '您没有权限执行此操作'
    case 404:
      return '请求的内容不存在'
    case 409:
      return '操作冲突，请稍后重试'
    case 429:
      return '操作过于频繁，请稍后再试'
    case 500:
      return '服务器出错了，我们正在处理'
    case 503:
      return '服务暂时不可用，请稍后重试'
    default:
      if (error.message?.includes('timeout')) {
        return '请求超时，请检查网络连接'
      }
      if (error.message?.includes('Network Error')) {
        return '网络连接失败，请检查网络'
      }
      return '操作失败，请稍后重试'
  }
}

/**
 * Classify error type
 */
export function classifyError(error: any): ErrorDetails {
  const statusCode = error.response?.status
  let type = ErrorType.UNKNOWN
  let retryable = false

  if (!statusCode) {
    if (error.message?.includes('timeout')) {
      type = ErrorType.TIMEOUT
      retryable = true
    } else if (error.message?.includes('Network Error')) {
      type = ErrorType.NETWORK
      retryable = true
    }
  } else if (statusCode === 400) {
    type = ErrorType.VALIDATION
  } else if (statusCode === 401) {
    type = ErrorType.AUTHENTICATION
  } else if (statusCode === 403) {
    type = ErrorType.AUTHORIZATION
  } else if (statusCode === 404) {
    type = ErrorType.NOT_FOUND
  } else if (statusCode === 409) {
    type = ErrorType.CONFLICT
  } else if (statusCode === 429) {
    type = ErrorType.RATE_LIMIT
    retryable = true
  } else if (statusCode >= 500) {
    type = ErrorType.SERVER
    retryable = true
  }

  return {
    type,
    message: error.message || 'Unknown error',
    userMessage: getUserFriendlyMessage(error),
    retryable,
    statusCode,
  }
}

/**
 * Error handler composable
 */
export function useErrorHandler() {
  const error = ref<ErrorDetails | null>(null)
  const isRetrying = ref(false)

  const handleError = (err: any) => {
    error.value = classifyError(err)
    return error.value
  }

  const clearError = () => {
    error.value = null
  }

  const retry = async <T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> => {
    isRetrying.value = true
    let lastError: any

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await fn()
        isRetrying.value = false
        clearError()
        return result
      } catch (err) {
        lastError = err
        const errorDetails = classifyError(err)

        if (!errorDetails.retryable || attempt === maxRetries - 1) {
          break
        }

        // Exponential backoff
        const delay = 1000 * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    isRetrying.value = false
    handleError(lastError)
    throw lastError
  }

  return {
    error,
    isRetrying,
    handleError,
    clearError,
    retry,
  }
}
