<template>
  <div class="modular-viewer relative w-full h-full bg-gray-900 overflow-hidden">
    <!-- 3D视图区域 -->
    <div class="viewer-container relative w-full h-full">
      <!-- Babylon 3D 查看器 -->
      <Babylon3DViewer
        ref="babylonViewer"
        :model-url="modelUrl"
        :show-grid="displayOptions.grid"
        :show-axes="displayOptions.axes"
        :wireframe="displayOptions.wireframe"
        @model-loaded="handleModelLoaded"
        @error="handleError"
        class="w-full h-full"
      />

      <!-- 加载状态 -->
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10"
      >
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p class="text-white text-lg">加载模型中...</p>
          <p class="text-gray-400 text-sm mt-2">{{ loadingProgress }}%</p>
        </div>
      </div>

      <!-- 错误状态 -->
      <div
        v-if="error"
        class="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center z-10"
      >
        <div class="text-center max-w-md">
          <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 class="text-xl font-semibold text-white mb-2">加载失败</h3>
          <p class="text-gray-400 mb-4">{{ error }}</p>
          <button
            @click="retryLoad"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            重试
          </button>
        </div>
      </div>

      <!-- 顶部工具栏 -->
      <ViewerToolbar
        v-if="!isLoading && !error"
        :display-options="displayOptions"
        :current-view="currentView"
        @view-change="handleViewChange"
        @tool-change="handleToolChange"
        @display-toggle="handleDisplayToggle"
        @action="handleToolbarAction"
        class="absolute top-4 left-4 z-20"
      />

      <!-- 右侧控制面板 -->
      <Transition name="slide-left">
        <ViewerControlPanel
          v-if="showControlPanel && !isLoading && !error"
          :model-info="modelInfo"
          @close="showControlPanel = false"
          @transform-change="handleTransformChange"
          @material-change="handleMaterialChange"
          @lighting-change="handleLightingChange"
          class="absolute top-4 right-4 z-20"
        />
      </Transition>

      <!-- 底部状态栏 -->
      <div
        v-if="!isLoading && !error"
        class="absolute bottom-4 left-4 right-4 z-20"
      >
        <div class="bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-lg px-4 py-2">
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center space-x-4 text-gray-300">
              <span>视图: {{ viewModeText }}</span>
              <span>工具: {{ currentToolText }}</span>
              <span v-if="modelInfo.vertices">顶点: {{ modelInfo.vertices.toLocaleString() }}</span>
              <span v-if="modelInfo.faces">面: {{ modelInfo.faces.toLocaleString() }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="showControlPanel = !showControlPanel"
                :class="[
                  'p-2 rounded-lg transition-colors',
                  showControlPanel 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                ]"
                title="控制面板"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </button>
              <button
                @click="handleFullscreen"
                class="p-2 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white rounded-lg transition-colors"
                title="全屏"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 快捷键提示 -->
      <div
        v-if="showShortcuts"
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
      >
        <div class="bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 max-w-md">
          <h3 class="text-lg font-semibold text-white mb-4">快捷键</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-400">旋转视图</span>
              <span class="text-white">鼠标左键拖拽</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">平移视图</span>
              <span class="text-white">鼠标中键拖拽</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">缩放</span>
              <span class="text-white">鼠标滚轮</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">重置视图</span>
              <span class="text-white">R</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">适应屏幕</span>
              <span class="text-white">F</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">切换网格</span>
              <span class="text-white">G</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">切换线框</span>
              <span class="text-white">W</span>
            </div>
          </div>
          <button
            @click="showShortcuts = false"
            class="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import Babylon3DViewer from './Babylon3DViewer.vue'
import ViewerToolbar from './ViewerToolbar.vue'
import ViewerControlPanel from './ViewerControlPanel.vue'

// Props
interface Props {
  modelUrl?: string
  autoLoad?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelUrl: '',
  autoLoad: true
})

// Emits
const emit = defineEmits<{
  modelLoaded: [modelInfo: any]
  error: [error: string]
  viewChange: [view: string]
  toolChange: [tool: string]
}>()

// Refs
const babylonViewer = ref()

// State
const isLoading = ref(false)
const loadingProgress = ref(0)
const error = ref('')
const showControlPanel = ref(false)
const showShortcuts = ref(false)
const currentView = ref('perspective')
const currentTool = ref('rotate')

const displayOptions = reactive({
  wireframe: false,
  grid: true,
  axes: true
})

const modelInfo = reactive({
  vertices: 0,
  faces: 0,
  fileSize: 0,
  name: ''
})

// Computed
const viewModeText = computed(() => {
  const viewModes: Record<string, string> = {
    perspective: '透视',
    top: '顶视图',
    front: '前视图',
    side: '侧视图'
  }
  return viewModes[currentView.value] || '透视'
})

const currentToolText = computed(() => {
  const tools: Record<string, string> = {
    rotate: '旋转',
    pan: '平移',
    zoom: '缩放',
    select: '选择'
  }
  return tools[currentTool.value] || '旋转'
})

// Methods
const handleModelLoaded = (info: any) => {
  isLoading.value = false
  error.value = ''
  Object.assign(modelInfo, info)
  emit('modelLoaded', info)
}

const handleError = (errorMessage: string) => {
  isLoading.value = false
  error.value = errorMessage
  emit('error', errorMessage)
}

const retryLoad = () => {
  error.value = ''
  isLoading.value = true
  // 重新加载模型
  if (babylonViewer.value && props.modelUrl) {
    babylonViewer.value.loadModel(props.modelUrl)
  }
}

const handleViewChange = (view: string) => {
  currentView.value = view
  emit('viewChange', view)
  // 调用 Babylon 查看器的视图切换方法
  if (babylonViewer.value) {
    babylonViewer.value.setView(view)
  }
}

const handleToolChange = (tool: string) => {
  currentTool.value = tool
  emit('toolChange', tool)
  // 调用 Babylon 查看器的工具切换方法
  if (babylonViewer.value) {
    babylonViewer.value.setTool(tool)
  }
}

const handleDisplayToggle = (option: string, value: boolean) => {
  displayOptions[option as keyof typeof displayOptions] = value
  // 调用 Babylon 查看器的显示选项切换方法
  if (babylonViewer.value) {
    babylonViewer.value.setDisplayOption(option, value)
  }
}

const handleToolbarAction = (action: string) => {
  switch (action) {
    case 'reset':
      if (babylonViewer.value) {
        babylonViewer.value.resetView()
      }
      break
    case 'fit':
      if (babylonViewer.value) {
        babylonViewer.value.fitToScreen()
      }
      break
    case 'screenshot':
      if (babylonViewer.value) {
        babylonViewer.value.takeScreenshot()
      }
      break
    case 'shortcuts':
      showShortcuts.value = true
      break
  }
}

const handleTransformChange = (transform: any) => {
  if (babylonViewer.value) {
    babylonViewer.value.updateTransform(transform)
  }
}

const handleMaterialChange = (material: any) => {
  if (babylonViewer.value) {
    babylonViewer.value.updateMaterial(material)
  }
}

const handleLightingChange = (lighting: any) => {
  if (babylonViewer.value) {
    babylonViewer.value.updateLighting(lighting)
  }
}

const handleFullscreen = () => {
  const element = document.querySelector('.modular-viewer')
  if (element) {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      element.requestFullscreen()
    }
  }
}

// 键盘快捷键
const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key.toLowerCase()) {
    case 'r':
      if (babylonViewer.value) {
        babylonViewer.value.resetView()
      }
      break
    case 'f':
      if (babylonViewer.value) {
        babylonViewer.value.fitToScreen()
      }
      break
    case 'g':
      displayOptions.grid = !displayOptions.grid
      handleDisplayToggle('grid', displayOptions.grid)
      break
    case 'w':
      displayOptions.wireframe = !displayOptions.wireframe
      handleDisplayToggle('wireframe', displayOptions.wireframe)
      break
    case 'escape':
      showShortcuts.value = false
      showControlPanel.value = false
      break
    case '?':
      showShortcuts.value = !showShortcuts.value
      break
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  
  if (props.autoLoad && props.modelUrl) {
    isLoading.value = true
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// 暴露方法给父组件
defineExpose({
  loadModel: (url: string) => {
    isLoading.value = true
    error.value = ''
    if (babylonViewer.value) {
      babylonViewer.value.loadModel(url)
    }
  },
  resetView: () => {
    if (babylonViewer.value) {
      babylonViewer.value.resetView()
    }
  },
  takeScreenshot: () => {
    if (babylonViewer.value) {
      return babylonViewer.value.takeScreenshot()
    }
  }
})
</script>

<style scoped>
.modular-viewer {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 过渡动画 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* 全屏样式 */
.modular-viewer:fullscreen {
  background: #111827;
}

.modular-viewer:fullscreen .viewer-container {
  border-radius: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modular-viewer .absolute.top-4.right-4 {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    right: auto;
    max-width: calc(100vw - 2rem);
  }
  
  .modular-viewer .absolute.bottom-4 {
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
  }
}
</style>