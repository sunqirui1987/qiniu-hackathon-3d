<template>
  <div class="studio-container h-[calc(100vh-4rem)] flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden">
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
      @model-imported="handleModelImported"
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
import { useTextTo3D } from '@/composables/useTextTo3D'
import type { SelectedItem, RetopologyOptions, TextureOptions } from '@/types/model'
import { useImageTo3D } from '@/composables/useImageTo3D'
import { meshyClient } from '@/utils/meshyClient'

// 路由
const route = useRoute()

// Composables
const { generateModel: generateFromText, isGenerating: textGenerating, progress: textProgress, status: textStatus } = useTextTo3D()
const { generateFromImage, isGenerating: imageGenerating, progress: imageProgress, status: imageStatus } = useImageTo3D()

// 响应式数据
const activeTab = ref('text-to-3d')
const activeMainMenu = ref('model')
const historyCategory = ref('all')
const selectedItem = ref<SelectedItem | null>(null) // 当前选中的历史项目对象

// Meshy API 任务列表
const textTo3DTasks = ref([])
const imageTo3DTasks = ref([])
const allHistoryTasks = ref([])
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
const retopologyOptions = reactive<RetopologyOptions>({
  input_source: 'existing_task',
  task_id: '',
  model_url: '',
  topology: 'triangle',
  target_polycount: 30000,
  quality: 'medium',
  preserve_boundaries: true,
  preserve_uv: false
})

// 贴图生成相关
const texturePrompt = ref('')
const textureOptions = reactive({
  input_source: 'existing_task',
  task_id: '',
  model_url: '',
  texture_prompt: '',
  texture_type: 'diffuse',
  resolution: '1024',
  quality: 'standard',
  seamless: false,
  preserve_uv: true,
  generate_normal: false
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

// 合并所有可用任务供重拓扑和贴图使用
const availableTasks = computed(() => {
  const allTasks = [...textTo3DTasks.value, ...imageTo3DTasks.value]
  return allTasks.map(task => ({
    id: task.id,
    name: task.prompt || task.name || `任务 ${task.id}`,
    created_at: new Date(task.created_at).toLocaleDateString()
  }))
})

// 方法
const loadHistoryData = async () => {
  isLoadingHistory.value = true
  try {
    const allTasks = await meshyClient.getAllTasks()
    
    console.log('🚀 Studio.vue - 原始API数据:')
    console.log('allTasks from API:', allTasks)
    
    // 合并所有任务到一个数组中
    const combinedTasks = [
      ...allTasks.textTo3D.map(task => ({ ...task, type: 'text-to-3d' })),
      ...allTasks.imageTo3D.map(task => ({ ...task, type: 'image-to-3d' })),
      ...(allTasks.remesh || []).map(task => ({ ...task, type: 'remesh' })),
      ...(allTasks.retexture || []).map(task => ({ ...task, type: 'retexture' }))
    ]
    
    // 按创建时间排序（最新的在前）
    allHistoryTasks.value = combinedTasks.sort((a, b) => b.created_at - a.created_at)
    
    // 保持原有的分类数据（为了兼容性）
    textTo3DTasks.value = allTasks.textTo3D.map(task => ({ ...task, type: 'text-to-3d' }))
    imageTo3DTasks.value = allTasks.imageTo3D.map(task => ({ ...task, type: 'image-to-3d' }))
    
    console.log('🎯 Studio.vue - 处理后的数据:')
    console.log('allHistoryTasks.value:', allHistoryTasks.value)
    console.log('historyCategory.value:', historyCategory.value)
    
    console.log('历史数据加载成功:', { 
      totalTasks: allHistoryTasks.value.length,
      textTasks: allTasks.textTo3D.length, 
      imageTasks: allTasks.imageTo3D.length,
      remeshTasks: allTasks.remesh?.length || 0,
      retextureTasks: allTasks.retexture?.length || 0
    })
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
      targetPolycount: parseInt(options.target_polycount),
      shouldRemesh: options.should_remesh,
      isATPose: options.is_a_t_pose,
      symmetryMode: 'auto',
      enablePBR: false,
    }
    
    const result = await generateFromText(textTo3DOptions)
    if (result) {
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
      showNotification('3D模型生成成功！', 'success')
      // 重新加载历史数据以获取最新的任务
      await loadHistoryData()
    }
  } catch (error) {
    console.error('Image to 3D generation failed:', error)
    showNotification('生成失败，请重试', 'error')
  }
}

const handleRetopology = async (options: RetopologyOptions) => {
  // 验证输入参数
  if (!options) {
    showNotification('重拓扑参数无效', 'error')
    return
  }

  // 检查是否有有效的输入源
  const hasTaskId = options.task_id && options.task_id.trim() !== ''
  const hasModelUrl = options.model_url && options.model_url.trim() !== ''
  const hasSelectedItem = selectedItem.value?.id

  if (!hasTaskId && !hasModelUrl && !hasSelectedItem) {
    showNotification('请先选择一个模型或任务', 'error')
    return
  }
  
  isProcessing.value = true
  try {
    // 构造重拓扑参数，符合 RetopologyOptions 接口
    const remeshOptions: RetopologyOptions = {
      // 优先使用 task_id，其次使用 selectedItem.id，最后使用 model_url
      input_task_id: hasTaskId ? options.task_id : (hasSelectedItem ? selectedItem.value!.id : undefined),
      model_url: hasModelUrl ? options.model_url : undefined,
      target_formats: ['glb', 'obj'],
      topology: options.topology || 'triangle',
      target_polycount: options.target_polycount || 30000,
      resize_height: options.resize_height,
      origin_at: options.origin_at || 'bottom',
      convert_format_only: options.convert_format_only || false
    }

    console.log('开始重拓扑处理:', remeshOptions)
    
    // 验证必需参数
    if (!remeshOptions.input_task_id && !remeshOptions.model_url) {
      throw new Error('必须提供 input_task_id 或 model_url 中的一个')
    }
    
    // 创建重拓扑任务
    const taskResponse = await meshyClient.createRemesh(remeshOptions)
    console.log('重拓扑任务创建成功:', taskResponse)
    
    showNotification('重拓扑任务已创建，正在处理中...', 'success')
    
    // 轮询任务状态直到完成
    const finalStatus = await meshyClient.pollTaskUntilComplete(
      taskResponse.result,
      'remesh',
      {
        maxAttempts: 120,
        pollInterval: 5000,
        onProgress: (progress, status) => {
          console.log(`重拓扑进度: ${progress}%`, status)
        }
      }
    )
    
    console.log('重拓扑完成:', finalStatus)
    
    if (finalStatus.model_urls?.glb) {
      showNotification('重拓扑完成！模型已更新', 'success')
    } else {
      showNotification('重拓扑完成，但未获取到模型文件', 'error')
    }
    
    // 刷新历史数据
    await loadHistoryData()
    
  } catch (error: any) {
    console.error('Retopology failed:', error)
    showNotification(`重拓扑失败: ${error?.message || '未知错误'}`, 'error')
  } finally {
    isProcessing.value = false
  }
}

const handleTextureGeneration = async (prompt: string, options: TextureOptions) => {
  // 验证输入参数
  if (!options) {
    showNotification('贴图生成参数无效', 'error')
    return
  }

  // 检查是否有有效的输入源
  const hasTaskId = options.task_id && options.task_id.trim() !== ''
  const hasModelUrl = options.model_url && options.model_url.trim() !== ''
  const hasSelectedItem = selectedItem.value?.id

  if (!hasTaskId && !hasModelUrl && !hasSelectedItem) {
    showNotification('请先选择一个模型或任务', 'error')
    return
  }
  
  isProcessing.value = true
  try {
    // 根据纹理输入类型决定使用文字提示还是图片
    let textStylePrompt: string | undefined = undefined
    let imageStyleUrl: string | undefined = undefined

    if (options.texture_input_type === 'text_prompt') {
      // 使用文字描述
      textStylePrompt = prompt || options.texture_prompt || ''
      if (!textStylePrompt.trim()) {
        throw new Error('使用文字描述模式时，必须提供纹理描述')
      }
    } else if (options.texture_input_type === 'reference_image') {
      // 使用参考图片
      if (!options.reference_image) {
        throw new Error('使用图片参考模式时，必须上传参考图片')
      }
      
      // 确保 reference_image 是正确的 Data URI 格式
      if (!options.reference_image.startsWith('data:image/')) {
        throw new Error('参考图片必须是有效的 Data URI 格式')
      }
      
      imageStyleUrl = options.reference_image
    } else {
      throw new Error('必须选择纹理输入方式：文字描述或参考图片')
    }

    // 构造贴图生成参数
    const retextureOptions = {
      // 优先使用 task_id，其次使用 selectedItem.id，最后使用 model_url
      input_task_id: hasTaskId ? options.task_id : (hasSelectedItem ? selectedItem.value!.id : undefined),
      model_url: hasModelUrl ? options.model_url : undefined,
      text_style_prompt: textStylePrompt,
      image_style_url: imageStyleUrl,
      ai_model: options.ai_model || 'meshy-4',
      enable_original_uv: options.enable_original_uv !== false,
      enable_pbr: options.enable_pbr !== false
    }

    // 验证必需参数
    if (!retextureOptions.input_task_id && !retextureOptions.model_url) {
      throw new Error('必须提供 input_task_id 或 model_url 中的一个')
    }

    // 验证 text_style_prompt 和 image_style_url 互斥
    if (!retextureOptions.text_style_prompt && !retextureOptions.image_style_url) {
      throw new Error('必须提供 text_style_prompt 或 image_style_url 中的一个')
    }

    if (retextureOptions.text_style_prompt && retextureOptions.image_style_url) {
      throw new Error('text_style_prompt 和 image_style_url 不能同时提供')
    }

    console.log('开始贴图生成:', retextureOptions)
    
    // 创建贴图生成任务
    const taskResponse = await meshyClient.createRetexture(retextureOptions)
    console.log('贴图生成任务创建成功:', taskResponse)
    
    showNotification('贴图生成任务已创建，正在处理中...', 'success')
    
    // 轮询任务状态直到完成
    const finalStatus = await meshyClient.pollTaskUntilComplete(
      taskResponse.result,
      'retexture',
      {
        maxAttempts: 120,
        pollInterval: 5000,
        onProgress: (progress, status) => {
          console.log(`贴图生成进度: ${progress}%`, status)
          showNotification(`贴图生成进度: ${progress}%`, 'success')
        }
      }
    )
    
    console.log('贴图生成完成:', finalStatus)
    
    if (finalStatus.model_urls?.glb) {
      showNotification('贴图生成完成！模型已更新', 'success')
    } else {
      showNotification('贴图生成完成，但未获取到模型文件', 'error')
    }
    
    // 如果有贴图URL，也可以显示相关信息
    if (finalStatus.texture_urls && finalStatus.texture_urls.length > 0) {
      console.log('生成的贴图:', finalStatus.texture_urls)
      showNotification(`贴图生成完成！生成了 ${finalStatus.texture_urls.length} 个贴图文件`, 'success')
    }
    
    // 刷新历史数据
    await loadHistoryData()
    
  } catch (error) {
    console.error('Texture generation failed:', error)
    showNotification(`贴图生成失败: ${error.message}`, 'error')
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
  // 从统一的历史任务列表中删除
  const allIndex = allHistoryTasks.value.findIndex(h => h.id === itemId)
  if (allIndex > -1) {
    allHistoryTasks.value.splice(allIndex, 1)
    showNotification('历史记录已删除', 'success')
  }
  
  // 从文本生成任务中删除（保持兼容性）
  const textIndex = textTo3DTasks.value.findIndex(h => h.id === itemId)
  if (textIndex > -1) {
    textTo3DTasks.value.splice(textIndex, 1)
  }
  
  // 从图片生成任务中删除（保持兼容性）
  const imageIndex = imageTo3DTasks.value.findIndex(h => h.id === itemId)
  if (imageIndex > -1) {
    imageTo3DTasks.value.splice(imageIndex, 1)
  }
  
  if (allIndex === -1) {
    showNotification('未找到要删除的记录', 'error')
  }
}

const clearHistory = () => {
  allHistoryTasks.value = []
  textTo3DTasks.value = []
  imageTo3DTasks.value = []
  selectedItemId.value = '' // 清除选中状态
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
  // 如果URL中有模型参数，直接加载
  if (route.query.model) {
    selectedItem.value = {
      url: route.query.model as string,
      type: 'external',
      created_at: new Date().toISOString()
    }
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