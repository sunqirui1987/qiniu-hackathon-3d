import { ref, onUnmounted, type Ref } from 'vue'
import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  DirectionalLight,
  Vector3,
  SceneLoader,
  AbstractMesh,
  Color4,
  Color3,
  StandardMaterial,
  PBRMaterial,
  MeshBuilder,
  AxesViewer,
  Mesh,
  type ISceneLoaderAsyncResult,
  TransformNode,
  Tools,
  ShadowGenerator,
  CascadedShadowGenerator
} from '@babylonjs/core'
import { GridMaterial } from '@babylonjs/materials/grid'
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

export interface Transform {
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
}

export function use3DViewer({ canvasRef }: { canvasRef: Ref<HTMLCanvasElement | null> }) {
  const engine = ref<Engine | null>(null)
  const scene = ref<Scene | null>(null)
  const camera = ref<ArcRotateCamera | null>(null)
  const light = ref<HemisphericLight | null>(null)
  const directionalLight = ref<DirectionalLight | null>(null)
  const currentModel = ref<AbstractMesh | null>(null)
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const loadError = ref<string | null>(null)
  const modelInfo = ref<ModelInfo | null>(null)
  
  // 控制状态
  const showWireframe = ref(false)
  const showGrid = ref(true)
  const showAxes = ref(true)
  const currentView = ref('perspective')
  const activeTool = ref('rotate')
  
  // 辅助对象
  const gridMesh = ref<Mesh | null>(null)
  const axesViewer = ref<AxesViewer | null>(null)
  const shadowGenerator = ref<ShadowGenerator | null>(null)

  const initViewer = (options: ViewerOptions = {}) => {
    if (!canvasRef.value) {
      throw new Error('Canvas element is required')
    }

    if (isInitialized.value) {
      return
    }

    try {
      engine.value = new Engine(canvasRef.value, true, {
        preserveDrawingBuffer: true,
        stencil: true,
      })

      scene.value = new Scene(engine.value)
      scene.value.clearColor = options.clearColor || new Color4(31/255, 41/255, 55/255, 1)

      // 创建相机
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

      // 创建光源
      light.value = new HemisphericLight('ambientLight', new Vector3(0, 1, 0), scene.value)
      light.value.intensity = 0.6

      directionalLight.value = new DirectionalLight('directionalLight', new Vector3(-1, -1, -1), scene.value)
      directionalLight.value.intensity = 0.8
      directionalLight.value.position = new Vector3(10, 10, 10)

      // 创建阴影生成器
      shadowGenerator.value = new ShadowGenerator(1024, directionalLight.value)
      shadowGenerator.value.useBlurExponentialShadowMap = true

      // 初始化网格
      createGrid()
      
      // 初始化坐标轴
      createAxes()

      engine.value.runRenderLoop(() => {
        if (scene.value) {
          scene.value.render()
        }
      })

      window.addEventListener('resize', handleResize)
      isInitialized.value = true
      
      console.log('[3DViewer] Viewer initialized successfully')
    } catch (error) {
      console.error('[3DViewer] Failed to initialize viewer:', error)
      throw error
    }
  }

  const handleResize = () => {
    if (engine.value) {
      engine.value.resize()
    }
  }

  const createGrid = () => {
    if (!scene.value) return

    try {
      // 创建网格材质
      const gridMaterial = new GridMaterial('gridMaterial', scene.value)
      gridMaterial.majorUnitFrequency = 5
      gridMaterial.minorUnitVisibility = 0.45
      gridMaterial.gridRatio = 1
      gridMaterial.backFaceCulling = false
      gridMaterial.mainColor = new Color3(1, 1, 1)
      gridMaterial.lineColor = new Color3(1.0, 1.0, 1.0)
      gridMaterial.opacity = 0.98

      // 创建网格平面
      gridMesh.value = MeshBuilder.CreateGround('grid', { width: 50, height: 50 }, scene.value)
      gridMesh.value.material = gridMaterial
      gridMesh.value.receiveShadows = true
      gridMesh.value.setEnabled(showGrid.value)
      
      console.log('[3DViewer] Grid created successfully')
    } catch (error) {
      console.error('[3DViewer] Failed to create grid:', error)
    }
  }

  const createAxes = () => {
    if (!scene.value) return

    try {
      // 创建更小的坐标轴 (长度从2改为1)
      if (showAxes.value) {
        axesViewer.value = new AxesViewer(scene.value, 1)
      }
      
      console.log('[3DViewer] Axes created successfully')
    } catch (error) {
      console.error('[3DViewer] Failed to create axes:', error)
    }
  }

  const loadModel = async (url: string, fileName?: string): Promise<void> => {
    if (!scene.value) {
      throw new Error('Scene not initialized. Call initViewer() first.')
    }

    if (!url || typeof url !== 'string') {
      const errorMessage = 'Invalid model URL provided'
      loadError.value = errorMessage
      throw new Error(errorMessage)
    }

    const supportedExtensions = ['.glb', '.gltf', '.fbx', '.obj', '.stl', '.babylon']
    const urlLower = url.toLowerCase()
    
    const getFileExtension = (url: string): string => {
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
      const errorMessage = `Unsupported file format. Supported formats: ${supportedExtensions.join(', ')}`
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

      const result: ISceneLoaderAsyncResult = await SceneLoader.ImportMeshAsync(
        '',
        '',
        url,
        scene.value
      )

      if (!result || !result.meshes || result.meshes.length === 0) {
        throw new Error('No meshes found in the model file')
      }

      const rootMesh = result.meshes[0]
      currentModel.value = rootMesh

      // 设置阴影
      if (shadowGenerator.value) {
        result.meshes.forEach(mesh => {
          if (mesh instanceof Mesh) {
            shadowGenerator.value!.addShadowCaster(mesh)
            mesh.receiveShadows = true
          }
        })
      }

      frameModel(rootMesh)
      updateModelInfo(result.meshes)
      applyWireframeMode(showWireframe.value)

      console.log('[3DViewer] Model loaded successfully')
      isLoading.value = false
    } catch (error) {
      isLoading.value = false
      
      let errorMessage = 'Failed to load model'
      if (error instanceof Error) {
        errorMessage = `Loading error: ${error.message}`
      }
      
      console.error('[3DViewer] Model loading failed:', error)
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
    camera.value.radius = maxDim * 2.5
    camera.value.alpha = -Math.PI / 4
    camera.value.beta = Math.PI / 3
  }

  const updateModelInfo = (meshes: AbstractMesh[]) => {
    let totalVertices = 0
    let totalFaces = 0
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

    if (currentModel.value) {
      const boundingInfo = currentModel.value.getHierarchyBoundingVectors()
      const min = boundingInfo.min
      const max = boundingInfo.max
      const size = max.subtract(min)
      const center = min.add(max).scale(0.5)

      modelInfo.value = {
        vertices: totalVertices,
        faces: Math.floor(totalFaces),
        materials: materials.size,
        boundingBox: { min, max, size, center }
      }
    }
  }

  // 控制功能实现
  const setViewMode = (mode: string) => {
    if (!camera.value) return

    currentView.value = mode
    
    switch (mode) {
      case 'perspective':
        camera.value.mode = 0
        break
      case 'orthographic':
        camera.value.mode = 1
        break
      case 'top':
        camera.value.alpha = 0
        camera.value.beta = 0.1
        break
      case 'front':
        camera.value.alpha = -Math.PI / 2
        camera.value.beta = Math.PI / 2
        break
      case 'side':
        camera.value.alpha = 0
        camera.value.beta = Math.PI / 2
        break
    }
  }

  const toggleWireframe = (enabled?: boolean) => {
    const newState = enabled !== undefined ? enabled : !showWireframe.value
    showWireframe.value = newState
    applyWireframeMode(newState)
  }

  const applyWireframeMode = (enabled: boolean) => {
    if (!scene.value) return

    scene.value.meshes.forEach(mesh => {
      if (mesh.material && mesh !== gridMesh.value) {
        mesh.material.wireframe = enabled
      }
    })
  }

  const toggleGrid = (enabled?: boolean) => {
    const newState = enabled !== undefined ? enabled : !showGrid.value
    showGrid.value = newState
    
    if (gridMesh.value) {
      gridMesh.value.setEnabled(newState)
    }
  }

  const toggleAxes = (enabled?: boolean) => {
    const newState = enabled !== undefined ? enabled : !showAxes.value
    showAxes.value = newState
    
    if (!scene.value) return
    
    // 销毁现有的坐标轴
    if (axesViewer.value) {
      axesViewer.value.dispose()
      axesViewer.value = null
    }
    
    // 如果需要显示，重新创建坐标轴
    if (newState) {
      try {
        axesViewer.value = new AxesViewer(scene.value, 1)
        console.log('[3DViewer] Axes toggled on')
      } catch (error) {
        console.error('[3DViewer] Failed to create axes:', error)
      }
    } else {
      console.log('[3DViewer] Axes toggled off')
    }
  }

  const resetCamera = () => {
    if (!camera.value) return

    if (currentModel.value) {
      frameModel(currentModel.value)
    } else {
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

  const updateTransform = (transform: Transform) => {
    if (!currentModel.value) return

    currentModel.value.position.x = transform.position.x
    currentModel.value.position.y = transform.position.y
    currentModel.value.position.z = transform.position.z

    currentModel.value.rotation.x = Tools.ToRadians(transform.rotation.x)
    currentModel.value.rotation.y = Tools.ToRadians(transform.rotation.y)
    currentModel.value.rotation.z = Tools.ToRadians(transform.rotation.z)

    currentModel.value.scaling.x = transform.scale.x
    currentModel.value.scaling.y = transform.scale.y
    currentModel.value.scaling.z = transform.scale.z
  }

  const takeScreenshot = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!engine.value) {
        reject(new Error('Engine not initialized'))
        return
      }

      try {
        const canvas = engine.value.getRenderingCanvas()
        if (canvas) {
          const dataURL = canvas.toDataURL('image/png')
          resolve(dataURL)
        } else {
          reject(new Error('Canvas not found'))
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  // 导出功能
  const exportSTL = async (): Promise<Blob | null> => {
    if (!currentModel.value || !scene.value) {
      throw new Error('No model loaded')
    }

    try {
      const stlString = STLExport.CreateSTL([currentModel.value], true, currentModel.value.name || 'model')
      return new Blob([stlString], { type: 'application/octet-stream' })
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

  const dispose = () => {
    window.removeEventListener('resize', handleResize)
    
    if (axesViewer.value) {
      axesViewer.value.dispose()
      axesViewer.value = null
    }

    if (gridMesh.value) {
      gridMesh.value.dispose()
      gridMesh.value = null
    }

    if (shadowGenerator.value) {
      shadowGenerator.value.dispose()
      shadowGenerator.value = null
    }
    
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
    // 核心对象
    engine,
    scene,
    camera,
    light,
    directionalLight,
    currentModel,
    
    // 状态
    isInitialized,
    isLoading,
    loadError,
    modelInfo,
    showWireframe,
    showGrid,
    showAxes,
    currentView,
    activeTool,
    
    // 核心方法
    initViewer,
    loadModel,
    dispose,
    
    // 控制方法
    setViewMode,
    toggleWireframe,
    toggleGrid,
    toggleAxes,
    resetCamera,
    setZoom,
    rotateModel,
    updateTransform,
    takeScreenshot,
    
    // 导出方法
    exportSTL,
    exportGLB,
  }
}
