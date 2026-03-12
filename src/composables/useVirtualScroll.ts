import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface VirtualScrollOptions {
  itemHeight: number
  bufferSize?: number
}

export function useVirtualScroll<T>(
  items: T[],
  options: VirtualScrollOptions
) {
  const containerRef = ref<HTMLElement | null>(null)
  const scrollTop = ref(0)
  const containerHeight = ref(0)

  const { itemHeight, bufferSize = 5 } = options

  const visibleRange = computed(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop.value / itemHeight) - bufferSize)
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop.value + containerHeight.value) / itemHeight) + bufferSize
    )
    return { startIndex, endIndex }
  })

  const visibleItems = computed(() => {
    const { startIndex, endIndex } = visibleRange.value
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index
    }))
  })

  const offsetY = computed(() => {
    return visibleRange.value.startIndex * itemHeight
  })

  const totalHeight = computed(() => {
    return items.length * itemHeight
  })

  function handleScroll(event: Event) {
    const target = event.target as HTMLElement
    scrollTop.value = target.scrollTop
  }

  function handleResize() {
    if (containerRef.value) {
      containerHeight.value = containerRef.value.clientHeight
    }
  }

  onMounted(() => {
    if (containerRef.value) {
      containerHeight.value = containerRef.value.clientHeight
      containerRef.value.addEventListener('scroll', handleScroll)
    }
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    if (containerRef.value) {
      containerRef.value.removeEventListener('scroll', handleScroll)
    }
    window.removeEventListener('resize', handleResize)
  })

  return {
    containerRef,
    visibleItems,
    offsetY,
    totalHeight,
    visibleRange
  }
}
