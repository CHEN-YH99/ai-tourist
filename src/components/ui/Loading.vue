<template>
  <div
    :class="[
      'flex items-center justify-center',
      fullscreen ? 'fixed inset-0 bg-black bg-opacity-50 z-50' : 'w-full h-full'
    ]"
  >
    <div class="flex flex-col items-center gap-4">
      <!-- Spinner -->
      <div
        :class="[
          'border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin',
          sizeClasses
        ]"
      />

      <!-- Text -->
      <p v-if="text" class="text-gray-600 text-sm font-medium">
        {{ text }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullscreen?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  fullscreen: false
});

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };
  return sizes[props.size];
});
</script>
