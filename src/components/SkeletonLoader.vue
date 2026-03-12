<template>
  <div class="space-y-4">
    <div
      v-for="i in count"
      :key="i"
      class="animate-pulse"
    >
      <!-- Card Skeleton -->
      <div
        v-if="type === 'card'"
        class="bg-white rounded-lg overflow-hidden shadow-sm"
      >
        <div class="h-48 bg-gray-200" />
        <div class="p-4 space-y-3">
          <div class="h-4 bg-gray-200 rounded w-3/4" />
          <div class="h-3 bg-gray-200 rounded w-1/2" />
          <div class="h-3 bg-gray-200 rounded w-2/3" />
        </div>
      </div>

      <!-- Text Skeleton -->
      <div
        v-else-if="type === 'text'"
        class="space-y-2"
      >
        <div class="h-4 bg-gray-200 rounded w-3/4" />
        <div class="h-4 bg-gray-200 rounded w-1/2" />
      </div>

      <!-- List Item Skeleton -->
      <div
        v-else-if="type === 'list-item'"
        class="flex gap-4 p-4 bg-white rounded-lg"
      >
        <div class="h-12 w-12 bg-gray-200 rounded-full flex-shrink-0" />
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-200 rounded w-3/4" />
          <div class="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>

      <!-- Table Row Skeleton -->
      <div
        v-else-if="type === 'table-row'"
        class="flex gap-4 p-4 bg-white rounded-lg"
      >
        <div class="h-4 bg-gray-200 rounded flex-1" />
        <div class="h-4 bg-gray-200 rounded flex-1" />
        <div class="h-4 bg-gray-200 rounded flex-1" />
      </div>

      <!-- Message Skeleton -->
      <div
        v-else-if="type === 'message'"
        class="flex gap-3 mb-4"
      >
        <div class="h-8 w-8 bg-gray-200 rounded-full flex-shrink-0" />
        <div class="flex-1 space-y-2">
          <div class="h-3 bg-gray-200 rounded w-1/4" />
          <div class="h-4 bg-gray-200 rounded w-3/4" />
          <div class="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>

      <!-- Itinerary Skeleton -->
      <div
        v-else-if="type === 'itinerary'"
        class="bg-white rounded-lg p-4 space-y-4"
      >
        <div class="h-6 bg-gray-200 rounded w-1/3" />
        <div class="space-y-3">
          <div class="h-4 bg-gray-200 rounded w-full" />
          <div class="h-4 bg-gray-200 rounded w-5/6" />
          <div class="h-4 bg-gray-200 rounded w-4/6" />
        </div>
      </div>

      <!-- Destination Card Skeleton -->
      <div
        v-else-if="type === 'destination'"
        class="bg-white rounded-lg overflow-hidden shadow-sm"
      >
        <div class="h-40 bg-gray-200" />
        <div class="p-4 space-y-3">
          <div class="h-5 bg-gray-200 rounded w-2/3" />
          <div class="h-3 bg-gray-200 rounded w-full" />
          <div class="h-3 bg-gray-200 rounded w-4/5" />
          <div class="flex gap-2 pt-2">
            <div class="h-3 bg-gray-200 rounded flex-1" />
            <div class="h-3 bg-gray-200 rounded flex-1" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'card' | 'text' | 'list-item' | 'table-row' | 'message' | 'itinerary' | 'destination'
    count?: number
  }>(),
  {
    type: 'card',
    count: 3
  }
)
</script>

<style scoped>
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
