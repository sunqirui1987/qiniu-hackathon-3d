<template>
  <div :class="['modular-viewer relative w-full h-full overflow-hidden', viewerBackgroundClass]">
    <!-- 3D视图区域 -->
    <div class="viewer-container relative w-full h-full">
      <!-- Babylon 3D 查看器 -->
      <Babylon3DViewer
        ref="babylonViewer"
        :model-url="modelUrl"
        :show-wireframe="displayOptions.wireframe"
        :show-grid="displayOptions.grid"
        :show-axes="displayOptions.axes"
        :current-view="currentView"
        :active-tool="currentTool"
        @model-loaded="handleModelLoaded"
        @error="handleError"
        @view-change="handleViewChange"
        @tool-change="handleToolChange"
        @wireframe-toggle="(value) => handleDisplayToggle('wireframe', value)"
        @grid-toggle="(value) => handleDisplayToggle('grid', value)"
        @axes-toggle="(value) => handleDisplayToggle('axes', value)"
        @reset-view="() => handleToolbarAction('reset')"
        @fit-to-screen="() => handleToolbarAction('fit')"
        @screenshot="() => handleToolbarAction('screenshot')"
        class="w-full h-full"
      />

      <!-- 加载状态 -->
      <div
        v-if="isLoading"
        :class="['absolute inset-0 backdrop-blur-sm flex items-center justify-center z-10', isDarkMode ? 'bg-gray-900/80' : 'bg-gray-100/80']"
      >
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p :class="['text-lg', isDarkMode ? 'text-white' : 'text-gray-900']">加载模型中...</p>
          <p :class="['text-sm mt-2', isDarkMode ? 'text-gray-400' : 'text-gray-600']">{{ loadingProgress }}%</p>
        </div>
      </div>

      <!-- 错误状态 -->
      <div
        v-if="error"
        :class="['absolute inset-0 backdrop-blur-sm flex items-center justify-center z-10', isDarkMode ? 'bg-gray-900/90' : 'bg-gray-100/90']"
      >
        <div class="text-center max-w-md">
          <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 :class="['text-xl font-semibold mb-2', isDarkMode ? 'text-white' : 'text-gray-900']">加载失败</h3>
          <p :class="['mb-4', isDarkMode ? 'text-gray-400' : 'text-gray-600']">{{ error }}</p>
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
        <div :class="['backdrop-blur-sm border rounded-lg px-4 py-2', isDarkMode ? 'bg-gray-900/90 border-gray-700/50' : 'bg-white/90 border-gray-300/50']">
          <div class="flex items-center justify-between text-sm">
            <div :class="['flex items-center space-x-4', isDarkMode ? 'text-gray-300' : 'text-gray-700']">
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
                    : isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900'
                ]"
                title="控制面板"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </button>
              <button
                @click="handleFullscreen"
                :class="[
                  'p-2 rounded-lg transition-colors',
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900'
                ]"
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
        <div :class="['backdrop-blur-sm border rounded-lg p-6 max-w-md', isDarkMode ? 'bg-gray-900/95 border-gray-700/50' : 'bg-white/95 border-gray-300/50']">
          <h3 :class="['text-lg font-semibold mb-4', isDarkMode ? 'text-white' : 'text-gray-900']">快捷键</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']">旋转视图</span>
              <span :class="[isDarkMode ? 'text-white' : 'text-gray-900']">鼠标左键拖拽</span>
            </div>
            <div class="flex justify-between">
              <span :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']">平移视图</span>
              <span :class="[isDarkMode ? 'text-white' : 'text-gray-900']">鼠标中键拖拽</span>
            </div>
            <div class="flex justify-between">
              <span :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']">缩放</span>
              <span :class="[isDarkMode ? 'text-white' : 'text-gray-900']">鼠标滚轮</span>
            </div>
            <div class="flex justify-between">
              <span :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']">重置视图</span>
              <span :class="[isDarkMode ? 'text-white' : 'text-gray-900']">R</span>
            </div>
            <div class="flex justify-between">
              <span :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']">适应屏幕</span>
              <span :class="[isDarkMode ? 'text-white' : 'text-gray-900']">F</span>
            </div>
            <div class="flex justify-between">
              <span :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']">切换网格</span>
              <span :class="[isDarkMode ? 'text-white' : 'text-gray-900']">G</span>
            </div>
            <div class="flex justify-between">
              <span :class="[isDarkMode ? 'text-gray-400' : 'text-gray-600']">切换线框</span>
              <span :class="[isDarkMode ? 'text-white' : 'text-gray-900']">W</span>
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
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import Babylon3DViewer from './Babylon3DViewer.vue'
import ViewerToolbar from './ViewerToolbar.vue'
import ViewerControlPanel from './ViewerControlPanel.vue'

// Props
interface Props {
  modelUrl?: string
  autoLoad?: boolean
  showWireframe?: boolean
  showGrid?: boolean
  showAxes?: boolean
  viewMode?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelUrl: '',
  autoLoad: true,
  showWireframe: false,
  showGrid: true,
  showAxes: true,
  viewMode: 'perspective'
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
  wireframe: props.showWireframe,
  grid: props.showGrid,
  axes: props.showAxes
})

const modelInfo = reactive({
  vertices: 0,
  faces: 0,
  fileSize: 0,
  name: ''
})

// Watch props changes
watch(() => props.showWireframe, (newValue) => {
  displayOptions.wireframe = newValue
})

watch(() => props.showGrid, (newValue) => {
  displayOptions.grid = newValue
})

watch(() => props.showAxes, (newValue) => {
  displayOptions.axes = newValue
})

watch(() => props.viewMode, (newValue) => {
  currentView.value = newValue
})

// Computed
const isDarkMode = computed(() => {
  return document.documentElement.classList.contains('dark')
})

const viewerBackgroundClass = computed(() => {
  return isDarkMode.value ? 'bg-gray-900' : 'bg-gray-100'
})

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
  background: var(--viewer-bg-color, #111827);
}

.modular-viewer:fullscreen.bg-gray-900 {
  background: #111827;
}

.modular-viewer:fullscreen.bg-gray-100 {
  background: #f3f4f6;
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