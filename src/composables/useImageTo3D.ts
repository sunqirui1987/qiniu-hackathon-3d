import { ref, computed } from 'vue'
import {  MeshyImageTo3DOptions, meshyClient, type MeshyTaskStatus } from '../utils/meshyClient'
import type { Model3D } from '../types/model'
import { getUserFriendlyErrorMessage } from '../utils/errorHandler'

// 将 File 对象转换为 base64 字符串
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

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

export function useImageTo3D() {
  const client = meshyClient
  
  const status = ref<'idle' | 'uploading' | 'generating' | 'completed' | 'error' | 'cancelled'>('idle')
  const progress = ref<number>(0)
  const error = ref<string | null>(null)
  const result = ref<Model3D | null>(null)
  const taskId = ref<string | null>(null)
  const uploadedImageUrl = ref<string | null>(null)
  const retryCount = ref<number>(0)
  
  const isUploading = computed(() => status.value === 'uploading')
  const isGenerating = computed(() => status.value === 'generating')
  const isCompleted = computed(() => status.value === 'completed')
  const hasError = computed(() => status.value === 'error')
  const isCancelled = computed(() => status.value === 'cancelled')

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
        // 支持 URL 或 base64 格式
        imageUrl = options.image
        uploadedImageUrl.value = imageUrl
      } else {
        // 将 File 对象转换为 base64
        const base64 = await fileToBase64(options.image)
        imageUrl = base64
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
      const errorMessage = getUserFriendlyErrorMessage(err)
      error.value = errorMessage
      status.value = 'error'
      throw new Error(errorMessage)
    }
  }

  const cancel = () => {
    if (!isGenerating.value && !isUploading.value) return

    if (taskId.value) {
      client.cancelTask(taskId.value)
    }

    status.value = 'cancelled'
    error.value = 'Generation cancelled by user'
  }

  const retry = async (options: ImageTo3DOptions): Promise<Model3D> => {
    retryCount.value++
    return generateFromImage(options)
  }

  const reset = () => {
    status.value = 'idle'
    progress.value = 0
    error.value = null
    result.value = null
    taskId.value = null
    uploadedImageUrl.value = null
    retryCount.value = 0
  }

  const convertTaskToModel = (taskStatus: MeshyTaskStatus, imageName: string): Model3D => {
    const url = taskStatus.model_urls?.glb || taskStatus.model_urls?.obj || ''
    // 使用代理 URL 避免 CORS 问题
    const proxiedUrl = meshyClient.getProxiedAssetUrl(url)
    const name = imageName.replace(/\.[^/.]+$/, '')
    
    return {
      id: taskStatus.id,
      name: name.substring(0, 50),
      url: proxiedUrl,
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
    retryCount,
    isUploading,
    isGenerating,
    isCompleted,
    hasError,
    isCancelled,
    generateFromImage,
    cancel,
    retry,
    reset,
  }
}
