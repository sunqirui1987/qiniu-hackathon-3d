import { ref, computed } from 'vue'
import { useStudioStore } from '@/stores/studio'
import { GenerationService, type GenerationProgress, type GenerationResult } from '@/services/generationService'
import type { 
  TextTo3DOptions, 
  ImageTo3DOptions, 
  RetopologyOptions, 
  TextureOptions 
} from '@/types/model'
import { GENERATION_STATUS } from '@/constants'

export function useGeneration() {
  const studioStore = useStudioStore()
  
  // 当前生成任务ID
  const currentTaskId = ref<string | null>(null)
  
  // 计算属性
  const isGenerating = computed(() => 
    studioStore.isGenerating || studioStore.isProcessing
  )
  
  const generationProgress = computed(() => studioStore.generationProgress)
  const generationStatus = computed(() => studioStore.generationStatus)
  
  // 进度回调处理
  const handleProgress = (progress: GenerationProgress) => {
    studioStore.updateGenerationProgress(progress.progress)
    studioStore.updateGenerationStatus(progress.status)
    
    if (progress.taskId) {
      currentTaskId.value = progress.taskId
    }
    
    if (progress.error) {
      console.error('Generation error:', progress.error)
    }
  }
  
  // 文本生成3D
  const generateFromText = async (prompt: string): Promise<GenerationResult> => {
    if (!prompt.trim()) {
      throw new Error('请输入文本描述')
    }
    
    studioStore.setGenerating(true)
    studioStore.updateGenerationStatus(GENERATION_STATUS.GENERATING)
    
    try {
      const options: TextTo3DOptions = {
        prompt: prompt.trim(),
        ...studioStore.textOptions
      }
      
      const result = await GenerationService.generateFromText(options, handleProgress)
      
      if (result.success) {
        // 重新加载历史数据
        await loadHistory()
      }
      
      return result
      
    } finally {
      studioStore.setGenerating(false)
      studioStore.updateGenerationStatus(GENERATION_STATUS.IDLE)
    }
  }
  
  // 图片生成3D
  const generateFromImage = async (image: File | string): Promise<GenerationResult> => {
    if (!image) {
      throw new Error('请选择图片')
    }
    
    studioStore.setGenerating(true)
    studioStore.updateGenerationStatus(GENERATION_STATUS.GENERATING)
    
    try {
      const options: ImageTo3DOptions = {
        image,
        ...studioStore.imageOptions
      }
      
      const result = await GenerationService.generateFromImage(options, handleProgress)
      
      if (result.success) {
        // 重新加载历史数据
        await loadHistory()
      }
      
      return result
      
    } finally {
      studioStore.setGenerating(false)
      studioStore.updateGenerationStatus(GENERATION_STATUS.IDLE)
    }
  }
  
  // 重拓扑处理
  const processRetopology = async (inputOptions?: RetopologyOptions): Promise<GenerationResult> => {
    // 使用传入的选项或store中的选项
    const options = inputOptions || studioStore.retopologyOptions
    
    if (!options.task_id && !options.model_url) {
      throw new Error('请选择要处理的模型')
    }
    
    studioStore.setProcessing(true)
    studioStore.updateGenerationStatus(GENERATION_STATUS.GENERATING)
    
    try {
      const result = await GenerationService.processRetopology(
        options as RetopologyOptions, 
        handleProgress
      )
      
      if (result.success) {
        // 重新加载历史数据
        await loadHistory()
      }
      
      return result
      
    } finally {
      studioStore.setProcessing(false)
      studioStore.updateGenerationStatus(GENERATION_STATUS.IDLE)
    }
  }
  
  // 纹理生成
  const generateTexture = async (prompt?: string, inputOptions?: TextureOptions): Promise<GenerationResult> => {
    // 使用传入的选项或store中的选项
    const options = inputOptions || studioStore.textureOptions
    
    // 如果传入了prompt，更新选项中的texture_prompt
    if (prompt) {
      options.texture_prompt = prompt
    }
    
    if (!options.task_id && !options.model_url) {
      throw new Error('请选择要处理的模型')
    }
    
    if (options.texture_input_type === 'text_prompt' && !options.texture_prompt) {
      throw new Error('请输入纹理描述')
    }
    
    if (options.texture_input_type === 'reference_image' && !options.reference_image) {
      throw new Error('请选择参考图片')
    }
    
    studioStore.setProcessing(true)
    studioStore.updateGenerationStatus(GENERATION_STATUS.GENERATING)
    
    try {
      const result = await GenerationService.generateTexture(
        options as TextureOptions, 
        handleProgress
      )
      
      if (result.success) {
        // 重新加载历史数据
        await loadHistory()
      }
      
      return result
      
    } finally {
      studioStore.setProcessing(false)
      studioStore.updateGenerationStatus(GENERATION_STATUS.IDLE)
    }
  }
  
  // 取消当前任务
  const cancelGeneration = async (): Promise<boolean> => {
    if (!currentTaskId.value) {
      return false
    }
    
    const success = await GenerationService.cancelTask(currentTaskId.value)
    
    if (success) {
      studioStore.resetGenerationState()
      currentTaskId.value = null
    }
    
    return success
  }
  
  // 加载历史任务
  const loadHistory = async (): Promise<void> => {
    studioStore.setLoadingHistory(true)
    
    try {
      const tasks = await GenerationService.getTaskHistory()
      studioStore.setHistoryTasks(tasks as any)
      
      // 设置可用任务（已完成的任务）
      const availableTasks = tasks.filter(task => task.status === 'SUCCEEDED')
      studioStore.setAvailableTasks(availableTasks as any)
      
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      studioStore.setLoadingHistory(false)
    }
  }
  
  // 刷新任务状态
  const refreshTaskStatus = async (taskId: string): Promise<void> => {
    try {
      const task = await GenerationService.getTaskStatus(taskId)
      if (task) {
        studioStore.updateHistoryTask(taskId, task as any)
      }
    } catch (error) {
      console.error('Failed to refresh task status:', error)
    }
  }
  
  return {
    // 状态
    isGenerating,
    generationProgress,
    generationStatus,
    currentTaskId,
    
    // 方法
    generateFromText,
    generateFromImage,
    processRetopology,
    generateTexture,
    cancelGeneration,
    loadHistory,
    refreshTaskStatus
  }
}