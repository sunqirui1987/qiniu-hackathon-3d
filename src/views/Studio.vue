<template>
  <div class="studio-container h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
    <!-- 左侧Tab面板组件 -->
    <LeftTabPanel
      :active-tab="activeTab"
      :text-prompt="textPrompt"
      :text-options="textOptions"
      :image-options="imageOptions"
      :retopology-options="retopologyOptions"
      :texture-options="textureOptions"
      :texture-prompt="texturePrompt"
      :current-model="currentModel"
      :model-info="modelInfo"
      :is-generating="isGenerating"
      :is-processing="isProcessing"
      :generation-progress="generationProgress"
      :generation-status="generationStatus"
      @tab-change="activeTab = $event"
      @update:text-prompt="textPrompt = $event"
      @update:text-options="textOptions = $event"
      @update:image-options="imageOptions = $event"
      @update:retopology-options="retopologyOptions = $event"
      @update:texture-options="textureOptions = $event"
      @update:texture-prompt="texturePrompt = $event"
      @text-to-3d="handleTextTo3D"
      @image-to-3d="handleImageTo3D"
      @retopology="handleRetopology"
      @texture-generation="handleTextureGeneration"
    />

    <!-- 中间3D查看器区域 -->
    <CenterViewer
      :current-model="currentModel"
      :model-info="modelInfo"
      @update:current-model="currentModel = $event"
      @update:model-info="modelInfo = $event"
      @model-imported="handleModelImported"
      @model-exported="handleModelExported"
      @model-loaded="handleModelLoaded"
      @viewer-error="handleViewerError"
      @notification="(message, type) => showNotification(message, type)"
    />

    <!-- 右侧历史面板组件 -->
    <RightHistoryPanel
      :history="generationHistory"
      :active-filter="historyFilter"
      @filter-change="historyFilter = $event"
      @load-history-item="loadHistoryItem"
      @download-item="downloadHistoryItem"
      @delete-item="deleteHistoryItem"
      @clear-history="clearHistory"
    />

    <!-- 通知组件 -->
    <div v-if="notification.show" class="fixed top-4 right-4 z-50">
      <div :class="[
        'px-6 py-4 rounded-lg shadow-lg max-w-sm',
        notification.type === 'success' 
          ? 'bg-green-600 dark:bg-green-700 text-white' 
          : 'bg-red-600 dark:bg-red-700 text-white'
      ]">
        <div class="flex items-center gap-3">
          <svg v-if="notification.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>{{ notification.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import LeftTabPanel from '@/components/studio/LeftTabPanel.vue'
import CenterViewer from '@/components/studio/CenterViewer.vue'
import RightHistoryPanel from '@/components/studio/RightHistoryPanel.vue'
import { useTextTo3D } from '@/composables/useTextTo3D'
import { useImageTo3D } from '@/composables/useImageTo3D'

// 路由
const route = useRoute()

// Composables
const { generateFromText, isGenerating: textGenerating, progress: textProgress, status: textStatus } = useTextTo3D()
const { generateFromImage, isGenerating: imageGenerating, progress: imageProgress, status: imageStatus } = useImageTo3D()

// 响应式数据
const activeTab = ref('text-to-3d')
const currentModel = ref<string>('')
const historyFilter = ref('all')

// 文本生成相关
const textPrompt = ref('')
const textOptions = reactive({
  quality: 'standard',
  style: 'realistic'
})

// 图片生成相关
const imageOptions = reactive({
  complexity: 'medium'
})

// 重拓扑相关
const retopologyOptions = reactive({
  targetFaces: 10000,
  preserveUV: true,
  preserveSharp: false
})

// 贴图生成相关
const texturePrompt = ref('')
const textureOptions = reactive({
  type: 'diffuse',
  resolution: '1024'
})

// 模型信息
const modelInfo = ref({
  faces: 0,
  vertices: 0,
  fileSize: ''
})

// 处理状态
const isProcessing = ref(false)

// 生成历史
const generationHistory = ref([
  {
    id: '1',
    name: '可爱小猫',
    type: 'text-to-3d',
    status: 'completed',
    date: '2024-01-15 14:30',
    prompt: '一只可爱的小猫咪，坐着的姿势',
    thumbnail: '/api/placeholder/80/80',
    faces: 5420,
    fileSize: '2.3MB',
    downloadUrl: '/models/cat.glb'
  },
  {
    id: '2',
    name: '现代椅子',
    type: 'image-to-3d',
    status: 'generating',
    date: '2024-01-15 15:45',
    prompt: '现代简约风格的椅子',
    thumbnail: '/api/placeholder/80/80',
    progress: 65
  },
  {
    id: '3',
    name: '古典花瓶',
    type: 'text-to-3d',
    status: 'failed',
    date: '2024-01-15 16:20',
    prompt: '古典风格的陶瓷花瓶',
    thumbnail: '/api/placeholder/80/80',
    error: '生成失败：模型复杂度过高'
  }
])

// 通知
const notification = reactive({
  show: false,
  type: 'success' as 'success' | 'error',
  message: ''
})

// 计算属性
const isGenerating = computed(() => textGenerating.value || imageGenerating.value)
const generationProgress = computed(() => {
  if (activeTab.value === 'text-to-3d') return textProgress.value
  if (activeTab.value === 'image-to-3d') return imageProgress.value
  return 0
})
const generationStatus = computed(() => {
  if (activeTab.value === 'text-to-3d') return textStatus.value
  if (activeTab.value === 'image-to-3d') return imageStatus.value
  return ''
})

// 方法
const handleTextTo3D = async (prompt: string, options: any) => {
  try {
    const result = await generateFromText(prompt, options)
    if (result) {
      currentModel.value = result.modelUrl
      addToHistory({
        name: prompt.slice(0, 20) + '...',
        type: 'text-to-3d',
        status: 'completed',
        prompt,
        modelUrl: result.modelUrl
      })
      showNotification('3D模型生成成功！', 'success')
    }
  } catch (error) {
    console.error('Text to 3D generation failed:', error)
    showNotification('生成失败，请重试', 'error')
  }
}

const handleImageTo3D = async (image: File, options: any) => {
  try {
    const result = await generateFromImage(image, options)
    if (result) {
      currentModel.value = result.modelUrl
      addToHistory({
        name: '图片生成模型',
        type: 'image-to-3d',
        status: 'completed',
        prompt: '从图片生成',
        modelUrl: result.modelUrl
      })
      showNotification('3D模型生成成功！', 'success')
    }
  } catch (error) {
    console.error('Image to 3D generation failed:', error)
    showNotification('生成失败，请重试', 'error')
  }
}

const handleRetopology = async (options: any) => {
  if (!currentModel.value) return
  
  isProcessing.value = true
  try {
    // 模拟重拓扑处理
    await new Promise(resolve => setTimeout(resolve, 3000))
    showNotification('重拓扑完成！', 'success')
  } catch (error) {
    console.error('Retopology failed:', error)
    showNotification('重拓扑失败，请重试', 'error')
  } finally {
    isProcessing.value = false
  }
}

const handleTextureGeneration = async (prompt: string, options: any) => {
  if (!currentModel.value) return
  
  isProcessing.value = true
  try {
    // 模拟贴图生成
    await new Promise(resolve => setTimeout(resolve, 5000))
    showNotification('贴图生成完成！', 'success')
  } catch (error) {
    console.error('Texture generation failed:', error)
    showNotification('贴图生成失败，请重试', 'error')
  } finally {
    isProcessing.value = false
  }
}

const handleModelImported = (file: File) => {
  // 处理模型导入后的逻辑，比如添加到历史记录
  addToHistory({
    name: file.name.replace(/\.[^/.]+$/, ''),
    type: 'imported',
    status: 'completed',
    prompt: '导入的模型',
    modelUrl: currentModel.value
  })
}

const handleModelExported = () => {
  // 处理模型导出的逻辑
  console.log('Model exported')
}

const handleModelLoaded = (info: any) => {
  modelInfo.value = info
}

const handleViewerError = (error: string) => {
  showNotification(error, 'error')
}

const loadHistoryItem = (item: any) => {
  if (item.modelUrl) {
    currentModel.value = item.modelUrl
    showNotification('历史模型加载成功！', 'success')
  }
}

const downloadHistoryItem = (item: any) => {
  if (item.downloadUrl) {
    const link = document.createElement('a')
    link.href = item.downloadUrl
    link.download = `${item.name}.glb`
    link.click()
    showNotification('下载开始！', 'success')
  }
}

const deleteHistoryItem = (item: any) => {
  const index = generationHistory.value.findIndex(h => h.id === item.id)
  if (index > -1) {
    generationHistory.value.splice(index, 1)
    showNotification('历史记录已删除', 'success')
  }
}

const clearHistory = () => {
  generationHistory.value = []
  showNotification('历史记录已清空', 'success')
}

const addToHistory = (item: any) => {
  const newItem = {
    id: Date.now().toString(),
    date: new Date().toLocaleString('zh-CN'),
    thumbnail: '/api/placeholder/80/80',
    faces: Math.floor(Math.random() * 10000) + 1000,
    fileSize: (Math.random() * 5 + 0.5).toFixed(1) + 'MB',
    ...item
  }
  generationHistory.value.unshift(newItem)
}

const showNotification = (messageOrData: string | { message: string, type: 'success' | 'error' }, type?: 'success' | 'error') => {
  notification.show = true
  if (typeof messageOrData === 'string') {
    notification.message = messageOrData
    notification.type = type || 'success'
  } else {
    notification.message = messageOrData.message
    notification.type = messageOrData.type
  }
  setTimeout(() => {
    notification.show = false
  }, 3000)
}

// 生命周期
onMounted(() => {
  // 从路由参数加载模型
  if (route.query.model) {
    currentModel.value = route.query.model as string
  }
})
</script>

<style scoped>
/* 主要布局样式 */
.studio-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.bg-gray-850 {
  background-color: rgb(31, 41, 55);
}

/* 中央查看器区域 */
.central-viewer {
  min-height: 100vh;
  position: relative;
}

/* 响应式布局 */
@media (max-width: 1024px) {
  .left-panel {
    width: 16rem;
    min-width: 16rem;
  }
  
  .right-panel {
    width: 16rem;
    min-width: 16rem;
  }
}

@media (max-width: 768px) {
  .flex {
    flex-direction: column;
  }
  
  .left-panel,
  .right-panel {
    width: 100%;
    height: auto;
    max-height: 35vh;
  }
  
  .central-viewer {
    min-height: 50vh;
  }
}
</style>