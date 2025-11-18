<template>
  <div
    class="model-card bg-white dark:bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
    @click="$emit('select', model)"
  >
    <!-- 模型预览图 -->
    <div class="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative overflow-hidden">
      <img
        v-if="model.thumbnail"
        :src="model.thumbnail"
        :alt="model.name"
        class="w-full h-full object-cover"
      >
      <svg
        v-else
        class="w-16 h-16 text-gray-400"
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

      <!-- 选择复选框 -->
      <div
        v-if="showCheckbox"
        class="absolute top-2 left-2 z-10"
        @click.stop
      >
        <input
          type="checkbox"
          :checked="isSelected"
          class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          @change="$emit('toggleSelection', model.id)"
        >
      </div>

      <!-- 快捷操作按钮 -->
      <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div class="flex gap-2">
          <button
            class="p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
            title="查看"
            @click.stop="$emit('view', model)"
          >
            <svg class="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            class="p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
            title="打印"
            @click.stop="$emit('print', model)"
          >
            <svg class="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 模型信息 -->
    <div class="p-4">
      <h3 class="font-medium text-gray-900 dark:text-gray-100 mb-1 truncate">{{ model.name }}</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{{ model.description }}</p>

      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          {{ getCategoryName(model.category) }}
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {{ model.fileSize }}
        </span>
      </div>

      <!-- 元数据 -->
      <div v-if="model.metadata" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div class="text-center">
            <div class="font-medium">{{ formatNumber(model.metadata.vertices) }}</div>
            <div class="text-gray-500 dark:text-gray-500">顶点</div>
          </div>
          <div class="text-center">
            <div class="font-medium">{{ formatNumber(model.metadata.faces) }}</div>
            <div class="text-gray-500 dark:text-gray-500">面</div>
          </div>
          <div class="text-center">
            <div class="font-medium">{{ model.metadata.materials }}</div>
            <div class="text-gray-500 dark:text-gray-500">材质</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
  model: Model
  showCheckbox?: boolean
  isSelected?: boolean
}>()

defineEmits<{
  select: [model: Model]
  view: [model: Model]
  print: [model: Model]
  toggleSelection: [id: string]
}>()

const getCategoryName = (category: string): string => {
  const categoryNames: Record<string, string> = {
    character: '角色',
    object: '物品',
    building: '建筑',
    vehicle: '载具'
  }
  return categoryNames[category] || category
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}
</script>

<style scoped>
.model-card {
  @apply group;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
