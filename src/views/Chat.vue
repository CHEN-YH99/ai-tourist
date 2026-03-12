<template>
  <div class="chat-container">
    <!-- Main Chat Area -->
    <div class="chat-main">
      <!-- Messages Container -->
      <div class="messages-wrapper">
        <div v-if="!currentConversation || currentConversation.messages.length === 0" class="empty-state">
          <div class="empty-icon">💬</div>
          <h2>开始对话</h2>
          <p>向AI助手提问关于旅游的任何问题</p>
        </div>

        <div v-else class="messages" ref="messagesContainer">
          <ChatMessage
            v-for="(msg, index) in currentConversation.messages"
            :key="index"
            :message="msg"
          />
          <div v-if="sending" class="message assistant">
            <div class="message-content">
              <span class="avatar">🤖</span>
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <ChatInput
        :disabled="sending"
        :sending="sending"
        @send="handleSendMessage"
      />
    </div>

    <!-- Sidebar - Conversation History -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h3>对话历史</h3>
        <button class="new-chat-btn" @click="startNewConversation" title="新建对话">
          ➕
        </button>
      </div>

      <div class="conversations-list">
        <div v-if="loadingConversations" class="space-y-2">
          <div v-for="i in 5" :key="i" class="h-12 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        <div v-else-if="conversations.length === 0" class="empty-conversations">
          <p>暂无对话记录</p>
        </div>

        <div
          v-for="conv in conversations"
          v-else
          :key="conv._id"
          :class="['conversation-item', { active: currentConversation?._id === conv._id }]"
          @click="selectConversation(conv._id)"
        >
          <div class="conversation-title">
            {{ conv.title || getConversationPreview(conv) }}
          </div>
          <button
            class="delete-btn"
            @click.stop="deleteConversation(conv._id)"
            title="删除对话"
          >
            🗑️
          </button>
        </div>
      </div>

      <button v-if="conversations.length > 0" class="load-more-btn" @click="loadMoreConversations">
        加载更多
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import ChatMessage from '@/components/ChatMessage.vue'
import ChatInput from '@/components/ChatInput.vue'

const chatStore = useChatStore()
const messagesContainer = ref<HTMLElement>()
const currentPage = ref(1)
const loadingConversations = ref(false)

const conversations = computed(() => chatStore.conversations)
const currentConversation = computed(() => chatStore.currentConversation)
const sending = computed(() => chatStore.sending)

onMounted(async () => {
  await loadConversations()
})

async function loadConversations() {
  loadingConversations.value = true
  try {
    await chatStore.loadConversations(currentPage.value, 20)
  } catch (error) {
    console.error('Failed to load conversations:', error)
  } finally {
    loadingConversations.value = false
  }
}

async function loadMoreConversations() {
  currentPage.value++
  try {
    await chatStore.loadConversations(currentPage.value, 20)
  } catch (error) {
    console.error('Failed to load more conversations:', error)
    currentPage.value--
  }
}

async function handleSendMessage(message: string) {
  try {
    await chatStore.sendMessage(message, currentConversation.value?._id)
    await scrollToBottom()
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

async function selectConversation(conversationId: string) {
  try {
    await chatStore.loadConversation(conversationId)
    await scrollToBottom()
  } catch (error) {
    console.error('Failed to load conversation:', error)
  }
}

function startNewConversation() {
  chatStore.clearCurrentConversation()
}

async function deleteConversation(conversationId: string) {
  if (confirm('确定要删除这个对话吗？')) {
    try {
      await chatStore.deleteConversation(conversationId)
      if (currentConversation.value?._id === conversationId) {
        startNewConversation()
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }
}

function getConversationPreview(conversation: any): string {
  if (conversation.messages && conversation.messages.length > 0) {
    const firstMessage = conversation.messages[0]
    return firstMessage.content.substring(0, 30) + (firstMessage.content.length > 30 ? '...' : '')
  }
  return '新对话'
}

async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}
</script>

<style scoped>
.chat-container {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 1.5rem;
  height: calc(100vh - 80px);
  padding: 1.5rem;
  background: #f7fafc;
}

.chat-main {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.messages-wrapper {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #a0aec0;
  padding: 2rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.messages {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.message {
  display: flex;
}

.message.assistant {
  justify-content: flex-start;
}

.message-content {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
}

.avatar {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.typing-indicator {
  display: flex;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  background: #f0f4f8;
  border-radius: 12px;
}

.typing-indicator span {
  width: 0.5rem;
  height: 0.5rem;
  background: #a0aec0;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.5;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-0.5rem);
  }
}

/* Sidebar */
.sidebar {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #2d3748;
}

.new-chat-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  transition: transform 0.2s;
}

.new-chat-btn:hover {
  transform: scale(1.2);
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.empty-conversations {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #a0aec0;
  font-size: 0.875rem;
}

.conversation-item {
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.conversation-item:hover {
  background: #edf2f7;
}

.conversation-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.conversation-title {
  flex: 1;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-btn {
  background: none;
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.conversation-item:hover .delete-btn {
  opacity: 1;
}

.load-more-btn {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f0f4f8;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #4a5568;
  transition: background 0.2s;
}

.load-more-btn:hover {
  background: #edf2f7;
}

/* Responsive */
@media (max-width: 1024px) {
  .chat-container {
    grid-template-columns: 1fr 200px;
    gap: 1rem;
    padding: 1rem;
  }

  .sidebar {
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  .chat-container {
    grid-template-columns: 1fr;
    height: auto;
    gap: 0.75rem;
    padding: 0.75rem;
  }

  .chat-main {
    min-height: calc(100vh - 200px);
  }

  .sidebar {
    max-height: 250px;
    border-radius: 8px;
  }

  .messages {
    padding: 1rem;
    gap: 0.25rem;
  }

  .empty-state {
    padding: 1rem;
  }

  .empty-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .empty-state h2 {
    font-size: 1.25rem;
  }

  .empty-state p {
    font-size: 0.875rem;
  }

  .sidebar-header h3 {
    font-size: 0.875rem;
  }

  .new-chat-btn {
    font-size: 1rem;
  }

  .conversation-title {
    font-size: 0.75rem;
  }

  .delete-btn {
    font-size: 0.75rem;
  }

  .load-more-btn {
    font-size: 0.75rem;
    padding: 0.375rem;
  }
}

@media (max-width: 480px) {
  .chat-container {
    padding: 0.5rem;
  }

  .messages {
    padding: 0.75rem;
  }

  .typing-indicator {
    padding: 0.5rem 0.75rem;
  }

  .sidebar {
    max-height: 200px;
  }
}
</style>
