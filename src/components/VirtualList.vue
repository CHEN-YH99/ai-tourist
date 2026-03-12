<template>
  <div
    ref="containerRef"
    class="overflow-y-auto"
    :style="{ height: containerHeight }"
  >
    <div :style="{ height: totalHeight + 'px', position: 'relative' }">
      <div
        v-for="{ item, index } in visibleItems"
        :key="index"
        :style="{ 
          transform: `translateY(${itemOffsetY(index)}px)`,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0
        }"
      >
        <slot :item="item" :index="index" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props<T> {
  items: T[]
  itemHeight: number
  containerHeight?: string
  bufferSize?: number
}

const props = withDefaults(defineProps<Props<T>>(), {
  containerHeight: '500px',
  bufferSize: 5
})

const containerRef = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
const containerHeight = ref(0)

const visibleRange = computed(() => {
  const startIndex = Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.bufferSize)
  const endIndex = Math.min(
    props.items.length,
    Math.ceil((scrollTop.value + containerHeight.value) / props.itemHeight) + props.bufferSize
  )
  return { startIndex, endIndex }
})

const visibleItems = computed(() => {
  const { startIndex, endIndex } = visibleRange.value
  return props.items.slice(startIndex, endIndex).map((item, index) => ({
    item,
    index: startIndex + index
  }))
})

const totalHeight = computed(() => {
  return props.items.length * props.itemHeight
})

function itemOffsetY(index: number): number {
  return index * props.itemHeight
}

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
</script>
