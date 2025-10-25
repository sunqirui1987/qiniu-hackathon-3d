import { ref, computed } from 'vue'
import { MeshyClient, MeshyTextTo3DPreviewOptions, MeshyTaskStatus } from '../utils/meshyClient'
import type { Model3D } from '../types/model'

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
  
  const status = ref<'idle' | 'generating' | 'completed' | 'error'>('idle')
  const progress = ref<number>(0)
  const error = ref<string | null>(null)
  const result = ref<Model3D | null>(null)
  const previewTaskId = ref<string | null>(null)
  const refineTaskId = ref<string | null>(null)
  
  const isGenerating = computed(() => status.value === 'generating')
  const isCompleted = computed(() => status.value === 'completed')
  const hasError = computed(() => status.value === 'error')

  const generateModel = async (options: TextTo3DOptions): Promise<Model3D> => {
    try {
      status.value = 'generating'
      progress.value = 0
      error.value = null
      result.value = null
      previewTaskId.value = null
      refineTaskId.value = null

      const previewOptions: Omit<MeshyTextTo3DPreviewOptions, 'mode'> = {
        prompt: options.prompt,
        negative_prompt: options.negative_prompt,
        art_style: options.artStyle,
        ai_model: options.aiModel,
        topology: options.topology,
        target_polycount: options.targetPolycount,
        should_remesh: options.shouldRemesh,
        symmetry_mode: options.symmetryMode,
        is_a_t_pose: options.isATPose,
        seed: options.seed,
      }

      const previewResponse = await client.createTextTo3DPreview(previewOptions)
      previewTaskId.value = previewResponse.result

      const previewStatus = await client.pollTaskUntilComplete(
        previewResponse.result,
        'text-to-3d',
        {
          onProgress: (taskProgress) => {
            progress.value = taskProgress * 0.5
          },
        }
      )

      const refineResponse = await client.createTextTo3DRefine({
        preview_task_id: previewStatus.id,
        enable_pbr: options.enablePBR,
        texture_prompt: options.texturePrompt,
      })
      refineTaskId.value = refineResponse.result

      const refineStatus = await client.pollTaskUntilComplete(
        refineResponse.result,
        'text-to-3d',
        {
          onProgress: (taskProgress) => {
            progress.value = 50 + taskProgress * 0.5
          },
        }
      )

      const model = convertTaskToModel(refineStatus, options.prompt)
      result.value = model
      status.value = 'completed'
      progress.value = 100

      return model
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      error.value = errorMessage
      status.value = 'error'
      throw new Error(errorMessage)
    }
  }

  const reset = () => {
    status.value = 'idle'
    progress.value = 0
    error.value = null
    result.value = null
    previewTaskId.value = null
    refineTaskId.value = null
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
    isGenerating,
    isCompleted,
    hasError,
    generateModel,
    reset,
  }
}
