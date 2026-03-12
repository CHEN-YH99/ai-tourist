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

export const useItineraryStore = defineStore('itinerary', () => {
  // State
  const itineraries = ref<Itinerary[]>([]);
  const currentItinerary = ref<Itinerary | null>(null);
  const generating = ref(false);
  const loading = ref(false);

  // Actions
  async function generateItinerary(params: ItineraryParams) {
    generating.value = true;
    try {
      const response = await itineraryAPI.generate(params);
      currentItinerary.value = response.data as Itinerary;
      return response.data;
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
      const data = response.data as PaginatedResponse<Itinerary>;
      itineraries.value = data.items;
    } catch (error) {
      console.error('Failed to load itineraries:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function loadItinerary(id: string) {
    loading.value = true;
    try {
      const response = await itineraryAPI.getById(id);
      currentItinerary.value = response.data as Itinerary;
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

  return {
    itineraries,
    currentItinerary,
    generating,
    loading,
    generateItinerary,
    loadItineraries,
    loadItinerary,
    deleteItinerary
  };
});
