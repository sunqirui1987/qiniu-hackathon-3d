<template>
  <div class="w-full">
    <div v-if="showPercentage || label" class="flex justify-between mb-1">
      <span v-if="label" class="text-sm font-medium text-gray-700">{{ label }}</span>
      <span v-if="showPercentage" class="text-sm font-medium text-gray-700">{{ progress }}%</span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2.5">
      <div
        :class="['h-2.5 rounded-full transition-all duration-300', colorClasses]"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  progress: number
  label?: string
  color?: 'blue' | 'green' | 'red' | 'yellow'
  showPercentage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  color: 'blue',
  showPercentage: true,
})

const colorClasses = computed(() => {
  switch (props.color) {
    case 'blue':
      return 'bg-blue-600'
    case 'green':
      return 'bg-green-600'
    case 'red':
      return 'bg-red-600'
    case 'yellow':
      return 'bg-yellow-600'
    default:
      return 'bg-blue-600'
  }
})
</script>
