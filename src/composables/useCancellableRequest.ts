/**
 * 可取消请求的 Composable
 * 用于处理用户快速切换查询时取消旧请求
 */

import { ref, onUnmounted } from 'vue'

export interface CancelToken {
  cancel: (reason?: string) => void
  isCancelled: () => boolean
}

class CancelTokenImpl implements CancelToken {
  private cancelled = false
  private reason: string | undefined

  cancel(reason?: string): void {
    this.cancelled = true
    this.reason = reason
  }

  isCancelled(): boolean {
    return this.cancelled
  }

  getReason(): string | undefined {
    return this.reason
  }
}

export function useCancellableRequest() {
  const currentToken = ref<CancelTokenImpl | null>(null)

  /**
   * 取消当前请求
   */
  function cancelCurrent(reason?: string): void {
    if (currentToken.value) {
      currentToken.value.cancel(reason || 'Request cancelled by user')
      currentToken.value = null
    }
  }

  /**
   * 创建新的取消令牌
   */
  function createToken(): CancelToken {
    // 取消之前的请求
    cancelCurrent('New request initiated')

    // 创建新令牌
    const token = new CancelTokenImpl()
    currentToken.value = token

    return token
  }

  /**
   * 包装异步函数，使其可取消
   */
  async function withCancellation<T>(
    fn: (token: CancelToken) => Promise<T>
  ): Promise<T> {
    const token = createToken()

    try {
      const result = await fn(token)

      // 检查是否已取消
      if (token.isCancelled()) {
        throw new Error('Request was cancelled')
      }

      return result
    } catch (error) {
      // 如果是取消错误，不抛出
      if (token.isCancelled()) {
        console.log('Request cancelled:', (token as CancelTokenImpl).getReason())
        throw new Error('CANCELLED')
      }
      throw error
    }
  }

  /**
   * 检查令牌是否已取消
   */
  function checkCancellation(token: CancelToken): void {
    if (token.isCancelled()) {
      throw new Error('Request was cancelled')
    }
  }

  // 组件卸载时取消所有请求
  onUnmounted(() => {
    cancelCurrent('Component unmounted')
  })

  return {
    createToken,
    cancelCurrent,
    withCancellation,
    checkCancellation
  }
}

/**
 * 使用 AbortController 的版本（适用于 fetch API）
 */
export function useAbortController() {
  const controller = ref<AbortController | null>(null)

  /**
   * 取消当前请求
   */
  function abort(reason?: string): void {
    if (controller.value) {
      controller.value.abort(reason)
      controller.value = null
    }
  }

  /**
   * 创建新的 AbortController
   */
  function createController(): AbortController {
    // 取消之前的请求
    abort('New request initiated')

    // 创建新控制器
    const newController = new AbortController()
    controller.value = newController

    return newController
  }

  /**
   * 获取 AbortSignal
   */
  function getSignal(): AbortSignal | undefined {
    return controller.value?.signal
  }

  // 组件卸载时取消所有请求
  onUnmounted(() => {
    abort('Component unmounted')
  })

  return {
    createController,
    getSignal,
    abort
  }
}
