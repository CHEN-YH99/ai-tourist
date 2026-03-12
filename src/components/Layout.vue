<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <!-- Header with Sidebar Toggle -->
    <Header @toggle-sidebar="toggleSidebar" />

    <!-- Main Content -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <Sidebar ref="sidebarRef" :is-open="sidebarOpen" @close="sidebarOpen = false" />

      <!-- Content Area -->
      <main class="flex-1 overflow-y-auto transition-all duration-300 md:ml-64">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Header from './Header.vue';
import Sidebar from './Sidebar.vue';

const sidebarRef = ref();
const sidebarOpen = ref(false);

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

defineExpose({
  sidebarRef,
  toggleSidebar
});
</script>
