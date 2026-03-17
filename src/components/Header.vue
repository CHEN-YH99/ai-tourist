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
              <Avatar 
                :src="authStore.user?.avatar"
                :username="authStore.user?.username || '游客'"
                size="sm"
              />
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
                  class="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition text-sm"
                  @click="showUserMenu = false"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>个人信息</span>
                </router-link>
                <hr class="my-2 border-gray-200" />
                <button
                  class="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition text-sm"
                  @click="showLogoutConfirm"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>退出</span>
                </button>
              </template>
              <template v-else>
                <router-link
                  to="/login"
                  class="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition text-sm"
                  @click="showUserMenu = false"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>登录</span>
                </router-link>
                <router-link
                  to="/register"
                  class="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition text-sm"
                  @click="showUserMenu = false"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>注册</span>
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

    <!-- Logout Confirmation Dialog -->
    <ConfirmDialog
      v-model="showLogoutDialog"
      title="确认退出"
      message="您确定要退出登录吗？"
      confirm-text="退出"
      cancel-text="取消"
      confirm-variant="danger"
      @confirm="handleLogout"
    />
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import SearchBar from '@/components/SearchBar.vue';
import Avatar from '@/components/ui/Avatar.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';

const router = useRouter();
const authStore = useAuthStore();

const showUserMenu = ref(false);
const showLogoutDialog = ref(false);

defineEmits<{
  'toggle-sidebar': [];
}>();

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value;
}

function showLogoutConfirm() {
  showUserMenu.value = false;
  showLogoutDialog.value = true;
}

async function handleLogout() {
  await authStore.logout();
  showLogoutDialog.value = false;
  router.push('/');
}
</script>
