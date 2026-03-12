<template>
  <div class="input-area">
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

function handleSend() {
  const message = inputText.value.trim()
  if (message) {
    emit('send', message)
    inputText.value = ''
  }
}
</script>

<style scoped>
.input-area {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: white;
}

.message-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s;
}

.message-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.message-input:disabled {
  background-color: #f7fafc;
  color: #a0aec0;
  cursor: not-allowed;
}

.send-button {
  white-space: nowrap;
}

@media (max-width: 768px) {
  .input-area {
    gap: 0.5rem;
    padding: 1rem;
  }
}
</style>
