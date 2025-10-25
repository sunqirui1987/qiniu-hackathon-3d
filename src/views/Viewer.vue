<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">
        3D查看器
      </h1>
      <p class="text-gray-600">
        查看、编辑和导出3D模型
      </p>
    </div>

    <div class="grid grid-cols-12 gap-6">
      <div class="col-span-12 lg:col-span-8 xl:col-span-9">
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <div class="h-[600px]">
            <Babylon3DViewer
              ref="viewerRef"
              :model-url="currentModelUrl"
              :auto-load="false"
              @loaded="handleModelLoaded"
              @error="handleLoadError"
            />
          </div>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-4 xl:col-span-3 space-y-6">
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
import { ref } from 'vue'
import Babylon3DViewer from '@/components/3d/Babylon3DViewer.vue'
import ModelControls from '@/components/3d/ModelControls.vue'
import PropertyPanel from '@/components/3d/PropertyPanel.vue'
import FileImport from '@/components/3d/FileImport.vue'
import ExportPanel from '@/components/3d/ExportPanel.vue'
import type { ModelInfo } from '@/composables/use3DViewer'

const viewerRef = ref<InstanceType<typeof Babylon3DViewer> | null>(null)
const currentModelUrl = ref<string>('')
const modelInfo = ref<ModelInfo | null>(null)
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

const handleExport = async (format: string, fileName: string) => {
  if (!viewerRef.value) return

  try {
    let blob: Blob | null = null
    let fileExtension = ''

    if (format === 'stl') {
      blob = viewerRef.value.exportSTL()
      fileExtension = 'stl'
    } else if (format === 'glb') {
      blob = await viewerRef.value.exportGLB()
      fileExtension = 'glb'
    } else {
      showNotification('error', '导出失败', `暂不支持 ${format.toUpperCase()} 格式`)
      return
    }

    if (!blob) {
      showNotification('error', '导出失败', '无法生成导出文件')
      return
    }

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${fileName}.${fileExtension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showNotification('success', '导出成功', `模型已导出为 ${fileName}.${fileExtension}`)
  } catch (error) {
    showNotification('error', '导出失败', error instanceof Error ? error.message : '未知错误')
  }
}
</script>
