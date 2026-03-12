<template>
  <header class="bg-white shadow-sm sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">✈</span>
          </div>
          <span class="text-xl font-bold text-gray-900">Travel AI</span>
        </router-link>

        <!-- Search Bar -->
        <div class="flex-1 max-w-md mx-8">
          <div class="relative">
            <input
              type="text"
              placeholder="搜索目的地、攻略..."
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              @keyup.enter="handleSearch"
            />
            <button
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              @click="handleSearch"
            >
              🔍
            </button>
          </div>
        </div>

        <!-- Navigation & User Menu -->
        <div class="flex items-center gap-6">
          <nav class="hidden md:flex gap-6">
            <router-link
              to="/chat"
              class="text-gray-600 hover:text-gray-900 transition"
            >
              问答
            </router-link>
            <router-link
              to="/itinerary"
              class="text-gray-600 hover:text-gray-900 transition"
            >
              攻略
            </router-link>
            <router-link
              to="/destinations"
              class="text-gray-600 hover:text-gray-900 transition"
            >
              目的地
            </router-link>
          </nav>

          <!-- User Menu -->
          <div class="relative">
            <button
              class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              @click="toggleUserMenu"
            >
              <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span class="text-sm font-semibold">👤</span>
              </div>
              <span class="text-sm text-gray-700">{{ authStore.user?.username || '登录' }}</span>
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
            >
              <template v-if="authStore.isAuthenticated">
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  @click="showUserMenu = false"
                >
                  个人资料
                </router-link>
                <router-link
                  to="/collections"
                  class="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  @click="showUserMenu = false"
                >
                  我的收藏
                </router-link>
                <hr class="my-2" />
                <button
                  class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  @click="handleLogout"
                >
                  登出
                </button>
              </template>
              <template v-else>
                <router-link
                  to="/login"
                  class="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  @click="showUserMenu = false"
                >
                  登录
                </router-link>
                <router-link
                  to="/register"
                  class="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  @click="showUserMenu = false"
                >
                  注册
                </router-link>
              </template>
            </div>
          </div>

          <!-- Mobile Menu Toggle -->
          <button
            class="md:hidden text-gray-600 hover:text-gray-900"
            @click="toggleMobileMenu"
          >
            ☰
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="showMobileMenu" class="md:hidden border-t border-gray-200 py-4">
        <router-link
          to="/chat"
          class="block px-4 py-2 text-gray-600 hover:text-gray-900"
          @click="showMobileMenu = false"
        >
          问答
        </router-link>
        <router-link
          to="/itinerary"
          class="block px-4 py-2 text-gray-600 hover:text-gray-900"
          @click="showMobileMenu = false"
        >
          攻略
        </router-link>
        <router-link
          to="/destinations"
          class="block px-4 py-2 text-gray-600 hover:text-gray-900"
          @click="showMobileMenu = false"
        >
          目的地
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const showUserMenu = ref(false);
const showMobileMenu = ref(false);

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value;
}

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value;
}

async function handleLogout() {
  await authStore.logout();
  showUserMenu.value = false;
  router.push('/');
}

function handleSearch() {
  // TODO: Implement search functionality
  showUserMenu.value = false;
}
</script>
