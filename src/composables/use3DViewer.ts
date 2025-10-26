import { ref, onUnmounted, type Ref } from 'vue'
import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  Vector3,
  SceneLoader,
  AbstractMesh,
  Color4,
  type Mesh,
  type ISceneLoaderAsyncResult,
  // 添加网格和坐标轴支持
  StandardMaterial,
  MeshBuilder,
  AxesViewer,
  Material
} from '@babylonjs/core'
import { STLExport } from '@babylonjs/serializers'
import '@babylonjs/loaders/glTF'
import '@babylonjs/loaders/STL'
import '@babylonjs/loaders/OBJ'

export interface ViewerOptions {
  clearColor?: Color4
  enablePhysics?: boolean
}

export interface ModelInfo {
  vertices: number
  faces: number
  materials: number
  boundingBox: {
    min: Vector3
    max: Vector3
    size: Vector3
    center: Vector3
  }
}

export function use3DViewer({ canvasRef }: { canvasRef: Ref<HTMLCanvasElement | null> }) {
  const engine = ref<Engine | null>(null)
  const scene = ref<Scene | null>(null)
  const camera = ref<ArcRotateCamera | null>(null)
  const light = ref<HemisphericLight | null>(null)
  const currentModel = ref<AbstractMesh | null>(null)
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const loadError = ref<string | null>(null)
  const modelInfo = ref<ModelInfo | null>(null)

  const initViewer = (options: ViewerOptions = {}) => {
    if (!canvasRef.value) {
      throw new Error('Canvas element is required')
    }

    if (isInitialized.value) {
      return
    }

    engine.value = new Engine(canvasRef.value, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    })

    scene.value = new Scene(engine.value)
    scene.value.clearColor = options.clearColor || new Color4(0.95, 0.95, 0.95, 1)

    camera.value = new ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 2.5,
      10,
      Vector3.Zero(),
      scene.value
    )
    camera.value.attachControl(canvasRef.value, true)
    camera.value.wheelPrecision = 50
    camera.value.minZ = 0.1
    camera.value.lowerRadiusLimit = 1
    camera.value.upperRadiusLimit = 100

    light.value = new HemisphericLight('light', new Vector3(0, 1, 0), scene.value)
    light.value.intensity = 1.0

    engine.value.runRenderLoop(() => {
      if (scene.value) {
        scene.value.render()
      }
    })

    window.addEventListener('resize', handleResize)
    isInitialized.value = true
  }

  const handleResize = () => {
    if (engine.value) {
      engine.value.resize()
    }
  }

  const loadModel = async (url: string, fileName?: string): Promise<void> => {
    if (!scene.value) {
      throw new Error('Scene not initialized. Call initViewer() first.')
    }

    // 验证URL格式
    if (!url || typeof url !== 'string') {
      const errorMessage = 'Invalid model URL provided'
      loadError.value = errorMessage
      throw new Error(errorMessage)
    }

    // 检查URL是否为有效的3D模型文件
    const supportedExtensions = ['.glb', '.gltf', '.fbx', '.obj', '.stl', '.babylon']
    const urlLower = url.toLowerCase()
    
    // 更精确的文件扩展名检测
    const getFileExtension = (url: string): string => {
      // 移除查询参数和片段
      const cleanUrl = url.split('?')[0].split('#')[0]
      const lastDotIndex = cleanUrl.lastIndexOf('.')
      if (lastDotIndex === -1) return ''
      return cleanUrl.substring(lastDotIndex).toLowerCase()
    }
    
    const fileExtension = getFileExtension(url)
    const isValidExtension = supportedExtensions.includes(fileExtension) || 
                           urlLower.includes('proxy-asset') ||
                           urlLower.includes('blob:') ||
                           urlLower.includes('data:')

    if (!isValidExtension) {
      const errorMessage = `Unsupported file format. Supported formats: ${supportedExtensions.join(', ')}. Detected extension: ${fileExtension || 'none'}`
      loadError.value = errorMessage
      throw new Error(errorMessage)
    }

    isLoading.value = true
    loadError.value = null

    try {
      if (currentModel.value) {
        currentModel.value.dispose()
        currentModel.value = null
      }

      console.log('[3DViewer] Loading model from URL:', url)

      // 使用标准的SceneLoader加载模型
      const result: ISceneLoaderAsyncResult = await SceneLoader.ImportMeshAsync(
        '',
        '',
        url,
        scene.value
      )

      if (!result || !result.meshes || result.meshes.length === 0) {
        throw new Error('No meshes found in the model file. The file may be empty or corrupted.')
      }

      const rootMesh = result.meshes[0]
      currentModel.value = rootMesh

      frameModel(rootMesh)
      updateModelInfo(result.meshes)

      console.log('[3DViewer] Model loaded successfully:', {
        meshCount: result.meshes.length,
        vertices: result.meshes.reduce((total, mesh) => {
          return total + ('getTotalVertices' in mesh ? (mesh as Mesh).getTotalVertices() : 0)
        }, 0)
      })

      isLoading.value = false
    } catch (error) {
      isLoading.value = false
      
      let errorMessage = 'Failed to load model'
      
      if (error instanceof Error) {
        // 处理特定的错误类型
        if (error.message.includes('JSON parse') || error.message.includes('Unexpected token')) {
          errorMessage = 'Invalid GLB/GLTF file format. The file may be corrupted, incomplete, or not a valid 3D model.'
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Network error: Unable to download the model file. Please check your internet connection and try again.'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timeout: The model file is taking too long to download. Please try again or use a smaller file.'
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
          errorMessage = 'Model file not found. The URL may be invalid or the file may have been removed.'
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorMessage = 'Access denied: You do not have permission to access this model file.'
        } else if (error.message.includes('415') || error.message.includes('Unsupported Media Type')) {
          errorMessage = 'Unsupported file type: The file is not a valid 3D model format.'
        } else if (error.message.includes('CORS')) {
          errorMessage = 'CORS error: The server does not allow cross-origin requests. Please check the file URL or server configuration.'
        } else if (error.message.includes('No meshes found')) {
          errorMessage = error.message
        } else {
          errorMessage = `Loading error: ${error.message}`
        }
      }
      
      console.error('[3DViewer] Model loading failed:', {
        url,
        fileName,
        error: errorMessage,
        originalError: error
      })
      
      loadError.value = errorMessage
      throw new Error(errorMessage)
    }
  }

  const frameModel = (mesh: AbstractMesh) => {
    if (!camera.value) return

    const boundingInfo = mesh.getHierarchyBoundingVectors()
    const center = boundingInfo.min.add(boundingInfo.max).scale(0.5)
    const size = boundingInfo.max.subtract(boundingInfo.min)
    const maxDim = Math.max(size.x, size.y, size.z)

    camera.value.target = center
    camera.value.radius = maxDim * 2
    camera.value.alpha = -Math.PI / 2
    camera.value.beta = Math.PI / 2.5
  }

  const updateModelInfo = (meshes: AbstractMesh[]) => {
    let totalVertices = 0
    let totalFaces = 0
    let materialCount = 0

    const materials = new Set()

    meshes.forEach(mesh => {
      if ('getTotalVertices' in mesh) {
        totalVertices += (mesh as Mesh).getTotalVertices()
      }
      if ('getTotalIndices' in mesh) {
        totalFaces += (mesh as Mesh).getTotalIndices() / 3
      }
      if (mesh.material) {
        materials.add(mesh.material.uniqueId)
      }
    })

    materialCount = materials.size

    if (currentModel.value) {
      const boundingInfo = currentModel.value.getHierarchyBoundingVectors()
      const min = boundingInfo.min
      const max = boundingInfo.max
      const size = max.subtract(min)
      const center = min.add(max).scale(0.5)

      modelInfo.value = {
        vertices: totalVertices,
        faces: Math.floor(totalFaces),
        materials: materialCount,
        boundingBox: {
          min,
          max,
          size,
          center,
        },
      }
    }
  }

  const exportSTL = async (): Promise<Blob | null> => {
    if (!currentModel.value || !scene.value) {
      throw new Error('No model loaded')
    }

    try {
      const stlString = STLExport.CreateSTL([currentModel.value], true, currentModel.value.name || 'model')
      const blob = new Blob([stlString], { type: 'application/octet-stream' })
      return blob
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to export STL: ${errorMessage}`)
    }
  }

  const exportGLB = async (): Promise<Blob | null> => {
    if (!currentModel.value || !scene.value) {
      throw new Error('No model loaded')
    }

    try {
      const { GLTF2Export } = await import('@babylonjs/serializers/glTF')
      const modelName = currentModel.value.name || 'model'
      const glb = await GLTF2Export.GLBAsync(scene.value, modelName)
      const fileName = `${modelName}.glb`
      return glb.glTFFiles[fileName] as Blob
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to export GLB: ${errorMessage}`)
    }
  }

  const exportGLTF = async (): Promise<{ gltf: Blob; bin: Blob | null } | null> => {
    if (!scene.value) {
      console.error('Scene not initialized')
      return null
    }

    try {
      const { GLTF2Export } = await import('@babylonjs/serializers/glTF')
      const gltf = await GLTF2Export.GLTFAsync(scene.value, 'model')
      
      const gltfBlob = new Blob([JSON.stringify(gltf.glTFFiles['model.gltf'])], { 
        type: 'model/gltf+json' 
      })
      
      const binBlob = gltf.glTFFiles['model.bin'] 
        ? new Blob([gltf.glTFFiles['model.bin']], { type: 'application/octet-stream' })
        : null
      
      return { gltf: gltfBlob, bin: binBlob }
    } catch (error) {
      console.error('Failed to export GLTF:', error)
      return null
    }
  }

  const exportOBJ = async (): Promise<Blob | null> => {
    if (!scene.value) {
      console.error('Scene not initialized')
      return null
    }

    try {
      const { OBJExport } = await import('@babylonjs/serializers/OBJ')
      const objString = OBJExport.OBJ([scene.value])
      const blob = new Blob([objString], { type: 'model/obj' })
      return blob
    } catch (error) {
      console.error('Failed to export OBJ:', error)
      return null
    }
  }

  const resetCamera = () => {
    if (camera.value) {
      camera.value.alpha = -Math.PI / 2
      camera.value.beta = Math.PI / 2.5
      camera.value.radius = 10
      camera.value.target = Vector3.Zero()
    }
  }

  const setZoom = (delta: number) => {
    if (camera.value) {
      camera.value.radius *= (1 + delta)
    }
  }

  const rotateModel = (x: number, y: number) => {
    if (camera.value) {
      camera.value.alpha += x
      camera.value.beta += y
    }
  }

  const dispose = () => {
    window.removeEventListener('resize', handleResize)
    
    if (currentModel.value) {
      currentModel.value.dispose()
      currentModel.value = null
    }

    if (scene.value) {
      scene.value.dispose()
      scene.value = null
    }

    if (engine.value) {
      engine.value.dispose()
      engine.value = null
    }

    isInitialized.value = false
  }

  onUnmounted(() => {
    dispose()
  })

  return {
    engine,
    scene,
    camera,
    light,
    currentModel,
    isInitialized,
    isLoading,
    loadError,
    modelInfo,
    initViewer,
    loadModel,
    exportSTL,
    exportGLB,
    exportGLTF,
    exportOBJ,
    resetCamera,
    setZoom,
    rotateModel,
    dispose,
  }
}
