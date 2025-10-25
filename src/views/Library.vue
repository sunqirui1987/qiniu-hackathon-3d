<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">
        模型库
      </h1>
      <p class="text-gray-600">
        管理和浏览您的3D模型文件
      </p>
    </div>

    <div class="mb-6 flex gap-4">
      <div class="flex-1">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search models by name..."
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <select
        v-model="filterCategory"
        class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">
          All Categories
        </option>
        <option
          v-for="category in availableCategories"
          :key="category"
          :value="category"
        >
          {{ category }}
        </option>
      </select>
      
      <select
        v-model="filterTag"
        class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">
          All Tags
        </option>
        <option
          v-for="tag in availableTags"
          :key="tag"
          :value="tag"
        >
          {{ tag }}
        </option>
      </select>
    </div>

    <ModelLibrary
      :models="filteredModels"
      @view="handleViewModel"
      @print="handlePrintModel"
      @delete="handleDeleteModel"
      @bulk-delete="handleBulkDelete"
    />

    <Modal
      v-model="showDeleteConfirm"
    >
      <template #title>
        <h3 class="text-xl font-semibold">
          Confirm Delete
        </h3>
      </template>
      <p class="mb-4">
        Are you sure you want to delete {{ deleteTarget === 'single' ? 'this model' : `${deleteModelIds.length} models` }}?
        This action cannot be undone.
      </p>
      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            variant="secondary"
            @click="showDeleteConfirm = false"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            @click="confirmDelete"
          >
            Delete
          </Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { type ModelFile } from '@/types/model'
import ModelLibrary from '@/components/library/ModelLibrary.vue'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'

const router = useRouter()

const searchQuery = ref('')
const filterCategory = ref('')
const filterTag = ref('')
const showDeleteConfirm = ref(false)
const deleteTarget = ref<'single' | 'bulk'>('single')
const deleteModelIds = ref<string[]>([])

const mockModels = ref<ModelFile[]>([
  {
    id: '1',
    name: 'Sample Cube',
    path: '/models/cube.glb',
    format: 'glb',
    size: 1024 * 512,
    createdAt: new Date('2025-10-20'),
    updatedAt: new Date('2025-10-20'),
    thumbnail: '',
    tags: ['basic', 'geometry'],
    category: 'Shapes',
    metadata: {
      faces: 12,
      vertices: 8
    }
  },
  {
    id: '2',
    name: 'Character Model',
    path: '/models/character.glb',
    format: 'glb',
    size: 1024 * 1024 * 5,
    createdAt: new Date('2025-10-22'),
    updatedAt: new Date('2025-10-22'),
    thumbnail: '',
    tags: ['character', 'game'],
    category: 'Characters',
    metadata: {
      faces: 5000,
      vertices: 3000
    }
  },
  {
    id: '3',
    name: 'Building Architecture',
    path: '/models/building.stl',
    format: 'stl',
    size: 1024 * 1024 * 2.5,
    createdAt: new Date('2025-10-24'),
    updatedAt: new Date('2025-10-24'),
    thumbnail: '',
    tags: ['architecture', 'building'],
    category: 'Architecture',
    metadata: {
      faces: 8000,
      vertices: 4500
    }
  }
])

const availableCategories = computed(() => {
  const categories = new Set(mockModels.value.map(m => m.category).filter(Boolean))
  return Array.from(categories) as string[]
})

const availableTags = computed(() => {
  const tags = new Set(mockModels.value.flatMap(m => m.tags))
  return Array.from(tags)
})

const filteredModels = computed(() => {
  let result = mockModels.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(m => m.name.toLowerCase().includes(query))
  }

  if (filterCategory.value) {
    result = result.filter(m => m.category === filterCategory.value)
  }

  if (filterTag.value) {
    result = result.filter(m => m.tags.includes(filterTag.value))
  }

  return result
})

const handleViewModel = (model: ModelFile) => {
  router.push({
    name: 'viewer',
    query: { modelId: model.id }
  })
}

const handlePrintModel = (model: ModelFile) => {
  router.push({
    name: 'print',
    query: { modelId: model.id }
  })
}

const handleDeleteModel = (model: ModelFile) => {
  deleteTarget.value = 'single'
  deleteModelIds.value = [model.id]
  showDeleteConfirm.value = true
}

const handleBulkDelete = (modelIds: string[]) => {
  deleteTarget.value = 'bulk'
  deleteModelIds.value = modelIds
  showDeleteConfirm.value = true
}

const confirmDelete = () => {
  deleteModelIds.value.forEach(id => {
    const index = mockModels.value.findIndex(m => m.id === id)
    if (index !== -1) {
      mockModels.value.splice(index, 1)
    }
  })
  
  showDeleteConfirm.value = false
  deleteModelIds.value = []
}
</script>
