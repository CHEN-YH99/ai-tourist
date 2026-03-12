<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
    <Card class="w-full max-w-md">
      <template #header>
        <h1 class="text-2xl font-bold text-gray-900">注册</h1>
        <p class="text-sm text-gray-600 mt-1">创建新账号，开始您的旅程</p>
      </template>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <!-- Username Input -->
        <Input
          v-model="formData.username"
          type="text"
          label="用户名"
          placeholder="请输入用户名"
          :error="errors.username"
          hint="2-50个字符"
          required
        />

        <!-- Email Input -->
        <Input
          v-model="formData.email"
          type="email"
          label="邮箱"
          placeholder="请输入邮箱地址"
          :error="errors.email"
          required
        />

        <!-- Password Input -->
        <Input
          v-model="formData.password"
          type="password"
          label="密码"
          placeholder="请输入密码"
          :error="errors.password"
          hint="至少8个字符，包含字母和数字"
          required
        />

        <!-- Confirm Password Input -->
        <Input
          v-model="formData.confirmPassword"
          type="password"
          label="确认密码"
          placeholder="请再次输入密码"
          :error="errors.confirmPassword"
          required
        />

        <!-- Error Message -->
        <div v-if="errors.submit" class="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-700">{{ errors.submit }}</p>
        </div>

        <!-- Submit Button -->
        <Button
          type="submit"
          variant="primary"
          size="lg"
          class="w-full"
          :loading="authStore.loading"
          :disabled="authStore.loading"
        >
          注册
        </Button>
      </form>

      <template #footer>
        <div class="text-center space-y-2">
          <p class="text-sm text-gray-600">
            已有账号？
            <RouterLink to="/login" class="text-blue-600 hover:text-blue-700 font-medium">
              立即登录
            </RouterLink>
          </p>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const authStore = useAuthStore()

const formData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  submit: ''
})

// Validate password strength
function isPasswordStrong(password: string): boolean {
  // At least 8 characters, contains letters and numbers
  const hasLetters = /[a-zA-Z]/.test(password)
  const hasNumbers = /\d/.test(password)
  return password.length >= 8 && hasLetters && hasNumbers
}

// Validate form
function validateForm(): boolean {
  errors.username = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  errors.submit = ''

  // Username validation
  if (!formData.username) {
    errors.username = '用户名不能为空'
    return false
  }
  if (formData.username.length < 2 || formData.username.length > 50) {
    errors.username = '用户名长度应为2-50个字符'
    return false
  }

  // Email validation
  if (!formData.email) {
    errors.email = '邮箱不能为空'
    return false
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.email)) {
    errors.email = '邮箱格式不正确'
    return false
  }

  // Password validation
  if (!formData.password) {
    errors.password = '密码不能为空'
    return false
  }
  if (!isPasswordStrong(formData.password)) {
    errors.password = '密码至少8个字符，必须包含字母和数字'
    return false
  }

  // Confirm password validation
  if (!formData.confirmPassword) {
    errors.confirmPassword = '请确认密码'
    return false
  }
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致'
    return false
  }

  return true
}

// Handle register
async function handleRegister() {
  if (!validateForm()) {
    return
  }

  try {
    await authStore.register({
      username: formData.username,
      email: formData.email,
      password: formData.password
    })

    // Redirect to home after successful registration
    router.push('/')
  } catch (error: any) {
    errors.submit = error.response?.data?.message || '注册失败，请稍后重试'
  }
}
</script>
