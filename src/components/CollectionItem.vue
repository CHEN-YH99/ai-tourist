<template>
  <Card
    class="flex items-center justify-between p-4 hover:bg-gray-50 transition"
  >
    <div class="flex-1 cursor-pointer" @click="handleViewDetails">
      <!-- Item Type Badge -->
      <div class="flex items-center gap-2 mb-2">
        <span
          :class="[
            'inline-block px-2 py-1 text-xs font-medium rounded',
            itemType === 'itinerary'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-purple-100 text-purple-700'
          ]"
        >
          {{ itemType === 'itinerary' ? '攻略' : '对话' }}
        </span>
      </div>

      <!-- Item Title/Content -->
      <h3 class="text-lg font-semibold text-gray-900 mb-1">
        {{ itemTitle }}
      </h3>

      <!-- Item Preview -->
      <p class="text-sm text-gray-600 mb-2 line-clamp-2">
        {{ itemPreview }}
      </p>

      <!-- Collection Timestamp -->
      <p class="text-xs text-gray-500">
        收藏于 {{ formatDate(collection.createdAt) }}
      </p>
    </div>

    <!-- Remove Button -->
    <Button
      variant="danger"
      size="sm"
      class="ml-4 flex-shrink-0"
      @click.stop="handleRemove"
      :loading="removing"
    >
      移除
    </Button>
  </Card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Collection, Itinerary, Conversation } from '@/types'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'

interface Props {
  collection: Collection
  item: Itinerary | Conversation
}

const props = defineProps<Props>()

const emit = defineEmits<{
  remove: [collectionId: string]
  viewDetails: [item: Itinerary | Conversation]
}>()

const removing = ref(false)

const itemType = computed(() => props.collection.itemType)

const itemTitle = computed(() => {
  if (itemType.value === 'itinerary') {
    const itinerary = props.item as Itinerary
    return `${itinerary.destination} - ${itinerary.days}天行程`
  } else {
    const conversation = props.item as Conversation
    return conversation.title || '对话记录'
  }
})

const itemPreview = computed(() => {
  if (itemType.value === 'itinerary') {
    const itinerary = props.item as Itinerary
    return `预算: ¥${itinerary.budget.toLocaleString()} | 偏好: ${itinerary.preferences.join(', ') || '无'}`
  } else {
    const conversation = props.item as Conversation
    const lastMessage = conversation.messages[conversation.messages.length - 1]
    return lastMessage?.content || '无消息'
  }
})

function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function handleRemove() {
  removing.value = true
  try {
    emit('remove', props.collection._id)
  } finally {
    removing.value = false
  }
}

function handleViewDetails() {
  emit('viewDetails', props.item)
}
</script>
