<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
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
        <div v-if="itineraryStore.generating" class="space-y-3 sm:space-y-4">
          <Card class="bg-blue-50 border border-blue-200">
            <div class="flex items-center gap-3">
              <div class="inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <div class="min-w-0">
                <p class="font-semibold text-blue-900 text-sm sm:text-base">正在生成攻略...</p>
                <p class="text-xs sm:text-sm text-blue-700">这可能需要几秒钟，请稍候</p>
              </div>
            </div>
          </Card>
          <SkeletonLoader type="itinerary" :count="3" />
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="space-y-3 sm:space-y-4">
          <Card class="bg-red-50 border border-red-200">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <div class="min-w-0">
                <p class="font-semibold text-red-900 text-sm sm:text-base">生成失败</p>
                <p class="text-xs sm:text-sm text-red-700 mt-1 break-words">{{ error }}</p>
              </div>
            </div>
          </Card>
          <Button
            variant="secondary"
            size="md"
            class="text-sm"
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
        <div v-else class="space-y-3 sm:space-y-4">
          <Card class="bg-gray-50 border-2 border-dashed border-gray-300">
            <div class="text-center py-8 sm:py-12">
              <svg class="w-12 sm:w-16 h-12 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">还没有生成攻略</h3>
              <p class="text-xs sm:text-base text-gray-600">填写左侧表单，点击"生成攻略"按钮开始</p>
            </div>
          </Card>
        </div>
      </div>

      <!-- History Sidebar -->
      <div class="lg:col-span-1">
        <Card class="sticky top-20">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">生成历史</h3>
              <button
                v-if="itineraryStore.generationHistory.length > 0"
                @click="handleClearHistory"
                class="text-xs text-red-600 hover:text-red-700 transition"
                title="清空历史"
              >
                清空
              </button>
            </div>

            <!-- History List -->
            <div v-if="itineraryStore.generationHistory.length > 0" class="space-y-2 max-h-[600px] overflow-y-auto">
              <div
                v-for="item in itineraryStore.generationHistory"
                :key="item.id"
                class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer group relative"
                @click="loadFromHistory(item)"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-gray-900 text-sm truncate">
                      {{ item.params.destination }}
                    </div>
                    <div class="text-xs text-gray-600 mt-1">
                      {{ item.params.days }}天 · ¥{{ item.params.budget }}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      {{ formatTime(item.timestamp) }}
                    </div>
                  </div>
                  <button
                    @click.stop="deleteHistory(item.id)"
                    class="opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-700"
                    title="删除"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div v-if="item.params.preferences && item.params.preferences.length > 0" class="flex flex-wrap gap-1 mt-2">
                  <span
                    v-for="pref in item.params.preferences.slice(0, 3)"
                    :key="pref"
                    class="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded"
                  >
                    {{ pref }}
                  </span>
                  <span v-if="item.params.preferences.length > 3" class="text-xs text-gray-500">
                    +{{ item.params.preferences.length - 3 }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-8">
              <svg class="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-gray-500">暂无生成记录</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useItineraryStore } from '@/stores/itinerary'
import type { ItineraryParams } from '@/types'
import ItineraryForm from '@/components/ItineraryForm.vue'
import ItineraryDisplay from '@/components/ItineraryDisplay.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

const itineraryStore = useItineraryStore()
const error = ref<string | null>(null)
const lastParams = ref<ItineraryParams | null>(null)

// 清理函数：离开页面时清除聊天数据
onUnmounted(() => {
  // 不清除chatContent，这样用户可以返回查看
  // itineraryStore.clearChatData()
})

async function handleGenerateItinerary(params: ItineraryParams) {
  console.log('handleGenerateItinerary called with params:', params)
  error.value = null
  lastParams.value = params

  try {
    console.log('Calling itineraryStore.generateItinerary...')
    await itineraryStore.generateItinerary(params)
    console.log('Itinerary generated successfully')
  } catch (err) {
    console.error('Failed to generate itinerary:', err)
    const errorMessage = err instanceof Error ? err.message : '生成攻略失败，请重试'
    error.value = errorMessage
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

function loadFromHistory(item: any) {
  // Load the parameters from history and trigger generation
  handleGenerateItinerary(item.params)
}

function deleteHistory(id: string) {
  if (confirm('确定要删除这条历史记录吗？')) {
    itineraryStore.deleteHistoryItem(id)
  }
}

function handleClearHistory() {
  if (confirm('确定要清空所有历史记录吗？')) {
    itineraryStore.clearHistory()
  }
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
</script>
