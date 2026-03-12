import { ref } from 'vue'

export interface Toast {
  id: string
  message: string
  title?: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration: number
}

// Global toast state - shared across all instances
const toasts = ref<Toast[]>([])
let toastId = 0

export function useToast() {
  function addToast(
    message: string,
    options?: {
      title?: string
      type?: 'success' | 'error' | 'warning' | 'info'
      duration?: number
    }
  ): string {
    const id = `toast-${++toastId}`
    const toast: Toast = {
      id,
      message,
      title: options?.title,
      type: options?.type || 'info',
      duration: options?.duration ?? 3000
    }

    toasts.value.push(toast)

    if (toast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration)
    }

    return id
  }

  function removeToast(id: string) {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  function success(message: string, title?: string) {
    return addToast(message, { type: 'success', title, duration: 3000 })
  }

  function error(message: string, title?: string) {
    return addToast(message, { type: 'error', title, duration: 5000 })
  }

  function warning(message: string, title?: string) {
    return addToast(message, { type: 'warning', title, duration: 4000 })
  }

  function info(message: string, title?: string) {
    return addToast(message, { type: 'info', title, duration: 3000 })
  }

  function clearAll() {
    toasts.value = []
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    clearAll
  }
}
