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
