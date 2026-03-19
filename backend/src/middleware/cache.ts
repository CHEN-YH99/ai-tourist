import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { LRUCache } from '../utils/cache.js';

// 使用改进的LRU缓存替代简单Map
const cache = new LRUCache({
  maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000'),
  defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '300'),
});

/**
 * Cache middleware factory
 * @param duration - Cache duration in seconds (optional, uses default if not provided)
 */
export function cacheMiddleware(duration?: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cachedData = cache.get(key);

    // Check if cache exists and return it
    if (cachedData) {
      logger.info(`Cache hit for ${key}`);
      return res.json(cachedData);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache the response
    res.json = function (data: any) {
      cache.set(key, data, duration);
      logger.info(`Cached response for ${key} (duration: ${duration || 'default'}s)`);
      return originalJson(data);
    };

    next();
  };
}

/**
 * Clear cache for specific pattern
 */
export function clearCachePattern(pattern: string): void {
  // Note: LRUCache doesn't support pattern matching yet
  // This is a placeholder for future implementation
  logger.info(`Cache clear requested for pattern: ${pattern}`);
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return cache.getStats();
}

/**
 * Clear cache for a specific key or pattern
 */
export function clearCache(pattern?: string) {
  if (!pattern) {
    cache.clear();
    logger.info('Cleared all cache');
    return;
  }

  // Note: LRUCache doesn't have a keys() method yet
  // This is a placeholder for future implementation
  logger.info(`Cache clear requested for pattern: ${pattern}`);
}
