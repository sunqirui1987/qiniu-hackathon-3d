<template>
  <div class="w-full">
    <div class="flex justify-between mb-1">
      <span class="text-sm font-medium text-gray-700">{{ label }}</span>
      <span class="text-sm font-medium text-gray-700">{{ progress }}%</span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2.5">
      <div
        class="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  progress: number
  label?: string
}

withDefaults(defineProps<Props>(), {
  label: '进度',
})
</script>
