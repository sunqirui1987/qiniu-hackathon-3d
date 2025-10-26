import { meshyClient, type MeshyTaskStatus, type MeshyRetextureOptions } from '@/utils/meshyClient'
import type { 
  TextTo3DOptions, 
  ImageTo3DOptions, 
  RetopologyOptions, 
  TextureOptions,
  Model3D
} from '@/types/model'
import { getUserFriendlyErrorMessage } from '@/utils/errorHandler'

export interface GenerationProgress {
  progress: number
  status: string
  taskId?: string
  error?: string
}

export interface GenerationResult {
  success: boolean
  model?: Model3D
  task?: MeshyTaskStatus
  error?: string
}

export class GenerationService {
  
  /**
   * 文本生成3D模型
   */
  static async generateFromText(
    options: TextTo3DOptions,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<GenerationResult> {
    try {
      onProgress?.({ progress: 0, status: 'starting' })
      
      // 创建文本生成3D任务
      const taskResponse = await meshyClient.createTextTo3D({
        prompt: options.prompt,
        negative_prompt: options.negative_prompt,
        art_style: options.art_style,
        ai_model: options.ai_model,
        symmetry_mode: options.symmetry_mode,
        is_a_t_pose: options.is_a_t_pose,
        seed: options.seed
      })
      
      onProgress?.({ progress: 10, status: 'generating', taskId: taskResponse.result })
      
      // 轮询任务状态
      const finalStatus = await meshyClient.pollTaskUntilComplete(
        taskResponse.result,
        'text-to-3d',
        {
          onProgress: (taskProgress) => {
            onProgress?.({ 
              progress: 10 + taskProgress * 0.9, 
              status: 'generating',
              taskId: taskResponse.result
            })
          }
        }
      )
      
      // 转换为Model3D格式
      const model = await this.convertTaskToModel(finalStatus, options.prompt || 'text-to-3d')
      
      onProgress?.({ progress: 100, status: 'completed' })
      
      return {
        success: true,
        model,
        task: finalStatus
      }
      
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error)
      onProgress?.({ progress: 0, status: 'error', error: errorMessage })
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }
  
  /**
   * 图片生成3D模型
   */
  static async generateFromImage(
    options: ImageTo3DOptions,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<GenerationResult> {
    try {
      onProgress?.({ progress: 0, status: 'uploading' })
      
      // 处理图片
      let imageUrl: string
      if (typeof options.image === 'string') {
        imageUrl = options.image
      } else {
        // 将File转换为base64
        imageUrl = await this.fileToBase64(options.image)
      }
      
      onProgress?.({ progress: 10, status: 'generating' })
      
      // 创建图片生成3D任务
      const taskResponse = await meshyClient.createImageTo3D({
        image_url: imageUrl,
        ai_model: options.ai_model,
        topology: options.topology,
        target_polycount: options.target_polycount,
        symmetry_mode: options.symmetry_mode,
        should_remesh: options.should_remesh,
        should_texture: options.should_texture,
        enable_pbr: options.enable_pbr,
        is_a_t_pose: options.is_a_t_pose,
        texture_prompt: options.texture_prompt
      })
      
      onProgress?.({ progress: 20, status: 'generating', taskId: taskResponse.result })
      
      // 轮询任务状态
      const finalStatus = await meshyClient.pollTaskUntilComplete(
        taskResponse.result,
        'image-to-3d',
        {
          onProgress: (taskProgress) => {
            onProgress?.({ 
              progress: 20 + taskProgress * 0.8, 
              status: 'generating',
              taskId: taskResponse.result
            })
          }
        }
      )
      
      // 转换为Model3D格式
      const imageName = options.image instanceof File ? options.image.name : 'image-to-3d'
      const model = await this.convertTaskToModel(finalStatus, imageName)
      
      onProgress?.({ progress: 100, status: 'completed' })
      
      return {
        success: true,
        model,
        task: finalStatus
      }
      
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error)
      onProgress?.({ progress: 0, status: 'error', error: errorMessage })
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }
  
  /**
   * 重拓扑处理
   */
  static async processRetopology(
    options: RetopologyOptions,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<GenerationResult> {
    try {
      onProgress?.({ progress: 0, status: 'starting' })
      
      // 构建API参数
      const remeshOptions = {
        input_task_id: options.input_task_id || options.task_id,
        model_url: options.model_url,
        target_formats: ['glb', 'obj'] as ('glb' | 'obj' | 'stl' | 'fbx' | 'usdz' | 'blend')[],
        topology: options.topology,
        target_polycount: options.target_polycount,
        resize_height: options.resize_height,
        origin_at: options.origin_at || 'bottom',
        convert_format_only: options.convert_format_only || false
      }
      
      // 创建重拓扑任务
      const taskResponse = await meshyClient.createRemesh(remeshOptions)
      
      onProgress?.({ progress: 10, status: 'processing', taskId: taskResponse.result })
      
      // 轮询任务状态
      const finalStatus = await meshyClient.pollTaskUntilComplete(
        taskResponse.result,
        'remesh',
        {
          onProgress: (taskProgress) => {
            onProgress?.({ 
              progress: 10 + taskProgress * 0.9, 
              status: 'processing',
              taskId: taskResponse.result
            })
          }
        }
      )
      
      // 转换为Model3D格式
      const model = await this.convertTaskToModel(finalStatus, 'retopology-result')
      
      onProgress?.({ progress: 100, status: 'completed' })
      
      return {
        success: true,
        model,
        task: finalStatus
      }
      
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error)
      onProgress?.({ progress: 0, status: 'error', error: errorMessage })
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }
  
  /**
   * 纹理生成
   */
  static async generateTexture(
    options: TextureOptions,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<GenerationResult> {
    try {
      onProgress?.({ progress: 0, status: 'starting' })
      
      // 构建API参数
      const retextureOptions: MeshyRetextureOptions = {
        input_task_id: options.task_id,
        model_url: options.model_url,
        ai_model: options.ai_model === 'latest' ? 'meshy-5' : 
                 (options.ai_model === 'meshy-4' || options.ai_model === 'meshy-5') ? 
                 options.ai_model : 'meshy-5',
        enable_original_uv: options.enable_original_uv,
        enable_pbr: options.enable_pbr
      }
      
      // 根据输入类型设置参数
      if (options.texture_input_type === 'text_prompt') {
        retextureOptions.text_style_prompt = options.texture_prompt
      } else if (options.texture_input_type === 'reference_image') {
        retextureOptions.image_style_url = options.reference_image
      }
      
      // 创建纹理生成任务
      const taskResponse = await meshyClient.createRetexture(retextureOptions)
      
      onProgress?.({ progress: 10, status: 'generating', taskId: taskResponse.result })
      
      // 轮询任务状态
      const finalStatus = await meshyClient.pollTaskUntilComplete(
        taskResponse.result,
        'retexture',
        {
          onProgress: (taskProgress) => {
            onProgress?.({ 
              progress: 10 + taskProgress * 0.9, 
              status: 'generating',
              taskId: taskResponse.result
            })
          }
        }
      )
      
      // 转换为Model3D格式
      const model = await this.convertTaskToModel(finalStatus, 'texture-result')
      
      onProgress?.({ progress: 100, status: 'completed' })
      
      return {
        success: true,
        model,
        task: finalStatus
      }
      
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error)
      onProgress?.({ progress: 0, status: 'error', error: errorMessage })
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }
  
  /**
   * 获取任务历史
   */
  static async getTaskHistory(): Promise<MeshyTaskStatus[]> {
    try {
      const allTasks = await meshyClient.getAllTasks()
      const combinedTasks = [
        ...allTasks.textTo3D,
        ...allTasks.imageTo3D,
        ...allTasks.remesh,
        ...allTasks.retexture
      ]
      
      // 按创建时间排序（最新的在前）
      return combinedTasks.sort((a, b) => {
        const timeA = new Date(a.created_at).getTime()
        const timeB = new Date(b.created_at).getTime()
        return timeB - timeA
      })
    } catch (error) {
      console.error('Failed to load task history:', error)
      return []
    }
  }
  
  /**
   * 获取单个任务状态
   */
  static async getTaskStatus(taskId: string): Promise<MeshyTaskStatus | null> {
    try {
      const task = await meshyClient.getTaskStatus(taskId)
      return task
    } catch (error) {
      console.error('Failed to get task status:', error)
      return null
    }
  }
  
  /**
   * 取消任务
   */
  static async cancelTask(taskId: string): Promise<boolean> {
    try {
      await meshyClient.cancelTask(taskId)
      return true
    } catch (error) {
      console.error('Failed to cancel task:', error)
      return false
    }
  }
  
  // 私有辅助方法
  
  /**
   * 将File转换为base64
   */
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
  
  /**
   * 将Meshy任务转换为Model3D格式
   */
  private static async convertTaskToModel(taskStatus: any, name: string): Promise<Model3D> {
    const url = taskStatus.model_urls?.glb || taskStatus.model_urls?.obj || ''
    // 使用代理URL避免CORS问题
    const proxiedUrl = await meshyClient.getProxiedAssetUrl(url)
    
    return {
      id: taskStatus.id,
      name: name,
      url: proxiedUrl,
      format: 'glb',
      createdAt: new Date(taskStatus.created_at),
      updatedAt: new Date(taskStatus.finished_at || taskStatus.created_at),
      thumbnail: taskStatus.thumbnail_url,
      metadata: {
        vertices: 0,
        faces: 0,
        materials: 0
      }
    }
  }
}