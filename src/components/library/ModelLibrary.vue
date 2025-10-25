<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold">
          Model Library
        </h2>
        <p class="text-gray-600 text-sm mt-1">
          {{ filteredModels.length }} model{{ filteredModels.length !== 1 ? 's' : '' }}
        </p>
      </div>
      
      <div class="flex gap-3 items-center">
        <select
          v-model="sortBy"
          class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="date-desc">
            Newest First
          </option>
          <option value="date-asc">
            Oldest First
          </option>
          <option value="name-asc">
            Name (A-Z)
          </option>
          <option value="name-desc">
            Name (Z-A)
          </option>
          <option value="size-desc">
            Largest First
          </option>
          <option value="size-asc">
            Smallest First
          </option>
        </select>
        
        <Button
          v-if="selectedModels.length > 0"
          variant="danger"
          @click="handleBulkDelete"
        >
          Delete Selected ({{ selectedModels.length }})
        </Button>
      </div>
    </div>
    
    <div
      v-if="models.length === 0"
      class="text-center py-16"
    >
      <div class="text-gray-400 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-24 w-24 mx-auto"
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
      <h3 class="text-xl font-semibold text-gray-600 mb-2">
        No Models Yet
      </h3>
      <p class="text-gray-500">
        Start by generating or uploading your first 3D model
      </p>
    </div>
    
    <div
      v-else
      class="space-y-4"
    >
      <div
        v-if="enableSelection"
        class="flex items-center gap-2 text-sm text-gray-600"
      >
        <input
          id="select-all"
          v-model="selectAll"
          type="checkbox"
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          @change="handleSelectAll"
        />
        <label
          for="select-all"
          class="cursor-pointer"
        >
          Select All
        </label>
      </div>
      
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <div
          v-for="model in filteredModels"
          :key="model.id"
          class="relative"
        >
          <input
            v-if="enableSelection"
            v-model="selectedModels"
            type="checkbox"
            :value="model.id"
            class="absolute top-4 left-4 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded z-10"
          />
          
          <ModelCard
            :model="model"
            @view="handleView"
            @print="handlePrint"
            @delete="handleDelete"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { type ModelFile } from '@/types/model'
import ModelCard from './ModelCard.vue'
import Button from '@/components/ui/Button.vue'

interface Props {
  models: ModelFile[]
  enableSelection?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  enableSelection: true,
})

const emit = defineEmits<{
  view: [model: ModelFile]
  print: [model: ModelFile]
  delete: [model: ModelFile]
  bulkDelete: [modelIds: string[]]
}>()

const sortBy = ref<string>('date-desc')
const selectedModels = ref<string[]>([])
const selectAll = ref(false)

const filteredModels = computed(() => {
  const sorted = [...props.models]
  
  switch (sortBy.value) {
    case 'date-desc':
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
    case 'date-asc':
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      break
    case 'name-asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'name-desc':
      sorted.sort((a, b) => b.name.localeCompare(a.name))
      break
    case 'size-desc':
      sorted.sort((a, b) => (b.size || 0) - (a.size || 0))
      break
    case 'size-asc':
      sorted.sort((a, b) => (a.size || 0) - (b.size || 0))
      break
  }
  
  return sorted
})

watch(
  () => props.models.length,
  () => {
    selectedModels.value = []
    selectAll.value = false
  }
)

const handleSelectAll = () => {
  if (selectAll.value) {
    selectedModels.value = filteredModels.value.map(m => m.id)
  } else {
    selectedModels.value = []
  }
}

const handleView = (model: ModelFile) => {
  emit('view', model)
}

const handlePrint = (model: ModelFile) => {
  emit('print', model)
}

const handleDelete = (model: ModelFile) => {
  emit('delete', model)
}

const handleBulkDelete = () => {
  if (selectedModels.value.length > 0) {
    emit('bulkDelete', selectedModels.value)
    selectedModels.value = []
    selectAll.value = false
  }
}
</script>
