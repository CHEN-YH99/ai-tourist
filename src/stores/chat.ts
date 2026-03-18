import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Conversation } from '@/types';
import { chatAPI } from '@/api/chat';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatResponse {
  conversationId: string;
  message: string;
  timestamp: Date;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const useChatStore = defineStore('chat', () => {
  // State
  const conversations = ref<Conversation[]>([]);
  const currentConversation = ref<Conversation | null>(null);
  const loading = ref(false);
  const sending = ref(false);

  // Actions
  async function sendMessage(text: string, conversationId?: string) {
    // Initialize conversation if needed
    if (!currentConversation.value) {
      currentConversation.value = {
        _id: conversationId || '',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      } as Conversation;
    }

    // Ensure messages array exists
    if (!currentConversation.value.messages) {
      currentConversation.value.messages = [];
    }

    // Immediately add user message to UI
    currentConversation.value.messages.push({
      role: 'user',
      content: text,
      timestamp: new Date()
    });

    // Set sending state to show typing indicator
    sending.value = true;

    try {
      // Only pass conversationId if it's a valid MongoDB ObjectId (24 hex chars)
      const isValidObjectId = conversationId && /^[0-9a-f]{24}$/i.test(conversationId);
      
      const response = await chatAPI.sendMessage({
        message: text,
        conversationId: isValidObjectId ? conversationId : undefined
      });
      
      const data = response.data?.data || response.data;

      // Update conversation ID if it's a new conversation
      if (data.conversationId && currentConversation.value._id !== data.conversationId) {
        currentConversation.value._id = data.conversationId;
      }

      // Add AI reply
      currentConversation.value.messages.push({
        role: 'assistant',
        content: data.message,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date()
      });

      return data;
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Remove the user message if request failed
      if (currentConversation.value.messages.length > 0) {
        const lastMessage = currentConversation.value.messages[currentConversation.value.messages.length - 1];
        if (lastMessage.role === 'user' && lastMessage.content === text) {
          currentConversation.value.messages.pop();
        }
      }
      
      throw error;
    } finally {
      sending.value = false;
    }
  }

  async function loadConversations(page = 1, pageSize = 20) {
    loading.value = true;
    try {
      const response = await chatAPI.getConversations(page, pageSize);
      const data = response.data?.data || response.data;
      
      // Ensure data is in the correct format
      if (data && Array.isArray(data.items)) {
        conversations.value = data.items.map((conv: any) => ({
          ...conv,
          messages: conv.messages || []
        }));
      } else if (data && Array.isArray(data)) {
        conversations.value = data.map((conv: any) => ({
          ...conv,
          messages: conv.messages || []
        }));
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function loadConversation(id: string) {
    loading.value = true;
    try {
      const response = await chatAPI.getConversation(id);
      const data = response.data?.data || response.data;
      currentConversation.value = {
        ...data,
        messages: data.messages || []
      } as Conversation;
    } catch (error) {
      console.error('Failed to load conversation:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function clearCurrentConversation() {
    currentConversation.value = {
      _id: '',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    } as Conversation;
  }

  async function deleteConversation(id: string) {
    try {
      await chatAPI.deleteConversation(id);
      conversations.value = conversations.value.filter(c => c._id !== id);
      if (currentConversation.value?._id === id) {
        currentConversation.value = null;
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      throw error;
    }
  }

  return {
    conversations,
    currentConversation,
    loading,
    sending,
    sendMessage,
    loadConversations,
    loadConversation,
    clearCurrentConversation,
    deleteConversation
  };
});
