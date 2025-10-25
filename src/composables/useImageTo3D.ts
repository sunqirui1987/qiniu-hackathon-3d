import { ref, computed } from 'vue'
import { MeshyClient, MeshyImageTo3DOptions, MeshyTaskStatus } from '../utils/meshyClient'
import type { Model3D } from '../types/model'

export interface ImageTo3DOptions {
  image: File | string
  aiModel?: 'latest'
  topology?: 'triangle' | 'quad'
  targetPolycount?: number
  symmetryMode?: 'auto' | 'off' | 'on'
  shouldRemesh?: boolean
  shouldTexture?: boolean
  enablePBR?: boolean
  isATPose?: boolean
  texturePrompt?: string
}

export function useImageTo3D(apiKey: string) {
  const client = new MeshyClient(apiKey)
  
  const status = ref<'idle' | 'uploading' | 'generating' | 'completed' | 'error'>('idle')
  const progress = ref<number>(0)
  const error = ref<string | null>(null)
  const result = ref<Model3D | null>(null)
  const taskId = ref<string | null>(null)
  const uploadedImageUrl = ref<string | null>(null)
  
  const isUploading = computed(() => status.value === 'uploading')
  const isGenerating = computed(() => status.value === 'generating')
  const isCompleted = computed(() => status.value === 'completed')
  const hasError = computed(() => status.value === 'error')

  const generateFromImage = async (options: ImageTo3DOptions): Promise<Model3D> => {
    try {
      status.value = 'uploading'
      progress.value = 0
      error.value = null
      result.value = null
      taskId.value = null
      uploadedImageUrl.value = null

      let imageUrl: string

      if (typeof options.image === 'string') {
        imageUrl = options.image
        uploadedImageUrl.value = imageUrl
      } else {
        const uploadResponse = await client.uploadImage(options.image)
        imageUrl = uploadResponse.url
        uploadedImageUrl.value = imageUrl
      }

      status.value = 'generating'
      progress.value = 10

      const createOptions: MeshyImageTo3DOptions = {
        image_url: imageUrl,
        ai_model: options.aiModel,
        topology: options.topology,
        target_polycount: options.targetPolycount,
        symmetry_mode: options.symmetryMode,
        should_remesh: options.shouldRemesh,
        should_texture: options.shouldTexture,
        enable_pbr: options.enablePBR,
        is_a_t_pose: options.isATPose,
        texture_prompt: options.texturePrompt,
      }

      const taskResponse = await client.createImageTo3D(createOptions)
      taskId.value = taskResponse.result

      const taskStatus = await client.pollTaskUntilComplete(
        taskResponse.result,
        'image-to-3d',
        {
          onProgress: (taskProgress) => {
            progress.value = 10 + taskProgress * 0.9
          },
        }
      )

      const imageName = options.image instanceof File ? options.image.name : 'image-to-3d'
      const model = convertTaskToModel(taskStatus, imageName)
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
    taskId.value = null
    uploadedImageUrl.value = null
  }

  const convertTaskToModel = (taskStatus: MeshyTaskStatus, imageName: string): Model3D => {
    const url = taskStatus.model_urls?.glb || taskStatus.model_urls?.obj || ''
    const name = imageName.replace(/\.[^/.]+$/, '')
    
    return {
      id: taskStatus.id,
      name: name.substring(0, 50),
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
    taskId,
    uploadedImageUrl,
    isUploading,
    isGenerating,
    isCompleted,
    hasError,
    generateFromImage,
    reset,
  }
}
