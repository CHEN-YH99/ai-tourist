<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">我的收藏</h1>
        <p class="text-gray-600">管理你收藏的攻略和对话</p>
      </div>

      <!-- Type Filter -->
      <div class="mb-6 flex gap-3">
        <button
          v-for="type in filterOptions"
          :key="type.value"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition',
            selectedType === type.value
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
          ]"
          @click="selectedType = type.value"
        >
          {{ type.label }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-24 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredCollections.length === 0"
        class="text-center py-12"
      >
        <div class="text-6xl mb-4">📭</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          {{ selectedType === null ? '还没有收藏' : '该类型下没有收藏' }}
        </h3>
        <p class="text-gray-600 mb-6">
          {{ selectedType === null
            ? '收藏你喜欢的攻略和对话，方便日后查看'
            : '尝试收藏其他类型的内容'
          }}
        </p>
        <router-link
          to="/destinations"
          class="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          浏览目的地
        </router-link>
      </div>

      <!-- Collections List -->
      <div v-else class="space-y-4">
        <CollectionItem
          v-for="collection in filteredCollections"
          :key="collection._id"
          :collection="collection"
          :item="getCollectionItem(collection)"
          @remove="handleRemove"
          @viewDetails="handleViewDetails"
        />
      </div>

      <!-- Detail Modal -->
      <Modal
        v-if="selectedItem"
        :isOpen="!!selectedItem"
        @close="selectedItem = null"
      >
        <template v-if="selectedItem && selectedItemType === 'itinerary'">
          <ItineraryDisplay :itinerary="selectedItem as Itinerary" />
        </template>
        <template v-else-if="selectedItem && selectedItemType === 'conversation'">
          <div class="max-h-96 overflow-y-auto">
            <div class="space-y-4">
              <ChatMessage
                v-for="(msg, idx) in (selectedItem as Conversation).messages"
                :key="idx"
                :message="msg"
              />
            </div>
          </div>
        </template>
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCollectionStore } from '@/stores/collection'
import type { Collection, Itinerary, Conversation, CollectionType } from '@/types'
import CollectionItem from '@/components/CollectionItem.vue'
import ItineraryDisplay from '@/components/ItineraryDisplay.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import Modal from '@/components/ui/Modal.vue'

const collectionStore = useCollectionStore()

const selectedType = ref<CollectionType | null>(null)
const selectedItem = ref<Itinerary | Conversation | null>(null)
const selectedItemType = ref<CollectionType | null>(null)

const filterOptions = [
  { label: '全部', value: null },
  { label: '攻略', value: 'itinerary' as const },
  { label: '对话', value: 'conversation' as const }
]

const loading = computed(() => collectionStore.loading)

const filteredCollections = computed(() => {
  if (selectedType.value === null) {
    return collectionStore.collections
  }
  return collectionStore.collections.filter(c => c.itemType === selectedType.value)
})

// Map to store items by ID for quick lookup
const itemsMap = new Map<string, Itinerary | Conversation>()

onMounted(async () => {
  await collectionStore.loadCollections()
})

function getCollectionItem(collection: Collection): Itinerary | Conversation {
  return itemsMap.get(collection.itemId) || ({} as any)
}

async function handleRemove(collectionId: string) {
  await collectionStore.removeFromCollection(collectionId)
}

function handleViewDetails(item: Itinerary | Conversation) {
  selectedItem.value = item
  // Determine item type from the item structure
  if ('destination' in item) {
    selectedItemType.value = 'itinerary'
  } else {
    selectedItemType.value = 'conversation'
  }
}
</script>
