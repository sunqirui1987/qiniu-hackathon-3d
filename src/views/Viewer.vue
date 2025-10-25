<template>
  <div
    class="container mx-auto px-4 py-8"
    :class="{ 'fixed inset-0 z-50 bg-white p-0': isFullscreen }"
  >
    <div
      v-if="!isFullscreen"
      class="mb-6"
    >
      <h1 class="text-3xl font-bold text-gray-800 mb-2">
        3D查看器
      </h1>
      <p class="text-gray-600">
        查看、编辑和导出3D模型
      </p>
    </div>

    <div
      class="grid grid-cols-12 gap-6"
      :class="{ 'h-screen': isFullscreen }"
    >
      <div
        class="col-span-12"
        :class="isFullscreen ? '' : 'lg:col-span-8 xl:col-span-9'"
      >
        <div
          class="bg-white rounded-lg shadow-lg overflow-hidden"
          :class="{ 'h-full': isFullscreen }"
        >
          <div :class="isFullscreen ? 'h-full' : 'h-[600px]'">
            <Babylon3DViewer
              ref="viewerRef"
              :model-url="currentModelUrl"
              :auto-load="false"
              @loaded="handleModelLoaded"
              @error="handleLoadError"
            />
          </div>
          <button
            class="absolute top-4 right-4 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg shadow-lg transition-all z-10"
            @click="toggleFullscreen"
          >
            <svg
              v-if="!isFullscreen"
              class="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
            <svg
              v-else
              class="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        v-if="!isFullscreen"
        class="col-span-12 lg:col-span-4 xl:col-span-3 space-y-6"
      >
        <FileImport @file-selected="handleFileSelected" />
        
        <ModelControls
          @zoom="handleZoom"
          @rotate="handleRotate"
          @reset="handleReset"
          @toggle-grid="handleToggleGrid"
          @toggle-axis="handleToggleAxis"
        />
        
        <PropertyPanel :model-info="modelInfo" />
        
        <ExportPanel
          :has-model="!!modelInfo"
          @export="handleExport"
        />
        
        <div class="bg-white rounded-lg shadow-md p-4">
          <h3 class="text-lg font-semibold mb-3">
            打印
          </h3>
          <button
            class="w-full px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!modelInfo"
            @click="handleSendToPrint"
          >
            发送到打印机
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="notification"
      class="fixed bottom-6 right-6 max-w-md bg-white rounded-lg shadow-lg p-4 border-l-4 transition-all"
      :class="notification.type === 'success' ? 'border-green-500' : 'border-red-500'"
    >
      <div class="flex items-start gap-3">
        <svg
          v-if="notification.type === 'success'"
          class="w-6 h-6 text-green-500 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <svg
          v-else
          class="w-6 h-6 text-red-500 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <div class="flex-1">
          <p class="font-semibold text-gray-800">
            {{ notification.title }}
          </p>
          <p class="text-sm text-gray-600 mt-1">
            {{ notification.message }}
          </p>
        </div>
        <button
          class="text-gray-400 hover:text-gray-600"
          @click="notification = null"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useModelStore } from '@/stores/model'
import Babylon3DViewer from '@/components/3d/Babylon3DViewer.vue'
import ModelControls from '@/components/3d/ModelControls.vue'
import PropertyPanel from '@/components/3d/PropertyPanel.vue'
import FileImport from '@/components/3d/FileImport.vue'
import ExportPanel from '@/components/3d/ExportPanel.vue'
import type { ModelInfo } from '@/composables/use3DViewer'

const route = useRoute()
const router = useRouter()
const modelStore = useModelStore()

const viewerRef = ref<InstanceType<typeof Babylon3DViewer> | null>(null)
const currentModelUrl = ref<string>('')
const modelInfo = ref<ModelInfo | null>(null)
const isFullscreen = ref(false)
const notification = ref<{
  type: 'success' | 'error'
  title: string
  message: string
} | null>(null)

const showNotification = (type: 'success' | 'error', title: string, message: string) => {
  notification.value = { type, title, message }
  setTimeout(() => {
    notification.value = null
  }, 5000)
}

const handleFileSelected = async (file: File) => {
  try {
    const url = URL.createObjectURL(file)
    currentModelUrl.value = url
    
    if (viewerRef.value) {
      await viewerRef.value.loadModel(url, file.name)
      showNotification('success', '加载成功', `模型 "${file.name}" 已成功加载`)
    }
  } catch (error) {
    showNotification('error', '加载失败', error instanceof Error ? error.message : '未知错误')
  }
}

const handleModelLoaded = (info: ModelInfo) => {
  modelInfo.value = info
}

const handleLoadError = (error: string) => {
  showNotification('error', '加载错误', error)
}

const handleZoom = (delta: number) => {
  viewerRef.value?.setZoom(delta)
}

const handleRotate = (direction: string) => {
  const rotationStep = 0.1
  
  switch (direction) {
    case 'up':
      viewerRef.value?.rotateModel(0, -rotationStep)
      break
    case 'down':
      viewerRef.value?.rotateModel(0, rotationStep)
      break
    case 'left':
      viewerRef.value?.rotateModel(-rotationStep, 0)
      break
    case 'right':
      viewerRef.value?.rotateModel(rotationStep, 0)
      break
  }
}

const handleReset = () => {
  viewerRef.value?.resetCamera()
}

const handleToggleGrid = (show: boolean) => {
  console.log('Toggle grid:', show)
}

const handleToggleAxis = (show: boolean) => {
  console.log('Toggle axis:', show)
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

const handleExport = async (format: string, fileName: string) => {
  if (!viewerRef.value) return

  try {
    if (format === 'stl') {
      const blob = viewerRef.value.exportSTL()
      if (!blob) {
        showNotification('error', '导出失败', '无法生成STL文件')
        return
      }
      downloadBlob(blob, fileName, 'stl')
      showNotification('success', '导出成功', `模型已导出为 ${fileName}.stl`)
    } else if (format === 'glb') {
      const blob = await viewerRef.value.exportGLB()
      if (!blob) {
        showNotification('error', '导出失败', '无法生成GLB文件')
        return
      }
      downloadBlob(blob, fileName, 'glb')
      showNotification('success', '导出成功', `模型已导出为 ${fileName}.glb`)
    } else if (format === 'gltf') {
      const result = await viewerRef.value.exportGLTF()
      if (!result) {
        showNotification('error', '导出失败', '无法生成GLTF文件')
        return
      }
      downloadBlob(result.gltf, fileName, 'gltf')
      if (result.bin) {
        downloadBlob(result.bin, fileName, 'bin')
      }
      showNotification('success', '导出成功', `模型已导出为 ${fileName}.gltf${result.bin ? ' 和 ' + fileName + '.bin' : ''}`)
    } else if (format === 'obj') {
      const blob = await viewerRef.value.exportOBJ()
      if (!blob) {
        showNotification('error', '导出失败', '无法生成OBJ文件')
        return
      }
      downloadBlob(blob, fileName, 'obj')
      showNotification('success', '导出成功', `模型已导出为 ${fileName}.obj`)
    } else {
      showNotification('error', '导出失败', `暂不支持 ${format.toUpperCase()} 格式`)
      return
    }
  } catch (error) {
    showNotification('error', '导出失败', error instanceof Error ? error.message : '未知错误')
  }
}

const downloadBlob = (blob: Blob, fileName: string, extension: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${fileName}.${extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const handleSendToPrint = () => {
  const modelId = route.query.modelId as string || route.query.id as string
  if (modelId) {
    router.push({
      name: 'print',
      query: { modelId }
    })
  } else {
    showNotification('error', '无法打印', '请先加载一个模型')
  }
}

onMounted(async () => {
  const modelId = route.query.modelId as string || route.query.id as string
  if (modelId) {
    const model = modelStore.getModelById(modelId)
    const modelUrl = model?.url || '/demo-model.glb'
    const modelName = model?.name || `model-${modelId}.glb`
    
    currentModelUrl.value = modelUrl
    
    if (viewerRef.value) {
      try {
        await viewerRef.value.loadModel(modelUrl, modelName)
        showNotification('success', '加载成功', `模型 "${modelName}" 已成功加载`)
      } catch (error) {
        showNotification('error', '加载失败', error instanceof Error ? error.message : '未知错误')
      }
    }
  }
})
</script>
