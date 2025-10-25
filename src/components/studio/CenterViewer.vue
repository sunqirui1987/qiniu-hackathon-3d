<template>
  <div class="center-panel flex-1 flex flex-col  bg-gray-100 dark:bg-gray-700 ">
    <!-- 3D查看器工具栏 -->
    <div class="viewer-toolbar dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">视图:</span>
            <select 
              v-model="viewMode" 
              class="px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-sm"
              @change="$emit('update:viewMode', viewMode)"
            >
              <option value="perspective">透视</option>
              <option value="orthographic">正交</option>
              <option value="top">顶视图</option>
              <option value="front">前视图</option>
              <option value="side">侧视图</option>
            </select>
          </div>
          
          <div class="flex items-center gap-1">
            <button
              @click="handleResetView"
              class="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              title="重置视图"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            
            <button
              @click="handleToggleWireframe"
              :class="[
                'p-1 rounded transition-colors',
                showWireframe ? 'text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-400/20' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
              ]"
              title="线框模式"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </button>
            
            <button
              @click="handleToggleGrid"
              :class="[
                'p-1 rounded transition-colors',
                showGrid ? 'text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-400/20' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
              ]"
              title="显示网格"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="handleImportModel"
            class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
          >
            导入模型
          </button>
          <button
            @click="handleExportModel"
            :disabled="!currentModel"
            class="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-sm transition-colors"
          >
            导出
          </button>
        </div>
      </div>
    </div>

    <!-- 3D查看器主体 -->
    <div class="viewer-main flex-1 relative">
      <ModularViewer
        v-if="currentModel"
        :model-url="currentModel"
        :auto-load="true"
        :view-mode="viewMode"
        :show-wireframe="showWireframe"
        :show-grid="showGrid"
        @model-loaded="handleModelLoaded"
        @error="handleViewerError"
        class="w-full h-full"
      />
      
      <!-- 空状态 -->
      <div v-else class="flex items-center justify-center h-full">
        <div class="text-center">
          <svg class="w-24 h-24 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 class="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">3D工作室</h3>
          <p class="text-gray-500 dark:text-gray-500 mb-4">选择左侧功能开始创建3D模型</p>
          <button
            @click="handleImportModel"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            或者导入现有模型
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import ModularViewer from '@/components/3d/ModularViewer.vue'

// Props
interface Props {
  currentModel?: string
  modelInfo?: {
    faces: number
    vertices: number
    fileSize: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  currentModel: '',
  modelInfo: () => ({
    faces: 0,
    vertices: 0,
    fileSize: ''
  })
})

// Emits
interface Emits {
  'update:currentModel': [value: string]
  'update:modelInfo': [value: any]
  'update:viewMode': [value: string]
  'update:showWireframe': [value: boolean]
  'update:showGrid': [value: boolean]
  'model-imported': [file: File]
  'model-exported': []
  'model-loaded': [info: any]
  'viewer-error': [error: string]
  'notification': [message: string, type: 'success' | 'error']
}

const emit = defineEmits<Emits>()

// 响应式数据
const viewMode = ref('perspective')
const showWireframe = ref(false)
const showGrid = ref(true)

// 监听props变化
watch(() => props.currentModel, (newValue) => {
  // 当外部传入的currentModel变化时，可以在这里处理
}, { immediate: true })

// 方法
const handleResetView = () => {
  // 重置3D查看器视图
  console.log('Reset view')
  emit('notification', '视图已重置', 'success')
}

const handleToggleWireframe = () => {
  showWireframe.value = !showWireframe.value
  emit('update:showWireframe', showWireframe.value)
}

const handleToggleGrid = () => {
  showGrid.value = !showGrid.value
  emit('update:showGrid', showGrid.value)
}

const handleImportModel = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.glb,.gltf,.obj,.fbx'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      emit('update:currentModel', url)
      emit('model-imported', file)
      emit('notification', '模型导入成功！', 'success')
    }
  }
  input.click()
}

const handleExportModel = () => {
  if (!props.currentModel) return
  emit('model-exported')
  emit('notification', '模型导出中...', 'success')
}

const handleModelLoaded = (info: any) => {
  emit('update:modelInfo', info)
  emit('model-loaded', info)
}

const handleViewerError = (error: string) => {
  emit('viewer-error', error)
  emit('notification', error, 'error')
}
</script>

<style scoped>
.bg-gray-850 {
  background-color: rgb(31, 41, 55);
}
</style>