/**
 * 前端缓存系统
 * 支持 TTL、LRU 淘汰策略
 */

interface CacheItem<T> {
  data: T
  timestamp: number
  accessCount: number
  lastAccess: number
}

interface CacheStats {
  hits: number
  misses: number
  size: number
  maxSize: number
  hitRate: number
}

export class FrontendCache<T> {
  private cache = new Map<string, CacheItem<T>>()
  private ttl: number
  private maxSize: number
  private hits = 0
  private misses = 0

  constructor(ttlSeconds: number = 300, maxSize: number = 100) {
    this.ttl = ttlSeconds * 1000
    this.maxSize = maxSize
  }

  /**
   * 获取缓存数据
   */
  get(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      this.misses++
      return null
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      this.misses++
      return null
    }

    // 更新访问信息
    item.accessCount++
    item.lastAccess = Date.now()
    this.hits++

    return item.data
  }

  /**
   * 设置缓存数据
   */
  set(key: string, data: T): void {
    // 如果缓存已满，执行 LRU 淘汰
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccess: Date.now()
    })
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.hits = 0
    this.misses = 0
  }

  /**
   * 检查缓存是否存在且未过期
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0
    }
  }

  /**
   * LRU 淘汰策略
   */
  private evictLRU(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccess < oldestTime) {
        oldestTime = item.lastAccess
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

/**
 * 带缓存的异步函数包装器
 */
export function withCache<T>(
  cache: FrontendCache<T>,
  keyGenerator: (...args: any[]) => string
) {
  return function (fn: (...args: any[]) => Promise<T>) {
    return async function (...args: any[]): Promise<T> {
      const key = keyGenerator(...args)
      
      // 尝试从缓存获取
      const cached = cache.get(key)
      if (cached !== null) {
        return cached
      }

      // 执行函数并缓存结果
      const result = await fn(...args)
      cache.set(key, result)
      return result
    }
  }
}

/**
 * 创建缓存键
 */
export function createCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${JSON.stringify(params[key])}`)
    .join('&')
  
  return `${prefix}:${sortedParams}`
}

// 预定义的缓存实例
export const searchCache = new FrontendCache<any>(300, 50) // 5分钟，50条
export const destinationCache = new FrontendCache<any>(600, 100) // 10分钟，100条
export const userCache = new FrontendCache<any>(300, 20) // 5分钟，20条

// 定期清理过期缓存
if (typeof window !== 'undefined') {
  setInterval(() => {
    searchCache.cleanup()
    destinationCache.cleanup()
    userCache.cleanup()
  }, 60000) // 每分钟清理一次
}
