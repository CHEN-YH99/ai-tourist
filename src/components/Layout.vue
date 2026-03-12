<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <!-- Header -->
    <Header />

    <!-- Main Content -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <Sidebar ref="sidebarRef" />

      <!-- Content Area -->
      <main class="flex-1 overflow-y-auto md:ml-64">
        <div class="max-w-7xl mx-auto">
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

defineExpose({
  sidebarRef
});
</script>
