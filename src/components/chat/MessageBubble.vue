<template>
  <div class="message-bubble">
    <p class="message-text">{{ message.content }}</p>
    <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
    <slot name="actions" />
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

  if (isNaN(d.getTime())) {
    return '刚刚'
  }

  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}
</script>

<style scoped>
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

.timestamp {
  font-size: 0.75rem;
  color: #a0aec0;
  padding: 0 1rem;
}
</style>
