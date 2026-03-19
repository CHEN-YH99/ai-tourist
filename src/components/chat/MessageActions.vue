<template>
  <div class="action-buttons">
    <Button
      variant="primary"
      size="sm"
      @click="$emit('generate-route-map')"
      :loading="loadingRouteMap"
      class="generate-btn route-map-btn"
    >
      <span class="btn-icon">🗺️</span>
      {{ loadingRouteMap ? '生成中...' : '一键生成路线图' }}
    </Button>
    <Button
      variant="primary"
      size="sm"
      @click="$emit('generate-itinerary')"
      :loading="loadingItinerary"
      class="generate-btn itinerary-btn"
    >
      <span class="btn-icon">📋</span>
      {{ loadingItinerary ? '生成中...' : '一键生成攻略' }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import Button from '@/components/ui/Button.vue'

interface Props {
  loadingRouteMap?: boolean
  loadingItinerary?: boolean
}

withDefaults(defineProps<Props>(), {
  loadingRouteMap: false,
  loadingItinerary: false
})

defineEmits<{
  'generate-route-map': []
  'generate-itinerary': []
}>()
</script>

<style scoped>
.action-buttons {
  padding: 0.5rem 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.generate-btn {
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  flex: 1;
  min-width: 140px;
  justify-content: center;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.itinerary-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.itinerary-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-icon {
  font-size: 1rem;
}

@media (max-width: 768px) {
  .generate-btn {
    font-size: 0.75rem;
    min-width: 120px;
  }

  .btn-icon {
    font-size: 0.875rem;
  }

  .action-buttons {
    padding: 0.5rem 0.5rem;
  }
}
</style>
