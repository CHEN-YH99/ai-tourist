<template>
  <div class="lazy-image-wrapper" :style="wrapperStyle">
    <img
      v-if="isLoaded"
      :src="src"
      :alt="alt"
      :class="['lazy-image', { loaded: showImage }]"
      @load="onLoad"
      @error="onError"
    />
    <div v-else-if="isLoading" class="lazy-image-placeholder">
      <div class="spinner"></div>
    </div>
    <div v-else-if="hasError" class="lazy-image-error">
      <svg class="error-icon" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      <span class="error-text">加载失败</span>
    </div>
    <img
      v-show="false"
      ref="imageRef"
      :src="shouldLoad ? src : ''"
      @load="onLoad"
      @error="onError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

interface Props {
  src: string
  alt?: string
  aspectRatio?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  aspectRatio: '56.25%', // 16:9 默认
  placeholder: ''
})

const imageRef = ref<HTMLImageElement>()
const isLoading = ref(false)
const isLoaded = ref(false)
const showImage = ref(false)
const hasError = ref(false)
const shouldLoad = ref(false)

const wrapperStyle = computed(() => ({
  paddingBottom: props.aspectRatio,
  background: props.placeholder || '#f0f0f0'
}))

// 使用 Intersection Observer 检测图片是否进入视口
const { stop } = useIntersectionObserver(
  imageRef,
  ([{ isIntersecting }]) => {
    if (isIntersecting && !shouldLoad.value) {
      shouldLoad.value = true
      isLoading.value = true
      stop()
    }
  },
  {
    rootMargin: '50px' // 提前50px开始加载
  }
)

function onLoad() {
  isLoading.value = false
  isLoaded.value = true
  // 延迟显示以实现淡入效果
  setTimeout(() => {
    showImage.value = true
  }, 50)
}

function onError() {
  isLoading.value = false
  hasError.value = true
}
</script>

<style scoped>
.lazy-image-wrapper {
  position: relative;
  overflow: hidden;
  background: #f0f0f0;
}

.lazy-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.lazy-image.loaded {
  opacity: 1;
}

.lazy-image-placeholder,
.lazy-image-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.lazy-image-error {
  color: #ef4444;
}

.error-icon {
  width: 2rem;
  height: 2rem;
}

.error-text {
  font-size: 0.875rem;
}
</style>
