<template>
  <div
    :class="[
      'rounded-lg border border-gray-200 bg-white overflow-hidden transition-shadow duration-200',
      hoverable ? 'hover:shadow-lg cursor-pointer' : 'shadow-sm',
      customClass
    ]"
  >
    <!-- Header -->
    <div v-if="$slots.header" class="px-6 py-4 border-b border-gray-200 bg-gray-50">
      <slot name="header" />
    </div>

    <!-- Body -->
    <div class="px-6 py-4">
      <slot />
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  hoverable?: boolean;
  customClass?: string;
}

withDefaults(defineProps<Props>(), {
  hoverable: false,
  customClass: ''
});
</script>
