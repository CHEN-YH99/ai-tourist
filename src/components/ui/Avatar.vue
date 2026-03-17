<template>
  <div 
    class="avatar"
    :class="sizeClass"
    :style="{ backgroundColor: avatarColor }"
    :title="username"
  >
    <img 
      v-if="src" 
      :src="src" 
      :alt="username"
      class="avatar-image"
      @error="handleImageError"
    />
    <span v-else class="avatar-text">{{ initial }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { generateAvatarColor, getInitials } from '@/utils/avatar'

interface Props {
  src?: string
  username: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const imageError = ref(false)

// Get first letter of username
const initial = computed(() => getInitials(props.username))

// Generate random color based on username
const avatarColor = computed(() => {
  if (props.src && !imageError.value) return 'transparent'
  return generateAvatarColor(props.username)
})

const sizeClass = computed(() => {
  const sizes = {
    sm: 'avatar-sm',
    md: 'avatar-md',
    lg: 'avatar-lg',
    xl: 'avatar-xl'
  }
  return sizes[props.size]
})

function handleImageError() {
  imageError.value = true
}
</script>

<style scoped>
.avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  user-select: none;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-text {
  color: white;
  font-weight: 600;
  text-transform: uppercase;
}

.avatar-sm {
  width: 32px;
  height: 32px;
}

.avatar-sm .avatar-text {
  font-size: 14px;
}

.avatar-md {
  width: 40px;
  height: 40px;
}

.avatar-md .avatar-text {
  font-size: 16px;
}

.avatar-lg {
  width: 64px;
  height: 64px;
}

.avatar-lg .avatar-text {
  font-size: 24px;
}

.avatar-xl {
  width: 96px;
  height: 96px;
}

.avatar-xl .avatar-text {
  font-size: 36px;
}
</style>
