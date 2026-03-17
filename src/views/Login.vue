<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
    <Card class="w-full max-w-md">
      <template #header>
        <h1 class="text-2xl font-bold text-gray-900">登录</h1>
        <p class="text-sm text-gray-600 mt-1">
          <span v-if="welcomeUsername">欢迎，{{ welcomeUsername }}！请登录您的账号</span>
          <span v-else>欢迎回来，请登录您的账号</span>
        </p>
        <div v-if="isFromRegister" class="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-sm text-green-700">✓ 注册成功！请登录</p>
        </div>
      </template>

      <form @submit.prevent="handleLogin" class="space-y-4">
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
          required
        />

        <!-- Slider Captcha -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">安全验证</label>
          <SliderCaptcha 
            @verified="handleCaptchaVerified"
            @failed="handleCaptchaFailed"
          />
          <p v-if="errors.captcha" class="text-sm text-red-600">{{ errors.captcha }}</p>
        </div>

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
          :disabled="authStore.loading || !captchaVerified"
        >
          登录
        </Button>
      </form>

      <template #footer>
        <div class="text-center space-y-2">
          <p class="text-sm text-gray-600">
            还没有账号？
            <RouterLink to="/register" class="text-blue-600 hover:text-blue-700 font-medium">
              立即注册
            </RouterLink>
          </p>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import SliderCaptcha from '@/components/ui/SliderCaptcha.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const formData = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: '',
  captcha: '',
  submit: ''
})

const captchaVerified = ref(false)
const welcomeUsername = ref('')
const isFromRegister = ref(false)

onMounted(() => {
  // Pre-fill email if coming from registration
  if (route.query.email) {
    formData.email = route.query.email as string
  }
  
  // Show welcome message if coming from registration
  if (route.query.username) {
    welcomeUsername.value = route.query.username as string
  }
  
  if (route.query.registered === 'true') {
    isFromRegister.value = true
  }
})

// Validate form
function validateForm(): boolean {
  errors.email = ''
  errors.password = ''
  errors.submit = ''

  if (!formData.email) {
    errors.email = '邮箱不能为空'
    return false
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.email)) {
    errors.email = '邮箱格式不正确'
    return false
  }

  if (!formData.password) {
    errors.password = '密码不能为空'
    return false
  }
  if (formData.password.length < 8) {
    errors.password = '密码长度至少为8个字符'
    return false
  }

  if (!captchaVerified.value) {
    errors.captcha = '请完成安全验证'
    return false
  }

  return true
}

function handleCaptchaVerified() {
  captchaVerified.value = true
  errors.captcha = ''
}

function handleCaptchaFailed() {
  captchaVerified.value = false
}

// Handle login
async function handleLogin() {
  if (!validateForm()) {
    return
  }

  try {
    await authStore.login({
      email: formData.email,
      password: formData.password
    })

    // Redirect to the page user was trying to access or home
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch (error: any) {
    errors.submit = error.message || '登录失败，请检查邮箱和密码'
    captchaVerified.value = false
  }
}
</script>
