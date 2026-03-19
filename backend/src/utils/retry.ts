/**
 * Retry utilities for handling transient failures
 * 用于处理临时故障的重试工具
 */

import { logger } from './logger.js';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: any) => boolean;
}

/**
 * Exponential backoff retry
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    shouldRetry = () => true,
  } = options;

  let lastError: any;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (attempt === maxAttempts || !shouldRetry(error)) {
        throw error;
      }

      // Log retry attempt
      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`, {
        error: error instanceof Error ? error.message : String(error),
      });

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));

      // Increase delay for next attempt (exponential backoff)
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Check if error is retryable (network errors, timeouts, 5xx errors)
 */
export function isRetryableError(error: any): boolean {
  // Network errors
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
    return true;
  }

  // HTTP 5xx errors
  if (error.response?.status >= 500 && error.response?.status < 600) {
    return true;
  }

  // Rate limit errors (429)
  if (error.response?.status === 429) {
    return true;
  }

  return false;
}
