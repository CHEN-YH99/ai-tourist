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
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <slot :item="item" :index="index" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { ref } from 'vue'
import { useVirtualScroll } from '@/composables/useVirtualScroll'

interface Props<T> {
  items: T[]
  itemHeight: number
  containerHeight?: string
}

const props = withDefaults(defineProps<Props<T>>(), {
  containerHeight: '500px'
})

const containerRef = ref<HTMLElement | null>(null)

const { visibleItems, offsetY, totalHeight } = useVirtualScroll(props.items, {
  itemHeight: props.itemHeight,
  bufferSize: 5
})
</script>
