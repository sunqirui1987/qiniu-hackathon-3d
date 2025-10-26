import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import type { 
  SelectedItem, 
  StudioState, 
  GenerationOptions,
  TextTo3DOptions,
  ImageTo3DOptions,
  RetopologyOptions,
  TextureOptions,
  MeshyTaskItem
} from '@/types/model'
import { 
  STUDIO_TABS, 
  MAIN_MENUS, 
  HISTORY_CATEGORIES, 
  GENERATION_STATUS,
  DEFAULT_CONFIG
} from '@/constants'

export const useStudioStore = defineStore('studio', () => {
  // 基础状态
  const activeTab = ref(STUDIO_TABS.TEXT_TO_3D)
  const activeMainMenu = ref(MAIN_MENUS.MODEL)
  const historyCategory = ref(HISTORY_CATEGORIES.ALL)
  const selectedItem = ref<SelectedItem | null>(null)
  
  // 加载状态
  const isPageLoading = ref(true)
  const isGenerating = ref(false)
  const isProcessing = ref(false)
  const isLoadingHistory = ref(false)
  
  // 生成进度和状态
  const generationProgress = ref(0)
  const generationStatus = ref(GENERATION_STATUS.IDLE)
  
  // 输入数据
  const textPrompt = ref('')
  const selectedImage = ref('')
  const texturePrompt = ref('')
  
  // 生成选项
  const textOptions = reactive<Partial<TextTo3DOptions>>({
    ai_model: DEFAULT_CONFIG.TEXT_TO_3D.AI_MODEL,
    topology: DEFAULT_CONFIG.TEXT_TO_3D.TOPOLOGY,
    target_polycount: DEFAULT_CONFIG.TEXT_TO_3D.TARGET_POLYCOUNT,
    art_style: DEFAULT_CONFIG.TEXT_TO_3D.ART_STYLE,
    enable_pbr: DEFAULT_CONFIG.TEXT_TO_3D.ENABLE_PBR,
    should_remesh: DEFAULT_CONFIG.TEXT_TO_3D.SHOULD_REMESH
  })
  
  const imageOptions = reactive<Partial<ImageTo3DOptions>>({
    ai_model: DEFAULT_CONFIG.IMAGE_TO_3D.AI_MODEL,
    topology: DEFAULT_CONFIG.IMAGE_TO_3D.TOPOLOGY,
    target_polycount: DEFAULT_CONFIG.IMAGE_TO_3D.TARGET_POLYCOUNT,
    should_texture: DEFAULT_CONFIG.IMAGE_TO_3D.SHOULD_TEXTURE,
    enable_pbr: DEFAULT_CONFIG.IMAGE_TO_3D.ENABLE_PBR,
    should_remesh: DEFAULT_CONFIG.IMAGE_TO_3D.SHOULD_REMESH,
    is_a_t_pose: DEFAULT_CONFIG.IMAGE_TO_3D.IS_A_T_POSE
  })
  
  const retopologyOptions = reactive<Partial<RetopologyOptions>>({
    ...DEFAULT_CONFIG.RETOPOLOGY,
    input_source: 'existing_task',
    task_id: '',
    model_url: ''
  })
  
  const textureOptions = reactive<Partial<TextureOptions>>({
    ...DEFAULT_CONFIG.TEXTURE,
    input_source: 'existing_task',
    task_id: '',
    model_url: '',
    texture_input_type: 'text_prompt',
    texture_prompt: '',
    reference_image: '',
    image_description: '',
    texture_type: 'diffuse',
    resolution: '1024'
  })
  
  // 历史数据
  const textTo3DTasks = ref<MeshyTaskItem[]>([])
  const imageTo3DTasks = ref<MeshyTaskItem[]>([])
  const allHistoryTasks = ref<MeshyTaskItem[]>([])
  const availableTasks = ref<MeshyTaskItem[]>([])
  
  // 模型信息
  const modelInfo = ref<any>(null)
  
  // 计算属性
  const studioState = computed<StudioState>(() => ({
    activeTab: activeTab.value,
    activeMainMenu: activeMainMenu.value,
    historyCategory: historyCategory.value,
    selectedItem: selectedItem.value,
    isPageLoading: isPageLoading.value,
    isGenerating: isGenerating.value,
    isProcessing: isProcessing.value,
    generationProgress: generationProgress.value,
    generationStatus: generationStatus.value
  }))
  
  const generationOptions = computed<GenerationOptions>(() => ({
    textOptions: textOptions,
    imageOptions: imageOptions,
    retopologyOptions: retopologyOptions,
    textureOptions: textureOptions
  }))
  
  const filteredHistoryTasks = computed(() => {
    if (historyCategory.value === HISTORY_CATEGORIES.ALL) {
      return allHistoryTasks.value
    }
    // 根据类别过滤任务
    return allHistoryTasks.value.filter(task => {
      // 这里可以根据任务类型或其他属性进行过滤
      return true // 暂时返回所有任务
    })
  })
  
  // Actions
  const setActiveTab = (tab: string) => {
    activeTab.value = tab as any
  }
  
  const setActiveMainMenu = (menu: string) => {
    activeMainMenu.value = menu as any
  }
  
  const setHistoryCategory = (category: string) => {
    historyCategory.value = category as any
  }
  
  const setSelectedItem = (item: SelectedItem | null) => {
    selectedItem.value = item
  }
  
  const setPageLoading = (loading: boolean) => {
    isPageLoading.value = loading
  }
  
  const setGenerating = (generating: boolean) => {
    isGenerating.value = generating
  }
  
  const setProcessing = (processing: boolean) => {
    isProcessing.value = processing
  }
  
  const setLoadingHistory = (loading: boolean) => {
    isLoadingHistory.value = loading
  }
  
  const updateGenerationProgress = (progress: number) => {
    generationProgress.value = progress
  }
  
  const updateGenerationStatus = (status: string) => {
    generationStatus.value = status as any
  }
  
  const setTextPrompt = (prompt: string) => {
    textPrompt.value = prompt
  }
  
  const setSelectedImage = (image: string) => {
    selectedImage.value = image
  }
  
  const setTexturePrompt = (prompt: string) => {
    texturePrompt.value = prompt
  }
  
  const updateTextOptions = (options: Partial<TextTo3DOptions>) => {
    Object.assign(textOptions, options)
  }
  
  const updateImageOptions = (options: Partial<ImageTo3DOptions>) => {
    Object.assign(imageOptions, options)
  }
  
  const updateRetopologyOptions = (options: Partial<RetopologyOptions>) => {
    Object.assign(retopologyOptions, options)
  }
  
  const updateTextureOptions = (options: Partial<TextureOptions>) => {
    Object.assign(textureOptions, options)
  }
  
  const setHistoryTasks = (tasks: MeshyTaskItem[]) => {
    allHistoryTasks.value = tasks
  }
  
  const addHistoryTask = (task: MeshyTaskItem) => {
    allHistoryTasks.value.unshift(task)
  }
  
  const updateHistoryTask = (taskId: string, updates: Partial<MeshyTaskItem>) => {
    const index = allHistoryTasks.value.findIndex(task => task.id === taskId)
    if (index !== -1) {
      Object.assign(allHistoryTasks.value[index], updates)
    }
  }
  
  const setAvailableTasks = (tasks: MeshyTaskItem[]) => {
    availableTasks.value = tasks
  }
  
  const setModelInfo = (info: any) => {
    modelInfo.value = info
  }
  
  // 重置状态
  const resetGenerationState = () => {
    isGenerating.value = false
    isProcessing.value = false
    generationProgress.value = 0
    generationStatus.value = GENERATION_STATUS.IDLE
  }
  
  const resetOptions = () => {
    Object.assign(textOptions, DEFAULT_CONFIG.TEXT_TO_3D)
    Object.assign(imageOptions, DEFAULT_CONFIG.IMAGE_TO_3D)
    Object.assign(retopologyOptions, {
      ...DEFAULT_CONFIG.RETOPOLOGY,
      input_source: 'existing_task',
      task_id: '',
      model_url: ''
    })
    Object.assign(textureOptions, {
      ...DEFAULT_CONFIG.TEXTURE,
      input_source: 'existing_task',
      task_id: '',
      model_url: '',
      texture_input_type: 'text_prompt',
      texture_prompt: '',
      reference_image: '',
      image_description: '',
      texture_type: 'diffuse',
      resolution: '1024'
    })
  }
  
  return {
    // 状态
    activeTab,
    activeMainMenu,
    historyCategory,
    selectedItem,
    isPageLoading,
    isGenerating,
    isProcessing,
    isLoadingHistory,
    generationProgress,
    generationStatus,
    textPrompt,
    selectedImage,
    texturePrompt,
    textOptions,
    imageOptions,
    retopologyOptions,
    textureOptions,
    textTo3DTasks,
    imageTo3DTasks,
    allHistoryTasks,
    availableTasks,
    modelInfo,
    
    // 计算属性
    studioState,
    generationOptions,
    filteredHistoryTasks,
    
    // Actions
    setActiveTab,
    setActiveMainMenu,
    setHistoryCategory,
    setSelectedItem,
    setPageLoading,
    setGenerating,
    setProcessing,
    setLoadingHistory,
    updateGenerationProgress,
    updateGenerationStatus,
    setTextPrompt,
    setSelectedImage,
    setTexturePrompt,
    updateTextOptions,
    updateImageOptions,
    updateRetopologyOptions,
    updateTextureOptions,
    setHistoryTasks,
    addHistoryTask,
    updateHistoryTask,
    setAvailableTasks,
    setModelInfo,
    resetGenerationState,
    resetOptions
  }
})