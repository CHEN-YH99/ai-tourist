<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="[
          'w-full px-4 py-2 rounded-lg border transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          errorClasses,
          disabledClasses
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur')"
        @focus="$emit('focus')"
      />

      <span v-if="icon" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        {{ icon }}
      </span>
    </div>

    <p v-if="error" class="mt-1 text-sm text-red-600">
      {{ error }}
    </p>

    <p v-if="hint" class="mt-1 text-sm text-gray-500">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  label?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  icon?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
  id: 'input-' + Math.random().toString(36).substr(2, 9)
});

defineEmits<{
  'update:modelValue': [value: string];
  blur: [];
  focus: [];
}>();

const errorClasses = computed(() => {
  if (props.error) {
    return 'border-red-500 focus:ring-red-500 focus:border-red-500';
  }
  return 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
});

const disabledClasses = computed(() => {
  return props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white';
});
</script>
