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
            <Tooltip text="重置视图" position="right" :delay="100">
              <button
                @click="handleResetView"
                class="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </Tooltip>
            
            <Tooltip text="线框模式" position="right" :delay="100">
              <button
                @click="handleToggleWireframe"
                :class="[
                  'p-1 rounded transition-colors',
                  showWireframe ? 'text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-400/20' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                ]"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </button>
            </Tooltip>
            
            <Tooltip text="显示网格" position="right" :delay="100">
              <button
                @click="handleToggleGrid"
                :class="[
                  'p-1 rounded transition-colors',
                  showGrid ? 'text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-400/20' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                ]"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </button>
            </Tooltip>
            
            <Tooltip text="显示坐标轴" position="right" :delay="100">
              <button
                @click="handleToggleAxes"
                :class="[
                  'p-1 rounded transition-colors',
                  showAxes ? 'text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-400/20' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                ]"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21l3-3-3-3m8 0l3 3-3 3M12 3v18m9-9H3" />
                </svg>
              </button>
            </Tooltip>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="handleConnectPrinter"
            :disabled="!selectedItem?.url"
            class="px-3 py-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded text-sm transition-colors"
          >
            连接打印机
          </button>
        </div>
      </div>
    </div>

    <!-- 3D查看器主体 -->
    <div class="viewer-main flex-1 relative">
      <!-- 加载状态 -->
      <div v-if="isLoadingModel" class="flex items-center justify-center h-full">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400">正在处理模型URL...</p>
        </div>
      </div>
      
      <ModularViewer
        v-else-if="modelUrl"
        :model-url="modelUrl"
        :auto-load="true"
        :view-mode="viewMode"
        :show-wireframe="showWireframe"
        :show-grid="showGrid"
        :show-axes="showAxes"
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
        </div>
      </div>
    </div>

    <!-- 打印模态框 -->
    <PrintModal
      :is-visible="showPrintModal"
      :model-info="{
        name: selectedItem?.name || '未知模型',
        url: modelUrl || selectedItem?.url,
        faces: modelInfo?.faces,
        vertices: modelInfo?.vertices,
        fileSize: modelInfo?.fileSize
      }"
      @close="showPrintModal = false"
      @print-success="handlePrintSuccess"
      @print-error="handlePrintError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import ModularViewer from '@/components/3d/ModularViewer.vue'
import PrintModal from '@/components/modals/PrintModal.vue'
import Tooltip from '@/components/ui/Tooltip.vue'
import { meshyClient } from '@/utils/meshyClient'
import type { SelectedItem } from '@/types/model'

// Props
interface Props {
  modelInfo?: {
    faces: number
    vertices: number
    fileSize: string
  }
  selectedItem?: SelectedItem
}

const props = withDefaults(defineProps<Props>(), {
  modelInfo: () => ({
    faces: 0,
    vertices: 0,
    fileSize: ''
  }),
  selectedItem: null
})

// Emits
interface Emits {
  'update:selectedItem': [value: SelectedItem]
  'update:modelInfo': [value: any]
  'update:viewMode': [value: string]
  'update:showWireframe': [value: boolean]
  'update:showGrid': [value: boolean]
  'update:showAxes': [value: boolean]
  'model-loaded': [info: any]
  'viewer-error': [error: string]
  'notification': [message: string, type: 'success' | 'error']
}

const emit = defineEmits<Emits>()

// 响应式数据
const viewMode = ref('perspective')
const showWireframe = ref(false)
const showGrid = ref(true)
const showAxes = ref(true)
const processedModelUrl = ref('')
const isLoadingModel = ref(false)
const showPrintModal = ref(false)

// 计算属性：处理模型URL
const modelUrl = computed(() => {
  if (!props.selectedItem) return ''
  
  // 获取模型URL，优先从 model_urls 中选择，然后回退到 url
  let sourceUrl = ''
  
  if (props.selectedItem.model_urls) {
    // 优先选择 GLB 格式，然后是其他格式
    sourceUrl = props.selectedItem.model_urls.glb || 
                props.selectedItem.model_urls.fbx || 
                props.selectedItem.model_urls.obj || 
                props.selectedItem.model_urls.usdz || ''
  } else if (props.selectedItem.url) {
    // 兼容旧的导入模型格式
    sourceUrl = props.selectedItem.url
  }
  
  if (!sourceUrl) return ''
  
  // 如果已经是代理URL或本地URL，直接返回
  if (sourceUrl.startsWith('http://localhost') || 
      sourceUrl.startsWith('blob:') ||
      sourceUrl.includes('/api/proxy/')) {
    return sourceUrl
  }
  
  // 返回处理后的URL
  return processedModelUrl.value || sourceUrl
})

// 监听props变化并处理模型URL
watch(() => props.selectedItem, async (newValue) => {
  console.log('Selected item changed:', newValue)
  
  if (newValue) {
    // 获取源URL
    let sourceUrl = ''
    
    if (newValue.model_urls) {
      // 优先选择 GLB 格式，然后是其他格式
      sourceUrl = newValue.model_urls.glb || 
                  newValue.model_urls.fbx || 
                  newValue.model_urls.obj || 
                  newValue.model_urls.usdz || ''
    } else if (newValue.url) {
      // 兼容旧的导入模型格式
      sourceUrl = newValue.url
    }
    
    if (sourceUrl) {
      // 检查是否需要代理处理
      if (!sourceUrl.startsWith('http://localhost') && 
          !sourceUrl.startsWith('blob:') &&
          !sourceUrl.includes('/api/proxy/')) {
        
        isLoadingModel.value = true
        try {
          // 获取代理后的模型URL
          const proxiedUrl = await meshyClient.getProxiedAssetUrl(sourceUrl)
          processedModelUrl.value = proxiedUrl
          console.log('Model URL processed:', proxiedUrl)
        } catch (error) {
          console.error('Failed to get proxied URL:', error)
          emit('notification', '模型URL处理失败', 'error')
          processedModelUrl.value = sourceUrl // 回退到原始URL
        } finally {
          isLoadingModel.value = false
        }
      } else {
        processedModelUrl.value = sourceUrl
      }
    } else {
      processedModelUrl.value = ''
    }
  } else {
    processedModelUrl.value = ''
  }
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

const handleToggleAxes = () => {
  showAxes.value = !showAxes.value
  emit('update:showAxes', showAxes.value)
}

const handleConnectPrinter = () => {
  if (!props.selectedItem) {
    emit('notification', '请先选择一个模型', 'error')
    return
  }
  
  // 检查是否有可用的模型URL
  const hasValidUrl = modelUrl.value || props.selectedItem.url
  if (!hasValidUrl) {
    emit('notification', '模型文件URL不可用，无法发送到打印机', 'error')
    return
  }
  
  console.log('Opening print modal with model:', {
    name: props.selectedItem.name,
    url: modelUrl.value,
    selectedItem: props.selectedItem
  })
  
  showPrintModal.value = true
}

const handlePrintSuccess = (message: string) => {
  emit('notification', message, 'success')
}

const handlePrintError = (error: string) => {
  emit('notification', error, 'error')
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