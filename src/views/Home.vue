<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <!-- Hero Section -->
    <section class="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
          探索世界，从这里开始
        </h1>
        <p class="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-10">
          让AI助手为你规划完美的旅行，发现独特的目的地和个性化的旅游体验
        </p>

        <!-- Quick Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/chat"
            class="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
            </svg>
            开始问答
          </router-link>
          <router-link
            to="/itinerary"
            class="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-indigo-600 font-semibold rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H3a1 1 0 00-1 1v10a1 1 0 001 1h14a1 1 0 001-1V6a1 1 0 00-1-1h-3a1 1 0 000-2h2a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" clip-rule="evenodd" />
            </svg>
            生成攻略
          </router-link>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">
          功能介绍
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
            <div class="text-4xl mb-4">🤖</div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">智能问答</h3>
            <p class="text-gray-600">
              24/7在线AI助手，即时解答旅游疑问，提供专业的旅行建议和实用信息
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
            <div class="text-4xl mb-4">🗺️</div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">个性化攻略</h3>
            <p class="text-gray-600">
              根据你的喜好、预算和时间定制专属旅行方案，包含详细的每日行程安排
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
            <div class="text-4xl mb-4">💡</div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">实用建议</h3>
            <p class="text-gray-600">
              获取当地美食、景点、交通、住宿等实用信息，让你的旅行更加便利
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Popular Destinations Section -->
    <section class="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-gray-50">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">
          热门目的地
        </h2>
        <p class="text-center text-gray-600 mb-12">
          探索全球最受欢迎的旅游目的地，发现你的下一个冒险之地
        </p>

        <!-- Loading State -->
        <div v-if="destinationStore.loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>

        <!-- Destinations Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DestinationCard
            v-for="destination in destinationStore.popularDestinations"
            :key="destination._id"
            :destination="destination"
            @click="handleDestinationClick"
          />
        </div>

        <!-- Empty State -->
        <div
          v-if="!destinationStore.loading && destinationStore.popularDestinations.length === 0"
          class="text-center py-12"
        >
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-gray-600 text-lg">暂无热门目的地数据</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div class="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-8 sm:p-12 text-center">
        <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">
          准备好开始你的旅程了吗？
        </h2>
        <p class="text-lg text-blue-100 mb-8">
          让我们的AI助手帮助你规划一次难忘的旅行体验
        </p>
        <router-link
          to="/chat"
          class="inline-block px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-200"
        >
          立即开始
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDestinationStore } from '@/stores/destination'
import DestinationCard from '@/components/DestinationCard.vue'
import type { Destination } from '@/types'

const router = useRouter()
const destinationStore = useDestinationStore()

// Load popular destinations on component mount
onMounted(async () => {
  try {
    await destinationStore.loadPopularDestinations(10)
  } catch (error) {
    console.error('Failed to load popular destinations:', error)
  }
})

// Handle destination card click
function handleDestinationClick(destination: Destination) {
  destinationStore.loadDestination(destination._id)
  router.push({
    name: 'Destinations',
    query: { selectedId: destination._id }
  })
}
</script>
