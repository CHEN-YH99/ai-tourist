<template>
  <div v-if="destination" class="space-y-6">
    <!-- Header with Image -->
    <div class="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
      <img
        v-if="destination.images.length > 0"
        :src="destination.images[0]"
        :alt="destination.name"
        class="w-full h-full object-cover"
      >
      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
        <svg class="w-16 h-16 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
        </svg>
      </div>

      <!-- Popularity Badge -->
      <div
        class="absolute top-4 right-4 bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-lg"
      >
        <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span class="text-lg font-bold text-gray-900">{{ destination.popularity }}/100</span>
      </div>
    </div>

    <!-- Title and Basic Info -->
    <Card>
      <div class="space-y-4">
        <div>
          <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ destination.name }}</h2>
          <p v-if="destination.nameEn" class="text-gray-500 mb-3">{{ destination.nameEn }}</p>
          <div class="flex flex-wrap gap-3 mb-4">
            <span class="flex items-center gap-1 text-gray-600">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
              {{ destination.region }} · {{ destination.country }}
            </span>
          </div>
        </div>

        <!-- Types -->
        <div v-if="destination.type.length > 0">
          <p class="text-sm font-semibold text-gray-600 mb-2">目的地类型</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="type in destination.type"
              :key="type"
              class="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full"
            >
              {{ type }}
            </span>
          </div>
        </div>

        <!-- Description -->
        <div>
          <p class="text-gray-700 leading-relaxed">{{ destination.description }}</p>
        </div>
      </div>
    </Card>

    <!-- Key Information Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Budget -->
      <Card>
        <div class="space-y-2">
          <div class="flex items-center gap-2 mb-3">
            <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.16 5.314l4.897-4.896a1 1 0 111.414 1.414L9.574 6.728A1 1 0 018.16 5.314zM2 10a8 8 0 1116 0 8 8 0 01-16 0zm9-3a1 1 0 11-2 0 1 1 0 012 0zM6.3 6.3a1 1 0 10-1.4 1.4A6 6 0 1016 10a1 1 0 11-2 0 4 4 0 10-7.7-3.7z" />
            </svg>
            <h3 class="font-semibold text-gray-900">平均预算</h3>
          </div>
          <p class="text-2xl font-bold text-green-600">
            ¥{{ destination.averageBudget.min.toLocaleString() }}-{{ destination.averageBudget.max.toLocaleString() }}
          </p>
          <p class="text-sm text-gray-500">{{ destination.averageBudget.currency }}</p>
        </div>
      </Card>

      <!-- Best Time to Visit -->
      <Card>
        <div class="space-y-2">
          <div class="flex items-center gap-2 mb-3">
            <svg class="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 000 2h8a1 1 0 100-2H6zM4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clip-rule="evenodd" />
            </svg>
            <h3 class="font-semibold text-gray-900">最佳旅行时间</h3>
          </div>
          <p class="text-gray-700">{{ destination.bestTimeToVisit }}</p>
        </div>
      </Card>

      <!-- Climate -->
      <Card v-if="destination.climate">
        <div class="space-y-2">
          <div class="flex items-center gap-2 mb-3">
            <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
            </svg>
            <h3 class="font-semibold text-gray-900">气候</h3>
          </div>
          <p class="text-gray-700">{{ destination.climate }}</p>
        </div>
      </Card>

      <!-- Transportation -->
      <Card v-if="destination.transportation">
        <div class="space-y-2">
          <div class="flex items-center gap-2 mb-3">
            <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
            <h3 class="font-semibold text-gray-900">交通</h3>
          </div>
          <p class="text-gray-700">{{ destination.transportation }}</p>
        </div>
      </Card>
    </div>

    <!-- Attractions -->
    <Card v-if="destination.attractions.length > 0">
      <div class="space-y-4">
        <h3 class="text-xl font-bold text-gray-900">热门景点</h3>
        <div class="space-y-4">
          <div
            v-for="(attraction, idx) in destination.attractions"
            :key="idx"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex gap-4">
              <!-- Attraction Image -->
              <div v-if="attraction.image" class="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-200">
                <img
                  :src="attraction.image"
                  :alt="attraction.name"
                  class="w-full h-full object-cover"
                >
              </div>

              <!-- Attraction Info -->
              <div class="flex-grow">
                <h4 class="font-semibold text-gray-900 mb-1">{{ attraction.name }}</h4>
                <p class="text-sm text-gray-600 mb-3">{{ attraction.description }}</p>

                <!-- Attraction Details -->
                <div class="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span v-if="attraction.ticketPrice" class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.16 5.314l4.897-4.896a1 1 0 111.414 1.414L9.574 6.728A1 1 0 018.16 5.314zM2 10a8 8 0 1116 0 8 8 0 01-16 0zm9-3a1 1 0 11-2 0 1 1 0 012 0zM6.3 6.3a1 1 0 10-1.4 1.4A6 6 0 1016 10a1 1 0 11-2 0 4 4 0 10-7.7-3.7z" />
                    </svg>
                    ¥{{ attraction.ticketPrice }}
                  </span>
                  <span v-if="attraction.openingHours" class="flex items-center gap-1">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd" />
                    </svg>
                    {{ attraction.openingHours }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- Travel Tips -->
    <Card v-if="destination.tips.length > 0">
      <div class="space-y-4">
        <h3 class="text-xl font-bold text-gray-900">旅行贴士</h3>
        <ul class="space-y-3">
          <li
            v-for="(tip, idx) in destination.tips"
            :key="idx"
            class="flex gap-3"
          >
            <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span class="text-gray-700">{{ tip }}</span>
          </li>
        </ul>
      </div>
    </Card>

    <!-- Additional Images Gallery -->
    <div v-if="destination.images.length > 1" class="space-y-4">
      <h3 class="text-lg font-bold text-gray-900">更多图片</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div
          v-for="(image, idx) in destination.images.slice(1)"
          :key="idx"
          class="relative w-full h-32 rounded-lg overflow-hidden bg-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <img
            :src="image"
            :alt="`${destination.name} - ${idx + 2}`"
            class="w-full h-full object-cover hover:scale-110 transition-transform"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Destination } from '@/types'
import Card from '@/components/ui/Card.vue'

interface Props {
  destination: Destination | null
}

defineProps<Props>()
</script>
