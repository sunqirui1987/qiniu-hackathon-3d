import type { Model3D } from './model'

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
