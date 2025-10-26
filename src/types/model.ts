import type { 
  ModelFormat, 
  TaskStatus, 
  GenerationStatus, 
  AIModel, 
  TopologyType, 
  ArtStyle, 
  QualityLevel 
} from '@/constants'

// 基础3D模型接口
export interface Model3D {
  id: string
  name: string
  url: string
  format: ModelFormat
  createdAt: Date
  updatedAt: Date
  thumbnail?: string
  size?: number
  metadata?: ModelMetadata
}

// 模型元数据
export interface ModelMetadata {
  vertices: number
  faces: number
  materials: number
  boundingBox?: {
    min: { x: number; y: number; z: number }
    max: { x: number; y: number; z: number }
    size: { x: number; y: number; z: number }
    center: { x: number; y: number; z: number }
  }
}

// 生成任务接口
export interface GenerateTask {
  id: string
  type: 'text-to-3d' | 'image-to-3d' | 'retopology' | 'texture'
  status: GenerationStatus
  progress: number
  prompt?: string
  imageUrl?: string
  result?: Model3D
  error?: string
  createdAt: Date
  updatedAt?: Date
}

// Meshy任务项接口
export interface MeshyTaskItem {
  id: string
  model_urls: ModelUrls
  thumbnail_url?: string
  prompt?: string
  art_style?: ArtStyle
  progress: number
  started_at?: number
  created_at: number
  finished_at?: number
  status: TaskStatus
  texture_urls?: TextureUrls[]
  preceding_tasks?: number
  task_error?: TaskError
}

// 模型URL集合
export interface ModelUrls {
  glb?: string
  fbx?: string
  obj?: string
  mtl?: string
  usdz?: string
}

// 纹理URL集合
export interface TextureUrls {
  base_color?: string
  normal?: string
  roughness?: string
  metallic?: string
}

// 任务错误信息
export interface TaskError {
  message?: string
  code?: string
  details?: Record<string, unknown>
}

// 选中项接口（统一历史项目和任务项）
export interface SelectedItem extends Partial<MeshyTaskItem> {
  url?: string
  name?: string
  type?: string
}

// 文本生成3D选项
export interface TextTo3DOptions {
  prompt: string
  negative_prompt?: string
  art_style?: ArtStyle
  ai_model?: AIModel
  topology?: TopologyType
  target_polycount?: number
  should_remesh?: boolean
  symmetry_mode?: 'off' | 'auto' | 'on'
  is_a_t_pose?: boolean
  seed?: number
  enable_pbr?: boolean
  texture_prompt?: string
}

// 图片生成3D选项
export interface ImageTo3DOptions {
  image: File | string
  ai_model?: AIModel
  topology?: TopologyType
  target_polycount?: number
  symmetry_mode?: 'off' | 'auto' | 'on'
  should_remesh?: boolean
  should_texture?: boolean
  enable_pbr?: boolean
  is_a_t_pose?: boolean
  texture_prompt?: string
}

// 重拓扑选项
export interface RetopologyOptions {
  // UI层面的选项
  input_source: 'existing_task' | 'upload_model'
  task_id: string
  model_url: string
  topology: TopologyType
  target_polycount: number
  quality: QualityLevel
  preserve_boundaries: boolean
  preserve_uv: boolean
  
  // API层面的选项
  input_task_id?: string
  target_formats?: ModelFormat[]
  resize_height?: number
  origin_at?: 'bottom' | 'center'
  convert_format_only?: boolean
}

// 纹理生成选项
export interface TextureOptions {
  // UI层面的选项
  input_source: 'existing_task' | 'upload_model'
  task_id: string
  model_url: string
  texture_input_type: 'text_prompt' | 'reference_image'
  texture_prompt: string
  reference_image: string
  image_description: string
  texture_type: 'diffuse' | 'normal' | 'roughness' | 'metallic'
  resolution: '512' | '1024' | '2048'
  quality: QualityLevel
  seamless: boolean
  preserve_uv: boolean
  generate_normal: boolean
  
  // API层面的选项
  ai_model?: AIModel
  enable_original_uv?: boolean
  enable_pbr?: boolean
}

// 重新纹理选项（API专用）
export interface RetextureOptions {
  input_task_id?: string
  model_url?: string
  text_style_prompt?: string
  image_style_url?: string
  ai_model?: AIModel
  enable_original_uv?: boolean
  enable_pbr?: boolean
}

// 模型文件接口
export interface ModelFile {
  id: string
  name: string
  path: string
  format: ModelFormat
  size: number
  createdAt: Date
  updatedAt: Date
  thumbnail?: string
  tags: string[]
  category?: string
  metadata?: ModelMetadata
}

// 模型索引接口
export interface ModelIndex {
  files: ModelFile[]
  categories: string[]
  tags: string[]
  lastUpdated: Date
}

// 工作室状态接口
export interface StudioState {
  activeTab: string
  activeMainMenu: string
  historyCategory: string
  selectedItem: SelectedItem | null
  isPageLoading: boolean
  isGenerating: boolean
  isProcessing: boolean
  generationProgress: number
  generationStatus: GenerationStatus
}

// 生成选项集合
export interface GenerationOptions {
  textOptions: Partial<TextTo3DOptions>
  imageOptions: Partial<ImageTo3DOptions>
  retopologyOptions: Partial<RetopologyOptions>
  textureOptions: Partial<TextureOptions>
}
