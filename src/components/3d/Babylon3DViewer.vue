<template>
  <div class="babylon-viewer" ref="containerRef">
    <canvas ref="canvasRef" class="babylon-canvas" />
    
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>正在加载模型...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-if="loadError" class="error-overlay">
      <div class="error-content">
        <h3>加载失败</h3>
        <p>{{ loadError }}</p>
        <button @click="retryLoad" class="retry-button">重试</button>
      </div>
    </div>
    
    <!-- 模型信息 -->
    <div v-if="modelInfo && !isLoading && !loadError" class="model-info">
      <div class="info-item">
        <span>顶点: {{ (modelInfo.vertices || 0).toLocaleString() }}</span>
      </div>
      <div class="info-item">
        <span>面: {{ (modelInfo.faces || 0).toLocaleString() }}</span>
      </div>
      <div class="info-item">
        <span>材质: {{ modelInfo.materials }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { use3DViewer } from '@/composables/use3DViewer'

// Props
interface Props {
  modelUrl?: string
  autoLoad?: boolean
  showWireframe?: boolean
  showGrid?: boolean
  showAxes?: boolean
  currentView?: string
  activeTool?: string
}

const props = withDefaults(defineProps<Props>(), {
  autoLoad: true,
  showWireframe: false,
  showGrid: true,
  showAxes: true,
  currentView: 'perspective',
  activeTool: 'rotate'
})

// Emits
const emit = defineEmits<{
  loaded: [model: any]
  error: [error: string]
  viewerReady: []
  modelLoaded: [info: any]
  modelError: [error: string]
  viewChange: [view: string]
  toolChange: [tool: string]
  wireframeToggle: [enabled: boolean]
  gridToggle: [enabled: boolean]
  axesToggle: [enabled: boolean]
  resetView: []
  fitToScreen: []
  screenshot: [dataUrl: string]
}>()

// Refs
const containerRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()

// 使用3D查看器composable
const {
  isInitialized,
  isLoading,
  loadError,
  modelInfo,
  showWireframe,
  showGrid,
  showAxes,
  currentView,
  activeTool,
  initViewer,
  loadModel,
  setViewMode,
  toggleWireframe,
  toggleGrid,
  toggleAxes,
  resetCamera,
  setZoom,
  rotateModel,
  updateTransform,
  updateLighting,
  takeScreenshot,
  dispose
} = use3DViewer({ canvasRef })

// 初始化查看器
onMounted(async () => {
  await nextTick()
  
  try {
    initViewer()
    emit('viewerReady')
    
    // 如果有模型URL且自动加载，则加载模型
    if (props.modelUrl && props.autoLoad) {
      await loadModelFromUrl(props.modelUrl)
    }
  } catch (error) {
    console.error('Failed to initialize viewer:', error)
    emit('error', error instanceof Error ? error.message : 'Unknown error')
  }
})

// 加载模型
const loadModelFromUrl = async (url: string) => {
  try {
    await loadModel(url)
    emit('loaded', modelInfo.value)
    emit('modelLoaded', modelInfo.value)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    emit('error', errorMessage)
    emit('modelError', errorMessage)
  }
}

// 重试加载
const retryLoad = async () => {
  if (props.modelUrl) {
    await loadModelFromUrl(props.modelUrl)
  }
}

// 监听props变化
watch(() => props.modelUrl, async (newUrl) => {
  if (newUrl && isInitialized.value) {
    await loadModelFromUrl(newUrl)
  }
})

watch(() => props.showWireframe, (newValue) => {
  toggleWireframe(newValue)
  emit('wireframeToggle', newValue)
})

watch(() => props.showGrid, (newValue) => {
  toggleGrid(newValue)
  emit('gridToggle', newValue)
})

watch(() => props.showAxes, (newValue) => {
  toggleAxes(newValue)
  emit('axesToggle', newValue)
})

watch(() => props.currentView, (newValue) => {
  setViewMode(newValue)
  emit('viewChange', newValue)
})

// ViewerToolbar事件处理方法
const handleViewChange = (view: string) => {
  setViewMode(view)
  emit('viewChange', view)
}

const handleToolChange = (tool: string) => {
  activeTool.value = tool
  emit('toolChange', tool)
}

const handleWireframeToggle = () => {
  const newState = !showWireframe.value
  toggleWireframe(newState)
  emit('wireframeToggle', newState)
}

const handleGridToggle = () => {
  const newState = !showGrid.value
  toggleGrid(newState)
  emit('gridToggle', newState)
}

const handleAxesToggle = () => {
  const newState = !showAxes.value
  toggleAxes(newState)
  emit('axesToggle', newState)
}

const handleResetView = () => {
  resetCamera()
  emit('resetView')
}

const handleFitToScreen = () => {
  resetCamera()
  emit('fitToScreen')
}

const handleScreenshot = async () => {
  try {
    const dataUrl = await takeScreenshot()
    emit('screenshot', dataUrl)
  } catch (error) {
    console.error('Screenshot failed:', error)
  }
}

// ModularViewer期望的接口方法
const setView = (view: string) => {
  handleViewChange(view)
}

const setTool = (tool: string) => {
  handleToolChange(tool)
}

const setDisplayOption = (option: string, enabled: boolean) => {
  switch (option) {
    case 'wireframe':
      toggleWireframe(enabled)
      emit('wireframeToggle', enabled)
      break
    case 'grid':
      toggleGrid(enabled)
      emit('gridToggle', enabled)
      break
    case 'axes':
      toggleAxes(enabled)
      emit('axesToggle', enabled)
      break
  }
}

const resetView = () => {
  handleResetView()
}

const fitToScreen = () => {
  handleFitToScreen()
}

const takeScreenshotMethod = async () => {
  return await takeScreenshot()
}

const updateTransformMethod = (transform: any) => {
  updateTransform(transform)
}

const updateLightingMethod = (lighting: any) => {
  updateLighting(lighting)
}

// 暴露方法给父组件
defineExpose({
  // ViewerToolbar控制方法
  handleViewChange,
  handleToolChange,
  handleWireframeToggle,
  handleGridToggle,
  handleAxesToggle,
  handleResetView,
  handleFitToScreen,
  handleScreenshot,
  
  // ModularViewer期望的方法
  setView,
  setTool,
  setDisplayOption,
  resetView,
  fitToScreen,
  takeScreenshot: takeScreenshotMethod,
  updateTransform: updateTransformMethod,
  updateLighting: updateLightingMethod,
  
  // 直接暴露composable方法
  loadModel: loadModelFromUrl,
  setZoom,
  rotateModel,
  
  // 状态
  isLoading,
  loadError,
  modelInfo,
  showWireframe,
  showGrid,
  showAxes,
  currentView,
  activeTool
})

// 清理
onUnmounted(() => {
  dispose()
})
</script>

<style scoped>
.babylon-viewer {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f5f5f5;
}

.babylon-canvas {
  width: 100%;
  height: 100%;
  display: block;
  outline: none;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.error-content {
  text-align: center;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 400px;
}

.error-content h3 {
  color: #e74c3c;
  margin: 0 0 12px 0;
  font-size: 18px;
}

.error-content p {
  color: #666;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.retry-button {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background: #2980b9;
}

.model-info {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  z-index: 5;
}

.info-item {
  margin-bottom: 4px;
}

.info-item:last-child {
  margin-bottom: 0;
}
</style>
