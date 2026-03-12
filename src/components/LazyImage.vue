<template>
  <div class="relative overflow-hidden bg-gray-200 rounded-lg" :style="{ aspectRatio }">
    <!-- Placeholder/Skeleton -->
    <div
      v-if="!loaded"
      class="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"
    />

    <!-- Image -->
    <img
      ref="imgRef"
      :src="src"
      :alt="alt"
      :class="[
        'w-full h-full object-cover transition-opacity duration-300',
        loaded ? 'opacity-100' : 'opacity-0'
      ]"
      @load="onLoad"
      @error="onError"
    />

    <!-- Error state -->
    <div
      v-if="error"
      class="absolute inset-0 flex items-center justify-center bg-gray-100"
    >
      <span class="text-gray-400 text-sm">图片加载失败</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  src: string
  alt?: string
  aspectRatio?: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: 'Image',
  aspectRatio: '16 / 9'
})

const imgRef = ref<HTMLImageElement | null>(null)
const loaded = ref(false)
const error = ref(false)

function onLoad() {
  loaded.value = true
  error.value = false
}

function onError() {
  error.value = true
  loaded.value = false
}

onMounted(() => {
  if (!imgRef.value) return

  // Use Intersection Observer for lazy loading
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && imgRef.value) {
          imgRef.value.src = props.src
          observer.unobserve(entry.target)
        }
      })
    },
    { rootMargin: '50px' }
  )

  observer.observe(imgRef.value)
})
</script>

<style scoped>
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
