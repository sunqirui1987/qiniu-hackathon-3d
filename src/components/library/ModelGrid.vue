<template>
  <div class="model-grid-container flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
    <!-- 操作工具栏 -->
    <div v-if="selectedIds.length > 0" class="sticky top-0 z-10 bg-blue-50 dark:bg-blue-900 border-b border-blue-200 dark:border-blue-800 p-4">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-blue-900 dark:text-blue-100">
          已选择 {{ selectedIds.length }} 个模型
        </span>
        <div class="flex gap-2">
          <button
            class="px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            @click="$emit('selectAll')"
          >
            全选
          </button>
          <button
            class="px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            @click="$emit('clearSelection')"
          >
            取消选择
          </button>
          <button
            class="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            @click="$emit('batchPrint')"
          >
            批量打印
          </button>
          <button
            class="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            @click="$emit('batchDelete')"
          >
            批量删除
          </button>
        </div>
      </div>
    </div>

    <!-- 模型网格 -->
    <div class="p-6">
      <div v-if="models.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ModelCard
          v-for="model in models"
          :key="model.id"
          :model="model"
          :show-checkbox="selectionMode"
          :is-selected="selectedIds.includes(model.id)"
          @select="$emit('selectModel', $event)"
          @view="$emit('viewModel', $event)"
          @print="$emit('printModel', $event)"
          @toggle-selection="$emit('toggleSelection', $event)"
        />
      </div>

      <!-- 空状态 -->
      <div v-else class="flex flex-col items-center justify-center py-16">
        <svg
          class="w-20 h-20 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <p class="text-gray-500 dark:text-gray-400 text-lg mb-2">没有找到匹配的模型</p>
        <p class="text-gray-400 dark:text-gray-500 text-sm">
          {{ emptyMessage || '尝试调整搜索条件或筛选器' }}
        </p>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      <span class="ml-3 text-gray-600 dark:text-gray-300">加载中...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import ModelCard from './ModelCard.vue'

interface ModelMetadata {
  vertices: number
  faces: number
  materials: number
}

interface Model {
  id: string
  name: string
  description: string
  category: string
  thumbnail?: string
  fileSize: string
  metadata?: ModelMetadata
}

defineProps<{
  models: Model[]
  selectedIds: string[]
  selectionMode: boolean
  loading?: boolean
  emptyMessage?: string
}>()

defineEmits<{
  selectModel: [model: Model]
  viewModel: [model: Model]
  printModel: [model: Model]
  toggleSelection: [id: string]
  selectAll: []
  clearSelection: []
  batchPrint: []
  batchDelete: []
}>()
</script>
