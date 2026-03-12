<template>
  <div
    v-if="isVisible"
    class="fixed top-4 right-4 z-50 animate-slide-in"
    :class="toastClasses"
  >
    <div class="flex items-start gap-3 bg-white rounded-lg shadow-lg border-l-4 p-4 max-w-sm">
      <!-- Icon -->
      <div class="flex-shrink-0 text-xl">
        {{ icon }}
      </div>

      <!-- Content -->
      <div class="flex-1">
        <h3 v-if="title" class="font-semibold text-gray-900">{{ title }}</h3>
        <p class="text-sm text-gray-600" :class="{ 'mt-1': title }">{{ message }}</p>
      </div>

      <!-- Close Button -->
      <button
        class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
        @click="handleClose"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

export interface ToastProps {
  message: string
  title?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

const props = withDefaults(defineProps<ToastProps>(), {
  type: 'info',
  duration: 3000
})

const emit = defineEmits<{
  close: []
}>()

const isVisible = ref(true)
let timeoutId: ReturnType<typeof setTimeout> | null = null

const toastClasses = computed(() => {
  const baseClasses = 'border-l-4'
  const typeClasses = {
    success: 'border-green-500 bg-green-50',
    error: 'border-red-500 bg-red-50',
    warning: 'border-yellow-500 bg-yellow-50',
    info: 'border-blue-500 bg-blue-50'
  }
  return `${baseClasses} ${typeClasses[props.type]}`
})

const icon = computed(() => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }
  return icons[props.type]
})

function handleClose() {
  isVisible.value = false
  // Clear timeout if exists
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  // Emit close event after animation
  setTimeout(() => {
    emit('close')
  }, 300)
}

onMounted(() => {
  if (props.duration > 0) {
    timeoutId = setTimeout(() => {
      handleClose()
    }, props.duration)
  }
})
</script>

<style scoped>
@keyframes slide-in {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

div:not(.animate-slide-in) {
  animation: slide-out 0.3s ease-out;
}
</style>
