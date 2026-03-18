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
  const initialized = ref(false);
  const initPromise = ref<Promise<void> | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const userPreferences = computed(() => user.value?.preferences || []);

  // Actions
  async function login(credentials: LoginDTO) {
    loading.value = true;
    try {
      const response = await authAPI.login(credentials);
      console.log('Login response:', response);
      
      // Handle nested data structure from API
      const authData = response.data?.data || response.data;
      console.log('Auth data:', authData);
      
      if (!authData || !authData.token || !authData.user) {
        throw new Error('Invalid response format');
      }
      
      token.value = authData.token;
      user.value = authData.user;
      initialized.value = true; // Mark as initialized after successful login
      localStorage.setItem('token', authData.token);
      
      console.log('Auth store updated:', { 
        token: !!token.value, 
        user: user.value,
        isAuthenticated: isAuthenticated.value 
      });
      
      return authData;
    } finally {
      loading.value = false;
    }
  }

  async function register(data: RegisterDTO) {
    loading.value = true;
    try {
      const response = await authAPI.register(data);
      console.log('Register response:', response);
      
      // Handle nested data structure from API
      const authData = response.data?.data || response.data;
      console.log('Auth data:', authData);
      
      if (!authData || !authData.token || !authData.user) {
        throw new Error('Invalid response format');
      }
      
      token.value = authData.token;
      user.value = authData.user;
      initialized.value = true; // Mark as initialized after successful registration
      localStorage.setItem('token', authData.token);
      
      console.log('Auth store updated:', { 
        token: !!token.value, 
        user: user.value,
        isAuthenticated: isAuthenticated.value 
      });
      
      return authData;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    token.value = null;
    user.value = null;
    initialized.value = false;
    initPromise.value = null;
    localStorage.removeItem('token');
  }

  async function fetchProfile() {
    if (!token.value) return;
    try {
      const response = await authAPI.getProfile();
      console.log('Fetch profile response:', response);
      
      // Handle nested data structure from API
      const profileData = response.data?.data || response.data;
      console.log('Profile data:', profileData);
      
      user.value = profileData as UserProfile;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // If token is invalid, clear it
      token.value = null;
      user.value = null;
      localStorage.removeItem('token');
      throw error;
    }
  }

  // Initialize user data if token exists
  async function initialize() {
    // If already initialized, return immediately
    if (initialized.value) {
      return;
    }
    
    // If initialization is in progress, wait for it
    if (initPromise.value) {
      return initPromise.value;
    }
    
    // Start initialization
    initPromise.value = (async () => {
      console.log('Initializing auth store, token exists:', !!token.value);
      
      if (token.value && !user.value) {
        try {
          await fetchProfile();
          console.log('Profile fetched successfully:', user.value);
        } catch (error) {
          console.error('Failed to initialize auth:', error);
        }
      } else {
        console.log('Skip initialization:', { hasToken: !!token.value, hasUser: !!user.value });
      }
      
      initialized.value = true;
      initPromise.value = null;
    })();
    
    return initPromise.value;
  }

  async function updateProfile(data: Partial<UserProfile>) {
    try {
      const response = await authAPI.updateProfile(data);
      
      // Handle nested data structure from API
      const profileData = response.data?.data || response.data;
      user.value = profileData as UserProfile;
      
      return profileData;
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
    updateProfile,
    initialize
  };
});
