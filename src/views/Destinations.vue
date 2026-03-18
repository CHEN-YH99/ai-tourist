<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-6 sm:mb-8">
      <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
        旅游目的地
      </h1>
      <p class="text-sm sm:text-base text-gray-600">探索世界各地的精彩目的地</p>
    </div>

    <!-- Filters and Sorting -->
    <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
      <!-- Search Bar -->
      <div class="mb-4">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索目的地名称..."
            class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            @input="handleSearch"
          />
          <svg
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <!-- Region Filter -->
        <div>
          <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">地区</label>
          <select
            v-model="filters.region"
            class="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            @change="applyFilters"
          >
            <option value="">全部地区</option>
            <option value="亚洲">亚洲</option>
            <option value="欧洲">欧洲</option>
            <option value="美洲">美洲</option>
            <option value="非洲">非洲</option>
            <option value="大洋洲">大洋洲</option>
          </select>
        </div>

        <!-- Type Filter -->
        <div>
          <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">类型</label>
          <select
            v-model="filters.type"
            class="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            @change="applyFilters"
          >
            <option value="">全部类型</option>
            <option value="海滨">海滨</option>
            <option value="文化">文化</option>
            <option value="冒险">冒险</option>
            <option value="美食">美食</option>
            <option value="购物">购物</option>
            <option value="自然">自然</option>
            <option value="历史">历史</option>
            <option value="现代">现代</option>
          </select>
        </div>

        <!-- Sort By -->
        <div>
          <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">排序</label>
          <select
            v-model="filters.sortBy"
            class="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            @change="applyFilters"
          >
            <option value="popularity">热度排序</option>
            <option value="name">名称排序</option>
            <option value="budget">预算排序</option>
          </select>
        </div>

        <!-- Reset Button -->
        <div class="flex items-end">
          <Button
            variant="secondary"
            class="w-full text-sm"
            @click="resetFilters"
          >
            重置筛选
          </Button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="destinationStore.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <SkeletonLoader type="destination" :count="6" />
    </div>

    <!-- Destinations Grid with Virtual Scrolling for large lists -->
    <div v-else-if="displayedDestinations.length > 0" class="mb-6 sm:mb-8">
      <VirtualList
        v-if="displayedDestinations.length > 20"
        :items="displayedDestinations"
        :item-height="380"
        container-height="800px"
      >
        <template #default="{ item: destination }">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <DestinationCard
              :destination="destination"
              @click="selectDestination"
            />
          </div>
        </template>
      </VirtualList>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <DestinationCard
          v-for="destination in displayedDestinations"
          :key="destination._id"
          :destination="destination"
          @click="selectDestination"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8 sm:py-12">
      <svg class="w-12 sm:w-16 h-12 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
      </svg>
      <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">未找到目的地</h3>
      <p class="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">尝试调整筛选条件</p>
      <Button
        variant="primary"
        class="text-sm"
        @click="resetFilters"
      >
        清除筛选
      </Button>
    </div>

    <!-- Detail Modal -->
    <div
      v-if="selectedDestination"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4"
      @click.self="closeDetail"
    >
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h2 class="text-lg sm:text-2xl font-bold text-gray-900 truncate">{{ selectedDestination.name }}</h2>
          <button
            class="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0 ml-2"
            @click="closeDetail"
          >
            <svg class="w-5 sm:w-6 h-5 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="px-4 sm:px-6 py-4 sm:py-6">
          <DestinationDetail :destination="selectedDestination" />
        </div>

        <!-- Modal Footer -->
        <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex gap-2 sm:gap-3 justify-end flex-wrap">
          <Button
            variant="secondary"
            class="text-sm"
            @click="closeDetail"
          >
            关闭
          </Button>
          <Button
            variant="primary"
            class="text-sm"
            @click="handleGenerateItinerary"
          >
            生成攻略
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Destination, DestinationFilters } from '@/types'
import { useDestinationStore } from '@/stores/destination'
import DestinationCard from '@/components/DestinationCard.vue'
import DestinationDetail from '@/components/DestinationDetail.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import Button from '@/components/ui/Button.vue'
import VirtualList from '@/components/VirtualList.vue'

const router = useRouter()
const route = useRoute()
const destinationStore = useDestinationStore()

const searchQuery = ref('')
const filters = ref<DestinationFilters>({
  region: '',
  type: '',
  sortBy: 'popularity'
})

const selectedDestination = ref<Destination | null>(null)

const displayedDestinations = computed(() => {
  let results = destinationStore.destinations

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    results = results.filter(dest => 
      dest.name.toLowerCase().includes(query) ||
      dest.description?.toLowerCase().includes(query) ||
      dest.country?.toLowerCase().includes(query)
    )
  }

  return results
})

// Watch for query parameter changes (from search)
watch(() => route.query.id, async (newId) => {
  if (newId && typeof newId === 'string') {
    try {
      await destinationStore.loadDestination(newId)
      if (destinationStore.selectedDestination) {
        selectedDestination.value = destinationStore.selectedDestination
      }
    } catch (error) {
      console.error('Failed to load destination from query:', error)
    }
  }
}, { immediate: true })

onMounted(async () => {
  await applyFilters()
})

async function applyFilters() {
  const filterParams: DestinationFilters = {}

  if (filters.value.region) {
    filterParams.region = filters.value.region
  }

  if (filters.value.type) {
    filterParams.type = filters.value.type
  }

  if (filters.value.sortBy) {
    filterParams.sortBy = filters.value.sortBy as 'popularity' | 'name' | 'budget'
  }

  try {
    await destinationStore.loadDestinations(filterParams)
  } catch (error: unknown) {
    console.error('Failed to load destinations:', error)
  }
}

function resetFilters() {
  searchQuery.value = ''
  filters.value = {
    region: '',
    type: '',
    sortBy: 'popularity'
  }
  applyFilters()
}

function handleSearch() {
  // Search is handled by computed property
  // This function can be used for debouncing if needed
}

function selectDestination(destination: Destination) {
  selectedDestination.value = destination
}

function closeDetail() {
  selectedDestination.value = null
  // Clear query parameter
  if (route.query.id) {
    router.replace({ query: {} })
  }
}

function handleGenerateItinerary() {
  if (!selectedDestination.value) return

  // Navigate to itinerary generator with destination pre-filled
  router.push({
    name: 'ItineraryGenerator',
    query: { destination: selectedDestination.value.name }
  })

  closeDetail()
}
</script>
