import axios, { AxiosInstance, AxiosError } from 'axios'

export interface MeshyTextTo3DOptions {
  prompt: string
  negative_prompt?: string
  art_style?: 'realistic' | 'sculpture'
  ai_model?: 'meshy-4' | 'meshy-5' | 'meshy-5.3' | 'latest'
  license?: 'private' | 'public'
  is_a_t_pose?: boolean
  symmetry_mode?: 0 | 1 | 2 // 0: off, 1: auto, 2: on
  seed?: number
  image_ids?: string[]
}

export interface MeshyTextureOptions {
  parent: string // parent task ID
  prompt?: string
  image_id?: string
  art_style?: 'realistic' | 'sculpture'
  ai_model?: 'meshy-5.1' | 'latest'
  enable_pbr?: boolean
}

export interface MeshyImageTo3DOptions {
  image_id: string
  ai_model?: 'latest'
  topology?: 'triangle' | 'quad'
  target_polycount?: number
  symmetry_mode?: 0 | 1 | 2 // 0: off, 1: auto, 2: on
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
  private abortControllers: Map<string, AbortController> = new Map()
  private taskStatusCache: Map<string, { status: MeshyTaskStatus; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 3000

  constructor(apiKey: string) {
    this.apiKey = apiKey
    const serverBaseUrl = import.meta.env.VITE_AUTH_SERVER_URL || 'http://localhost:3001'
    this.client = axios.create({
      baseURL: `${serverBaseUrl}/api/meshy`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config) => {
        // Get auth token from localStorage
        const authToken = localStorage.getItem('auth_token')
        if (authToken) {
          config.headers.Authorization = `Bearer ${authToken}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

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

  async createTextTo3D(options: MeshyTextTo3DOptions): Promise<MeshyTaskResponse> {
    const requestBody = {
      phase: 'draft',
      args: {
        draft: {
          prompt: options.prompt,
          ...(options.negative_prompt && { negativePrompt: options.negative_prompt }),
          ...(options.art_style && { artStyle: options.art_style }),
          ...(options.ai_model && { aiModel: options.ai_model }),
          ...(options.license && { license: options.license }),
          ...(options.is_a_t_pose !== undefined && { isATPose: options.is_a_t_pose }),
          ...(options.symmetry_mode !== undefined && { symmetryMode: options.symmetry_mode }),
          ...(options.seed && { seed: options.seed }),
          ...(options.image_ids && { imageIds: options.image_ids }),
        }
      },
      isNSFW: false
    }
    
    const response = await this.client.post<MeshyTaskResponse>('/web/v2/tasks', requestBody)
    return response.data
  }

  async createTexture(options: MeshyTextureOptions): Promise<MeshyTaskResponse> {
    const requestBody = {
      phase: 'texture',
      parent: options.parent,
      args: {
        texture: {
          ...(options.prompt && { prompt: options.prompt }),
          ...(options.image_id && { imageId: options.image_id }),
          ...(options.art_style && { artStyle: options.art_style }),
          ...(options.ai_model && { aiModel: options.ai_model }),
          ...(options.enable_pbr !== undefined && { enablePBR: options.enable_pbr }),
        }
      },
      isNSFW: false
    }
    
    const response = await this.client.post<MeshyTaskResponse>('/web/v2/tasks', requestBody)
    return response.data
  }

  async getTaskStatus(taskId: string): Promise<MeshyTaskStatus> {
    const cached = this.getCachedTaskStatus(taskId)
    if (cached) {
      return cached
    }

    const response = await this.client.get<MeshyTaskStatus>(`/web/v1/tasks/${taskId}/status`)
    this.cacheTaskStatus(taskId, response.data)
    return response.data
  }

  async createImageTo3D(options: MeshyImageTo3DOptions): Promise<MeshyTaskResponse> {
    const requestBody = {
      phase: 'draft',
      args: {
        draft: {
          imageId: options.image_id,
          ...(options.ai_model && { aiModel: options.ai_model }),
          ...(options.topology && { topology: options.topology }),
          ...(options.target_polycount && { targetPolycount: options.target_polycount }),
          ...(options.symmetry_mode !== undefined && { symmetryMode: options.symmetry_mode }),
          ...(options.should_remesh !== undefined && { shouldRemesh: options.should_remesh }),
          ...(options.should_texture !== undefined && { shouldTexture: options.should_texture }),
          ...(options.enable_pbr !== undefined && { enablePBR: options.enable_pbr }),
          ...(options.is_a_t_pose !== undefined && { isATPose: options.is_a_t_pose }),
          ...(options.texture_prompt && { texturePrompt: options.texture_prompt }),
        }
      },
      isNSFW: false
    }
    
    const response = await this.client.post<MeshyTaskResponse>('/web/v2/tasks', requestBody)
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
    options: {
      maxAttempts?: number
      pollInterval?: number
      onProgress?: (progress: number, status: MeshyTaskStatus) => void
      signal?: AbortSignal
    } = {}
  ): Promise<MeshyTaskStatus> {
    const { maxAttempts = 120, pollInterval = 5000, onProgress, signal } = options
    const abortController = new AbortController()
    this.abortControllers.set(taskId, abortController)

    try {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (signal?.aborted || abortController.signal.aborted) {
          throw new Error('Task polling cancelled by user')
        }

        const status = await this.getTaskStatus(taskId)

        if (onProgress) {
          onProgress(status.progress, status)
        }

        if (status.status === 'SUCCEEDED') {
          this.abortControllers.delete(taskId)
          return status
        }

        if (status.status === 'FAILED') {
          this.abortControllers.delete(taskId)
          throw new Error(`Task failed: ${status.error || 'Unknown error'}`)
        }

        if (status.status === 'EXPIRED') {
          this.abortControllers.delete(taskId)
          throw new Error('Task expired')
        }

        await new Promise((resolve, reject) => {
          const timer = setTimeout(resolve, pollInterval)
          const onAbort = () => {
            clearTimeout(timer)
            reject(new Error('Task polling cancelled by user'))
          }
          signal?.addEventListener('abort', onAbort)
          abortController.signal.addEventListener('abort', onAbort)
        })
      }

      this.abortControllers.delete(taskId)
      throw new Error('Task polling timeout - maximum attempts reached')
    } catch (error) {
      this.abortControllers.delete(taskId)
      throw error
    }
  }

  async retryWithBackoff<T>(
    fn: () => Promise<T>,
    options: {
      maxRetries?: number
      initialDelay?: number
      maxDelay?: number
      backoffMultiplier?: number
      shouldRetry?: (error: Error) => boolean
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      initialDelay = 1000,
      maxDelay = 10000,
      backoffMultiplier = 2,
      shouldRetry = () => true,
    } = options

    let lastError: Error | undefined

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (attempt === maxRetries - 1 || !shouldRetry(lastError)) {
          break
        }

        const delay = Math.min(initialDelay * Math.pow(backoffMultiplier, attempt), maxDelay)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    throw new Error(`Max retries (${maxRetries}) exceeded. Last error: ${lastError?.message}`)
  }

  cancelTask(taskId: string): void {
    const controller = this.abortControllers.get(taskId)
    if (controller) {
      controller.abort()
      this.abortControllers.delete(taskId)
    }
  }

  cancelAllTasks(): void {
    this.abortControllers.forEach((controller) => controller.abort())
    this.abortControllers.clear()
  }

  clearCache(): void {
    this.taskStatusCache.clear()
  }

  getCachedTaskStatus(taskId: string): MeshyTaskStatus | null {
    const cached = this.taskStatusCache.get(taskId)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > this.CACHE_TTL) {
      this.taskStatusCache.delete(taskId)
      return null
    }

    return cached.status
  }

  private cacheTaskStatus(taskId: string, status: MeshyTaskStatus): void {
    this.taskStatusCache.set(taskId, {
      status,
      timestamp: Date.now(),
    })
  }
}

export default MeshyClient
