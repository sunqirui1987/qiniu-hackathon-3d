// 应用常量定义

// 3D模型格式
export const MODEL_FORMATS = {
  GLB: 'glb',
  GLTF: 'gltf',
  OBJ: 'obj',
  STL: 'stl',
  FBX: 'fbx',
  USDZ: 'usdz',
  BLEND: 'blend',
  '3MF': '3mf'
} as const

export type ModelFormat = typeof MODEL_FORMATS[keyof typeof MODEL_FORMATS]

// 任务状态
export const TASK_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED'
} as const

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS]

// 生成状态
export const GENERATION_STATUS = {
  IDLE: 'idle',
  GENERATING: 'generating',
  COMPLETED: 'completed',
  ERROR: 'error',
  CANCELLED: 'cancelled'
} as const

export type GenerationStatus = typeof GENERATION_STATUS[keyof typeof GENERATION_STATUS]

// AI模型版本
export const AI_MODELS = {
  MESHY_4: 'meshy-4',
  MESHY_5: 'meshy-5',
  LATEST: 'latest'
} as const

export type AIModel = typeof AI_MODELS[keyof typeof AI_MODELS]

// 拓扑类型
export const TOPOLOGY_TYPES = {
  TRIANGLE: 'triangle',
  QUAD: 'quad'
} as const

export type TopologyType = typeof TOPOLOGY_TYPES[keyof typeof TOPOLOGY_TYPES]

// 艺术风格
export const ART_STYLES = {
  REALISTIC: 'realistic',
  SCULPTURE: 'sculpture'
} as const

export type ArtStyle = typeof ART_STYLES[keyof typeof ART_STYLES]

// 质量等级
export const QUALITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  STANDARD: 'standard'
} as const

export type QualityLevel = typeof QUALITY_LEVELS[keyof typeof QUALITY_LEVELS]

// 默认配置
export const DEFAULT_CONFIG = {
  // 文本生成3D默认配置
  TEXT_TO_3D: {
    AI_MODEL: AI_MODELS.LATEST,
    TOPOLOGY: TOPOLOGY_TYPES.TRIANGLE,
    TARGET_POLYCOUNT: 30000,
    ART_STYLE: ART_STYLES.REALISTIC,
    ENABLE_PBR: true,
    SHOULD_REMESH: true
  },
  
  // 图片生成3D默认配置
  IMAGE_TO_3D: {
    AI_MODEL: AI_MODELS.LATEST,
    TOPOLOGY: TOPOLOGY_TYPES.TRIANGLE,
    TARGET_POLYCOUNT: 30000,
    SHOULD_TEXTURE: true,
    ENABLE_PBR: true,
    SHOULD_REMESH: true,
    IS_A_T_POSE: false
  },
  
  // 重拓扑默认配置
  RETOPOLOGY: {
    TOPOLOGY: TOPOLOGY_TYPES.TRIANGLE,
    TARGET_POLYCOUNT: 30000,
    QUALITY: QUALITY_LEVELS.MEDIUM,
    PRESERVE_BOUNDARIES: true,
    PRESERVE_UV: true,
    TARGET_FORMATS: [MODEL_FORMATS.GLB, MODEL_FORMATS.OBJ],
    ORIGIN_AT: 'bottom' as const,
    CONVERT_FORMAT_ONLY: false
  },
  
  // 纹理生成默认配置
  TEXTURE: {
    AI_MODEL: AI_MODELS.MESHY_4,
    RESOLUTION: '1024' as const,
    QUALITY: QUALITY_LEVELS.STANDARD,
    SEAMLESS: false,
    PRESERVE_UV: true,
    GENERATE_NORMAL: true,
    ENABLE_ORIGINAL_UV: true,
    ENABLE_PBR: true
  }
} as const

// 工作室标签页
export const STUDIO_TABS = {
  TEXT_TO_3D: 'text-to-3d',
  IMAGE_TO_3D: 'image-to-3d',
  RETOPOLOGY: 'retopology',
  TEXTURE: 'texture'
} as const

export type StudioTab = typeof STUDIO_TABS[keyof typeof STUDIO_TABS]

// 主菜单
export const MAIN_MENUS = {
  MODEL: 'model',
  TEXTURE: 'texture',
  ANIMATION: 'animation'
} as const

export type MainMenu = typeof MAIN_MENUS[keyof typeof MAIN_MENUS]

// 历史分类
export const HISTORY_CATEGORIES = {
  ALL: 'all',
  TEXT_TO_3D: 'text-to-3d',
  IMAGE_TO_3D: 'image-to-3d',
  RETOPOLOGY: 'retopology',
  TEXTURE: 'texture'
} as const

export type HistoryCategory = typeof HISTORY_CATEGORIES[keyof typeof HISTORY_CATEGORIES]