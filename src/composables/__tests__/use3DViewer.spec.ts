import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { ref } from 'vue'
import { use3DViewer } from '../use3DViewer'
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  SceneLoader,
  STLExport,
} from '@babylonjs/core'
import { GLTF2Export } from '@babylonjs/serializers'

vi.mock('@babylonjs/core', async () => {
  const actual = await vi.importActual('@babylonjs/core')
  
  class MockEngine {
    runRenderLoop = vi.fn()
    resize = vi.fn()
    dispose = vi.fn()
  }
  
  class MockScene {
    render = vi.fn()
    dispose = vi.fn()
    clearColor = {}
  }
  
  class MockArcRotateCamera {
    attachControl = vi.fn()
    wheelPrecision = 50
    minZ = 0.1
    target = new (actual as { Vector3: typeof Vector3 }).Vector3()
    radius = 3
    alpha = 0
    beta = 0
  }
  
  class MockHemisphericLight {
    intensity = 0.7
  }
  
  return {
    ...actual,
    Engine: MockEngine,
    Scene: MockScene,
    ArcRotateCamera: MockArcRotateCamera,
    HemisphericLight: MockHemisphericLight,
    SceneLoader: {
      ImportMeshAsync: vi.fn(),
    },
    STLExport: {
      CreateSTL: vi.fn(),
    },
    Vector3: actual.Vector3,
    Color4: actual.Color4,
  }
})

vi.mock('@babylonjs/serializers', () => ({
  GLTF2Export: {
    GLBAsync: vi.fn(),
  },
  STLExport: {
    CreateSTL: vi.fn(),
  },
}))

describe('use3DViewer', () => {
  let canvasRef: { value: HTMLCanvasElement | null }
  let mockCanvas: HTMLCanvasElement

  beforeEach(() => {
    mockCanvas = document.createElement('canvas')
    canvasRef = ref<HTMLCanvasElement | null>(mockCanvas)

    vi.spyOn(window, 'addEventListener').mockImplementation(() => {})
    vi.spyOn(window, 'removeEventListener').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initViewer', () => {
    it('should throw error if canvas is not provided', () => {
      canvasRef.value = null
      const { initViewer } = use3DViewer({ canvasRef })

      expect(() => initViewer()).toThrow('Canvas element is required')
    })

    it('should initialize engine, scene, camera and light', () => {
      const { initViewer, isInitialized, engine, scene, camera } = use3DViewer({ canvasRef })

      initViewer()

      expect(isInitialized.value).toBe(true)
      expect(engine.value).toBeTruthy()
      expect(scene.value).toBeTruthy()
      expect(camera.value).toBeTruthy()
      expect(engine.value).toBeInstanceOf(Engine)
      expect(scene.value).toBeInstanceOf(Scene)
      expect(camera.value).toBeInstanceOf(ArcRotateCamera)
    })

    it('should not reinitialize if already initialized', () => {
      const { initViewer, isInitialized, engine } = use3DViewer({ canvasRef })

      initViewer()
      const firstEngine = engine.value

      initViewer()
      const secondEngine = engine.value

      expect(isInitialized.value).toBe(true)
      expect(firstEngine).toBe(secondEngine)
    })

    it('should setup resize event listener', () => {
      const { initViewer } = use3DViewer({ canvasRef })

      initViewer()

      expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
    })
  })

  describe('loadModel', () => {
    it('should throw error if scene is not initialized', async () => {
      const { loadModel } = use3DViewer({ canvasRef })

      await expect(loadModel('test.glb')).rejects.toThrow('Scene not initialized. Call initViewer() first.')
    })

    it('should load model successfully', async () => {
      const { initViewer, loadModel, currentModel } = use3DViewer({ canvasRef })
      initViewer()

      const mockMesh = {
        name: 'testModel',
        getHierarchyBoundingVectors: vi.fn().mockReturnValue({
          min: new Vector3(0, 0, 0),
          max: new Vector3(1, 1, 1),
        }),
      }

      vi.mocked(SceneLoader.ImportMeshAsync).mockResolvedValue({
        meshes: [mockMesh],
      })

      await loadModel('test.glb')

      expect(SceneLoader.ImportMeshAsync).toHaveBeenCalledWith('', '', 'test.glb', expect.anything())
      expect(currentModel.value).toEqual(mockMesh)
    })

    it('should dispose previous model before loading new one', async () => {
      const { initViewer, loadModel } = use3DViewer({ canvasRef })
      initViewer()

      const mockMesh1 = {
        name: 'model1',
        dispose: vi.fn(),
        getHierarchyBoundingVectors: vi.fn().mockReturnValue({
          min: new Vector3(0, 0, 0),
          max: new Vector3(1, 1, 1),
        }),
      }

      const mockMesh2 = {
        name: 'model2',
        getHierarchyBoundingVectors: vi.fn().mockReturnValue({
          min: new Vector3(0, 0, 0),
          max: new Vector3(1, 1, 1),
        }),
      }

      vi.mocked(SceneLoader.ImportMeshAsync)
        .mockResolvedValueOnce({ meshes: [mockMesh1] })
        .mockResolvedValueOnce({ meshes: [mockMesh2] })

      await loadModel('model1.glb')
      await loadModel('model2.glb')

      expect(mockMesh1.dispose).toHaveBeenCalled()
    })

    it('should throw error on loading failure', async () => {
      const { initViewer, loadModel } = use3DViewer({ canvasRef })
      initViewer()

      vi.mocked(SceneLoader.ImportMeshAsync).mockRejectedValue(new Error('Load failed'))

      await expect(loadModel('invalid.glb')).rejects.toThrow('Failed to load model: Load failed')
    })

    it('should adjust camera based on model bounds', async () => {
      const { initViewer, loadModel, camera } = use3DViewer({ canvasRef })
      initViewer()

      const mockMesh = {
        name: 'testModel',
        getHierarchyBoundingVectors: vi.fn().mockReturnValue({
          min: new Vector3(-1, -1, -1),
          max: new Vector3(1, 1, 1),
        }),
      }

      vi.mocked(SceneLoader.ImportMeshAsync).mockResolvedValue({
        meshes: [mockMesh],
      })

      await loadModel('test.glb')

      expect(camera.value).toBeTruthy()
      if (camera.value && camera.value instanceof ArcRotateCamera) {
        expect(camera.value.radius).toBeGreaterThan(0)
      }
    })
  })

  describe('exportSTL', () => {
    it('should throw error if no model is loaded', async () => {
      const { initViewer, exportSTL } = use3DViewer({ canvasRef })
      initViewer()

      await expect(exportSTL()).rejects.toThrow('No model loaded')
    })

    it('should export model as STL', async () => {
      const { initViewer, loadModel, exportSTL } = use3DViewer({ canvasRef })
      initViewer()

      const mockMesh = {
        name: 'testModel',
        getHierarchyBoundingVectors: vi.fn().mockReturnValue({
          min: new Vector3(0, 0, 0),
          max: new Vector3(1, 1, 1),
        }),
      }

      vi.mocked(SceneLoader.ImportMeshAsync).mockResolvedValue({
        meshes: [mockMesh],
      })
      
      const { STLExport: mockSTLExport } = await import('@babylonjs/serializers')
      vi.mocked(mockSTLExport.CreateSTL).mockReturnValue('STL_DATA')

      await loadModel('test.glb')
      const blob = await exportSTL()

      expect(mockSTLExport.CreateSTL).toHaveBeenCalledWith([mockMesh], true, 'testModel')
      expect(blob).toBeInstanceOf(Blob)
      expect(blob?.type).toBe('application/octet-stream')
    })

    it('should throw error on export failure', async () => {
      const { initViewer, loadModel, exportSTL } = use3DViewer({ canvasRef })
      initViewer()

      const mockMesh = {
        name: 'testModel',
        getHierarchyBoundingVectors: vi.fn().mockReturnValue({
          min: new Vector3(0, 0, 0),
          max: new Vector3(1, 1, 1),
        }),
      }

      vi.mocked(SceneLoader.ImportMeshAsync).mockResolvedValue({
        meshes: [mockMesh],
      })
      
      const { STLExport: mockSTLExport } = await import('@babylonjs/serializers')
      vi.mocked(mockSTLExport.CreateSTL).mockImplementation(() => {
        throw new Error('Export failed')
      })

      await loadModel('test.glb')
      await expect(exportSTL()).rejects.toThrow('Failed to export STL: Export failed')
    })
  })

  describe('exportGLB', () => {
    it('should throw error if no model is loaded', async () => {
      const { initViewer, exportGLB } = use3DViewer({ canvasRef })
      initViewer()

      await expect(exportGLB()).rejects.toThrow('No model loaded')
    })

    it('should export model as GLB', async () => {
      const { initViewer, loadModel, exportGLB } = use3DViewer({ canvasRef })
      initViewer()

      const mockMesh = {
        name: 'testModel',
        parent: null,
        getHierarchyBoundingVectors: vi.fn().mockReturnValue({
          min: new Vector3(0, 0, 0),
          max: new Vector3(1, 1, 1),
        }),
      }

      const mockBlob = new Blob(['GLB_DATA'], { type: 'model/gltf-binary' })
      vi.mocked(SceneLoader.ImportMeshAsync).mockResolvedValue({
        meshes: [mockMesh],
      })
      vi.mocked(GLTF2Export.GLBAsync).mockResolvedValue({
        glTFFiles: {
          'testModel.glb': mockBlob,
        },
      })

      await loadModel('test.glb')
      const blob = await exportGLB()

      expect(GLTF2Export.GLBAsync).toHaveBeenCalled()
      expect(blob).toBe(mockBlob)
    })

    it('should throw error on export failure', async () => {
      const { initViewer, loadModel, exportGLB } = use3DViewer({ canvasRef })
      initViewer()

      const mockMesh = {
        name: 'testModel',
        getHierarchyBoundingVectors: vi.fn().mockReturnValue({
          min: new Vector3(0, 0, 0),
          max: new Vector3(1, 1, 1),
        }),
      }

      vi.mocked(SceneLoader.ImportMeshAsync).mockResolvedValue({
        meshes: [mockMesh],
      })
      vi.mocked(GLTF2Export.GLBAsync).mockRejectedValue(new Error('GLB export failed'))

      await loadModel('test.glb')
      await expect(exportGLB()).rejects.toThrow('Failed to export GLB: GLB export failed')
    })
  })

  describe('dispose', () => {
    it('should dispose all resources properly', async () => {
      const { initViewer, loadModel, dispose, isInitialized } = use3DViewer({ canvasRef })
      initViewer()

      const mockMesh = {
        name: 'testModel',
        dispose: vi.fn(),
        getHierarchyBoundingVectors: vi.fn().mockReturnValue({
          min: new Vector3(0, 0, 0),
          max: new Vector3(1, 1, 1),
        }),
      }

      vi.mocked(SceneLoader.ImportMeshAsync).mockResolvedValue({
        meshes: [mockMesh],
      })

      await loadModel('test.glb')
      dispose()

      expect(mockMesh.dispose).toHaveBeenCalled()
      expect(isInitialized.value).toBe(false)
    })

    it('should handle dispose when no model is loaded', () => {
      const { initViewer, dispose, isInitialized } = use3DViewer({ canvasRef })
      initViewer()

      expect(() => dispose()).not.toThrow()
      expect(isInitialized.value).toBe(false)
    })
  })

  describe('reactive state', () => {
    it('should update isInitialized ref', () => {
      const { initViewer, isInitialized } = use3DViewer({ canvasRef })

      expect(isInitialized.value).toBe(false)
      initViewer()
      expect(isInitialized.value).toBe(true)
    })

    it('should update currentModel ref after loading', async () => {
      const { initViewer, loadModel, currentModel } = use3DViewer({ canvasRef })
      initViewer()

      expect(currentModel.value).toBeNull()

      const mockMesh = {
        name: 'testModel',
        getHierarchyBoundingVectors: vi.fn().mockReturnValue({
          min: new Vector3(0, 0, 0),
          max: new Vector3(1, 1, 1),
        }),
      }

      vi.mocked(SceneLoader.ImportMeshAsync).mockResolvedValue({
        meshes: [mockMesh],
      })

      await loadModel('test.glb')
      expect(currentModel.value).toEqual(mockMesh)
    })
  })
})
