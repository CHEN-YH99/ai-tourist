import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Collection } from '@/types';
import { collectionAPI } from '@/api/collection';

type CollectionType = 'itinerary' | 'conversation';

interface CollectionCheckResponse {
  isCollected: boolean;
}

export const useCollectionStore = defineStore('collection', () => {
  // State
  const collections = ref<Collection[]>([]);
  const loading = ref(false);

  // Actions
  async function loadCollections(type?: CollectionType) {
    loading.value = true;
    try {
      const response = await collectionAPI.getList(type);
      collections.value = response.data as Collection[];
    } catch (error) {
      console.error('Failed to load collections:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function addToCollection(itemId: string, itemType: CollectionType) {
    try {
      const response = await collectionAPI.add(itemId, itemType);
      const newCollection = response.data as Collection;
      collections.value.unshift(newCollection);
      return newCollection;
    } catch (error) {
      console.error('Failed to add to collection:', error);
      throw error;
    }
  }

  async function removeFromCollection(id: string) {
    try {
      await collectionAPI.remove(id);
      collections.value = collections.value.filter(c => c._id !== id);
    } catch (error) {
      console.error('Failed to remove from collection:', error);
      throw error;
    }
  }

  async function isCollected(itemId: string): Promise<boolean> {
    try {
      const response = await collectionAPI.check(itemId);
      const data = response.data as CollectionCheckResponse;
      return data.isCollected;
    } catch (error) {
      console.error('Failed to check collection status:', error);
      throw error;
    }
  }

  return {
    collections,
    loading,
    loadCollections,
    addToCollection,
    removeFromCollection,
    isCollected
  };
});
