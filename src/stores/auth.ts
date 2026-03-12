import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserProfile } from '@/types';
import { authAPI } from '@/api/auth';

interface LoginDTO {
  email: string;
  password: string;
}

interface RegisterDTO {
  email: string;
  password: string;
  username: string;
}

interface AuthResponse {
  token: string;
  user: UserProfile;
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<UserProfile | null>(null);
  const loading = ref(false);

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const userPreferences = computed(() => user.value?.preferences || []);

  // Actions
  async function login(credentials: LoginDTO) {
    loading.value = true;
    try {
      const response = await authAPI.login(credentials);
      const data = response.data as AuthResponse;
      token.value = data.token;
      user.value = data.user;
      localStorage.setItem('token', data.token);
      return data;
    } finally {
      loading.value = false;
    }
  }

  async function register(data: RegisterDTO) {
    loading.value = true;
    try {
      const response = await authAPI.register(data);
      const authData = response.data as AuthResponse;
      token.value = authData.token;
      user.value = authData.user;
      localStorage.setItem('token', authData.token);
      return authData;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
  }

  async function fetchProfile() {
    if (!token.value) return;
    try {
      const response = await authAPI.getProfile();
      user.value = response.data as UserProfile;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw error;
    }
  }

  async function updateProfile(data: Partial<UserProfile>) {
    try {
      const response = await authAPI.updateProfile(data);
      user.value = response.data as UserProfile;
      return response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    userPreferences,
    login,
    register,
    logout,
    fetchProfile,
    updateProfile
  };
});
