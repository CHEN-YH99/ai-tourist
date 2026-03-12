import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Destination } from '@/types';
import { destinationAPI } from '@/api/destination';

interface DestinationFilters {
  region?: string;
  type?: string;
  sortBy?: 'popularity' | 'name' | 'budget';
}

export const useDestinationStore = defineStore('destination', () => {
  // State
  const destinations = ref<Destination[]>([]);
  const popularDestinations = ref<Destination[]>([]);
  const selectedDestination = ref<Destination | null>(null);
  const loading = ref(false);

  // Actions
  async function loadDestinations(filters?: DestinationFilters) {
    loading.value = true;
    try {
      const response = await destinationAPI.getList(filters);
      destinations.value = response.data as Destination[];
    } catch (error) {
      console.error('Failed to load destinations:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function loadPopularDestinations(limit = 10) {
    loading.value = true;
    try {
      const response = await destinationAPI.getPopular(limit);
      popularDestinations.value = response.data as Destination[];
    } catch (error) {
      console.error('Failed to load popular destinations:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function loadDestination(id: string) {
    loading.value = true;
    try {
      const response = await destinationAPI.getById(id);
      selectedDestination.value = response.data as Destination;
    } catch (error) {
      console.error('Failed to load destination:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function clearSelectedDestination() {
    selectedDestination.value = null;
  }

  return {
    destinations,
    popularDestinations,
    selectedDestination,
    loading,
    loadDestinations,
    loadPopularDestinations,
    loadDestination,
    clearSelectedDestination
  };
});
