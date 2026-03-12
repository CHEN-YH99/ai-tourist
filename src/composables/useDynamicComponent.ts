import { defineAsyncComponent, Component } from 'vue'

/**
 * Composable for dynamically loading components with loading and error states
 * Supports code splitting and lazy loading of heavy components
 */
export function useDynamicComponent(
  importFn: () => Promise<{ default: Component }>,
  options?: {
    delay?: number
    timeout?: number
    errorComponent?: Component
    loadingComponent?: Component
  }
): Component {
  return defineAsyncComponent({
    loader: importFn,
    delay: options?.delay || 200,
    timeout: options?.timeout || 10000,
    errorComponent: options?.errorComponent,
    loadingComponent: options?.loadingComponent
  })
}

/**
 * Preload a component to improve perceived performance
 */
export function preloadComponent(
  importFn: () => Promise<{ default: Component }>
): void {
  if (typeof window !== 'undefined') {
    // Use requestIdleCallback if available, otherwise use setTimeout
    const callback = () => {
      importFn().catch(() => {
        // Silently fail on preload errors
      })
    }

    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback)
    } else {
      setTimeout(callback, 1000)
    }
  }
}
