<template>
  <Card
    hoverable
    class="h-full flex flex-col cursor-pointer transition-transform hover:scale-105"
    @click="handleClick"
  >
    <!-- Image -->
    <div class="relative w-full h-48 bg-gray-200 overflow-hidden rounded-t-lg -mx-6 -mt-4 mb-4">
      <LazyImage
        v-if="destination.images.length > 0"
        :src="destination.images[0]"
        :alt="destination.name"
        aspect-ratio="16 / 9"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
        <svg class="w-12 h-12 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
        </svg>
      </div>

      <!-- Popularity Badge -->
      <div
        class="absolute top-3 right-3 bg-white rounded-full px-3 py-1 flex items-center gap-1 shadow-md"
      >
        <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span class="text-sm font-semibold text-gray-900">{{ destination.popularity }}</span>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-grow flex flex-col">
      <!-- Name and Region -->
      <h3 class="text-lg font-bold text-gray-900 mb-1">{{ destination.name }}</h3>
      <p class="text-sm text-gray-500 mb-3">{{ destination.region }} · {{ destination.country }}</p>

      <!-- Description -->
      <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ destination.description }}</p>

      <!-- Types -->
      <div v-if="destination.type.length > 0" class="flex flex-wrap gap-2 mb-4">
        <span
          v-for="type in destination.type.slice(0, 2)"
          :key="type"
          class="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded"
        >
          {{ type }}
        </span>
        <span
          v-if="destination.type.length > 2"
          class="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded"
        >
          +{{ destination.type.length - 2 }}
        </span>
      </div>

      <!-- Budget Info -->
      <div class="mt-auto pt-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-500 mb-1">平均预算</p>
            <p class="text-lg font-bold text-gray-900">
              ¥{{ destination.averageBudget.min.toLocaleString() }}-{{ destination.averageBudget.max.toLocaleString() }}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            @click.stop="handleClick"
          >
            查看详情
          </Button>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import type { Destination } from '@/types'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import LazyImage from '@/components/LazyImage.vue'

interface Props {
  destination: Destination
}

defineProps<Props>()

const emit = defineEmits<{
  click: [destination: Destination]
}>()

function handleClick() {
  emit('click', props.destination)
}
</script>
