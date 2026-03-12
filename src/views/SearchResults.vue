<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          搜索结果
        </h1>
        <p class="text-gray-600">
          关键词: <span class="font-semibold text-gray-900">{{ searchQuery }}</span>
        </p>
      </div>

      <!-- Type Filter -->
      <div class="mb-6 flex gap-3 flex-wrap">
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
        <div v-for="i in 3" :key="i" class="h-32 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      <!-- Empty Results -->
      <div v-else-if="filteredResults.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          未找到相关内容
        </h3>
        <p class="text-gray-600 mb-6">
          尝试使用其他关键词或浏览其他内容
        </p>
        <router-link
          to="/destinations"
          class="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          浏览目的地
        </router-link>
      </div>

      <!-- Results Grid -->
      <div v-else class="space-y-8">
        <!-- Destinations Results -->
        <section v-if="showDestinations && searchResults.destinations.length > 0">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            目的地 ({{ searchResults.destinations.length }})
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DestinationCard
              v-for="destination in searchResults.destinations"
              :key="destination._id"
              :destination="destination"
              @click="handleDestinationClick"
            />
          </div>
        </section>

        <!-- Itineraries Results -->
        <section v-if="showItineraries && searchResults.itineraries.length > 0">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            攻略 ({{ searchResults.itineraries.length }})
          </h2>
          <div class="space-y-4">
            <SearchResultItem
              v-for="itinerary in searchResults.itineraries"
              :key="itinerary._id"
              type="itinerary"
              :item="itinerary"
              @click="handleItineraryClick"
            />
          </div>
        </section>

        <!-- Conversations Results -->
        <section v-if="showConversations && searchResults.conversations.length > 0">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            对话 ({{ searchResults.conversations.length }})
          </h2>
          <div class="space-y-4">
            <SearchResultItem
              v-for="conversation in searchResults.conversations"
              :key="conversation._id"
              type="conversation"
              :item="conversation"
              @click="handleConversationClick"
            />
          </div>
        </section>
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
        <template v-else-if="selectedItem && selectedItemType === 'destination'">
          <DestinationDetail :destination="selectedItem as Destination" />
        </template>
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { searchAPI } from '@/api/search'
import type { SearchResults, Destination, Itinerary, Conversation } from '@/types'
import DestinationCard from '@/components/DestinationCard.vue'
import DestinationDetail from '@/components/DestinationDetail.vue'
import ItineraryDisplay from '@/components/ItineraryDisplay.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import SearchResultItem from '@/components/SearchResultItem.vue'
import Modal from '@/components/ui/Modal.vue'

const route = useRoute()

const searchQuery = ref('')
const searchResults = ref<SearchResults>({
  destinations: [],
  itineraries: [],
  conversations: [],
  total: 0
})
const loading = ref(false)
const selectedType = ref<'destination' | 'itinerary' | 'conversation' | null>(null)
const selectedItem = ref<Destination | Itinerary | Conversation | null>(null)
const selectedItemType = ref<'destination' | 'itinerary' | 'conversation' | null>(null)

const filterOptions = [
  { label: '全部', value: null as any },
  { label: '目的地', value: 'destination' as const },
  { label: '攻略', value: 'itinerary' as const },
  { label: '对话', value: 'conversation' as const }
]

const showDestinations = computed(() => selectedType.value === null || selectedType.value === 'destination')
const showItineraries = computed(() => selectedType.value === null || selectedType.value === 'itinerary')
const showConversations = computed(() => selectedType.value === null || selectedType.value === 'conversation')

const filteredResults = computed(() => {
  const results = []
  if (showDestinations.value) results.push(...searchResults.value.destinations)
  if (showItineraries.value) results.push(...searchResults.value.itineraries)
  if (showConversations.value) results.push(...searchResults.value.conversations)
  return results
})

async function performSearch() {
  const query = route.query.q as string
  if (!query) return

  searchQuery.value = query
  loading.value = true

  try {
    const response = await searchAPI.search(query, {
      type: selectedType.value || undefined
    })
    const data = response.data as any
    searchResults.value = {
      destinations: data.destinations || [],
      itineraries: data.itineraries || [],
      conversations: data.conversations || [],
      total: data.total || 0
    }
  } catch (error) {
    console.error('Search failed:', error)
  } finally {
    loading.value = false
  }
}

function handleDestinationClick(destination: Destination) {
  selectedItem.value = destination as any
  selectedItemType.value = 'destination'
}

function handleItineraryClick(item: Itinerary | Conversation) {
  selectedItem.value = item as any
  selectedItemType.value = 'itinerary'
}

function handleConversationClick(item: Itinerary | Conversation) {
  selectedItem.value = item as any
  selectedItemType.value = 'conversation'
}

onMounted(() => {
  performSearch()
})

watch(() => route.query.q, () => {
  performSearch()
})

watch(() => selectedType.value, () => {
  performSearch()
})
</script>
