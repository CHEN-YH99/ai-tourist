<template>
  <div class="relative w-full">
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索目的地、攻略、对话..."
        class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        @keyup.enter="handleSearch"
        @input="handleInput"
        @focus="showSuggestions = true"
        @blur="closeSuggestions"
      />
      <button
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
        @click="handleSearch"
      >
        🔍
      </button>
    </div>

    <!-- Search Suggestions Dropdown -->
    <div
      v-if="showSuggestions && (suggestions.length > 0 || destinationSuggestions.length > 0)"
      class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
    >
      <div class="max-h-64 overflow-y-auto">
        <!-- Destination Suggestions -->
        <div v-if="destinationSuggestions.length > 0" class="border-b border-gray-200">
          <div class="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">目的地</div>
          <button
            v-for="dest in destinationSuggestions"
            :key="dest._id"
            class="w-full text-left px-4 py-2 hover:bg-blue-50 transition flex items-center gap-2"
            @click="selectDestination(dest)"
          >
            <span class="text-blue-500">📍</span>
            <div class="flex-1">
              <div class="text-gray-900 font-medium">{{ dest.name }}</div>
              <div class="text-xs text-gray-500">{{ dest.region }} · {{ dest.type }}</div>
            </div>
          </button>
        </div>

        <!-- Recent Search Suggestions -->
        <div v-if="suggestions.length > 0">
          <div class="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">最近搜索</div>
          <button
            v-for="(suggestion, idx) in suggestions"
            :key="idx"
            class="w-full text-left px-4 py-2 hover:bg-gray-100 transition flex items-center gap-2"
            @click="selectSuggestion(suggestion)"
          >
            <span class="text-gray-400">🔍</span>
            <span class="text-gray-700">{{ suggestion }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDestinationStore } from '@/stores/destination'
import type { Destination } from '@/types'

const router = useRouter()
const destinationStore = useDestinationStore()

const searchQuery = ref('')
const showSuggestions = ref(false)
const recentSearches = ref<string[]>([])
const destinationSuggestions = ref<Destination[]>([])

// Load recent searches from localStorage
const loadRecentSearches = () => {
  const stored = localStorage.getItem('recentSearches')
  if (stored) {
    recentSearches.value = JSON.parse(stored)
  }
}

// Save recent searches to localStorage
const saveRecentSearches = () => {
  localStorage.setItem('recentSearches', JSON.stringify(recentSearches.value))
}

const suggestions = computed(() => {
  if (!searchQuery.value.trim()) {
    return recentSearches.value.slice(0, 5)
  }

  const query = searchQuery.value.toLowerCase()
  return recentSearches.value.filter(s => s.toLowerCase().includes(query)).slice(0, 5)
})

// Watch search query and fetch destination suggestions
watch(searchQuery, async (newQuery) => {
  if (newQuery.trim().length >= 1) {
    try {
      // Load all destinations and filter locally for better matching
      await destinationStore.loadDestinations()
      const query = newQuery.toLowerCase().trim()
      
      destinationSuggestions.value = destinationStore.destinations
        .filter(dest => {
          // Search in name
          if (dest.name.toLowerCase().includes(query)) return true
          
          // Search in region
          if (dest.region?.toLowerCase().includes(query)) return true
          
          // Search in type array
          if (dest.type && Array.isArray(dest.type)) {
            if (dest.type.some(t => t.toLowerCase().includes(query))) return true
          }
          
          // Search in country
          if (dest.country?.toLowerCase().includes(query)) return true
          
          return false
        })
        .slice(0, 5)
    } catch (error) {
      console.error('Failed to load destination suggestions:', error)
      destinationSuggestions.value = []
    }
  } else {
    destinationSuggestions.value = []
  }
})

function handleInput() {
  showSuggestions.value = true
}

function closeSuggestions() {
  // Delay to allow click on suggestion
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

function selectSuggestion(suggestion: string) {
  searchQuery.value = suggestion
  handleSearch()
}

function selectDestination(destination: Destination) {
  // Navigate directly to destinations page with the selected destination
  router.push({
    name: 'Destinations',
    query: { id: destination._id }
  })
  
  // Add to recent searches
  const searchText = destination.name
  const index = recentSearches.value.indexOf(searchText)
  if (index > -1) {
    recentSearches.value.splice(index, 1)
  }
  recentSearches.value.unshift(searchText)
  if (recentSearches.value.length > 10) {
    recentSearches.value.pop()
  }
  saveRecentSearches()
  
  searchQuery.value = ''
  showSuggestions.value = false
}

function handleSearch() {
  const query = searchQuery.value.trim()
  if (!query) return

  // Add to recent searches
  const index = recentSearches.value.indexOf(query)
  if (index > -1) {
    recentSearches.value.splice(index, 1)
  }
  recentSearches.value.unshift(query)
  if (recentSearches.value.length > 10) {
    recentSearches.value.pop()
  }
  saveRecentSearches()

  // Navigate to search results
  router.push({
    name: 'SearchResults',
    query: { q: query }
  })

  showSuggestions.value = false
}

// Load recent searches on mount
loadRecentSearches()
</script>
