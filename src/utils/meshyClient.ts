import axios, { AxiosInstance, AxiosError } from 'axios'

export interface MeshyTextTo3DPreviewOptions {
  mode: 'preview'
  prompt: string
  negative_prompt?: string
  art_style?: 'realistic' | 'sculpture'
  ai_model?: 'meshy-4' | 'meshy-5' | 'latest'
  topology?: 'triangle' | 'quad'
  target_polycount?: number
  should_remesh?: boolean
  symmetry_mode?: 'off' | 'auto' | 'on'
  is_a_t_pose?: boolean
  seed?: number
  moderation?: boolean
}

export interface MeshyTextTo3DRefineOptions {
  mode: 'refine'
  preview_task_id: string
  enable_pbr?: boolean
  texture_prompt?: string
  texture_image_url?: string
}

export interface MeshyImageTo3DOptions {
  image_url: string
  ai_model?: 'latest'
  topology?: 'triangle' | 'quad'
  target_polycount?: number
  symmetry_mode?: 'auto' | 'off' | 'on'
  should_remesh?: boolean
  should_texture?: boolean
  enable_pbr?: boolean
  is_a_t_pose?: boolean
  texture_prompt?: string
  moderation?: boolean
}

export interface MeshyTaskResponse {
  result: string
}

export interface MeshyTaskStatus {
  id: string
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED'
  progress: number
  model_urls?: {
    glb?: string
    fbx?: string
    obj?: string
    usdz?: string
    mtl?: string
  }
  thumbnail_url?: string
  created_at: string
  finished_at?: string
  error?: string
}

export interface MeshyApiError {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

export class MeshyClient {
  private client: AxiosInstance
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.client = axios.create({
      baseURL: 'https://api.meshy.ai',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<MeshyApiError>) => {
        return Promise.reject(this.handleError(error))
      }
    )
  }

  private handleError(error: AxiosError<MeshyApiError>): Error {
    if (error.response?.data?.error) {
      const { code, message, details } = error.response.data.error
      return new Error(`Meshy API Error [${code}]: ${message}${details ? ` - ${JSON.stringify(details)}` : ''}`)
    }

    if (error.code === 'ECONNABORTED') {
      return new Error('Request timeout - please try again')
    }

    if (error.response?.status === 401) {
      return new Error('Invalid API key - please check your authentication')
    }

    if (error.response?.status === 402) {
      return new Error('Insufficient credits - please top up your account')
    }

    if (error.response?.status === 429) {
      return new Error('Rate limit exceeded - please try again later')
    }

    return new Error(error.message || 'Unknown error occurred')
  }

  async createTextTo3DPreview(options: Omit<MeshyTextTo3DPreviewOptions, 'mode'>): Promise<MeshyTaskResponse> {
    const response = await this.client.post<MeshyTaskResponse>('/openapi/v2/text-to-3d', {
      mode: 'preview',
      ...options,
    })
    return response.data
  }

  async createTextTo3DRefine(options: Omit<MeshyTextTo3DRefineOptions, 'mode'>): Promise<MeshyTaskResponse> {
    const response = await this.client.post<MeshyTaskResponse>('/openapi/v2/text-to-3d', {
      mode: 'refine',
      ...options,
    })
    return response.data
  }

  async getTextTo3DTaskStatus(taskId: string): Promise<MeshyTaskStatus> {
    const response = await this.client.get<MeshyTaskStatus>(`/openapi/v2/text-to-3d/${taskId}`)
    return response.data
  }

  async createImageTo3D(options: MeshyImageTo3DOptions): Promise<MeshyTaskResponse> {
    const response = await this.client.post<MeshyTaskResponse>('/openapi/v1/image-to-3d', options)
    return response.data
  }

  async getImageTo3DTaskStatus(taskId: string): Promise<MeshyTaskStatus> {
    const response = await this.client.get<MeshyTaskStatus>(`/openapi/v1/image-to-3d/${taskId}`)
    return response.data
  }

  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await this.client.post<{ url: string; filename: string }>(
      '/web/v1/files/images?skipNameGeneration',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  }

  async pollTaskUntilComplete(
    taskId: string,
    taskType: 'text-to-3d' | 'image-to-3d',
    options: {
      maxAttempts?: number
      pollInterval?: number
      onProgress?: (progress: number, status: MeshyTaskStatus) => void
    } = {}
  ): Promise<MeshyTaskStatus> {
    const { maxAttempts = 120, pollInterval = 5000, onProgress } = options

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status =
        taskType === 'text-to-3d'
          ? await this.getTextTo3DTaskStatus(taskId)
          : await this.getImageTo3DTaskStatus(taskId)

      if (onProgress) {
        onProgress(status.progress, status)
      }

      if (status.status === 'SUCCEEDED') {
        return status
      }

      if (status.status === 'FAILED') {
        throw new Error(`Task failed: ${status.error || 'Unknown error'}`)
      }

      if (status.status === 'EXPIRED') {
        throw new Error('Task expired')
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval))
    }

    throw new Error('Task polling timeout - maximum attempts reached')
  }

  async retryWithBackoff<T>(
    fn: () => Promise<T>,
    options: {
      maxRetries?: number
      initialDelay?: number
      maxDelay?: number
      backoffMultiplier?: number
    } = {}
  ): Promise<T> {
    const { maxRetries = 3, initialDelay = 1000, maxDelay = 10000, backoffMultiplier = 2 } = options

    let lastError: Error | undefined

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (attempt === maxRetries - 1) {
          break
        }

        const delay = Math.min(initialDelay * Math.pow(backoffMultiplier, attempt), maxDelay)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    throw new Error(`Max retries (${maxRetries}) exceeded. Last error: ${lastError?.message}`)
  }
}

export default MeshyClient
