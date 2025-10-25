import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { ref } from 'vue'
import { use3DViewer } from '../use3DViewer'
import {
  Vector3,
  SceneLoader,
} from '@babylonjs/core'

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
    lowerRadiusLimit = 1
    upperRadiusLimit = 100
    target = new (actual as { Vector3: typeof Vector3 }).Vector3()
    radius = 3
    alpha = 0
    beta = 0
  }
  
  class MockHemisphericLight {
    intensity = 1.0
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
    Vector3: actual.Vector3,
    Color4: actual.Color4,
  }
})

vi.mock('@babylonjs/serializers', () => ({
  STLExport: {
    CreateSTL: vi.fn(),
  },
}))

vi.mock('@babylonjs/serializers/glTF', () => ({
  GLTF2Export: {
    GLBAsync: vi.fn(),
    GLTFAsync: vi.fn(),
  },
}))

vi.mock('@babylonjs/serializers/OBJ', () => ({
  OBJExport: {
    OBJ: vi.fn(),
  },
}))

describe('use3DViewer - Import/Export', () => {
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

  describe('Model Import', () => {
    it('should load GLB model successfully', async () => {
      const { initViewer, loadModel, currentModel, isLoading } = use3DViewer(canvasRef)
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
      } as any)

      expect(isLoading.value).toBe(false)
      await loadModel('test.glb')

      expect(SceneLoader.ImportMeshAsync).toHaveBeenCalledWith('', '', 'test.glb', expect.anything())
      expect(currentModel.value).toEqual(mockMesh)
      expect(isLoading.value).toBe(false)
    })

    it('should load GLTF model successfully', async () => {
      const { initViewer, loadModel } = use3DViewer(canvasRef)
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
      } as any)

      await loadModel('test.gltf')

      expect(SceneLoader.ImportMeshAsync).toHaveBeenCalledWith('', '', 'test.gltf', expect.anything())
    })

    it('should load STL model successfully', async () => {
      const { initViewer, loadModel } = use3DViewer(canvasRef)
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
      } as any)

      await loadModel('test.stl')

      expect(SceneLoader.ImportMeshAsync).toHaveBeenCalledWith('', '', 'test.stl', expect.anything())
    })

    it('should load OBJ model successfully', async () => {
      const { initViewer, loadModel } = use3DViewer(canvasRef)
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
      } as any)

      await loadModel('test.obj')

      expect(SceneLoader.ImportMeshAsync).toHaveBeenCalledWith('', '', 'test.obj', expect.anything())
    })

    it('should handle load error', async () => {
      const { initViewer, loadModel, loadError } = use3DViewer(canvasRef)
      initViewer()

      vi.mocked(SceneLoader.ImportMeshAsync).mockRejectedValue(new Error('Failed to load'))

      await expect(loadModel('invalid.glb')).rejects.toThrow()
      expect(loadError.value).toBeTruthy()
    })

    it('should dispose previous model before loading new one', async () => {
      const { initViewer, loadModel } = use3DViewer(canvasRef)
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
        .mockResolvedValueOnce({ meshes: [mockMesh1] } as any)
        .mockResolvedValueOnce({ meshes: [mockMesh2] } as any)

      await loadModel('model1.glb')
      await loadModel('model2.glb')

      expect(mockMesh1.dispose).toHaveBeenCalled()
    })
  })

  describe('STL Export', () => {
    it('should export model as STL', async () => {
      const { initViewer, loadModel, exportSTL } = use3DViewer(canvasRef)
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
      } as any)

      const { STLExport } = await import('@babylonjs/serializers')
      vi.mocked(STLExport.CreateSTL).mockReturnValue('STL_DATA')

      await loadModel('test.glb')
      const blob = exportSTL()

      expect(STLExport.CreateSTL).toHaveBeenCalled()
      expect(blob).toBeInstanceOf(Blob)
      expect(blob?.type).toBe('model/stl')
    })

    it('should return null if no model loaded', () => {
      const { initViewer, exportSTL } = use3DViewer(canvasRef)
      initViewer()

      const blob = exportSTL()
      expect(blob).toBeNull()
    })

    it('should return null if scene not initialized', () => {
      const { exportSTL } = use3DViewer(canvasRef)

      const blob = exportSTL()
      expect(blob).toBeNull()
    })
  })

  describe('GLB Export', () => {
    it('should export model as GLB', async () => {
      const { initViewer, loadModel, exportGLB } = use3DViewer(canvasRef)
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
      } as any)

      const mockBlob = new Blob(['GLB_DATA'], { type: 'model/gltf-binary' })
      const { GLTF2Export } = await import('@babylonjs/serializers/glTF')
      vi.mocked(GLTF2Export.GLBAsync).mockResolvedValue({
        glTFFiles: {
          'model.glb': mockBlob,
        },
      } as any)

      await loadModel('test.glb')
      const blob = await exportGLB()

      expect(GLTF2Export.GLBAsync).toHaveBeenCalled()
      expect(blob).toBe(mockBlob)
    })

    it('should return null if no scene initialized', async () => {
      const { exportGLB } = use3DViewer(canvasRef)

      const blob = await exportGLB()
      expect(blob).toBeNull()
    })

    it('should handle export error', async () => {
      const { initViewer, loadModel, exportGLB } = use3DViewer(canvasRef)
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
      } as any)

      const { GLTF2Export } = await import('@babylonjs/serializers/glTF')
      vi.mocked(GLTF2Export.GLBAsync).mockRejectedValue(new Error('Export failed'))

      await loadModel('test.glb')
      const blob = await exportGLB()

      expect(blob).toBeNull()
    })
  })

  describe('GLTF Export', () => {
    it('should export model as GLTF with separate files', async () => {
      const { initViewer, loadModel, exportGLTF } = use3DViewer(canvasRef)
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
      } as any)

      const { GLTF2Export } = await import('@babylonjs/serializers/glTF')
      vi.mocked(GLTF2Export.GLTFAsync).mockResolvedValue({
        glTFFiles: {
          'model.gltf': { some: 'data' },
          'model.bin': new ArrayBuffer(8),
        },
      } as any)

      await loadModel('test.glb')
      const result = await exportGLTF()

      expect(GLTF2Export.GLTFAsync).toHaveBeenCalled()
      expect(result).toBeTruthy()
      expect(result?.gltf).toBeInstanceOf(Blob)
      expect(result?.bin).toBeInstanceOf(Blob)
    })

    it('should export GLTF without bin file', async () => {
      const { initViewer, loadModel, exportGLTF } = use3DViewer(canvasRef)
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
      } as any)

      const { GLTF2Export } = await import('@babylonjs/serializers/glTF')
      vi.mocked(GLTF2Export.GLTFAsync).mockResolvedValue({
        glTFFiles: {
          'model.gltf': { some: 'data' },
        },
      } as any)

      await loadModel('test.glb')
      const result = await exportGLTF()

      expect(result).toBeTruthy()
      expect(result?.gltf).toBeInstanceOf(Blob)
      expect(result?.bin).toBeNull()
    })

    it('should return null if no scene initialized', async () => {
      const { exportGLTF } = use3DViewer(canvasRef)

      const result = await exportGLTF()
      expect(result).toBeNull()
    })

    it('should handle export error', async () => {
      const { initViewer, loadModel, exportGLTF } = use3DViewer(canvasRef)
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
      } as any)

      const { GLTF2Export } = await import('@babylonjs/serializers/glTF')
      vi.mocked(GLTF2Export.GLTFAsync).mockRejectedValue(new Error('Export failed'))

      await loadModel('test.glb')
      const result = await exportGLTF()

      expect(result).toBeNull()
    })
  })

  describe('OBJ Export', () => {
    it('should export model as OBJ', async () => {
      const { initViewer, loadModel, exportOBJ } = use3DViewer(canvasRef)
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
      } as any)

      const { OBJExport } = await import('@babylonjs/serializers/OBJ')
      vi.mocked(OBJExport.OBJ).mockReturnValue('OBJ_DATA')

      await loadModel('test.glb')
      const blob = await exportOBJ()

      expect(OBJExport.OBJ).toHaveBeenCalled()
      expect(blob).toBeInstanceOf(Blob)
      expect(blob?.type).toBe('model/obj')
    })

    it('should return null if no scene initialized', async () => {
      const { exportOBJ } = use3DViewer(canvasRef)

      const blob = await exportOBJ()
      expect(blob).toBeNull()
    })

    it('should handle export error', async () => {
      const { initViewer, loadModel, exportOBJ } = use3DViewer(canvasRef)
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
      } as any)

      const { OBJExport } = await import('@babylonjs/serializers/OBJ')
      vi.mocked(OBJExport.OBJ).mockImplementation(() => {
        throw new Error('Export failed')
      })

      await loadModel('test.glb')
      const blob = await exportOBJ()

      expect(blob).toBeNull()
    })
  })

  describe('Model Info', () => {
    it('should calculate model info after loading', async () => {
      const { initViewer, loadModel, modelInfo } = use3DViewer(canvasRef)
      initViewer()

      const mockMesh = {
        name: 'testModel',
        getTotalVertices: vi.fn().mockReturnValue(100),
        getTotalIndices: vi.fn().mockReturnValue(300),
        material: { uniqueId: 1 },
        getHierarchyBoundingVectors: vi.fn().mockReturnValue({
          min: new Vector3(-1, -1, -1),
          max: new Vector3(1, 1, 1),
        }),
      }

      vi.mocked(SceneLoader.ImportMeshAsync).mockResolvedValue({
        meshes: [mockMesh],
      } as any)

      await loadModel('test.glb')

      expect(modelInfo.value).toBeTruthy()
      expect(modelInfo.value?.vertices).toBe(100)
      expect(modelInfo.value?.faces).toBe(100)
      expect(modelInfo.value?.materials).toBe(1)
      expect(modelInfo.value?.boundingBox).toBeTruthy()
    })
  })
})
