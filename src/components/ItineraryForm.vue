<template>
  <Card class="w-full">
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-900">生成旅行攻略</h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Destination Input -->
        <div>
          <label for="destination" class="block text-sm font-medium text-gray-700 mb-2">
            目的地 <span class="text-red-500">*</span>
          </label>
          <Input
            id="destination"
            v-model="formData.destination"
            type="text"
            placeholder="例如：巴黎、东京、纽约"
            :error="errors.destination"
            @blur="validateField('destination')"
          />
          <p v-if="errors.destination" class="mt-1 text-sm text-red-500">{{ errors.destination }}</p>
        </div>

        <!-- Days Input -->
        <div>
          <label for="days" class="block text-sm font-medium text-gray-700 mb-2">
            旅行天数 <span class="text-red-500">*</span>
          </label>
          <input
            id="days"
            v-model.number="formData.days"
            type="number"
            min="1"
            max="30"
            placeholder="1-30天"
            :class="[
              'w-full px-4 py-2 rounded-lg border transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              errors.days ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            ]"
            @blur="validateField('days')"
          />
          <p v-if="errors.days" class="mt-1 text-sm text-red-500">{{ errors.days }}</p>
        </div>

        <!-- Budget Input -->
        <div>
          <label for="budget" class="block text-sm font-medium text-gray-700 mb-2">
            预算（CNY） <span class="text-red-500">*</span>
          </label>
          <input
            id="budget"
            v-model.number="formData.budget"
            type="number"
            min="0"
            placeholder="例如：5000"
            :class="[
              'w-full px-4 py-2 rounded-lg border transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              errors.budget ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            ]"
            @blur="validateField('budget')"
          />
          <p v-if="errors.budget" class="mt-1 text-sm text-red-500">{{ errors.budget }}</p>
        </div>

        <!-- Preferences Multi-select -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            旅行偏好 <span class="text-gray-500 text-xs">(可选)</span>
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label
              v-for="pref in availablePreferences"
              :key="pref"
              class="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                :value="pref"
                v-model="formData.preferences"
                class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700">{{ pref }}</span>
            </label>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="pt-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            :loading="isLoading"
            class="w-full"
          >
            {{ isLoading ? '生成中...' : '生成攻略' }}
          </Button>
        </div>
      </form>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { ItineraryParams } from '@/types'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

interface Props {
  loading?: boolean
}

interface FormData {
  destination: string
  days: number
  budget: number
  preferences: string[]
}

interface FormErrors {
  destination?: string
  days?: string
  budget?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  submit: [data: ItineraryParams]
}>()

const availablePreferences = [
  '美食',
  '文化',
  '冒险',
  '购物',
  '自然',
  '历史',
  '现代',
  '海滨'
]

const formData = reactive<FormData>({
  destination: '',
  days: 3,
  budget: 5000,
  preferences: []
})

const errors = reactive<FormErrors>({})
const isLoading = ref(false)

function validateField(field: keyof FormData) {
  errors[field as keyof FormErrors] = undefined

  if (field === 'destination') {
    if (!formData.destination.trim()) {
      errors.destination = '请输入目的地'
    } else if (formData.destination.trim().length < 2) {
      errors.destination = '目的地至少需要2个字符'
    }
  }

  if (field === 'days') {
    if (!formData.days) {
      errors.days = '请输入旅行天数'
    } else if (formData.days < 1 || formData.days > 30) {
      errors.days = '旅行天数必须在1-30天之间'
    } else if (!Number.isInteger(formData.days)) {
      errors.days = '旅行天数必须是整数'
    }
  }

  if (field === 'budget') {
    if (formData.budget === undefined || formData.budget === null) {
      errors.budget = '请输入预算'
    } else if (formData.budget < 0) {
      errors.budget = '预算不能为负数'
    }
  }
}

function validateForm(): boolean {
  Object.keys(formData).forEach(field => {
    validateField(field as keyof FormData)
  })
  return Object.keys(errors).length === 0
}

async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  try {
    const params: ItineraryParams = {
      destination: formData.destination.trim(),
      days: formData.days,
      budget: formData.budget,
      preferences: formData.preferences.length > 0 ? formData.preferences : undefined
    }
    emit('submit', params)
  } finally {
    isLoading.value = false
  }
}
</script>
