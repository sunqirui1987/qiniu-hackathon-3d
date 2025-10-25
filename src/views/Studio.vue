<template>
  <div class="studio-container h-screen flex bg-gray-900 text-white">
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
    <div class="center-panel flex-1 flex flex-col bg-gray-850">
      <!-- 3D查看器工具栏 -->
      <div class="viewer-toolbar bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-400">视图:</span>
              <select v-model="viewMode" class="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                <option value="perspective">透视</option>
                <option value="orthographic">正交</option>
                <option value="top">顶视图</option>
                <option value="front">前视图</option>
                <option value="side">侧视图</option>
              </select>
            </div>
            
            <div class="flex items-center gap-1">
              <button
                @click="resetView"
                class="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                title="重置视图"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              
              <button
                @click="toggleWireframe"
                :class="[
                  'p-1 rounded transition-colors',
                  showWireframe ? 'text-blue-400 bg-blue-400/20' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                ]"
                title="线框模式"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </button>
              
              <button
                @click="toggleGrid"
                :class="[
                  'p-1 rounded transition-colors',
                  showGrid ? 'text-blue-400 bg-blue-400/20' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                ]"
                title="显示网格"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </button>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="importModel"
              class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
            >
              导入模型
            </button>
            <button
              @click="exportModel"
              :disabled="!currentModel"
              class="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-sm transition-colors"
            >
              导出
            </button>
          </div>
        </div>
      </div>

      <!-- 3D查看器主体 -->
      <div class="viewer-main flex-1 relative">
        <ModularViewer
          v-if="currentModel"
          :model-url="currentModel"
          :auto-load="true"
          :view-mode="viewMode"
          :show-wireframe="showWireframe"
          :show-grid="showGrid"
          @model-loaded="handleModelLoaded"
          @error="handleViewerError"
          class="w-full h-full"
        />
        
        <!-- 空状态 -->
        <div v-else class="flex items-center justify-center h-full">
          <div class="text-center">
            <svg class="w-24 h-24 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 class="text-xl font-semibold text-gray-400 mb-2">3D工作室</h3>
            <p class="text-gray-500 mb-4">选择左侧功能开始创建3D模型</p>
            <button
              @click="importModel"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              或者导入现有模型
            </button>
          </div>
        </div>
      </div>
    </div>

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
        notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
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
import ModularViewer from '@/components/3d/ModularViewer.vue'
import LeftTabPanel from '@/components/studio/LeftTabPanel.vue'
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
const viewMode = ref('perspective')
const showWireframe = ref(false)
const showGrid = ref(true)
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

const resetView = () => {
  // 重置3D查看器视图
  console.log('Reset view')
}

const toggleWireframe = () => {
  showWireframe.value = !showWireframe.value
}

const toggleGrid = () => {
  showGrid.value = !showGrid.value
}

const importModel = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.glb,.gltf,.obj,.fbx'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      currentModel.value = url
      showNotification('模型导入成功！', 'success')
    }
  }
  input.click()
}

const exportModel = () => {
  if (!currentModel.value) return
  showNotification('模型导出中...', 'success')
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

const showNotification = (message: string, type: 'success' | 'error') => {
  notification.show = true
  notification.message = message
  notification.type = type
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