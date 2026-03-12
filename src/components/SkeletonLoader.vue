<template>
  <div class="space-y-4">
    <div
      v-for="i in count"
      :key="i"
      class="animate-pulse"
    >
      <div
        v-if="type === 'card'"
        class="bg-gray-200 rounded-lg h-64 w-full"
      />
      <div
        v-else-if="type === 'text'"
        class="space-y-2"
      >
        <div class="h-4 bg-gray-200 rounded w-3/4" />
        <div class="h-4 bg-gray-200 rounded w-1/2" />
      </div>
      <div
        v-else-if="type === 'list-item'"
        class="flex gap-4"
      >
        <div class="h-12 w-12 bg-gray-200 rounded-full flex-shrink-0" />
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-200 rounded w-3/4" />
          <div class="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div
        v-else-if="type === 'table-row'"
        class="flex gap-4"
      >
        <div class="h-4 bg-gray-200 rounded flex-1" />
        <div class="h-4 bg-gray-200 rounded flex-1" />
        <div class="h-4 bg-gray-200 rounded flex-1" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'card' | 'text' | 'list-item' | 'table-row'
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
