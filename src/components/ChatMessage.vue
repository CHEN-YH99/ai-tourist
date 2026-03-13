<template>
  <div :class="['message', message.role]">
    <div class="message-content">
      <span class="avatar">{{ message.role === 'user' ? '👤' : '🤖' }}</span>
      <div class="message-bubble">
        <p class="message-text">{{ message.content }}</p>
        <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Message } from '@/types'

interface Props {
  message: Message
}

defineProps<Props>()

function formatTime(date: Date | string): string {
  const d = new Date(date)
  
  // 检查日期是否有效
  if (isNaN(d.getTime())) {
    return '刚刚'
  }
  
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
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
  font-size: 1.5rem;
  flex-shrink: 0;
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

@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }
}
</style>
