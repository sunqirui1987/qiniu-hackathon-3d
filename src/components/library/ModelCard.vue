<template>
  <div
    class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
  >
    <div
      class="relative h-48 bg-gray-100 flex items-center justify-center"
      @click="handleView"
    >
      <img
        v-if="model.thumbnail"
        :src="model.thumbnail"
        :alt="model.name"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="flex items-center justify-center w-full h-full text-gray-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-16 w-16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      </div>
      
      <div
        class="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded"
      >
        {{ model.format.toUpperCase() }}
      </div>
    </div>
    
    <div class="p-4">
      <h3
        class="text-lg font-semibold mb-1 truncate"
        :title="model.name"
      >
        {{ model.name }}
      </h3>
      
      <div class="text-sm text-gray-500 mb-3 space-y-1">
        <div v-if="model.size">
          Size: {{ formatFileSize(model.size) }}
        </div>
        <div v-if="model.metadata">
          <span v-if="model.metadata.faces">
            Faces: {{ formatNumber(model.metadata.faces) }}
          </span>
        </div>
        <div class="text-xs">
          {{ formatDate(model.createdAt) }}
        </div>
      </div>
      
      <div
        v-if="model.tags && model.tags.length > 0"
        class="mb-3 flex flex-wrap gap-1"
      >
        <span
          v-for="tag in model.tags.slice(0, 3)"
          :key="tag"
          class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
        >
          {{ tag }}
        </span>
      </div>
      
      <div class="flex gap-2">
        <Button
          variant="primary"
          class="flex-1 text-sm py-1"
          @click="handleView"
        >
          View
        </Button>
        <Button
          variant="secondary"
          class="flex-1 text-sm py-1"
          @click="handlePrint"
        >
          Print
        </Button>
        <Button
          variant="danger"
          class="text-sm py-1 px-3"
          @click="handleDelete"
        >
          Delete
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type ModelFile } from '@/types/model'
import Button from '@/components/ui/Button.vue'

interface Props {
  model: ModelFile
}

const props = defineProps<Props>()

const emit = defineEmits<{
  view: [model: ModelFile]
  print: [model: ModelFile]
  delete: [model: ModelFile]
}>()

const handleView = () => {
  emit('view', props.model)
}

const handlePrint = (e: Event) => {
  e.stopPropagation()
  emit('print', props.model)
}

const handleDelete = (e: Event) => {
  e.stopPropagation()
  emit('delete', props.model)
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num)
}

const formatDate = (date: Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}
</script>
