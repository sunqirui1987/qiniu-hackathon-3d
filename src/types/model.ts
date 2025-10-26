export interface Model3D {
  id: string
  name: string
  url: string
  format: '3mf' | 'stl' | 'obj' | 'glb' | 'gltf'
  createdAt: Date
  updatedAt: Date
  thumbnail?: string
  size?: number
  metadata?: {
    vertices: number
    faces: number
    materials: number
  }
}

export interface GenerateTask {
  id: string
  type: 'text-to-3d' | 'image-to-3d'
  status: 'pending' | 'preview' | 'refine' | 'completed' | 'failed'
  progress: number
  prompt?: string
  imageUrl?: string
  result?: Model3D
  error?: string
  createdAt: Date
}

export interface GenerateOptions {
  artStyle?: string
  targetPolycount?: number
  enablePBR?: boolean
  seed?: number
}

export interface ModelFile {
  id: string
  name: string
  path: string
  format: '3mf' | 'stl' | 'obj' | 'glb' | 'gltf'
  size: number
  createdAt: Date
  updatedAt: Date
  thumbnail?: string
  tags: string[]
  category?: string
  metadata?: {
    vertices?: number
    faces?: number
    materials?: number
  }
}

export interface ModelIndex {
  files: ModelFile[]
  categories: string[]
  tags: string[]
  lastUpdated: Date
}

// Meshy API 任务对象类型定义
export interface MeshyTaskItem {
  id: string
  model_urls: {
    glb?: string
    fbx?: string
    obj?: string
    mtl?: string
    usdz?: string
  }
  thumbnail_url?: string
  prompt?: string
  art_style?: string
  progress: number
  started_at?: number
  created_at: number
  finished_at?: number
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED'
  texture_urls?: Array<{
    base_color?: string
  }>
  preceding_tasks?: number
  task_error?: {
    message?: string
  }
}

// 统一的选中项类型，兼容 Meshy API 和本地导入的模型
export interface SelectedItem {
  // Meshy API 任务对象属性
  id?: string
  model_urls?: {
    glb?: string
    fbx?: string
    obj?: string
    mtl?: string
    usdz?: string
  }
  thumbnail_url?: string
  prompt?: string
  art_style?: string
  progress?: number
  started_at?: number
  created_at?: number
  finished_at?: number
  status?: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED'
  texture_urls?: Array<{
    base_color?: string
  }>
  preceding_tasks?: number
  task_error?: {
    message?: string
  }
  
  // 本地导入模型属性（兼容性）
  url?: string
  name?: string
  type?: string
}

// 重拓扑 API 相关类型定义
export interface RemeshOptions {
  // 必需属性（二选一）
  input_task_id?: string  // 需要重建网格的已完成任务ID
  model_url?: string      // 3D模型的公开访问URL

  // 可选属性
  target_formats?: Array<'glb' | 'fbx' | 'obj' | 'usdz' | 'blend' | 'stl'>  // 目标格式
  topology?: 'quad' | 'triangle'  // 拓扑结构
  target_polycount?: number       // 目标面数 (100-300000)
  resize_height?: number          // 缩放高度（米）
  origin_at?: 'bottom' | 'center' // 原点位置
  convert_format_only?: boolean   // 是否仅转换格式
}

// 重拓扑组件选项类型
export interface RetopologyOptions {
  input_source: 'existing_task' | 'upload_model'
  task_id: string
  model_url: string
  topology: 'triangle' | 'quad'
  target_polycount: number
  quality: 'low' | 'medium' | 'high'
  preserve_boundaries: boolean
  preserve_uv: boolean
  resize_height?: number
  origin_at?: 'bottom' | 'center'
  convert_format_only?: boolean
}

// 贴图生成 API 相关类型定义
export interface RetextureOptions {
  // 必需属性（二选一）
  input_task_id?: string  // 需要重新贴图的已完成任务ID
  model_url?: string      // 3D模型的公开访问URL

  // 可选属性
  text_style_prompt?: string    // 文本风格提示
  image_style_url?: string      // 图像风格URL
  ai_model?: string            // AI模型版本
  enable_original_uv?: boolean // 启用原始UV
  enable_pbr?: boolean         // 启用PBR材质
}

// 贴图组件选项类型
export interface TextureOptions {
  input_source: 'existing_task' | 'upload_model'
  task_id: string
  model_url: string
  texture_prompt: string
  texture_type: 'diffuse' | 'normal' | 'roughness' | 'metallic'
  resolution: '512' | '1024' | '2048'
  quality: 'standard' | 'high'
  seamless: boolean
  preserve_uv: boolean
  generate_normal: boolean
  ai_model?: string
  enable_original_uv?: boolean
  enable_pbr?: boolean
}
