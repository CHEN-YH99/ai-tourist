<template>
  <div class="input-container">
    <!-- 提问模板提示 -->
    <div v-if="showTemplates" class="templates-panel">
      <div class="templates-header">
        <h4>💡 推荐提问格式</h4>
        <button @click="showTemplates = false" class="close-btn">✕</button>
      </div>
      <div class="templates-list">
        <div
          v-for="(template, index) in questionTemplates"
          :key="index"
          class="template-item"
          @click="useTemplate(template.text)"
        >
          <div class="template-icon">{{ template.icon }}</div>
          <div class="template-content">
            <div class="template-title">{{ template.title }}</div>
            <div class="template-text">{{ template.text }}</div>
          </div>
        </div>
      </div>
      <div class="templates-tip">
        <span class="tip-icon">💡</span>
        <span>点击模板快速填充，或参考格式自己输入</span>
      </div>
    </div>

    <div class="input-area">
      <!-- 模板按钮 -->
      <button
        @click="showTemplates = !showTemplates"
        class="template-toggle-btn"
        :class="{ active: showTemplates }"
        title="查看提问模板"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </button>

      <input
        v-model="inputText"
        @keyup.enter="handleSend"
        :placeholder="placeholder"
        :disabled="disabled"
        class="message-input"
      />
      <Button
        @click="handleSend"
        :disabled="disabled || !inputText.trim()"
        :loading="sending"
        variant="primary"
        size="md"
        class="send-button"
      >
        {{ sending ? '发送中...' : '发送' }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/Button.vue'

interface Props {
  disabled?: boolean
  sending?: boolean
  placeholder?: string
}

interface Emits {
  (e: 'send', message: string): void
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  sending: false,
  placeholder: '问我任何关于旅游的问题...'
})

const emit = defineEmits<Emits>()

const inputText = ref('')
const showTemplates = ref(false)

// 提问模板
const questionTemplates = [
  {
    icon: '🗺️',
    title: '完整攻略',
    text: '我想去云南玩7天，预算10000元，喜欢自然风光和美食，请帮我制定详细的旅游攻略'
  },
  {
    icon: '🏖️',
    title: '海滨度假',
    text: '我想去三亚度假5天，预算8000元，喜欢海滩和水上活动，请推荐行程'
  },
  {
    icon: '🏛️',
    title: '文化之旅',
    text: '我想去北京玩4天，预算6000元，喜欢历史文化和博物馆，请制定攻略'
  },
  {
    icon: '🍜',
    title: '美食探索',
    text: '我想去成都玩3天，预算5000元，主要想品尝当地美食，请推荐路线'
  },
  {
    icon: '🎒',
    title: '自由行',
    text: '我想去杭州周末游，预算2000元，喜欢休闲放松，请给我一些建议'
  },
  {
    icon: '👨‍👩‍👧',
    title: '亲子游',
    text: '我想带孩子去上海玩5天，预算12000元，适合亲子的景点和活动有哪些？'
  }
]

function handleSend() {
  const message = inputText.value.trim()
  if (message) {
    emit('send', message)
    inputText.value = ''
    showTemplates.value = false
  }
}

function useTemplate(text: string) {
  inputText.value = text
  showTemplates.value = false
  // 自动聚焦输入框
  setTimeout(() => {
    const input = document.querySelector('.message-input') as HTMLInputElement
    if (input) {
      input.focus()
    }
  }, 100)
}
</script>

<style scoped>
.input-container {
  position: relative;
}

.templates-panel {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
  z-index: 10;
}

.templates-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(16, 185, 129, 0.2);
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-radius: 12px 12px 0 0;
  position: relative;
  overflow: hidden;
}

/* 添加环绕边框动画 */
.templates-header::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(
    45deg,
    #34d399,
    #10b981,
    #6ee7b7,
    #a7f3d0,
    #d1fae5,
    #34d399
  );
  background-size: 400% 400%;
  border-radius: 12px 12px 0 0;
  z-index: -1;
  animation: borderFlow 4s ease infinite;
}

@keyframes borderFlow {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* 添加光效层 */
.templates-header::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shine 3s ease-in-out infinite;
}

@keyframes shine {
  0% {
    left: -100%;
  }
  50%, 100% {
    left: 100%;
  }
}

.templates-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  position: relative;
  z-index: 1;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.templates-list {
  padding: 0.5rem;
}

.template-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.template-item:hover {
  background: #f7fafc;
  border-color: #667eea;
  transform: translateX(4px);
}

.template-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.template-content {
  flex: 1;
  min-width: 0;
}

.template-title {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.template-text {
  color: #718096;
  font-size: 0.875rem;
  line-height: 1.4;
}

.templates-tip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #f7fafc;
  border-top: 1px solid #e2e8f0;
  font-size: 0.75rem;
  color: #718096;
}

.tip-icon {
  font-size: 1rem;
}

.input-area {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(16, 185, 129, 0.1);
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  align-items: center;
  box-shadow: 0 -4px 20px rgba(16, 185, 129, 0.15);
  position: relative;
  overflow: hidden;
}

/* 添加动态光效背景 */
.input-area::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 70%
  );
  animation: rotateGlow 10s linear infinite;
  pointer-events: none;
}

@keyframes rotateGlow {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.template-toggle-btn {
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 0.75rem;
  cursor: pointer;
  color: #10b981;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
}

.template-toggle-btn:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(255, 255, 255, 0.5);
  color: #059669;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.template-toggle-btn.active {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(255, 255, 255, 0.8);
  color: #10b981;
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(255, 255, 255, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 16px rgba(255, 255, 255, 0.4);
  }
  50% {
    box-shadow: 0 4px 20px rgba(255, 255, 255, 0.6);
  }
}

.template-toggle-btn svg {
  width: 20px;
  height: 20px;
}

.message-input {
  flex: 1;
  padding: 0.875rem 1.25rem;
  border: 2px solid transparent;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
}

/* 边框光条动画容器 */
.message-input::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(
    45deg,
    #10b981,
    #059669,
    #34d399,
    #6ee7b7,
    #a7f3d0,
    #10b981
  );
  background-size: 400% 400%;
  border-radius: 12px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
  animation: borderGlow 3s ease infinite;
}

@keyframes borderGlow {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.message-input:focus {
  outline: none;
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.25), 0 0 0 4px rgba(16, 185, 129, 0.1);
  transform: translateY(-1px);
}

.message-input:focus::before {
  opacity: 1;
}

.message-input:disabled {
  background-color: #f7fafc;
  color: #a0aec0;
  cursor: not-allowed;
  box-shadow: none;
}

.message-input::placeholder {
  color: #a0aec0;
  font-style: italic;
}

.send-button {
  white-space: nowrap;
  flex-shrink: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
  color: #10b981;
  border: 2px solid rgba(255, 255, 255, 0.3);
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(255, 255, 255, 0.5);
  background: linear-gradient(135deg, #ffffff 0%, #ffffff 100%);
  border-color: rgba(255, 255, 255, 0.5);
}

.send-button:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .templates-panel {
    max-height: 300px;
  }

  .templates-header {
    padding: 0.75rem 1rem;
  }

  .templates-header h4 {
    font-size: 0.875rem;
  }

  .template-item {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .template-icon {
    font-size: 1.5rem;
  }

  .template-title {
    font-size: 0.8125rem;
  }

  .template-text {
    font-size: 0.8125rem;
  }

  .templates-tip {
    padding: 0.5rem 1rem;
    font-size: 0.6875rem;
  }

  .input-area {
    gap: 0.5rem;
    padding: 1rem;
  }

  .template-toggle-btn {
    padding: 0.5rem;
  }

  .template-toggle-btn svg {
    width: 18px;
    height: 18px;
  }
}
</style>
