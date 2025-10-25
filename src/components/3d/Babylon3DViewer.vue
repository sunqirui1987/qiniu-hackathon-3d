<template>
  <div class="babylon-3d-viewer relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
    <canvas
      ref="canvasRef"
      class="viewer-canvas w-full h-full"
    />
    
    <div
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="text-center text-white">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4" />
        <p class="text-lg">
          加载模型中...
        </p>
      </div>
    </div>

    <div
      v-if="loadError"
      class="error-overlay absolute inset-0 flex items-center justify-center bg-red-50"
    >
      <div class="text-center text-red-600 p-6">
        <svg
          class="w-16 h-16 mx-auto mb-4"
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
        <p class="text-lg font-semibold mb-2">
          加载失败
        </p>
        <p class="text-sm">
          {{ loadError }}
        </p>
      </div>
    </div>

    <div
      v-if="!currentModel && !isLoading && !loadError"
      class="absolute inset-0 flex items-center justify-center text-gray-400"
    >
      <div class="text-center">
        <svg
          class="w-16 h-16 mx-auto mb-4"
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
        <p class="text-lg">
          暂无模型
        </p>
        <p class="text-sm mt-2">
          请加载3D模型以开始查看
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { use3DViewer, type ModelInfo } from '@/composables/use3DViewer'

interface Props {
  modelUrl?: string
  autoLoad?: boolean
  clearColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelUrl: '',
  autoLoad: true,
  clearColor: '#f3f4f6'
})

interface Emits {
  (e: 'loaded', info: ModelInfo): void
  (e: 'error', error: string): void
  (e: 'viewerReady'): void
  (e: 'modelLoaded'): void
  (e: 'modelError', error: string): void
}

const emit = defineEmits<Emits>()

const canvasRef = ref<HTMLCanvasElement | null>(null)

const {
  scene,
  camera,
  engine,
  currentModel,
  isInitialized,
  isLoading,
  loadError,
  modelInfo,
  initViewer,
  loadModel,
  exportSTL,
  exportGLB,
  exportGLTF,
  exportOBJ,
  resetCamera,
  setZoom,
  rotateModel,
  dispose,
} = use3DViewer({ canvasRef })

onMounted(() => {
  initViewer()
  emit('viewerReady')

  if (props.modelUrl && props.autoLoad) {
    handleLoadModel(props.modelUrl)
  }
})

watch(() => props.modelUrl, (newUrl) => {
  if (newUrl && props.autoLoad) {
    handleLoadModel(newUrl)
  }
})

watch(() => modelInfo.value, (info) => {
  if (info) {
    emit('loaded', info)
    emit('modelLoaded')
  }
})

watch(() => loadError.value, (error) => {
  if (error) {
    emit('error', error)
    emit('modelError', error)
  }
})

const handleLoadModel = async (url: string) => {
  try {
    await loadModel(url)
  } catch (error) {
    console.error('Failed to load model:', error)
  }
}

defineExpose({
  scene,
  camera,
  engine,
  isInitialized,
  currentModel,
  loadModel: handleLoadModel,
  exportSTL,
  exportGLB,
  exportGLTF,
  exportOBJ,
  resetCamera,
  setZoom,
  rotateModel,
  dispose,
})
</script>
