<template>
  <div v-if="itinerary" class="space-y-6">
    <!-- Header -->
    <Card class="bg-gradient-to-r from-blue-50 to-indigo-50">
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ itinerary.destination }}</h2>
          <div class="flex flex-wrap gap-4 text-sm text-gray-600">
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 2a1 1 0 000 2h8a1 1 0 100-2H6zM4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" />
              </svg>
              {{ itinerary.days }}天行程
            </span>
            <span class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.16 5.314l4.897-4.896a1 1 0 111.414 1.414L9.574 6.728A1 1 0 018.16 5.314zM2 10a8 8 0 1116 0 8 8 0 01-16 0zm9-3a1 1 0 11-2 0 1 1 0 012 0zM6.3 6.3a1 1 0 10-1.4 1.4A6 6 0 1016 10a1 1 0 11-2 0 4 4 0 10-7.7-3.7z" />
              </svg>
              预算: ¥{{ itinerary.budget.toLocaleString() }}
            </span>
          </div>
          <div v-if="itinerary.preferences.length > 0" class="mt-3 flex flex-wrap gap-2">
            <span
              v-for="pref in itinerary.preferences"
              :key="pref"
              class="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
            >
              {{ pref }}
            </span>
          </div>
        </div>
        <div class="text-right">
          <Button
            variant="primary"
            size="md"
            :loading="savingCollection"
            @click="handleSaveCollection"
          >
            {{ isCollected ? '已收藏' : '收藏' }}
          </Button>
        </div>
      </div>
    </Card>

    <!-- Budget Summary -->
    <Card>
      <h3 class="text-lg font-semibold text-gray-900 mb-4">预算分配</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-blue-50 rounded-lg p-4">
          <p class="text-sm text-gray-600 mb-1">总预算</p>
          <p class="text-2xl font-bold text-blue-600">¥{{ itinerary.budget.toLocaleString() }}</p>
        </div>
        <div class="bg-green-50 rounded-lg p-4">
          <p class="text-sm text-gray-600 mb-1">平均每天</p>
          <p class="text-2xl font-bold text-green-600">¥{{ (itinerary.budget / itinerary.days).toLocaleString('zh-CN', { maximumFractionDigits: 0 }) }}</p>
        </div>
        <div class="bg-purple-50 rounded-lg p-4">
          <p class="text-sm text-gray-600 mb-1">已分配</p>
          <p class="text-2xl font-bold text-purple-600">¥{{ totalAllocated.toLocaleString() }}</p>
        </div>
      </div>
    </Card>

    <!-- Daily Plans -->
    <div class="space-y-4">
      <div
        v-for="dayPlan in itinerary.content"
        :key="dayPlan.day"
        class="space-y-3"
      >
        <!-- Day Header -->
        <Card class="bg-gradient-to-r from-indigo-50 to-blue-50">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900">第{{ dayPlan.day }}天</h3>
            <span class="text-sm font-medium text-gray-600">预算: ¥{{ dayPlan.dailyBudget.toLocaleString() }}</span>
          </div>
        </Card>

        <!-- Activities -->
        <Card>
          <h4 class="font-semibold text-gray-900 mb-4">活动安排</h4>
          <div class="space-y-4">
            <div
              v-for="(activity, idx) in dayPlan.activities"
              :key="idx"
              class="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0"
            >
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100">
                  <span class="text-sm font-semibold text-blue-600">{{ activity.time }}</span>
                </div>
              </div>
              <div class="flex-grow">
                <h5 class="font-semibold text-gray-900">{{ activity.name }}</h5>
                <p class="text-sm text-gray-600 mt-1">{{ activity.description }}</p>
                <div class="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                  <span class="flex items-center gap-1">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                    </svg>
                    {{ activity.location }}
                  </span>
                  <span class="flex items-center gap-1">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd" />
                    </svg>
                    {{ activity.duration }}
                  </span>
                  <span class="flex items-center gap-1">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.16 5.314l4.897-4.896a1 1 0 111.414 1.414L9.574 6.728A1 1 0 018.16 5.314zM2 10a8 8 0 1116 0 8 8 0 01-16 0zm9-3a1 1 0 11-2 0 1 1 0 012 0zM6.3 6.3a1 1 0 10-1.4 1.4A6 6 0 1016 10a1 1 0 11-2 0 4 4 0 10-7.7-3.7z" />
                    </svg>
                    ¥{{ activity.cost.toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <!-- Meals -->
        <Card>
          <h4 class="font-semibold text-gray-900 mb-4">餐饮建议</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              v-for="(meal, idx) in dayPlan.meals"
              :key="idx"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <h5 class="font-semibold text-gray-900">
                  {{ mealTypeLabel(meal.type) }}
                </h5>
                <span class="text-sm font-medium text-gray-600">¥{{ meal.estimatedCost.toLocaleString() }}</span>
              </div>
              <p class="text-sm text-gray-600">{{ meal.restaurant }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ meal.cuisine }}菜系</p>
            </div>
          </div>
        </Card>

        <!-- Accommodation -->
        <Card v-if="dayPlan.accommodation">
          <h4 class="font-semibold text-gray-900 mb-2">住宿</h4>
          <p class="text-gray-700">{{ dayPlan.accommodation }}</p>
        </Card>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3 sticky bottom-4">
      <Button
        variant="primary"
        size="lg"
        class="flex-1"
        @click="handleDownload"
      >
        下载攻略
      </Button>
      <Button
        variant="secondary"
        size="lg"
        class="flex-1"
        @click="$emit('regenerate')"
      >
        重新生成
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Itinerary } from '@/types'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import { collectionAPI } from '@/api/collection'

interface Props {
  itinerary: Itinerary | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  regenerate: []
  saved: []
}>()

const isCollected = ref(false)
const savingCollection = ref(false)

const totalAllocated = computed(() => {
  if (!props.itinerary) return 0
  return props.itinerary.content.reduce((sum, day) => sum + day.dailyBudget, 0)
})

function mealTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐'
  }
  return labels[type] || type
}

async function handleSaveCollection() {
  if (!props.itinerary) return

  savingCollection.value = true
  try {
    if (isCollected.value) {
      // Remove from collection
      // Note: In a real app, you'd need to track the collection ID
      // For now, we'll just toggle the UI state
      isCollected.value = false
    } else {
      // Add to collection
      await collectionAPI.add(props.itinerary._id, 'itinerary')
      isCollected.value = true
      emit('saved')
    }
  } catch (error) {
    console.error('Failed to save collection:', error)
  } finally {
    savingCollection.value = false
  }
}

function handleDownload() {
  if (!props.itinerary) return

  // Create a simple text representation of the itinerary
  let content = `${props.itinerary.destination} - ${props.itinerary.days}天旅行攻略\n`
  content += `预算: ¥${props.itinerary.budget.toLocaleString()}\n`
  content += `生成时间: ${new Date(props.itinerary.generatedAt).toLocaleString('zh-CN')}\n\n`

  props.itinerary.content.forEach(day => {
    content += `\n第${day.day}天 (预算: ¥${day.dailyBudget})\n`
    content += '='.repeat(40) + '\n'

    content += '\n活动:\n'
    day.activities.forEach(activity => {
      content += `  ${activity.time} - ${activity.name}\n`
      content += `    ${activity.description}\n`
      content += `    地点: ${activity.location} | 时长: ${activity.duration} | 费用: ¥${activity.cost}\n`
    })

    content += '\n餐饮:\n'
    day.meals.forEach(meal => {
      content += `  ${mealTypeLabel(meal.type)}: ${meal.restaurant} (${meal.cuisine}菜系) - ¥${meal.estimatedCost}\n`
    })

    if (day.accommodation) {
      content += `\n住宿: ${day.accommodation}\n`
    }
  })

  // Create and download the file
  const element = document.createElement('a')
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content))
  element.setAttribute('download', `${props.itinerary.destination}-攻略.txt`)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}
</script>
