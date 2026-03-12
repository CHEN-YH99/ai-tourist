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
      v-if="showSuggestions && suggestions.length > 0"
      class="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
    >
      <div class="max-h-64 overflow-y-auto">
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const searchQuery = ref('')
const showSuggestions = ref(false)
const recentSearches = ref<string[]>([])

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
