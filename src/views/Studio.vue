<template>
  <div class="studio-container h-[calc(100vh-4rem)] flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden">
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
      :selected-image="selectedImage"
      @tab-change="activeTab = $event"
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
      :active-category="historyCategory"
      :text-to-3d-tasks="textTo3DTasks"
      :image-to-3d-tasks="imageTo3DTasks"
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
import { useTextTo3D } from '@/composables/useTextTo3D'
import { useImageTo3D } from '@/composables/useImageTo3D'
import { meshyClient } from '@/utils/meshyClient'

// 路由
const route = useRoute()

// Composables
const { generateModel: generateFromText, isGenerating: textGenerating, progress: textProgress, status: textStatus } = useTextTo3D()
const { generateFromImage, isGenerating: imageGenerating, progress: imageProgress, status: imageStatus } = useImageTo3D()

// 响应式数据
const activeTab = ref('text-to-3d')
const currentModel = ref<string>('')
const historyCategory = ref('all')

// Meshy API 任务列表
const textTo3DTasks = ref([])
const imageTo3DTasks = ref([])
const isLoadingHistory = ref(false)

// 文本生成相关
const textPrompt = ref('')
const textOptions = reactive({
  quality: 'standard',
  style: 'realistic'
})

// 图片生成相关
const selectedImage = ref('')
const imageOptions = reactive({
  ai_model: 'latest',
  should_texture: true,
  enable_pbr: true,
  texture_prompt: '',
  topology: 'triangle',
  target_polycount: 30000,
  should_remesh: true,
  is_a_t_pose: false
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
const loadHistoryData = async () => {
  isLoadingHistory.value = true
  try {
    const [textTasks, imageTasks] = await Promise.all([
      meshyClient.getTextTo3DTasks(),
      meshyClient.getImageTo3DTasks()
    ])
    
    console.log('🚀 Studio.vue - 原始API数据:')
    console.log('textTasks from API:', textTasks)
    console.log('imageTasks from API:', imageTasks)
    
    // 为任务添加类型标识
    textTo3DTasks.value = textTasks.map(task => ({ ...task, type: 'text-to-3d' }))
    imageTo3DTasks.value = imageTasks.map(task => ({ ...task, type: 'image-to-3d' }))
    
    console.log('🎯 Studio.vue - 处理后的数据:')
    console.log('textTo3DTasks.value:', textTo3DTasks.value)
    console.log('imageTo3DTasks.value:', imageTo3DTasks.value)
    console.log('historyCategory.value:', historyCategory.value)
    
    console.log('历史数据加载成功:', { textTasks: textTasks.length, imageTasks: imageTasks.length })
  } catch (error) {
    console.error('加载历史数据失败:', error)
    showNotification('加载历史数据失败', 'error')
  } finally {
    isLoadingHistory.value = false
  }
}

const handleTextTo3D = async (prompt: string, options: any) => {
  try {
    // 构造符合 TextTo3DOptions 接口的参数
    const textTo3DOptions = {
      prompt: prompt,
      negative_prompt: options.negative_prompt,
      artStyle: options.art_style,
      aiModel: options.ai_model,
      topology: options.topology,
      targetPolycount: options.target_polycount,
      shouldRemesh: options.should_remesh,
      isATPose: options.is_a_t_pose,
      symmetryMode: 'auto',
      enablePBR: false,
    }
    
    const result = await generateFromText(textTo3DOptions)
    if (result) {
      currentModel.value = result.url
      showNotification('3D模型生成成功！', 'success')
      // 重新加载历史数据以获取最新的任务
      await loadHistoryData()
    }
  } catch (error) {
    console.error('Text to 3D generation failed:', error)
    showNotification('生成失败，请重试', 'error')
  }
}

const handleImageTo3D = async (file: File | null) => {
  try {
    if (!file) {
      showNotification('请先上传图片', 'error')
      return
    }

    // 构造符合ImageTo3DOptions接口的options对象
    const options = {
      image: file, // 使用原始File对象
      aiModel: imageOptions.ai_model || 'latest',
      topology: imageOptions.topology || 'triangle',
      targetPolycount: imageOptions.target_polycount || 30000,
      shouldRemesh: imageOptions.should_remesh !== undefined ? imageOptions.should_remesh : true,
      shouldTexture: imageOptions.should_texture !== undefined ? imageOptions.should_texture : true,
      enablePBR: imageOptions.enable_pbr !== undefined ? imageOptions.enable_pbr : true,
      isATPose: imageOptions.is_a_t_pose || false,
      texturePrompt: imageOptions.texture_prompt || ''
    }

    const result = await generateFromImage(options)
    if (result) {
      currentModel.value = result.modelUrl
      showNotification('3D模型生成成功！', 'success')
      // 重新加载历史数据以获取最新的任务
      await loadHistoryData()
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
  // 处理模型导入后的逻辑
  showNotification(`模型 ${file.name} 导入成功`, 'success')
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

const loadHistoryItem = async (item: any) => {
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
    try {
      // 使用代理 URL 避免 CORS 问题
      const proxiedUrl = await meshyClient.getProxiedAssetUrl(modelUrl)
      currentModel.value = proxiedUrl
      showNotification('历史模型加载成功！', 'success')
    } catch (error) {
      console.error('Failed to get proxied URL:', error)
      showNotification('模型加载失败', 'error')
    }
  } else {
    showNotification('该任务暂无可用的模型文件', 'error')
  }
}

const deleteHistoryItem = (itemId: string) => {
  // 从文本生成任务中删除
  const textIndex = textTo3DTasks.value.findIndex(h => h.id === itemId)
  if (textIndex > -1) {
    textTo3DTasks.value.splice(textIndex, 1)
    showNotification('历史记录已删除', 'success')
    return
  }
  
  // 从图片生成任务中删除
  const imageIndex = imageTo3DTasks.value.findIndex(h => h.id === itemId)
  if (imageIndex > -1) {
    imageTo3DTasks.value.splice(imageIndex, 1)
    showNotification('历史记录已删除', 'success')
    return
  }
  
  showNotification('未找到要删除的记录', 'error')
}

const clearHistory = () => {
  textTo3DTasks.value = []
  imageTo3DTasks.value = []
  showNotification('历史记录已清空', 'success')
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
  
  // 加载历史数据
  loadHistoryData()
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