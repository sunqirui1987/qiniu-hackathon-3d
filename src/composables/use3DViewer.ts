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
  type ISceneLoaderAsyncResult
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

export function use3DViewer(canvasRef: Ref<HTMLCanvasElement | null>) {
  const engine = ref<Engine | null>(null)
  const scene = ref<Scene | null>(null)
  const camera = ref<ArcRotateCamera | null>(null)
  const light = ref<HemisphericLight | null>(null)
  const currentModel = ref<AbstractMesh | null>(null)
  const isLoading = ref(false)
  const loadError = ref<string | null>(null)
  const modelInfo = ref<ModelInfo | null>(null)

  const initViewer = (options: ViewerOptions = {}) => {
    if (!canvasRef.value) {
      console.error('Canvas element not found')
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
  }

  const handleResize = () => {
    if (engine.value) {
      engine.value.resize()
    }
  }

  const loadModel = async (url: string, _fileName?: string): Promise<void> => {
    if (!scene.value) {
      throw new Error('Scene not initialized')
    }

    isLoading.value = true
    loadError.value = null

    try {
      if (currentModel.value) {
        currentModel.value.dispose()
        currentModel.value = null
      }

      const result: ISceneLoaderAsyncResult = await SceneLoader.ImportMeshAsync(
        '',
        '',
        url,
        scene.value
      )

      if (result.meshes.length > 0) {
        const rootMesh = result.meshes[0]
        currentModel.value = rootMesh

        frameModel(rootMesh)
        
        updateModelInfo(result.meshes)
      }

      isLoading.value = false
    } catch (error) {
      isLoading.value = false
      loadError.value = error instanceof Error ? error.message : 'Failed to load model'
      throw error
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

  const exportSTL = (): Blob | null => {
    if (!currentModel.value || !scene.value) {
      console.error('No model to export')
      return null
    }

    try {
      const stlString = STLExport.CreateSTL([currentModel.value], false, currentModel.value.name || 'model')
      const blob = new Blob([stlString], { type: 'model/stl' })
      return blob
    } catch (error) {
      console.error('Failed to export STL:', error)
      return null
    }
  }

  const exportGLB = async (): Promise<Blob | null> => {
    if (!scene.value) {
      console.error('Scene not initialized')
      return null
    }

    try {
      const { GLTF2Export } = await import('@babylonjs/serializers/glTF')
      const glb = await GLTF2Export.GLBAsync(scene.value, 'model')
      return glb.glTFFiles['model.glb'] as Blob
    } catch (error) {
      console.error('Failed to export GLB:', error)
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

  const disposeViewer = () => {
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
  }

  onUnmounted(() => {
    disposeViewer()
  })

  return {
    engine,
    scene,
    camera,
    light,
    currentModel,
    isLoading,
    loadError,
    modelInfo,
    initViewer,
    loadModel,
    exportSTL,
    exportGLB,
    resetCamera,
    setZoom,
    rotateModel,
    disposeViewer,
  }
}
