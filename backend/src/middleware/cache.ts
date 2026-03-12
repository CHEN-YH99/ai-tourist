import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

interface CacheEntry {
  data: any;
  timestamp: number;
}

// Simple in-memory cache
const cache = new Map<string, CacheEntry>();

/**
 * Cache middleware factory
 * @param duration - Cache duration in seconds
 */
export function cacheMiddleware(duration: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cachedEntry = cache.get(key);

    // Check if cache exists and is still valid
    if (cachedEntry) {
      const age = (Date.now() - cachedEntry.timestamp) / 1000;
      if (age < duration) {
        logger.info(`Cache hit for ${key} (age: ${age.toFixed(2)}s)`);
        return res.json(cachedEntry.data);
      } else {
        // Cache expired, remove it
        cache.delete(key);
        logger.info(`Cache expired for ${key}`);
      }
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache the response
    res.json = function (data: any) {
      cache.set(key, {
        data,
        timestamp: Date.now(),
      });
      logger.info(`Cached response for ${key} (duration: ${duration}s)`);
      return originalJson(data);
    };

    next();
  };
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

  let cleared = 0;
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
      cleared++;
    }
  }
  logger.info(`Cleared ${cleared} cache entries matching pattern: ${pattern}`);
}
