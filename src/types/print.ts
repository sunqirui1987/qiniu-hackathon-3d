export interface PrintJob {
  id: string
  modelId: string
  modelName: string
  status: 'pending' | 'printing' | 'completed' | 'failed'
  progress: number
  settings: PrintSettings
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
}

export interface PrintSettings {
  printer: string
  material: string
  layerHeight: number
  infillDensity: number
  supports: boolean
  temperature?: number
}
