<template>
  <div :class="['message', message.role]">
    <div class="message-content">
      <Avatar 
        v-if="message.role === 'user'"
        :src="userAvatar"
        :username="username"
        size="sm"
        class="avatar"
      />
      <span v-else class="avatar">🤖</span>
      <div class="message-bubble">
        <p class="message-text">{{ message.content }}</p>
        <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
        
        <!-- Generate Route Map Button for AI responses -->
        <div v-if="message.role === 'assistant' && showGenerateButton" class="action-buttons">
          <Button
            variant="primary"
            size="sm"
            @click="handleGenerateRouteMap"
            :loading="generating"
            class="generate-btn"
          >
            <span class="btn-icon">🗺️</span>
            {{ generating ? '生成中...' : '一键生成路线图' }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { routeMapAPI } from '@/api/routeMap'
import Avatar from '@/components/ui/Avatar.vue'
import Button from '@/components/ui/Button.vue'
import type { Message } from '@/types'

interface Props {
  message: Message
}

const props = defineProps<Props>()

const authStore = useAuthStore()
const chatStore = useChatStore()
const router = useRouter()
const generating = ref(false)

const username = computed(() => authStore.user?.username || '游客')
const userAvatar = computed(() => authStore.user?.avatar)

// Check if message contains travel-related keywords
const showGenerateButton = computed(() => {
  const content = props.message.content.toLowerCase()
  const travelKeywords = [
    '旅游', '旅行', '攻略', '行程', '目的地', '景点', '天数', '预算',
    '巴黎', '东京', '纽约', '伦敦', '罗马', '北京', '上海', '杭州',
    '游玩', '游览', '参观', '住宿', '酒店', '餐厅', '美食', '路线'
  ]
  return travelKeywords.some(keyword => content.includes(keyword))
})

function formatTime(date: Date | string): string {
  const d = new Date(date)
  
  if (isNaN(d.getTime())) {
    return '刚刚'
  }
  
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

async function handleGenerateRouteMap() {
  if (!authStore.isAuthenticated) {
    // Redirect to login if not authenticated
    router.push({ name: 'Login', query: { redirect: '/chat' } })
    return
  }

  generating.value = true
  try {
    // Get the original travel content
    const originalContent = props.message.content
    
    // Call the dedicated route map API (Gemini)
    const response = await routeMapAPI.generateRouteMap(originalContent)
    
    if (response.data.status === 'success' && response.data.data) {
      // Add the route map response to chat
      chatStore.addMessage({
        role: 'assistant',
        content: response.data.data.message,
        timestamp: new Date(response.data.data.timestamp)
      })
      
      // Scroll to bottom to show the new response
      setTimeout(() => {
        const messagesContainer = document.querySelector('.messages')
        if (messagesContainer) {
          messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
          })
        }
      }, 100)
    } else {
      throw new Error('生成路线图失败')
    }
    
  } catch (error: any) {
    console.error('Failed to generate route map:', error)
    const errorMessage = error.response?.data?.message || '生成路线图失败，请重试'
    alert(errorMessage)
  } finally {
    generating.value = false
  }
}
</script>

<style scoped>
.message {
  display: flex;
  margin-bottom: 1rem;
}

.message.user {
  justify-content: flex-end;
}

.message-content {
  display: flex;
  gap: 0.75rem;
  max-width: 70%;
  align-items: flex-end;
}

.message.user .message-content {
  flex-direction: row-reverse;
}

.avatar {
  flex-shrink: 0;
  font-size: 1.5rem;
}

.message-bubble {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.message-text {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  margin: 0;
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.5;
}

.message.user .message-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message.assistant .message-text {
  background: #f0f4f8;
  color: #2d3748;
}

.timestamp {
  font-size: 0.75rem;
  color: #a0aec0;
  padding: 0 1rem;
}

.message.user .timestamp {
  text-align: right;
}

.action-buttons {
  padding: 0.5rem 1rem;
  display: flex;
  gap: 0.5rem;
}

.generate-btn {
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-icon {
  font-size: 1rem;
}

@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }
  
  .generate-btn {
    font-size: 0.75rem;
  }
  
  .btn-icon {
    font-size: 0.875rem;
  }
}
</style>
