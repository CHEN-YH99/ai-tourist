<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <Transition name="modal-content">
          <div
            v-if="isOpen"
            class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">
                {{ title }}
              </h2>
              <button
                class="text-gray-400 hover:text-gray-600 transition"
                @click="close"
              >
                ✕
              </button>
            </div>

            <!-- Body -->
            <div class="px-6 py-4">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Teleport, Transition } from 'vue';

interface Props {
  isOpen: boolean;
  title?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();

function close() {
  emit('close');
}

// Close on Escape key
if (props.isOpen) {
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      close();
    }
  };
  window.addEventListener('keydown', handleKeydown);
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-content-enter-active,
.modal-content-leave-active {
  transition: transform 0.3s ease;
}

.modal-content-enter-from,
.modal-content-leave-to {
  transform: scale(0.95);
}
</style>
