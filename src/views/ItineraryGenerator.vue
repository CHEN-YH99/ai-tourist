<template>
  <div class="container mx-auto px-4 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Form Column -->
      <div class="lg:col-span-1">
        <ItineraryForm
          :loading="itineraryStore.generating"
          @submit="handleGenerateItinerary"
        />
      </div>

      <!-- Display Column -->
      <div class="lg:col-span-2">
        <!-- Loading State -->
        <div v-if="itineraryStore.generating" class="space-y-4">
          <Card class="bg-blue-50 border border-blue-200">
            <div class="flex items-center gap-3">
              <div class="inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <div>
                <p class="font-semibold text-blue-900">正在生成攻略...</p>
                <p class="text-sm text-blue-700">这可能需要几秒钟，请稍候</p>
              </div>
            </div>
          </Card>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="space-y-4">
          <Card class="bg-red-50 border border-red-200">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <div>
                <p class="font-semibold text-red-900">生成失败</p>
                <p class="text-sm text-red-700 mt-1">{{ error }}</p>
              </div>
            </div>
          </Card>
          <Button
            variant="secondary"
            size="md"
            @click="error = null"
          >
            关闭错误提示
          </Button>
        </div>

        <!-- Display State -->
        <div v-else-if="itineraryStore.currentItinerary">
          <ItineraryDisplay
            :itinerary="itineraryStore.currentItinerary"
            @regenerate="handleRegenerate"
            @saved="handleSaved"
          />
        </div>

        <!-- Empty State -->
        <div v-else class="space-y-4">
          <Card class="bg-gray-50 border-2 border-dashed border-gray-300">
            <div class="text-center py-12">
              <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">还没有生成攻略</h3>
              <p class="text-gray-600">填写左侧表单，点击"生成攻略"按钮开始</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useItineraryStore } from '@/stores/itinerary'
import type { ItineraryParams } from '@/types'
import ItineraryForm from '@/components/ItineraryForm.vue'
import ItineraryDisplay from '@/components/ItineraryDisplay.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'

const itineraryStore = useItineraryStore()
const error = ref<string | null>(null)
const lastParams = ref<ItineraryParams | null>(null)

async function handleGenerateItinerary(params: ItineraryParams) {
  error.value = null
  lastParams.value = params

  try {
    await itineraryStore.generateItinerary(params)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '生成攻略失败，请重试'
    error.value = errorMessage
    console.error('Failed to generate itinerary:', err)
  }
}

async function handleRegenerate() {
  if (lastParams.value) {
    await handleGenerateItinerary(lastParams.value)
  }
}

function handleSaved() {
  // Show success message or update UI
  console.log('Itinerary saved to collection')
}
</script>
