<template>
  <Card
    hoverable
    class="p-4 cursor-pointer transition-transform hover:scale-102"
    @click="handleClick"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <!-- Type Badge -->
        <div class="flex items-center gap-2 mb-2">
          <span
            :class="[
              'inline-block px-2 py-1 text-xs font-medium rounded',
              type === 'itinerary'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-purple-100 text-purple-700'
            ]"
          >
            {{ typeLabel }}
          </span>
        </div>

        <!-- Title -->
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          {{ itemTitle }}
        </h3>

        <!-- Preview -->
        <p class="text-sm text-gray-600 mb-2 line-clamp-2">
          {{ itemPreview }}
        </p>

        <!-- Meta Info -->
        <p class="text-xs text-gray-500">
          {{ itemMeta }}
        </p>
      </div>

      <!-- Arrow Icon -->
      <div class="ml-4 text-gray-400">
        →
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Itinerary, Conversation } from '@/types'
import Card from '@/components/ui/Card.vue'

interface Props {
  type: 'itinerary' | 'conversation'
  item: Itinerary | Conversation
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [item: Itinerary | Conversation]
}>()

const typeLabel = computed(() => {
  return props.type === 'itinerary' ? '攻略' : '对话'
})

const itemTitle = computed(() => {
  if (props.type === 'itinerary') {
    const itinerary = props.item as Itinerary
    return `${itinerary.destination} - ${itinerary.days}天行程`
  } else {
    const conversation = props.item as Conversation
    return conversation.title || '对话记录'
  }
})

const itemPreview = computed(() => {
  if (props.type === 'itinerary') {
    const itinerary = props.item as Itinerary
    return `预算: ¥${itinerary.budget.toLocaleString()} | 偏好: ${itinerary.preferences.join(', ') || '无'}`
  } else {
    const conversation = props.item as Conversation
    const lastMessage = conversation.messages[conversation.messages.length - 1]
    return lastMessage?.content || '无消息'
  }
})

const itemMeta = computed(() => {
  if (props.type === 'itinerary') {
    const itinerary = props.item as Itinerary
    return `创建于 ${new Date(itinerary.createdAt).toLocaleDateString('zh-CN')}`
  } else {
    const conversation = props.item as Conversation
    return `${conversation.messages.length} 条消息 · 创建于 ${new Date(conversation.createdAt).toLocaleDateString('zh-CN')}`
  }
})

function handleClick() {
  emit('click', props.item)
}
</script>
