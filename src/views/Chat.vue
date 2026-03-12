<template>
  <div class="chat-container">
    <div class="chat-box">
      <div class="messages" ref="messagesContainer">
        <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
          <div class="message-content">
            <span class="avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</span>
            <div class="text">{{ msg.content }}</div>
          </div>
        </div>
        <div v-if="loading" class="message assistant">
          <div class="message-content">
            <span class="avatar">🤖</span>
            <div class="text typing">正在思考...</div>
          </div>
        </div>
      </div>

      <div class="input-area">
        <input 
          v-model="userInput" 
          @keyup.enter="sendMessage"
          placeholder="问我任何关于旅游的问题..."
          :disabled="loading"
        />
        <button @click="sendMessage" :disabled="loading || !userInput.trim()">
          发送
        </button>
      </div>
    </div>

    <div class="suggestions">
      <h3>试试这些问题：</h3>
      <button v-for="q in quickQuestions" :key="q" @click="askQuestion(q)">
        {{ q }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChat } from '../composables/useChat'

const {
  messages,
  userInput,
  loading,
  messagesContainer,
  sendMessage,
  askQuestion
} = useChat()

const quickQuestions = [
  '推荐日本7日游路线',
  '巴黎有哪些必去景点？',
  '东南亚哪里适合潜水？',
  '欧洲火车通票怎么买？'
]
</script>

<style scoped>
.chat-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  height: calc(100vh - 200px);
}

.chat-box {
  background: white;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message-content {
  display: flex;
  gap: 0.5rem;
  max-width: 70%;
}

.message.user .message-content {
  flex-direction: row-reverse;
}

.avatar {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.text {
  padding: 1rem;
  border-radius: 12px;
  white-space: pre-line;
}

.message.user .text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message.assistant .text {
  background: #f7fafc;
  color: #2d3748;
}

.typing {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.input-area {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.input-area input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}

.input-area button {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.input-area button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.suggestions {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  height: fit-content;
}

.suggestions h3 {
  margin-bottom: 1rem;
  color: #2d3748;
}

.suggestions button {
  display: block;
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: background 0.3s;
}

.suggestions button:hover {
  background: #edf2f7;
}

@media (max-width: 768px) {
  .chat-container {
    grid-template-columns: 1fr;
  }
  
  .suggestions {
    order: -1;
  }
}
</style>
