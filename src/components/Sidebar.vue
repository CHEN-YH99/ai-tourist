<template>
  <aside
    class="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto transition-transform duration-300 z-30"
    :class="{ '-translate-x-full': !isOpen && isMobile }"
  >
    <nav class="p-4 space-y-2">
      <!-- Main Navigation -->
      <div class="mb-6">
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
          主菜单
        </h3>
        <router-link
          to="/"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition"
          :class="{ 'bg-blue-100 text-blue-600': isActive('/') }"
          @click="closeMobileMenu"
        >
          <span class="text-lg">🏠</span>
          <span>首页</span>
        </router-link>

        <router-link
          to="/chat"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition"
          :class="{ 'bg-blue-100 text-blue-600': isActive('/chat') }"
          @click="closeMobileMenu"
        >
          <span class="text-lg">💬</span>
          <span>AI问答</span>
        </router-link>

        <router-link
          to="/itinerary"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition"
          :class="{ 'bg-blue-100 text-blue-600': isActive('/itinerary') }"
          @click="closeMobileMenu"
        >
          <span class="text-lg">📋</span>
          <span>生成攻略</span>
        </router-link>

        <router-link
          to="/destinations"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition"
          :class="{ 'bg-blue-100 text-blue-600': isActive('/destinations') }"
          @click="closeMobileMenu"
        >
          <span class="text-lg">🌍</span>
          <span>目的地</span>
        </router-link>
      </div>

      <!-- User Section -->
      <div v-if="authStore.isAuthenticated" class="border-t border-gray-200 pt-4">
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
          我的内容
        </h3>

        <router-link
          to="/collections"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition"
          :class="{ 'bg-blue-100 text-blue-600': isActive('/collections') }"
          @click="closeMobileMenu"
        >
          <span class="text-lg">⭐</span>
          <span>我的收藏</span>
        </router-link>

        <router-link
          to="/profile"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition"
          :class="{ 'bg-blue-100 text-blue-600': isActive('/profile') }"
          @click="closeMobileMenu"
        >
          <span class="text-lg">👤</span>
          <span>个人资料</span>
        </router-link>
      </div>

      <!-- Auth Section -->
      <div v-else class="border-t border-gray-200 pt-4">
        <router-link
          to="/login"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition"
          @click="closeMobileMenu"
        >
          <span class="text-lg">🔐</span>
          <span>登录</span>
        </router-link>

        <router-link
          to="/register"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition"
          @click="closeMobileMenu"
        >
          <span class="text-lg">✍️</span>
          <span>注册</span>
        </router-link>
      </div>
    </nav>
  </aside>

  <!-- Mobile Overlay -->
  <div
    v-if="isOpen && isMobile"
    class="fixed inset-0 bg-black bg-opacity-50 z-20 top-16"
    @click="closeMobileMenu"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const authStore = useAuthStore();

const isOpen = ref(false);
const isMobile = ref(false);

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/');
};

function closeMobileMenu() {
  if (isMobile.value) {
    isOpen.value = false;
  }
}

function handleResize() {
  isMobile.value = window.innerWidth < 768;
  if (!isMobile.value) {
    isOpen.value = true;
  }
}

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

defineExpose({
  isOpen,
  toggleOpen: () => {
    isOpen.value = !isOpen.value;
  }
});
</script>
