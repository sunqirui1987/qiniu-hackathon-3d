<template>
  <div class="babylon-viewer-container">
    <canvas
      ref="canvasRef"
      class="babylon-canvas"
    />
    
    <div
      v-if="isLoading"
      class="loading-overlay"
    >
      <div class="loading-spinner" />
      <p class="loading-text">
        {{ loadingMessage }}
      </p>
    </div>
    
    <div
      v-if="error"
      class="error-overlay"
    >
      <div class="error-content">
        <p class="error-message">
          {{ error }}
        </p>
        <button
          class="error-dismiss"
          @click="error = null"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { use3DViewer } from '@/composables/use3DViewer'

interface Props {
  modelUrl?: string
  autoLoad?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoLoad: false
})

interface Emits {
  (e: 'viewerReady'): void
  (e: 'modelLoaded'): void
  (e: 'modelError', error: string): void
}

const emit = defineEmits<Emits>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const isLoading = ref(false)
const loadingMessage = ref('')
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
  dispose
} = use3DViewer({ canvasRef })

onMounted(() => {
  try {
    initViewer()
    emit('viewerReady')
    
    if (props.autoLoad && props.modelUrl) {
      loadModelFromUrl(props.modelUrl)
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to initialize viewer'
    error.value = errorMsg
    emit('modelError', errorMsg)
  }
})

onUnmounted(() => {
  dispose()
})

watch(() => props.modelUrl, (newUrl) => {
  if (newUrl && props.autoLoad) {
    loadModelFromUrl(newUrl)
  }
})

async function loadModelFromUrl(url: string) {
  if (!url) return
  
  isLoading.value = true
  loadingMessage.value = 'Loading 3D model...'
  error.value = null
  
  try {
    await loadModel(url)
    emit('modelLoaded')
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to load model'
    error.value = errorMsg
    emit('modelError', errorMsg)
  } finally {
    isLoading.value = false
  }
}

async function exportAsSTL(): Promise<Blob | null> {
  try {
    return await exportSTL()
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to export STL'
    error.value = errorMsg
    throw err
  }
}

async function exportAsGLB(): Promise<Blob | null> {
  try {
    return await exportGLB()
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to export GLB'
    error.value = errorMsg
    throw err
  }
}

defineExpose({
  loadModel: loadModelFromUrl,
  exportSTL: exportAsSTL,
  exportGLB: exportAsGLB,
  dispose,
  scene,
  camera,
  engine,
  isInitialized,
  currentModel
})
</script>

<style scoped>
.babylon-viewer-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
  background-color: #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
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
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: white;
  margin-top: 16px;
  font-size: 16px;
}

.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.error-content {
  background-color: #fff;
  padding: 24px;
  border-radius: 8px;
  max-width: 400px;
  text-align: center;
}

.error-message {
  color: #dc2626;
  margin-bottom: 16px;
  font-size: 16px;
}

.error-dismiss {
  background-color: #3b82f6;
  color: white;
  padding: 8px 24px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.error-dismiss:hover {
  background-color: #2563eb;
}
</style>
