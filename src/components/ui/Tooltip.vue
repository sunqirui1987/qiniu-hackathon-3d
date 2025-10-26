<template>
  <div class="relative inline-block" @mouseenter="showTooltip" @mouseleave="hideTooltip">
    <slot />
    <Transition
      enter-active-class="transition-opacity duration-150"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        :class="[
          'absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg whitespace-nowrap pointer-events-none',
          positionClasses
        ]"
        role="tooltip"
      >
        {{ text }}
        <div :class="arrowClasses"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  text: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top',
  delay: 200
})

const visible = ref(false)
let timeoutId: number | null = null

const positionClasses = computed(() => {
  switch (props.position) {
    case 'top':
      return 'bottom-full left-1/2 transform -translate-x-1/2 mb-1'
    case 'bottom':
      return 'top-full left-1/2 transform -translate-x-1/2 mt-1'
    case 'left':
      return 'right-full top-1/2 transform -translate-y-1/2 mr-1'
    case 'right':
      return 'left-full top-1/2 transform -translate-y-1/2 ml-1'
    default:
      return 'bottom-full left-1/2 transform -translate-x-1/2 mb-1'
  }
})

const arrowClasses = computed(() => {
  const baseClasses = 'absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45'
  
  switch (props.position) {
    case 'top':
      return `${baseClasses} top-full left-1/2 -translate-x-1/2 -mt-1`
    case 'bottom':
      return `${baseClasses} bottom-full left-1/2 -translate-x-1/2 -mb-1`
    case 'left':
      return `${baseClasses} left-full top-1/2 -translate-y-1/2 -ml-1`
    case 'right':
      return `${baseClasses} right-full top-1/2 -translate-y-1/2 -mr-1`
    default:
      return `${baseClasses} top-full left-1/2 -translate-x-1/2 -mt-1`
  }
})

const showTooltip = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  
  timeoutId = setTimeout(() => {
    visible.value = true
  }, props.delay)
}

const hideTooltip = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  visible.value = false
}
</script>