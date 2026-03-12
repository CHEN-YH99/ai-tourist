<template>
  <div id="app" class="flex flex-col min-h-screen bg-gray-50">
    <Header />
    <div class="flex flex-1 overflow-hidden">
      <Sidebar />
      <main class="flex-1 overflow-auto md:ml-64">
        <div class="p-4 md:p-8">
          <router-view />
        </div>
      </main>
    </div>
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { setToastNotifier } from '@/api/client'
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
import ToastContainer from '@/components/ToastContainer.vue'

const { error, warning } = useToast()

// Initialize toast notifier for API client
onMounted(() => {
  setToastNotifier((message: string, type: string, title?: string) => {
    if (type === 'error') {
      error(message, title)
    } else if (type === 'warning') {
      warning(message, title)
    }
  })
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f5f7fa;
}
</style>
