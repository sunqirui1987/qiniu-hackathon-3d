<template>
  <!-- 页面Loading组件 -->
  <div v-if="isPageLoading" class="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
      <p class="text-gray-600 dark:text-gray-300 text-lg">加载中...</p>
      <p class="text-gray-400 dark:text-gray-500 text-sm mt-2">正在初始化3D工作室</p>
    </div>
  </div>

  <div v-else class="studio-container h-[calc(100vh-4rem)] flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden">
    <!-- 左侧Tab面板组件 -->
    <LeftTabPanel
      :active-tab="activeTab"
      :active-main-menu="activeMainMenu"
      :text-prompt="textPrompt"
      :text-options="textOptions"
      :image-options="imageOptions"
      :retopology-options="retopologyOptions"
      :texture-options="textureOptions"
      :texture-prompt="texturePrompt"

      :model-info="modelInfo"
      :is-generating="isGenerating"
      :is-processing="isProcessing"
      :generation-progress="generationProgress"
      :generation-status="generationStatus"
      :selected-image="selectedImage"
      :selected-item="selectedItem"
      :available-tasks="availableTasks"
      @tab-change="activeTab = $event"
      @main-menu-change="activeMainMenu = $event"
      @update:text-prompt="textPrompt = $event"
      @update:text-options="textOptions = $event"
      @update:image-options="imageOptions = $event"
      @update:retopology-options="retopologyOptions = $event"
      @update:texture-options="textureOptions = $event"
      @update:texture-prompt="texturePrompt = $event"
      @update:selected-image="selectedImage = $event"
      @generate-from-text="handleTextTo3D"
      @generate-from-image="handleImageTo3D"
      @start-retopology="handleRetopology"
      @generate-texture="handleTextureGeneration"
    />

    <!-- 中间3D查看器 -->
    <CenterViewer
      :selected-item="selectedItem"
      :model-info="modelInfo"
      @update:selected-item="selectedItem = $event"
      @update:model-info="modelInfo = $event"
      @model-loaded="handleModelLoaded"
      @viewer-error="handleViewerError"
      @notification="showNotification"
    />

    <!-- 右侧历史面板组件 -->
    <RightHistoryPanel
      :active-category="historyCategory"
      :all-tasks="allHistoryTasks"
      :selected-item-id="selectedItem?.id || ''"
      @category-change="historyCategory = $event"
      @load-history-item="loadHistoryItem"
      @delete-history-item="deleteHistoryItem"
      @clear-history="clearHistory"
      @refresh-history="loadHistoryData"
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
import type { SelectedItem, RetopologyOptions, TextureOptions } from '@/types/model'
import { useStudioStore } from '@/stores/studio'
import { useGeneration } from '@/composables/useGeneration'
import { useNotification } from '@/composables/useNotification'

// 路由
const route = useRoute()

// Studio Store
const studioStore = useStudioStore()

// 新的统一生成管理
const generation = useGeneration()

// 通知管理
const { showSuccess, showError } = useNotification()

// 使用 store 中的状态，保持向后兼容
const isPageLoading = computed({
  get: () => studioStore.isPageLoading,
  set: (value) => studioStore.setPageLoading(value)
})
const activeTab = computed({
  get: () => studioStore.activeTab,
  set: (value) => studioStore.setActiveTab(value)
})
const activeMainMenu = computed({
  get: () => studioStore.activeMainMenu,
  set: (value) => studioStore.setActiveMainMenu(value)
})
const historyCategory = computed({
  get: () => studioStore.historyCategory,
  set: (value) => studioStore.setHistoryCategory(value)
})
const selectedItem = computed({
  get: () => studioStore.selectedItem,
  set: (value) => studioStore.setSelectedItem(value)
})

// 使用 store 中的历史任务状态
const textTo3DTasks = computed(() => studioStore.textTo3DTasks)
const imageTo3DTasks = computed(() => studioStore.imageTo3DTasks)
const allHistoryTasks = computed(() => studioStore.allHistoryTasks)
const isLoadingHistory = computed({
  get: () => studioStore.isLoadingHistory,
  set: (value) => studioStore.setLoadingHistory(value)
})

// 使用 store 中的文本生成状态
const textPrompt = computed({
  get: () => studioStore.textPrompt,
  set: (value) => studioStore.setTextPrompt(value)
})
const textOptions = studioStore.textOptions

// 使用 store 中的图片生成状态
const selectedImage = computed({
  get: () => studioStore.selectedImage,
  set: (value) => studioStore.setSelectedImage(value)
})
const imageOptions = studioStore.imageOptions

// 使用 store 中的重拓扑状态
const retopologyOptions = studioStore.retopologyOptions

// 使用 store 中的纹理生成状态
const texturePrompt = computed({
  get: () => studioStore.texturePrompt,
  set: (value) => studioStore.setTexturePrompt(value)
})
const textureOptions = studioStore.textureOptions

// 使用 store 中的模型信息状态
const modelInfo = computed({
  get: () => studioStore.modelInfo,
  set: (value) => studioStore.setModelInfo(value)
})

// 使用 store 中的处理状态
const isProcessing = computed({
  get: () => studioStore.isProcessing,
  set: (value) => studioStore.setProcessing(value)
})



// 通知
const notification = reactive({
  show: false,
  type: 'success' as 'success' | 'error',
  message: ''
})

// 计算属性 - 使用generation composable
const isGenerating = computed(() => generation.isGenerating.value)
const generationProgress = computed(() => generation.generationProgress.value)
const generationStatus = computed(() => generation.generationStatus.value)

// 使用store中的可用任务
const availableTasks = computed(() => studioStore.availableTasks)

// 方法
const loadHistoryData = async () => {
  try {
    await generation.loadHistory()
    
    console.log('🎯 Studio.vue - 历史数据加载成功:', { 
      totalTasks: allHistoryTasks.value.length,
      availableTasks: studioStore.availableTasks.length
    })
  } catch (error) {
    console.error('加载历史数据失败:', error)
    showError('加载历史数据失败')
  }
}

const handleTextTo3D = async (prompt: string, options: any) => {
  try {
    const result = await generation.generateFromText(prompt)
    
    if (result.success) {
      showSuccess('3D模型生成成功！')
    } else {
      showError(result.error || '生成失败，请重试')
    }
  } catch (error) {
    console.error('Text to 3D generation failed:', error)
    showError('生成失败，请重试')
  }
}

const handleImageTo3D = async (file: File | null) => {
  try {
    if (!file) {
      showError('请先上传图片')
      return
    }

    const result = await generation.generateFromImage(file)
    
    if (result.success) {
      showSuccess('3D模型生成成功！')
    } else {
      showError(result.error || '生成失败，请重试')
    }
  } catch (error) {
    console.error('Image to 3D generation failed:', error)
    showError('生成失败，请重试')
  }
}

const handleRetopology = async (options: RetopologyOptions) => {
  try {
    const result = await generation.processRetopology(options)
    
    if (result.success) {
      showSuccess('重拓扑完成！模型已更新')
    } else {
      showError(result.error || '重拓扑失败，请重试')
    }
  } catch (error) {
    console.error('Retopology failed:', error)
    showError('重拓扑失败，请重试')
  }
}

const handleTextureGeneration = async (prompt: string, options: TextureOptions) => {
  try {
    const result = await generation.generateTexture(prompt, options)
    
    if (result.success) {
      showSuccess('贴图生成完成！模型已更新')
    } else {
      showError(result.error || '贴图生成失败，请重试')
    }
  } catch (error) {
    console.error('Texture generation failed:', error)
    showError('贴图生成失败，请重试')
  }
}





const handleModelLoaded = (info: any) => {
  modelInfo.value = info
}

const handleViewerError = (error: string) => {
  showNotification(error, 'error')
}

const loadHistoryItem = (item: any) => {
  // 处理Meshy API格式的模型URL
  let modelUrl = ''
  
  if (item.model_urls?.glb) {
    modelUrl = item.model_urls.glb
  } else if (item.model_urls?.obj) {
    modelUrl = item.model_urls.obj
  } else if (item.modelUrl) {
    // 兼容旧格式
    modelUrl = item.modelUrl
  }
  
  if (modelUrl) {
    // 设置选中的项目对象，包含原始URL，让CenterViewer处理代理
    selectedItem.value = {
      ...item,
      url: modelUrl
    }
    showNotification('历史模型加载成功！', 'success')
  } else {
    showNotification('该任务暂无可用的模型文件', 'error')
  }
}

const deleteHistoryItem = (itemId: string) => {
  // 从store中删除历史任务
  const allTasks = studioStore.allHistoryTasks
  const taskIndex = allTasks.findIndex(h => h.id === itemId)
  
  if (taskIndex > -1) {
    // 创建新的数组，移除指定项目
    const updatedTasks = allTasks.filter(h => h.id !== itemId)
    studioStore.setHistoryTasks(updatedTasks)
    
    // 同时更新可用任务列表
    const updatedAvailableTasks = updatedTasks.filter(task => task.status === 'SUCCEEDED')
    studioStore.setAvailableTasks(updatedAvailableTasks)
    
    showNotification('历史记录已删除', 'success')
  } else {
    showNotification('未找到要删除的记录', 'error')
  }
}

const clearHistory = () => {
  // 清空store中的历史数据
  studioStore.setHistoryTasks([])
  studioStore.setAvailableTasks([])
  
  // 清除选中状态
  studioStore.setSelectedItem(null)
  
  showNotification('历史记录已清空', 'success')
}



// 保持向后兼容的通知方法
const showNotification = (messageOrData: string | { message: string, type: 'success' | 'error' }, type?: 'success' | 'error') => {
  if (typeof messageOrData === 'string') {
    if (type === 'error') {
      showError(messageOrData)
    } else {
      showSuccess(messageOrData)
    }
  } else {
    if (messageOrData.type === 'error') {
      showError(messageOrData.message)
    } else {
      showSuccess(messageOrData.message)
    }
  }
  
  // 同时更新本地通知状态（为了兼容现有的UI）
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
onMounted(async () => {
  try {
    // 如果URL中有模型参数，直接加载
    if (route.query.model) {
      selectedItem.value = {
        url: route.query.model as string,
        type: 'external',
        created_at: new Date().toISOString()
      }
    }
    
    // 加载历史数据
    await loadHistoryData()
    
    // 确保最小loading时间，提供更好的用户体验
    await new Promise(resolve => setTimeout(resolve, 500))
    
  } catch (error) {
    console.error('页面初始化失败:', error)
    showNotification('页面初始化失败，请刷新重试', 'error')
  } finally {
    // 无论成功还是失败，都要隐藏loading
    isPageLoading.value = false
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
  height: 100%;
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
    height: 50vh;
    flex: 1;
  }
}
</style>