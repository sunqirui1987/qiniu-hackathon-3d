<template>
  <div class="bg-white rounded-lg shadow-md p-4 space-y-4">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">
      导出模型
    </h3>

    <div
      v-if="!hasModel"
      class="text-center py-8 text-gray-400"
    >
      <svg
        class="w-12 h-12 mx-auto mb-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <p class="text-sm">
        请先加载模型
      </p>
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700">文件名</label>
        <input
          v-model="fileName"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="model"
        >
      </div>

      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700">导出格式</label>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="format in formats"
            :key="format.value"
            class="p-3 border-2 rounded-lg transition-all"
            :class="selectedFormat === format.value 
              ? 'border-blue-500 bg-blue-50 text-blue-700' 
              : 'border-gray-200 hover:border-gray-300 text-gray-700'"
            @click="selectedFormat = format.value"
          >
            <div class="font-semibold text-sm">
              {{ format.label }}
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {{ format.description }}
            </div>
          </button>
        </div>
      </div>

      <div class="pt-3 border-t border-gray-200">
        <button
          :disabled="isExporting"
          class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
          @click="handleExport"
        >
          <svg
            v-if="!isExporting"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <div
            v-else
            class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"
          />
          {{ isExporting ? '导出中...' : '导出模型' }}
        </button>
      </div>

      <div
        v-if="exportError"
        class="p-3 bg-red-50 border border-red-200 rounded-lg"
      >
        <p class="text-sm text-red-700">
          {{ exportError }}
        </p>
      </div>

      <div
        v-if="exportSuccess"
        class="p-3 bg-green-50 border border-green-200 rounded-lg"
      >
        <p class="text-sm text-green-700">
          模型已成功导出!
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  hasModel: boolean
}

defineProps<Props>()

interface Emits {
  (e: 'export', format: string, fileName: string): void
}

const emit = defineEmits<Emits>()

const fileName = ref('model')
const selectedFormat = ref('stl')
const isExporting = ref(false)
const exportError = ref<string | null>(null)
const exportSuccess = ref(false)

const formats = [
  {
    value: 'stl',
    label: 'STL',
    description: '用于3D打印'
  },
  {
    value: 'glb',
    label: 'GLB',
    description: '通用3D格式'
  },
  {
    value: 'obj',
    label: 'OBJ',
    description: '传统3D格式'
  },
  {
    value: 'gltf',
    label: 'GLTF',
    description: 'Web 3D格式'
  }
]

const handleExport = async () => {
  if (!fileName.value.trim()) {
    exportError.value = '请输入文件名'
    return
  }

  isExporting.value = true
  exportError.value = null
  exportSuccess.value = false

  try {
    emit('export', selectedFormat.value, fileName.value.trim())
    exportSuccess.value = true
    
    setTimeout(() => {
      exportSuccess.value = false
    }, 3000)
  } catch (error) {
    exportError.value = error instanceof Error ? error.message : '导出失败'
  } finally {
    isExporting.value = false
  }
}
</script>
