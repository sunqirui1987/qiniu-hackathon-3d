import { ref, onUnmounted, type Ref } from 'vue'
import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  Vector3,
  SceneLoader,
  type AbstractMesh,
  type Camera,
  Color4,
  GLTFExportOptions,
} from '@babylonjs/core'
import '@babylonjs/loaders/glTF'
import '@babylonjs/loaders/STL'
import '@babylonjs/loaders/OBJ'
import { GLTF2Export, STLExport } from '@babylonjs/serializers'

export interface Use3DViewerOptions {
  canvasRef: Ref<HTMLCanvasElement | null>
}

export interface Use3DViewerReturn {
  scene: Ref<Scene | null>
  camera: Ref<Camera | null>
  engine: Ref<Engine | null>
  isInitialized: Ref<boolean>
  currentModel: Ref<AbstractMesh | null>
  initViewer: () => void
  loadModel: (url: string) => Promise<void>
  exportSTL: () => Promise<Blob | null>
  exportGLB: () => Promise<Blob | null>
  dispose: () => void
}

export function use3DViewer({ canvasRef }: Use3DViewerOptions): Use3DViewerReturn {
  const scene = ref<Scene | null>(null)
  const camera = ref<Camera | null>(null)
  const engine = ref<Engine | null>(null)
  const isInitialized = ref(false)
  const currentModel = ref<AbstractMesh | null>(null)

  const initViewer = () => {
    if (!canvasRef.value) {
      throw new Error('Canvas element is required')
    }

    if (isInitialized.value) {
      return
    }

    const babylonEngine = new Engine(canvasRef.value, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    })

    const babylonScene = new Scene(babylonEngine)
    babylonScene.clearColor = new Color4(0.2, 0.2, 0.2, 1)

    const babylonCamera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 2.5,
      3,
      Vector3.Zero(),
      babylonScene
    )
    babylonCamera.attachControl(canvasRef.value, true)
    babylonCamera.wheelPrecision = 50
    babylonCamera.minZ = 0.1

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), babylonScene)
    light.intensity = 0.7

    babylonEngine.runRenderLoop(() => {
      babylonScene.render()
    })

    window.addEventListener('resize', () => {
      babylonEngine.resize()
    })

    engine.value = babylonEngine
    scene.value = babylonScene
    camera.value = babylonCamera
    isInitialized.value = true
  }

  const loadModel = async (url: string): Promise<void> => {
    if (!scene.value) {
      throw new Error('Scene not initialized. Call initViewer() first.')
    }

    if (currentModel.value) {
      currentModel.value.dispose()
      currentModel.value = null
    }

    try {
      const result = await SceneLoader.ImportMeshAsync('', '', url, scene.value)

      if (result.meshes.length > 0) {
        const rootMesh = result.meshes[0]
        currentModel.value = rootMesh as AbstractMesh

        if (camera.value && camera.value instanceof ArcRotateCamera) {
          const boundingInfo = rootMesh.getHierarchyBoundingVectors(true)
          const center = boundingInfo.min.add(boundingInfo.max).scale(0.5)
          const size = boundingInfo.max.subtract(boundingInfo.min)
          const maxDimension = Math.max(size.x, size.y, size.z)

          camera.value.target = center
          camera.value.radius = maxDimension * 2
          camera.value.alpha = -Math.PI / 2
          camera.value.beta = Math.PI / 2.5
        }
      }
    } catch (error) {
      throw new Error(`Failed to load model: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const exportSTL = async (): Promise<Blob | null> => {
    if (!currentModel.value || !scene.value) {
      throw new Error('No model loaded')
    }

    try {
      const stlString = STLExport.CreateSTL([currentModel.value], true, currentModel.value.name || 'model')
      return new Blob([stlString], { type: 'application/octet-stream' })
    } catch (error) {
      throw new Error(`Failed to export STL: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const exportGLB = async (): Promise<Blob | null> => {
    if (!currentModel.value || !scene.value) {
      throw new Error('No model loaded')
    }

    try {
      const options: GLTFExportOptions = {
        shouldExportNode: (node) => node === currentModel.value || node.parent === currentModel.value,
      }

      const glb = await GLTF2Export.GLBAsync(scene.value, currentModel.value.name || 'model', options)
      const fileName = `${currentModel.value.name || 'model'}.glb`
      return glb.glTFFiles[fileName] as Blob
    } catch (error) {
      throw new Error(`Failed to export GLB: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const dispose = () => {
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
    scene,
    camera,
    engine,
    isInitialized,
    currentModel,
    initViewer,
    loadModel,
    exportSTL,
    exportGLB,
    dispose,
  }
}
