import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Itinerary } from '@/types';
import { itineraryAPI } from '@/api/itinerary';

interface ItineraryParams {
  destination: string;
  days: number;
  budget: number;
  preferences?: string[];
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

interface GenerationHistory {
  id: string;
  params: ItineraryParams;
  timestamp: number;
  itinerary?: Itinerary;
}

export const useItineraryStore = defineStore('itinerary', () => {
  // State
  const itineraries = ref<Itinerary[]>([]);
  const currentItinerary = ref<Itinerary | null>(null);
  const generating = ref(false);
  const loading = ref(false);
  const chatParams = ref<ItineraryParams | null>(null);
  const chatContent = ref<{ aiContent: string; userQuestion: string } | null>(null);
  const generationHistory = ref<GenerationHistory[]>([]);

  // Load generation history from localStorage
  const loadGenerationHistory = () => {
    try {
      const stored = localStorage.getItem('itineraryGenerationHistory');
      if (stored) {
        generationHistory.value = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load generation history:', error);
      generationHistory.value = [];
    }
  };

  // Save generation history to localStorage
  const saveGenerationHistory = () => {
    try {
      localStorage.setItem('itineraryGenerationHistory', JSON.stringify(generationHistory.value));
    } catch (error) {
      console.error('Failed to save generation history:', error);
    }
  };

  // Add to generation history
  const addToHistory = (params: ItineraryParams, itinerary?: Itinerary) => {
    // 防重复检查：基于攻略ID或参数组合
    const isDuplicate = generationHistory.value.some(item => {
      // 如果有攻略对象且有ID，基于ID判断
      if (itinerary?._id && item.itinerary?._id) {
        return item.itinerary._id === itinerary._id;
      }
      
      // 否则基于参数组合判断（目的地、天数、预算）
      return (
        item.params.destination === params.destination &&
        item.params.days === params.days &&
        item.params.budget === params.budget &&
        // 检查时间戳是否在5秒内（避免快速重复点击）
        Math.abs(Date.now() - item.timestamp) < 5000
      );
    });
    
    if (isDuplicate) {
      console.log('⚠️ 检测到重复的历史记录，跳过添加');
      return;
    }
    
    const historyItem: GenerationHistory = {
      id: Date.now().toString(),
      params,
      timestamp: Date.now(),
      itinerary
    };
    
    console.log('✓ 添加新的历史记录:', params.destination);
    generationHistory.value.unshift(historyItem);
    
    // Keep only last 20 items
    if (generationHistory.value.length > 20) {
      generationHistory.value = generationHistory.value.slice(0, 20);
    }
    
    saveGenerationHistory();
  };

  // Delete history item
  const deleteHistoryItem = (id: string) => {
    generationHistory.value = generationHistory.value.filter(item => item.id !== id);
    saveGenerationHistory();
  };

  // Clear all history
  const clearHistory = () => {
    generationHistory.value = [];
    saveGenerationHistory();
  };

  // Actions
  async function generateItinerary(params: ItineraryParams) {
    generating.value = true;
    try {
      const response = await itineraryAPI.generate(params);
      // Handle nested data structure from API
      const itineraryData = (response.data as any).data || response.data;
      currentItinerary.value = itineraryData as Itinerary;
      
      // Add to history
      addToHistory(params, itineraryData as Itinerary);
      
      return itineraryData;
    } catch (error) {
      console.error('Failed to generate itinerary:', error);
      throw error;
    } finally {
      generating.value = false;
    }
  }

  async function loadItineraries(page = 1, pageSize = 20) {
    loading.value = true;
    try {
      const response = await itineraryAPI.getList(page, pageSize);
      // Handle nested data structure from API
      const data = (response.data as any).data || response.data;
      itineraries.value = data.items || [];
    } catch (error) {
      console.error('Failed to load itineraries:', error);
      itineraries.value = [];
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function loadItinerary(id: string) {
    loading.value = true;
    try {
      const response = await itineraryAPI.getById(id);
      // Handle nested data structure from API
      const itineraryData = (response.data as any).data || response.data;
      currentItinerary.value = itineraryData as Itinerary;
    } catch (error) {
      console.error('Failed to load itinerary:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteItinerary(id: string) {
    try {
      await itineraryAPI.delete(id);
      itineraries.value = itineraries.value.filter(i => i._id !== id);
      if (currentItinerary.value?._id === id) {
        currentItinerary.value = null;
      }
    } catch (error) {
      console.error('Failed to delete itinerary:', error);
      throw error;
    }
  }

  function setItineraryFromChat(data: {
    params: ItineraryParams;
    aiContent: string;
    userQuestion: string;
  }) {
    chatParams.value = data.params;
    chatContent.value = {
      aiContent: data.aiContent,
      userQuestion: data.userQuestion
    };
  }

  function setCurrentItinerary(itinerary: Itinerary) {
    currentItinerary.value = itinerary;
  }

  function clearChatData() {
    chatParams.value = null;
    chatContent.value = null;
  }

  // Load history on store initialization
  loadGenerationHistory();

  return {
    itineraries,
    currentItinerary,
    generating,
    loading,
    chatParams,
    chatContent,
    generationHistory,
    generateItinerary,
    loadItineraries,
    loadItinerary,
    deleteItinerary,
    setItineraryFromChat,
    setCurrentItinerary,
    clearChatData,
    deleteHistoryItem,
    clearHistory,
    addToHistory
  };
});
