<template>
  <div class="babylon-3d-viewer" :class="{ 'is-loading': isLoading }">
    <canvas ref="canvasRef" class="viewer-canvas"></canvas>
    
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">{{ loadingMessage }}</p>
    </div>
    
    <div v-if="error" class="error-overlay">
      <div class="error-icon">⚠️</div>
      <p class="error-message">{{ error }}</p>
      <button @click="clearError" class="error-button">Close</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { use3DViewer } from '../../composables/use3DViewer'

export interface Babylon3DViewerProps {
  modelUrl?: string
  autoLoad?: boolean
}

const props = withDefaults(defineProps<Babylon3DViewerProps>(), {
  modelUrl: '',
  autoLoad: false,
})

const emit = defineEmits<{
  modelLoaded: []
  modelError: [error: string]
  viewerReady: []
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const isLoading = ref(false)
const loadingMessage = ref('Initializing 3D viewer...')
const error = ref<string | null>(null)

const {
  scene,
  camera,
  engine,
  isInitialized,
  currentModel,
  initViewer,
  loadModel,
  exportSTL,
  exportGLB,
  dispose,
} = use3DViewer({ canvasRef })

const initialize = () => {
  try {
    initViewer()
    emit('viewerReady')
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to initialize viewer'
    error.value = errorMessage
    emit('modelError', errorMessage)
  }
}

const load = async (url: string) => {
  if (!url) return
  
  isLoading.value = true
  loadingMessage.value = 'Loading 3D model...'
  error.value = null

  try {
    await loadModel(url)
    emit('modelLoaded')
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load model'
    error.value = errorMessage
    emit('modelError', errorMessage)
  } finally {
    isLoading.value = false
  }
}

const clearError = () => {
  error.value = null
}

const exportAsSTL = async (): Promise<Blob | null> => {
  try {
    return await exportSTL()
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to export STL'
    error.value = errorMessage
    emit('modelError', errorMessage)
    return null
  }
}

const exportAsGLB = async (): Promise<Blob | null> => {
  try {
    return await exportGLB()
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to export GLB'
    error.value = errorMessage
    emit('modelError', errorMessage)
    return null
  }
}

onMounted(() => {
  initialize()
  
  if (props.autoLoad && props.modelUrl) {
    load(props.modelUrl)
  }
})

watch(() => props.modelUrl, (newUrl) => {
  if (newUrl && isInitialized.value) {
    load(newUrl)
  }
})

defineExpose({
  scene,
  camera,
  engine,
  isInitialized,
  currentModel,
  loadModel: load,
  exportSTL: exportAsSTL,
  exportGLB: exportAsGLB,
  dispose,
})
</script>

<style scoped>
.babylon-3d-viewer {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  background-color: #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
}

.viewer-canvas {
  width: 100%;
  height: 100%;
  display: block;
  outline: none;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 10;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 16px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-message {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  max-width: 80%;
  margin-bottom: 16px;
}

.error-button {
  padding: 8px 24px;
  background-color: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.error-button:hover {
  background-color: #2563eb;
}

.error-button:active {
  background-color: #1d4ed8;
}
</style>
