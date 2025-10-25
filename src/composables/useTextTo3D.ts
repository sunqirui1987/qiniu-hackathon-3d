import { ref, computed } from 'vue'
import { MeshyClient, MeshyTextTo3DOptions, MeshyTaskStatus } from '../utils/meshyClient'
import type { Model3D } from '../types/model'
import { getUserFriendlyErrorMessage } from '../utils/errorHandler'

export interface TextTo3DOptions {
  prompt: string
  negative_prompt?: string
  artStyle?: 'realistic' | 'sculpture'
  aiModel?: 'meshy-4' | 'meshy-5' | 'latest'
  topology?: 'triangle' | 'quad'
  targetPolycount?: number
  shouldRemesh?: boolean
  symmetryMode?: 'off' | 'auto' | 'on'
  isATPose?: boolean
  seed?: number
  enablePBR?: boolean
  texturePrompt?: string
}

export interface TextTo3DState {
  status: 'idle' | 'generating' | 'completed' | 'error'
  progress: number
  previewTaskId: string | null
  refineTaskId: string | null
  error: string | null
  result: Model3D | null
}

export function useTextTo3D(apiKey: string) {
  const client = new MeshyClient(apiKey)
  
  const status = ref<'idle' | 'generating' | 'completed' | 'error' | 'cancelled'>('idle')
  const progress = ref<number>(0)
  const error = ref<string | null>(null)
  const result = ref<Model3D | null>(null)
  const previewTaskId = ref<string | null>(null)
  const refineTaskId = ref<string | null>(null)
  const retryCount = ref<number>(0)
  
  const isGenerating = computed(() => status.value === 'generating')
  const isCompleted = computed(() => status.value === 'completed')
  const hasError = computed(() => status.value === 'error')
  const isCancelled = computed(() => status.value === 'cancelled')

  const generateModel = async (options: TextTo3DOptions): Promise<Model3D> => {
    try {
      status.value = 'generating'
      progress.value = 0
      error.value = null
      result.value = null
      previewTaskId.value = null
      refineTaskId.value = null

      // 转换参数格式以匹配新的 API
      const createOptions: MeshyTextTo3DOptions = {
        prompt: options.prompt,
        negative_prompt: options.negative_prompt,
        art_style: options.artStyle,
        ai_model: options.aiModel,
        license: 'private',
        is_a_t_pose: options.isATPose,
        symmetry_mode: options.symmetryMode === 'off' ? 0 : options.symmetryMode === 'auto' ? 1 : 2,
        seed: options.seed,
      }

      // 创建 3D 模型任务
      const taskResponse = await client.createTextTo3D(createOptions)
      previewTaskId.value = taskResponse.result

      // 等待任务完成
      const taskStatus = await client.pollTaskUntilComplete(
        taskResponse.result,
        {
          onProgress: (taskProgress: number) => {
            progress.value = taskProgress
          },
        }
      )

      // 如果需要纹理，创建纹理任务
      if (options.enablePBR || options.texturePrompt) {
        const textureResponse = await client.createTexture({
          parent: taskStatus.id,
          prompt: options.texturePrompt,
          art_style: options.artStyle,
          enable_pbr: options.enablePBR,
        })
        refineTaskId.value = textureResponse.result

        const textureStatus = await client.pollTaskUntilComplete(
          textureResponse.result,
          {
            onProgress: (taskProgress: number) => {
              progress.value = 50 + taskProgress * 0.5
            },
          }
        )

        const model = convertTaskToModel(textureStatus, options.prompt)
        result.value = model
        status.value = 'completed'
        progress.value = 100
        return model
      } else {
        const model = convertTaskToModel(taskStatus, options.prompt)
        result.value = model
        status.value = 'completed'
        progress.value = 100
        return model
      }
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err)
      error.value = errorMessage
      status.value = 'error'
      throw new Error(errorMessage)
    }
  }

  const cancel = () => {
    if (!isGenerating.value) return

    if (previewTaskId.value) {
      client.cancelTask(previewTaskId.value)
    }
    if (refineTaskId.value) {
      client.cancelTask(refineTaskId.value)
    }

    status.value = 'cancelled'
    error.value = 'Generation cancelled by user'
  }

  const retry = async (options: TextTo3DOptions): Promise<Model3D> => {
    retryCount.value++
    return generateModel(options)
  }

  const reset = () => {
    status.value = 'idle'
    progress.value = 0
    error.value = null
    result.value = null
    previewTaskId.value = null
    refineTaskId.value = null
    retryCount.value = 0
  }

  const convertTaskToModel = (taskStatus: MeshyTaskStatus, prompt: string): Model3D => {
    const url = taskStatus.model_urls?.glb || taskStatus.model_urls?.obj || ''
    
    return {
      id: taskStatus.id,
      name: prompt.substring(0, 50),
      url,
      format: 'glb',
      createdAt: new Date(taskStatus.created_at),
      updatedAt: new Date(taskStatus.finished_at || taskStatus.created_at),
      thumbnail: taskStatus.thumbnail_url,
    }
  }

  return {
    status,
    progress,
    error,
    result,
    previewTaskId,
    refineTaskId,
    retryCount,
    isGenerating,
    isCompleted,
    hasError,
    isCancelled,
    generateModel,
    cancel,
    retry,
    reset,
  }
}
