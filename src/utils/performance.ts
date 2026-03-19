/**
 * 性能监控工具
 */

interface PerformanceMark {
  name: string
  startTime: number
}

class PerformanceMonitor {
  private marks: Map<string, number> = new Map()
  private measures: Map<string, number[]> = new Map()

  /**
   * 标记性能测量点
   */
  mark(name: string): void {
    this.marks.set(name, performance.now())
  }

  /**
   * 测量两个标记点之间的时间
   */
  measure(name: string, startMark: string, endMark?: string): number | null {
    const start = this.marks.get(startMark)
    if (!start) {
      console.warn(`[Performance] Start mark "${startMark}" not found`)
      return null
    }

    const end = endMark ? this.marks.get(endMark) : performance.now()
    if (!end) {
      console.warn(`[Performance] End mark "${endMark}" not found`)
      return null
    }

    const duration = end - start

    // 记录测量结果
    if (!this.measures.has(name)) {
      this.measures.set(name, [])
    }
    this.measures.get(name)!.push(duration)

    // 只在开发环境输出
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  /**
   * 获取统计信息
   */
  getStats(name: string): { avg: number; min: number; max: number; count: number } | null {
    const measurements = this.measures.get(name)
    if (!measurements || measurements.length === 0) {
      return null
    }

    const sum = measurements.reduce((a, b) => a + b, 0)
    return {
      avg: sum / measurements.length,
      min: Math.min(...measurements),
      max: Math.max(...measurements),
      count: measurements.length
    }
  }

  /**
   * 清除所有标记
   */
  clear(): void {
    this.marks.clear()
    this.measures.clear()
  }

  /**
   * 清除特定标记
   */
  clearMark(name: string): void {
    this.marks.delete(name)
  }
}

export const performanceMonitor = new PerformanceMonitor()

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args)
      timeoutId = null
    }, delay)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()

    if (now - lastCall >= delay) {
      lastCall = now
      fn.apply(this, args)
    }
  }
}

/**
 * 批量处理函数
 */
export function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => R,
  batchSize: number = 10
): R[] {
  const results: R[] = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    results.push(...batch.map(processor))
  }

  return results
}

/**
 * 异步批量处理
 */
export async function batchProcessAsync<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10,
  delayBetweenBatches: number = 0
): Promise<R[]> {
  const results: R[] = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(processor))
    results.push(...batchResults)

    if (delayBetweenBatches > 0 && i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
    }
  }

  return results
}

/**
 * 内存优化：清理大对象
 */
export function clearLargeObject(obj: any): void {
  if (typeof obj !== 'object' || obj === null) return

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      delete obj[key]
    }
  }
}

/**
 * 检测性能瓶颈
 */
export function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now()

  return fn().then(
    result => {
      const duration = performance.now() - start
      if (import.meta.env.DEV) {
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
      }
      return result
    },
    error => {
      const duration = performance.now() - start
      if (import.meta.env.DEV) {
        console.error(`[Performance] ${name} failed after ${duration.toFixed(2)}ms`)
      }
      throw error
    }
  )
}
