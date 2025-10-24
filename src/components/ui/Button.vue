<template>
  <button
    :class="[
      'rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
      variantClasses,
      sizeClasses,
      (disabled || loading) && 'opacity-50 cursor-not-allowed',
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="mr-2">⏳</span>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  disabled: false,
  size: 'md',
  loading: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
    case 'secondary':
      return 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500'
    case 'danger':
      return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    default:
      return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1.5 text-sm'
    case 'md':
      return 'px-4 py-2 text-base'
    case 'lg':
      return 'px-6 py-3 text-lg'
    default:
      return 'px-4 py-2 text-base'
  }
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>
