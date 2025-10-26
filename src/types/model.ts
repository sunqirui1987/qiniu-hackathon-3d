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
