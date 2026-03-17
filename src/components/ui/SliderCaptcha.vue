<template>
  <div class="slider-captcha">
    <div class="captcha-container">
      <!-- Background Image -->
      <div class="captcha-image">
        <img :src="backgroundImage" alt="验证背景" draggable="false" />
        <!-- Puzzle Piece Slot -->
        <div 
          class="puzzle-slot" 
          :style="{ left: puzzleX + 'px' }"
        ></div>
      </div>
      
      <!-- Puzzle Piece -->
      <div 
        class="puzzle-piece" 
        :style="{ 
          left: currentX + 'px',
          opacity: isDragging || isVerified ? 1 : 0 
        }"
      >
        <img :src="puzzleImage" alt="拼图" draggable="false" />
      </div>

      <!-- Status Overlay -->
      <div v-if="isVerified" class="status-overlay success">
        <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span>验证成功</span>
      </div>
      <div v-else-if="showError" class="status-overlay error">
        <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span>验证失败，请重试</span>
      </div>
    </div>

    <!-- Slider Track -->
    <div class="slider-track" ref="trackRef">
      <div class="slider-fill" :style="{ width: currentX + 'px' }"></div>
      <div 
        class="slider-button"
        :class="{ 'dragging': isDragging, 'verified': isVerified }"
        :style="{ left: currentX + 'px' }"
        @mousedown="startDrag"
        @touchstart="startDrag"
      >
        <svg v-if="!isVerified" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </div>
      <span class="slider-text" :class="{ 'hidden': isDragging || isVerified }">
        {{ isVerified ? '验证成功' : '向右拖动滑块完成验证' }}
      </span>
    </div>

    <!-- Refresh Button -->
    <button 
      v-if="!isVerified"
      class="refresh-button"
      @click="refresh"
      title="刷新验证码"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{
  verified: []
  failed: []
}>()

// Refs
const trackRef = ref<HTMLElement>()
const isDragging = ref(false)
const currentX = ref(0)
const startX = ref(0)
const puzzleX = ref(0)
const isVerified = ref(false)
const showError = ref(false)

// Images - using placeholder images
const backgroundImage = ref('https://picsum.photos/300/150?random=' + Math.random())
const puzzleImage = ref('https://picsum.photos/60/150?random=' + Math.random())

const TOLERANCE = 5 // Pixel tolerance for verification

onMounted(() => {
  generatePuzzle()
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('touchend', stopDrag)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
})

function generatePuzzle() {
  // Generate random position for puzzle (between 40% and 80% of width)
  const containerWidth = 300
  puzzleX.value = Math.floor(containerWidth * 0.4 + Math.random() * (containerWidth * 0.4))
}

function startDrag(e: MouseEvent | TouchEvent) {
  if (isVerified.value) return
  
  isDragging.value = true
  showError.value = false
  
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  startX.value = clientX - currentX.value
}

function onDrag(e: MouseEvent | TouchEvent) {
  if (!isDragging.value || isVerified.value) return
  
  e.preventDefault()
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const trackWidth = trackRef.value?.offsetWidth || 300
  
  let newX = clientX - startX.value
  newX = Math.max(0, Math.min(newX, trackWidth - 40))
  
  currentX.value = newX
}

function stopDrag() {
  if (!isDragging.value || isVerified.value) return
  
  isDragging.value = false
  
  // Check if puzzle is in correct position
  if (Math.abs(currentX.value - puzzleX.value) <= TOLERANCE) {
    isVerified.value = true
    emit('verified')
  } else {
    showError.value = true
    setTimeout(() => {
      currentX.value = 0
      showError.value = false
    }, 800)
    emit('failed')
  }
}

function refresh() {
  currentX.value = 0
  isVerified.value = false
  showError.value = false
  backgroundImage.value = 'https://picsum.photos/300/150?random=' + Math.random()
  puzzleImage.value = 'https://picsum.photos/60/150?random=' + Math.random()
  generatePuzzle()
}
</script>

<style scoped>
.slider-captcha {
  position: relative;
  width: 100%;
}

.captcha-container {
  position: relative;
  width: 100%;
  height: 150px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.captcha-image {
  width: 100%;
  height: 100%;
  position: relative;
}

.captcha-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
}

.puzzle-slot {
  position: absolute;
  top: 0;
  width: 60px;
  height: 150px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
}

.puzzle-piece {
  position: absolute;
  top: 0;
  width: 60px;
  height: 150px;
  transition: opacity 0.3s;
  pointer-events: none;
}

.puzzle-piece img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));
}

.status-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  animation: fadeIn 0.3s;
}

.status-overlay.success {
  background: rgba(34, 197, 94, 0.9);
  color: white;
}

.status-overlay.error {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.slider-track {
  position: relative;
  width: 100%;
  height: 40px;
  background: #f0f0f0;
  border-radius: 20px;
  overflow: hidden;
}

.slider-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  transition: width 0.1s;
  border-radius: 20px;
}

.slider-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  transition: all 0.3s;
  z-index: 10;
  color: #3b82f6;
}

.slider-button:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.slider-button.dragging {
  cursor: grabbing;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
}

.slider-button.verified {
  background: #22c55e;
  color: white;
  cursor: default;
}

.slider-text {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #9ca3af;
  font-size: 14px;
  user-select: none;
  pointer-events: none;
  transition: opacity 0.3s;
}

.slider-text.hidden {
  opacity: 0;
}

.refresh-button {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.refresh-button:hover {
  background: white;
  color: #3b82f6;
  transform: rotate(180deg);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
