/**
 * Enhanced error handling utilities
 * 改进的错误处理工具
 */

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  DATABASE = 'DATABASE',
  INTERNAL = 'INTERNAL',
}

export interface ErrorDetails {
  type: ErrorType;
  message: string;
  statusCode: number;
  userMessage: string;
  retryable: boolean;
  details?: any;
}

/**
 * Map error to user-friendly message
 */
export function getUserFriendlyMessage(error: any): string {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  const statusCode = error.response?.status;

  switch (statusCode) {
    case 400:
      return '请求参数有误，请检查后重试';
    case 401:
      return '登录已过期，请重新登录';
    case 403:
      return '您没有权限执行此操作';
    case 404:
      return '请求的内容不存在';
    case 409:
      return '操作冲突，请稍后重试';
    case 429:
      return '操作过于频繁，请稍后再试';
    case 500:
      return '服务器出错了，我们正在处理';
    case 503:
      return '服务暂时不可用，请稍后重试';
    default:
      if (error.message?.includes('timeout')) {
        return '请求超时，请检查网络连接';
      }
      if (error.message?.includes('Network Error')) {
        return '网络连接失败，请检查网络';
      }
      return '操作失败，请稍后重试';
  }
}

/**
 * Classify error type
 */
export function classifyError(error: any): ErrorDetails {
  const statusCode = error.response?.status || 500;
  let type = ErrorType.INTERNAL;
  let retryable = false;

  if (statusCode === 400) {
    type = ErrorType.VALIDATION;
  } else if (statusCode === 401) {
    type = ErrorType.AUTHENTICATION;
  } else if (statusCode === 403) {
    type = ErrorType.AUTHORIZATION;
  } else if (statusCode === 404) {
    type = ErrorType.NOT_FOUND;
  } else if (statusCode === 409) {
    type = ErrorType.CONFLICT;
  } else if (statusCode === 429) {
    type = ErrorType.RATE_LIMIT;
    retryable = true;
  } else if (statusCode >= 500) {
    type = ErrorType.INTERNAL;
    retryable = true;
  }

  // Check for external service errors
  if (error.message?.includes('OpenAI') || error.message?.includes('Gemini')) {
    type = ErrorType.EXTERNAL_SERVICE;
    retryable = true;
  }

  // Check for database errors
  if (error.name === 'MongoError' || error.name === 'MongooseError') {
    type = ErrorType.DATABASE;
    retryable = true;
  }

  return {
    type,
    message: error.message || 'Unknown error',
    statusCode,
    userMessage: getUserFriendlyMessage(error),
    retryable,
    details: error.response?.data,
  };
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const errorDetails = classifyError(error);

      // Don't retry if error is not retryable
      if (!errorDetails.retryable) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
