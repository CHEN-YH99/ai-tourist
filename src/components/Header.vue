<template>
  <header class="bg-white shadow-sm sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Mobile Menu Toggle & Logo -->
        <div class="flex items-center gap-3 md:gap-4">
          <button
            class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            @click="$emit('toggle-sidebar')"
            title="切换菜单"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <router-link to="/" class="flex items-center gap-2 flex-shrink-0">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span class="text-white font-bold text-lg">✈</span>
            </div>
            <span class="text-lg sm:text-xl font-bold text-gray-900 hidden sm:inline">Travel AI</span>
          </router-link>
        </div>

        <!-- Search Bar - Hidden on very small screens -->
        <div class="hidden sm:flex flex-1 max-w-md mx-4 lg:mx-8">
          <SearchBar />
        </div>

        <!-- Navigation & User Menu -->
        <div class="flex items-center gap-3 sm:gap-6">
          <nav class="hidden lg:flex gap-6">
            <router-link
              to="/chat"
              class="text-gray-600 hover:text-gray-900 transition text-sm lg:text-base"
            >
              问答
            </router-link>
            <router-link
              to="/itinerary"
              class="text-gray-600 hover:text-gray-900 transition text-sm lg:text-base"
            >
              攻略
            </router-link>
            <router-link
              to="/destinations"
              class="text-gray-600 hover:text-gray-900 transition text-sm lg:text-base"
            >
              目的地
            </router-link>
          </nav>

          <!-- User Menu -->
          <div class="relative">
            <button
              class="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              @click="toggleUserMenu"
            >
              <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-sm font-semibold">👤</span>
              </div>
              <span class="text-xs sm:text-sm text-gray-700 hidden sm:inline truncate max-w-[100px]">
                {{ authStore.user?.username || '登录' }}
              </span>
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
            >
              <template v-if="authStore.isAuthenticated">
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition text-sm"
                  @click="showUserMenu = false"
                >
                  个人资料
                </router-link>
                <router-link
                  to="/collections"
                  class="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition text-sm"
                  @click="showUserMenu = false"
                >
                  我的收藏
                </router-link>
                <hr class="my-2" />
                <button
                  class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition text-sm"
                  @click="handleLogout"
                >
                  登出
                </button>
              </template>
              <template v-else>
                <router-link
                  to="/login"
                  class="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition text-sm"
                  @click="showUserMenu = false"
                >
                  登录
                </router-link>
                <router-link
                  to="/register"
                  class="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition text-sm"
                  @click="showUserMenu = false"
                >
                  注册
                </router-link>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Search Bar -->
      <div class="sm:hidden pb-4">
        <SearchBar />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import SearchBar from '@/components/SearchBar.vue';

const router = useRouter();
const authStore = useAuthStore();

const showUserMenu = ref(false);

defineEmits<{
  'toggle-sidebar': [];
}>();

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value;
}

async function handleLogout() {
  await authStore.logout();
  showUserMenu.value = false;
  router.push('/');
}
</script>
