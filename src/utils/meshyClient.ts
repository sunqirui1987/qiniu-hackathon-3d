import axios, { AxiosInstance, AxiosError } from 'axios'

export interface MeshyTextTo3DOptions {
  prompt: string
  negative_prompt?: string
  art_style?: 'realistic' | 'sculpture' | 'cartoon' | 'low-poly'
  ai_model?: 'meshy-4' | 'meshy-5' | 'meshy-6-preview' | 'latest'
  license?: 'private' | 'public'
  is_a_t_pose?: boolean
  symmetry_mode?: 'off' | 'auto' | 'on'
  seed?: number
  image_urls?: string[]
}

export interface MeshyImageTo3DOptions {
  image_url: string
  ai_model?: 'meshy-4' | 'meshy-5' | 'latest'
  topology?: 'triangle' | 'quad'
  target_polycount?: number
  symmetry_mode?: 'off' | 'auto' | 'on'
  should_remesh?: boolean
  should_texture?: boolean
  enable_pbr?: boolean
  is_a_t_pose?: boolean
  texture_prompt?: string
  texture_image_url?: string
  moderation?: boolean
}

export interface MeshyRemeshOptions {
  input_task_id?: string
  model_url?: string
  target_formats?: ('glb' | 'fbx' | 'obj' | 'usdz' | 'blend' | 'stl')[]
  topology?: 'triangle' | 'quad'
  target_polycount?: number
  resize_height?: number
  origin_at?: 'bottom' | 'center'
  convert_format_only?: boolean
}

export interface MeshyRetextureOptions {
  input_task_id?: string
  model_url?: string
  text_style_prompt?: string
  image_style_url?: string
  ai_model?: 'meshy-4' | 'meshy-5'
  enable_original_uv?: boolean
  enable_pbr?: boolean
}

export interface MeshyTaskResponse {
  result: string
}

export interface MeshyTaskStatus {
  id: string
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED' | 'CANCELED'
  progress: number
  model_urls?: {
    glb?: string
    fbx?: string
    obj?: string
    usdz?: string
    mtl?: string
    blend?: string
    stl?: string
  }
  texture_urls?: Array<{
    base_color?: string
    metallic?: string
    normal?: string
    roughness?: string
  }>
  thumbnail_url?: string
  created_at: number
  started_at?: number
  finished_at?: number
  task_error?: {
    message: string
  }
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
  private abortControllers: Map<string, AbortController> = new Map()
  private taskStatusCache: Map<string, { status: MeshyTaskStatus; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 3000

  constructor() {
    const serverBaseUrl = import.meta.env.VITE_AUTH_SERVER_URL || 'http://localhost:3001'
    this.client = axios.create({
      baseURL: `${serverBaseUrl}/api/meshy`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })

    this.client.interceptors.request.use(
      (config) => {
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
    const requestBody: Record<string, unknown> = {
      mode: 'preview',
      prompt: options.prompt,
    }

    if (options.negative_prompt) requestBody.negative_prompt = options.negative_prompt
    if (options.art_style) requestBody.art_style = options.art_style
    if (options.ai_model) requestBody.ai_model = options.ai_model
    if (options.license) requestBody.license = options.license
    if (options.is_a_t_pose !== undefined) requestBody.is_a_t_pose = options.is_a_t_pose
    if (options.symmetry_mode) requestBody.symmetry_mode = options.symmetry_mode
    if (options.seed) requestBody.seed = options.seed
    if (options.image_urls) requestBody.image_urls = options.image_urls

    const response = await this.client.post<MeshyTaskResponse>('/openapi/v2/text-to-3d', requestBody)
    return response.data
  }

  async createImageTo3D(options: MeshyImageTo3DOptions): Promise<MeshyTaskResponse> {
    const requestBody: Record<string, unknown> = {
      image_url: options.image_url,
    }

    if (options.ai_model) requestBody.ai_model = options.ai_model
    if (options.topology) requestBody.topology = options.topology
    if (options.target_polycount) requestBody.target_polycount = options.target_polycount
    if (options.symmetry_mode) requestBody.symmetry_mode = options.symmetry_mode
    if (options.should_remesh !== undefined) requestBody.should_remesh = options.should_remesh
    if (options.should_texture !== undefined) requestBody.should_texture = options.should_texture
    if (options.enable_pbr !== undefined) requestBody.enable_pbr = options.enable_pbr
    if (options.is_a_t_pose !== undefined) requestBody.is_a_t_pose = options.is_a_t_pose
    if (options.texture_prompt) requestBody.texture_prompt = options.texture_prompt
    if (options.texture_image_url) requestBody.texture_image_url = options.texture_image_url
    if (options.moderation !== undefined) requestBody.moderation = options.moderation

    const response = await this.client.post<MeshyTaskResponse>('/openapi/v2/image-to-3d', requestBody)
    return response.data
  }

  async createRemesh(options: MeshyRemeshOptions): Promise<MeshyTaskResponse> {
    const requestBody: Record<string, unknown> = {}

    if (options.input_task_id) requestBody.input_task_id = options.input_task_id
    if (options.model_url) requestBody.model_url = options.model_url
    if (options.target_formats) requestBody.target_formats = options.target_formats
    if (options.topology) requestBody.topology = options.topology
    if (options.target_polycount) requestBody.target_polycount = options.target_polycount
    if (options.resize_height) requestBody.resize_height = options.resize_height
    if (options.origin_at) requestBody.origin_at = options.origin_at
    if (options.convert_format_only !== undefined) requestBody.convert_format_only = options.convert_format_only

    const response = await this.client.post<MeshyTaskResponse>('/openapi/v2/remesh', requestBody)
    return response.data
  }

  async createRetexture(options: MeshyRetextureOptions): Promise<MeshyTaskResponse> {
    const requestBody: Record<string, unknown> = {}

    if (options.input_task_id) requestBody.input_task_id = options.input_task_id
    if (options.model_url) requestBody.model_url = options.model_url
    if (options.text_style_prompt) requestBody.text_style_prompt = options.text_style_prompt
    if (options.image_style_url) requestBody.image_style_url = options.image_style_url
    if (options.ai_model) requestBody.ai_model = options.ai_model
    if (options.enable_original_uv !== undefined) requestBody.enable_original_uv = options.enable_original_uv
    if (options.enable_pbr !== undefined) requestBody.enable_pbr = options.enable_pbr

    const response = await this.client.post<MeshyTaskResponse>('/openapi/v2/retexture', requestBody)
    return response.data
  }

  async getTaskStatus(taskId: string, taskType?: 'text-to-3d' | 'image-to-3d' | 'remesh' | 'retexture'): Promise<MeshyTaskStatus> {
    const cached = this.getCachedTaskStatus(taskId)
    if (cached) {
      return cached
    }

    let endpoint = `/openapi/v2/text-to-3d/${taskId}`
    if (taskType === 'image-to-3d') {
      endpoint = `/openapi/v2/image-to-3d/${taskId}`
    } else if (taskType === 'remesh') {
      endpoint = `/openapi/v2/remesh/${taskId}`
    } else if (taskType === 'retexture') {
      endpoint = `/openapi/v2/retexture/${taskId}`
    }

    const response = await this.client.get<MeshyTaskStatus>(endpoint)
    this.cacheTaskStatus(taskId, response.data)
    return response.data
  }

  async listTasks(taskType: 'text-to-3d' | 'image-to-3d' | 'remesh' | 'retexture', params?: {
    page_num?: number
    page_size?: number
    sort_by?: string
    order?: 'asc' | 'desc'
  }): Promise<{ data: MeshyTaskStatus[], total: number }> {
    const endpoint = `/openapi/v2/${taskType}`
    const response = await this.client.get(endpoint, { params })
    return response.data
  }

  async getTextTo3DTasks(params?: {
    page_size?: number
    page_num?: number
  }): Promise<MeshyTaskStatus[]> {
    const { page_size = 10, page_num = 1 } = params || {}
    const response = await this.client.get(`/openapi/v2/text-to-3d`, {
      params: { page_size, page_num }
    })
    // API返回的是数组，直接返回
    return Array.isArray(response.data) ? response.data : []
  }

  async getImageTo3DTasks(params?: {
    page_size?: number
    page_num?: number
  }): Promise<MeshyTaskStatus[]> {
    const { page_size = 10, page_num = 1 } = params || {}
    const response = await this.client.get(`/openapi/v1/image-to-3d`, {
      params: { page_size, page_num }
    })
    // API返回的是数组，直接返回
    return Array.isArray(response.data) ? response.data : []
  }

  async getAllTasks(params?: {
    page_size?: number
    page_num?: number
  }): Promise<{ textTo3D: MeshyTaskStatus[], imageTo3D: MeshyTaskStatus[] }> {
    try {
      const [textTo3DTasks, imageTo3DTasks] = await Promise.all([
        this.getTextTo3DTasks(params),
        this.getImageTo3DTasks(params)
      ])
      
      return {
        textTo3D: textTo3DTasks,
        imageTo3D: imageTo3DTasks
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      return {
        textTo3D: [],
        imageTo3D: []
      }
    }
  }

  async deleteTask(taskId: string, taskType: 'text-to-3d' | 'image-to-3d' | 'remesh' | 'retexture'): Promise<void> {
    const endpoint = `/openapi/v2/${taskType}/${taskId}`
    await this.client.delete(endpoint)
    this.taskStatusCache.delete(taskId)
  }

  async pollTaskUntilComplete(
    taskId: string,
    taskType: 'text-to-3d' | 'image-to-3d' | 'remesh' | 'retexture',
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

        const status = await this.getTaskStatus(taskId, taskType)

        if (onProgress) {
          onProgress(status.progress, status)
        }

        if (status.status === 'SUCCEEDED') {
          this.abortControllers.delete(taskId)
          return status
        }

        if (status.status === 'FAILED') {
          this.abortControllers.delete(taskId)
          throw new Error(`Task failed: ${status.task_error?.message || status.error || 'Unknown error'}`)
        }

        if (status.status === 'EXPIRED') {
          this.abortControllers.delete(taskId)
          throw new Error('Task expired')
        }

        if (status.status === 'CANCELED') {
          this.abortControllers.delete(taskId)
          throw new Error('Task was canceled')
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
      timestamp: Date.now()
    })
  }

  /**
   * 将 Meshy 资源 URL 转换为通过服务器代理的 URL
   * 这样可以避免 CORS 问题
   */
  getProxiedAssetUrl(meshyUrl: string): string {
    if (!meshyUrl || !meshyUrl.includes('assets.meshy.ai')) {
      return meshyUrl
    }
    
    // 构建代理 URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
    const proxyUrl = `${baseUrl}/api/meshy/proxy-asset?url=${encodeURIComponent(meshyUrl)}`
    
    console.log('[MeshyClient] Converting URL to proxy:', {
      original: meshyUrl,
      proxied: proxyUrl
    })
    
    return proxyUrl
  }
}

export const meshyClient = new MeshyClient()

