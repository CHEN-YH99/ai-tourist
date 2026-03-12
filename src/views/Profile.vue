<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-6 sm:mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">个人资料</h1>
        <p class="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">管理您的账号信息和偏好设置</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <Loading />
      </div>

      <!-- Profile Content -->
      <div v-else class="space-y-4 sm:space-y-6">
        <!-- Avatar Section -->
        <Card>
          <template #header>
            <h2 class="text-base sm:text-lg font-semibold text-gray-900">头像</h2>
          </template>

          <div class="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <!-- Avatar Display -->
            <div class="flex-shrink-0">
              <img
                v-if="authStore.user?.avatar"
                :src="authStore.user.avatar"
                alt="用户头像"
                class="w-20 sm:w-24 h-20 sm:h-24 rounded-full object-cover border-2 border-gray-200"
              />
              <div
                v-else
                class="w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold"
              >
                {{ getInitials(authStore.user?.username || '') }}
              </div>
            </div>

            <!-- Upload Section -->
            <div class="flex-1 w-full sm:w-auto">
              <div class="mb-3 sm:mb-4">
                <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  上传新头像
                </label>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  class="hidden"
                  @change="handleAvatarChange"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  class="w-full sm:w-auto text-xs sm:text-sm"
                  @click="fileInput?.click()"
                  :disabled="uploadingAvatar"
                  :loading="uploadingAvatar"
                >
                  选择文件
                </Button>
              </div>
              <p class="text-xs text-gray-500">
                支持 JPEG、PNG、WebP 格式，文件大小不超过 5MB
              </p>
              <p v-if="avatarError" class="text-xs sm:text-sm text-red-600 mt-2">
                {{ avatarError }}
              </p>
            </div>
          </div>
        </Card>

        <!-- Profile Information Section -->
        <Card>
          <template #header>
            <h2 class="text-base sm:text-lg font-semibold text-gray-900">基本信息</h2>
          </template>

          <div v-if="!isEditing" class="space-y-3 sm:space-y-4">
            <!-- Display Mode -->
            <div>
              <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">用户名</label>
              <p class="text-sm sm:text-base text-gray-900">{{ authStore.user?.username }}</p>
            </div>

            <div>
              <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">邮箱</label>
              <p class="text-sm sm:text-base text-gray-900 break-all">{{ authStore.user?.email }}</p>
              <p class="text-xs text-gray-500 mt-1">邮箱地址无法修改</p>
            </div>

            <div>
              <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">联系电话</label>
              <p class="text-sm sm:text-base text-gray-900">{{ authStore.user?.contactInfo?.phone || '未设置' }}</p>
            </div>

            <div>
              <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">微信</label>
              <p class="text-sm sm:text-base text-gray-900">{{ authStore.user?.contactInfo?.wechat || '未设置' }}</p>
            </div>

            <Button variant="secondary" class="text-xs sm:text-sm" @click="startEdit">
              编辑信息
            </Button>
          </div>

          <div v-else class="space-y-3 sm:space-y-4">
            <!-- Edit Mode -->
            <Input
              v-model="editData.username"
              type="text"
              label="用户名"
              :error="errors.username"
              required
            />

            <Input
              v-model="editData.phone"
              type="tel"
              label="联系电话"
              placeholder="可选"
              :error="errors.phone"
            />

            <Input
              v-model="editData.wechat"
              type="text"
              label="微信"
              placeholder="可选"
              :error="errors.wechat"
            />

            <div v-if="errors.submit" class="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-xs sm:text-sm text-red-700">{{ errors.submit }}</p>
            </div>

            <div class="flex gap-2 sm:gap-3">
              <Button
                variant="primary"
                class="text-xs sm:text-sm flex-1 sm:flex-none"
                @click="handleSaveProfile"
                :loading="savingProfile"
                :disabled="savingProfile"
              >
                保存
              </Button>
              <Button
                variant="secondary"
                class="text-xs sm:text-sm flex-1 sm:flex-none"
                @click="cancelEdit"
                :disabled="savingProfile"
              >
                取消
              </Button>
            </div>
          </div>
        </Card>

        <!-- Preferences Section -->
        <Card>
          <template #header>
            <h2 class="text-base sm:text-lg font-semibold text-gray-900">旅行偏好</h2>
          </template>

          <div v-if="!isEditingPreferences" class="space-y-3 sm:space-y-4">
            <!-- Display Mode -->
            <div>
              <p v-if="authStore.user?.preferences && authStore.user.preferences.length > 0" class="text-gray-900">
                <span
                  v-for="pref in authStore.user.preferences"
                  :key="pref"
                  class="inline-block bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm mr-2 mb-2"
                >
                  {{ pref }}
                </span>
              </p>
              <p v-else class="text-sm text-gray-500">未设置偏好</p>
            </div>

            <Button variant="secondary" class="text-xs sm:text-sm" @click="startEditPreferences">
              编辑偏好
            </Button>
          </div>

          <div v-else class="space-y-3 sm:space-y-4">
            <!-- Edit Mode -->
            <div class="space-y-2 sm:space-y-3">
              <label class="block text-xs sm:text-sm font-medium text-gray-700">选择您的旅行偏好</label>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                <label
                  v-for="pref in availablePreferences"
                  :key="pref"
                  class="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    :value="pref"
                    v-model="editData.preferences"
                    class="w-4 h-4 rounded border-gray-300"
                  />
                  <span class="text-xs sm:text-sm text-gray-700">{{ pref }}</span>
                </label>
              </div>
            </div>

            <div class="flex gap-2 sm:gap-3">
              <Button
                variant="primary"
                class="text-xs sm:text-sm flex-1 sm:flex-none"
                @click="handleSavePreferences"
                :loading="savingProfile"
                :disabled="savingProfile"
              >
                保存
              </Button>
              <Button
                variant="secondary"
                class="text-xs sm:text-sm flex-1 sm:flex-none"
                @click="cancelEditPreferences"
                :disabled="savingProfile"
              >
                取消
              </Button>
            </div>
          </div>
        </Card>

        <!-- Account Section -->
        <Card>
          <template #header>
            <h2 class="text-base sm:text-lg font-semibold text-gray-900">账号</h2>
          </template>

          <div class="space-y-3 sm:space-y-4">
            <p class="text-xs sm:text-sm text-gray-600">
              账号创建于 {{ formatDate(authStore.user?.createdAt) }}
            </p>

            <Button
              variant="danger"
              class="text-xs sm:text-sm w-full sm:w-auto"
              @click="handleLogout"
            >
              登出
            </Button>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authAPI } from '@/api/auth'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import Loading from '@/components/ui/Loading.vue'
import type { UpdateProfileDTO, UserProfile } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

const fileInput = ref<HTMLInputElement>()
const loading = ref(false)
const isEditing = ref(false)
const isEditingPreferences = ref(false)
const uploadingAvatar = ref(false)
const savingProfile = ref(false)
const avatarError = ref('')

const availablePreferences = [
  '美食',
  '文化',
  '冒险',
  '海滨',
  '购物',
  '自然',
  '历史',
  '现代'
]

const editData = reactive({
  username: '',
  phone: '',
  wechat: '',
  preferences: [] as string[]
})

const errors = reactive({
  username: '',
  phone: '',
  wechat: '',
  submit: ''
})

// Get user initials for avatar placeholder
function getInitials(username: string): string {
  return username
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Format date
function formatDate(date?: Date): string {
  if (!date) return '未知'
  return new Date(date).toLocaleDateString('zh-CN')
}

// Load profile on mount
onMounted(async () => {
  loading.value = true
  try {
    await authStore.fetchProfile()
  } catch (error) {
    console.error('Failed to load profile:', error)
  } finally {
    loading.value = false
  }
})

// Handle avatar change
async function handleAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  avatarError.value = ''

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    avatarError.value = '文件大小不能超过 5MB'
    return
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    avatarError.value = '只支持 JPEG、PNG、WebP 格式'
    return
  }

  uploadingAvatar.value = true
  try {
    // Upload avatar using authAPI
    const response = await authAPI.uploadAvatar(file)
    authStore.user = response.data.data as UserProfile

    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (error: any) {
    avatarError.value = error.response?.data?.message || '上传头像失败'
  } finally {
    uploadingAvatar.value = false
  }
}

// Start editing profile
function startEdit() {
  isEditing.value = true
  editData.username = authStore.user?.username || ''
  editData.phone = authStore.user?.contactInfo?.phone || ''
  editData.wechat = authStore.user?.contactInfo?.wechat || ''
}

// Cancel edit
function cancelEdit() {
  isEditing.value = false
  errors.username = ''
  errors.phone = ''
  errors.wechat = ''
  errors.submit = ''
}

// Validate profile form
function validateProfileForm(): boolean {
  errors.username = ''
  errors.phone = ''
  errors.wechat = ''
  errors.submit = ''

  if (!editData.username) {
    errors.username = '用户名不能为空'
    return false
  }

  if (editData.username.length < 2 || editData.username.length > 50) {
    errors.username = '用户名长度应为 2-50 个字符'
    return false
  }

  return true
}

// Save profile
async function handleSaveProfile() {
  if (!validateProfileForm()) {
    return
  }

  savingProfile.value = true
  try {
    const updateData: UpdateProfileDTO = {
      username: editData.username,
      contactInfo: {
        phone: editData.phone || undefined,
        wechat: editData.wechat || undefined
      }
    }

    await authStore.updateProfile(updateData)
    isEditing.value = false
  } catch (error: any) {
    errors.submit = error.response?.data?.message || '保存失败，请稍后重试'
  } finally {
    savingProfile.value = false
  }
}

// Start editing preferences
function startEditPreferences() {
  isEditingPreferences.value = true
  editData.preferences = [...(authStore.user?.preferences || [])]
}

// Cancel edit preferences
function cancelEditPreferences() {
  isEditingPreferences.value = false
}

// Save preferences
async function handleSavePreferences() {
  savingProfile.value = true
  try {
    const updateData: UpdateProfileDTO = {
      preferences: editData.preferences
    }

    await authStore.updateProfile(updateData)
    isEditingPreferences.value = false
  } catch (error: any) {
    errors.submit = error.response?.data?.message || '保存失败，请稍后重试'
  } finally {
    savingProfile.value = false
  }
}

// Handle logout
async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>
