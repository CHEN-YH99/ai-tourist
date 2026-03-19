/**
 * Enhanced caching utilities
 * 改进的缓存工具，支持TTL和LRU策略
 */

import { logger } from './logger.js';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
}

interface CacheOptions {
  maxSize?: number;
  defaultTTL?: number; // seconds
}

/**
 * LRU Cache implementation with TTL support
 */
export class LRUCache<T = any> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private defaultTTL: number;
  private hits: number = 0;
  private misses: number = 0;

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize || 1000;
    this.defaultTTL = options.defaultTTL || 300; // 5 minutes default
  }

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    const age = (Date.now() - entry.timestamp) / 1000;
    if (age > this.defaultTTL) {
      this.cache.delete(key);
      this.misses++;
      logger.debug(`Cache expired: ${key} (age: ${age.toFixed(2)}s)`);
      return null;
    }

    // Update hits and move to end (LRU)
    entry.hits++;
    this.hits++;
    this.cache.delete(key);
    this.cache.set(key, entry);

    logger.debug(`Cache hit: ${key} (hits: ${entry.hits})`);
    return entry.data;
  }

  /**
   * Set value in cache
   */
  set(key: string, data: T, ttl?: number): void {
    // Evict oldest entry if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      logger.debug(`Cache evicted: ${firstKey}`);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0,
    });

    logger.debug(`Cache set: ${key} (TTL: ${ttl || this.defaultTTL}s)`);
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    logger.info('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.hits + this.misses > 0 
      ? (this.hits / (this.hits + this.misses) * 100).toFixed(2)
      : '0.00';

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: `${hitRate}%`,
    };
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

/**
 * Global cache instances
 */
export const destinationCache = new LRUCache({
  maxSize: 500,
  defaultTTL: 600, // 10 minutes for destinations
});

export const searchCache = new LRUCache({
  maxSize: 1000,
  defaultTTL: 300, // 5 minutes for search results
});

export const aiResponseCache = new LRUCache({
  maxSize: 200,
  defaultTTL: 1800, // 30 minutes for AI responses
});

/**
 * Normalize cache key from query parameters
 */
export function normalizeCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('&');
  
  return `${prefix}:${sortedParams}`;
}

/**
 * Cache statistics endpoint data
 */
export function getAllCacheStats() {
  return {
    destination: destinationCache.getStats(),
    search: searchCache.getStats(),
    aiResponse: aiResponseCache.getStats(),
  };
}
