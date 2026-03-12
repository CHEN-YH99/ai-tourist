<template>
  <div
    :class="[
      'bg-white rounded-lg shadow-sm border border-gray-200 p-6',
      hoverable && 'hover:shadow-md transition-shadow cursor-pointer',
      $attrs.class
    ]"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  hoverable?: boolean
}

withDefaults(defineProps<Props>(), {
  hoverable: false
})
</script>
