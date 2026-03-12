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
      // Handle both direct array and wrapped response formats
      if (Array.isArray(response.data)) {
        destinations.value = response.data as Destination[];
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        destinations.value = (response.data as any).data as Destination[];
      } else {
        console.warn('Unexpected response format:', response.data);
        destinations.value = [];
      }
    } catch (error) {
      console.error('Failed to load destinations:', error);
      destinations.value = [];
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function loadPopularDestinations(limit = 10) {
    loading.value = true;
    try {
      const response = await destinationAPI.getPopular(limit);
      // Handle both direct array and wrapped response formats
      if (Array.isArray(response.data)) {
        popularDestinations.value = response.data as Destination[];
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        popularDestinations.value = (response.data as any).data as Destination[];
      } else {
        console.warn('Unexpected response format:', response.data);
        popularDestinations.value = [];
      }
    } catch (error) {
      console.error('Failed to load popular destinations:', error);
      popularDestinations.value = [];
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function loadDestination(id: string) {
    loading.value = true;
    try {
      const response = await destinationAPI.getById(id);
      // Handle both direct object and wrapped response formats
      if (response.data && typeof response.data === 'object') {
        if ('_id' in response.data) {
          selectedDestination.value = response.data as Destination;
        } else if ('data' in response.data) {
          selectedDestination.value = (response.data as any).data as Destination;
        } else {
          console.warn('Unexpected response format:', response.data);
          selectedDestination.value = null;
        }
      }
    } catch (error) {
      console.error('Failed to load destination:', error);
      selectedDestination.value = null;
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
