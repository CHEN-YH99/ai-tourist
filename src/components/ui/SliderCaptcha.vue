<template>
  <div class="slider-captcha">
    <div class="captcha-container">
      <!-- Background Canvas -->
      <canvas 
        ref="backgroundCanvas" 
        class="captcha-canvas"
        width="300" 
        height="150"
      ></canvas>
      
      <!-- Puzzle Piece Canvas -->
      <canvas 
        ref="puzzleCanvas"
        class="puzzle-canvas" 
        :style="{ 
          left: currentX + 'px',
          opacity: isDragging || isVerified ? 1 : 0,
          width: (PUZZLE_WIDTH * scale) + 'px'
        }"
        width="60" 
        height="150"
      ></canvas>

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
const backgroundCanvas = ref<HTMLCanvasElement>()
const puzzleCanvas = ref<HTMLCanvasElement>()
const isDragging = ref(false)
const currentX = ref(0)
const startX = ref(0)
const puzzleX = ref(0)
const isVerified = ref(false)
const showError = ref(false)
const scale = ref(1) // Scale factor for canvas

const TOLERANCE = 8 // Pixel tolerance for verification
const PUZZLE_WIDTH = 60
const CANVAS_WIDTH = 300
const CANVAS_HEIGHT = 150

onMounted(() => {
  initCaptcha()
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('touchend', stopDrag)
  
  // Calculate scale on mount and window resize
  calculateScale()
  window.addEventListener('resize', calculateScale)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
  window.removeEventListener('resize', calculateScale)
})

function calculateScale() {
  if (!backgroundCanvas.value) return
  const rect = backgroundCanvas.value.getBoundingClientRect()
  scale.value = rect.width / CANVAS_WIDTH
  console.log('Canvas scale:', scale.value, 'Canvas width:', rect.width, 'Logical width:', CANVAS_WIDTH)
}

function initCaptcha() {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = 'https://picsum.photos/300/150?random=' + Math.random()
  
  img.onload = () => {
    drawCaptcha(img)
    calculateScale()
  }
  
  img.onerror = () => {
    // Fallback: use a gradient if image fails to load
    drawFallbackCaptcha()
    calculateScale()
  }
}

function drawCaptcha(img: HTMLImageElement) {
  if (!backgroundCanvas.value || !puzzleCanvas.value) return
  
  const bgCtx = backgroundCanvas.value.getContext('2d')
  const puzzleCtx = puzzleCanvas.value.getContext('2d')
  
  if (!bgCtx || !puzzleCtx) return
  
  // Clear canvases
  bgCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  puzzleCtx.clearRect(0, 0, PUZZLE_WIDTH, CANVAS_HEIGHT)
  
  // Generate random position for puzzle (between 40% and 80% of width)
  puzzleX.value = Math.floor(CANVAS_WIDTH * 0.4 + Math.random() * (CANVAS_WIDTH * 0.4))
  console.log('Puzzle X position (logical):', puzzleX.value)
  
  // Draw background image
  bgCtx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  
  // Draw puzzle slot (darkened area)
  bgCtx.fillStyle = 'rgba(0, 0, 0, 0.4)'
  bgCtx.fillRect(puzzleX.value, 0, PUZZLE_WIDTH, CANVAS_HEIGHT)
  
  // Draw slot border
  bgCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
  bgCtx.lineWidth = 2
  bgCtx.strokeRect(puzzleX.value, 0, PUZZLE_WIDTH, CANVAS_HEIGHT)
  
  // Extract puzzle piece from original image
  puzzleCtx.drawImage(
    img,
    puzzleX.value, 0, PUZZLE_WIDTH, CANVAS_HEIGHT,  // Source rectangle
    0, 0, PUZZLE_WIDTH, CANVAS_HEIGHT                // Destination rectangle
  )
  
  // Add shadow to puzzle piece
  puzzleCanvas.value.style.filter = 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))'
}

function drawFallbackCaptcha() {
  if (!backgroundCanvas.value || !puzzleCanvas.value) return
  
  const bgCtx = backgroundCanvas.value.getContext('2d')
  const puzzleCtx = puzzleCanvas.value.getContext('2d')
  
  if (!bgCtx || !puzzleCtx) return
  
  // Clear canvases
  bgCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  puzzleCtx.clearRect(0, 0, PUZZLE_WIDTH, CANVAS_HEIGHT)
  
  puzzleX.value = Math.floor(CANVAS_WIDTH * 0.4 + Math.random() * (CANVAS_WIDTH * 0.4))
  
  // Draw gradient background
  const gradient = bgCtx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  gradient.addColorStop(0, '#667eea')
  gradient.addColorStop(1, '#764ba2')
  bgCtx.fillStyle = gradient
  bgCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  
  // Draw some random shapes for visual interest
  for (let i = 0; i < 10; i++) {
    bgCtx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`
    bgCtx.beginPath()
    bgCtx.arc(
      Math.random() * CANVAS_WIDTH,
      Math.random() * CANVAS_HEIGHT,
      Math.random() * 30 + 10,
      0,
      Math.PI * 2
    )
    bgCtx.fill()
  }
  
  // Draw puzzle slot
  bgCtx.fillStyle = 'rgba(0, 0, 0, 0.4)'
  bgCtx.fillRect(puzzleX.value, 0, PUZZLE_WIDTH, CANVAS_HEIGHT)
  bgCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
  bgCtx.lineWidth = 2
  bgCtx.strokeRect(puzzleX.value, 0, PUZZLE_WIDTH, CANVAS_HEIGHT)
  
  // Copy the puzzle piece area before drawing the slot
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = CANVAS_WIDTH
  tempCanvas.height = CANVAS_HEIGHT
  const tempCtx = tempCanvas.getContext('2d')
  if (tempCtx) {
    // Redraw gradient without slot
    const gradient2 = tempCtx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    gradient2.addColorStop(0, '#667eea')
    gradient2.addColorStop(1, '#764ba2')
    tempCtx.fillStyle = gradient2
    tempCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    
    // Copy shapes
    for (let i = 0; i < 10; i++) {
      tempCtx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`
      tempCtx.beginPath()
      tempCtx.arc(
        Math.random() * CANVAS_WIDTH,
        Math.random() * CANVAS_HEIGHT,
        Math.random() * 30 + 10,
        0,
        Math.PI * 2
      )
      tempCtx.fill()
    }
    
    // Extract puzzle piece
    puzzleCtx.drawImage(
      tempCanvas,
      puzzleX.value, 0, PUZZLE_WIDTH, CANVAS_HEIGHT,
      0, 0, PUZZLE_WIDTH, CANVAS_HEIGHT
    )
  }
  
  puzzleCanvas.value.style.filter = 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))'
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
  const trackWidth = trackRef.value?.offsetWidth || CANVAS_WIDTH
  
  let newX = clientX - startX.value
  // Limit movement to track width minus button width
  newX = Math.max(0, Math.min(newX, trackWidth - 40))
  
  currentX.value = newX
}

function stopDrag() {
  if (!isDragging.value || isVerified.value) return
  
  isDragging.value = false
  
  // Convert currentX (screen pixels) to logical canvas pixels
  const logicalX = currentX.value / scale.value
  const logicalPuzzleX = puzzleX.value
  
  console.log('Verification:', {
    currentX: currentX.value,
    scale: scale.value,
    logicalX: logicalX,
    puzzleX: logicalPuzzleX,
    difference: Math.abs(logicalX - logicalPuzzleX)
  })
  
  // Check if puzzle is in correct position
  if (Math.abs(logicalX - logicalPuzzleX) <= TOLERANCE) {
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
  initCaptcha()
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

.captcha-canvas {
  display: block;
  width: 100%;
  height: 100%;
  user-select: none;
}

.puzzle-canvas {
  position: absolute;
  top: 0;
  height: 150px;
  transition: opacity 0.3s;
  pointer-events: none;
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
