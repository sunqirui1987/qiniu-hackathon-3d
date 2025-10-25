import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FormatConverter } from '../formatConverter'
import * as BABYLON from '@babylonjs/core'

vi.mock('@babylonjs/core', () => ({
  NullEngine: vi.fn(function() {
    return {
      dispose: vi.fn(),
    }
  }),
  Scene: vi.fn(function() {
    return {
      dispose: vi.fn(),
      meshes: [],
    }
  }),
  SceneLoader: {
    AppendAsync: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('@babylonjs/serializers', () => ({
  STLExport: {
    CreateSTL: vi.fn().mockReturnValue('mock-stl-data'),
  },
}))

global.URL.createObjectURL = vi.fn(() => 'mock-url')
global.URL.revokeObjectURL = vi.fn()

describe('FormatConverter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSupportedFormats', () => {
    it('should return list of supported formats', () => {
      const formats = FormatConverter.getSupportedFormats()
      expect(formats).toContain('glb')
      expect(formats).toContain('gltf')
      expect(formats).toContain('obj')
      expect(formats).toContain('stl')
      expect(formats).toContain('3mf')
    })
  })

  describe('isFormatSupported', () => {
    it('should return true for supported formats', () => {
      expect(FormatConverter.isFormatSupported('model.glb')).toBe(true)
      expect(FormatConverter.isFormatSupported('model.gltf')).toBe(true)
      expect(FormatConverter.isFormatSupported('model.obj')).toBe(true)
      expect(FormatConverter.isFormatSupported('model.stl')).toBe(true)
      expect(FormatConverter.isFormatSupported('model.3mf')).toBe(true)
    })

    it('should return false for unsupported formats', () => {
      expect(FormatConverter.isFormatSupported('model.fbx')).toBe(false)
      expect(FormatConverter.isFormatSupported('model.blend')).toBe(false)
      expect(FormatConverter.isFormatSupported('model.max')).toBe(false)
    })

    it('should be case insensitive', () => {
      expect(FormatConverter.isFormatSupported('model.GLB')).toBe(true)
      expect(FormatConverter.isFormatSupported('model.GLTF')).toBe(true)
      expect(FormatConverter.isFormatSupported('model.OBJ')).toBe(true)
    })
  })

  describe('needsConversion', () => {
    it('should return true for formats that need conversion', () => {
      expect(FormatConverter.needsConversion('model.glb')).toBe(true)
      expect(FormatConverter.needsConversion('model.gltf')).toBe(true)
      expect(FormatConverter.needsConversion('model.obj')).toBe(true)
    })

    it('should return false for STL and 3MF formats', () => {
      expect(FormatConverter.needsConversion('model.stl')).toBe(false)
      expect(FormatConverter.needsConversion('model.3mf')).toBe(false)
    })
  })

  describe('glbToStl', () => {
    it('should convert GLB file to STL successfully', async () => {
      const mockFile = new File(['mock-data'], 'model.glb', { type: 'model/gltf-binary' })

      const result = await FormatConverter.glbToStl(mockFile)

      expect(result.success).toBe(true)
      expect(result.data).toBeInstanceOf(Blob)
      expect(BABYLON.SceneLoader.AppendAsync).toHaveBeenCalled()
    })

    it('should handle conversion errors', async () => {
      vi.mocked(BABYLON.SceneLoader.AppendAsync).mockRejectedValueOnce(
        new Error('Failed to load')
      )

      const mockFile = new File(['mock-data'], 'model.glb', { type: 'model/gltf-binary' })

      const result = await FormatConverter.glbToStl(mockFile)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed')
    })

    it('should apply scale option', async () => {
      const mockMesh = { scaling: { scaleInPlace: vi.fn() } }
      const mockScene = {
        dispose: vi.fn(),
        meshes: [mockMesh],
      }
      vi.mocked(BABYLON.Scene).mockImplementationOnce(function() {
        return mockScene as never
      })

      const mockFile = new File(['mock-data'], 'model.glb', { type: 'model/gltf-binary' })

      await FormatConverter.glbToStl(mockFile, { scale: 2 })

      expect(mockMesh.scaling.scaleInPlace).toHaveBeenCalledWith(2)
    })
  })

  describe('gltfToStl', () => {
    it('should convert GLTF file to STL successfully', async () => {
      const mockFile = new File(['mock-data'], 'model.gltf', { type: 'model/gltf+json' })

      const result = await FormatConverter.gltfToStl(mockFile)

      expect(result.success).toBe(true)
      expect(result.data).toBeInstanceOf(Blob)
      expect(BABYLON.SceneLoader.AppendAsync).toHaveBeenCalledWith(
        '',
        'mock-url',
        expect.anything(),
        undefined,
        '.gltf'
      )
    })

    it('should handle conversion errors', async () => {
      vi.mocked(BABYLON.SceneLoader.AppendAsync).mockRejectedValueOnce(
        new Error('Failed to load')
      )

      const mockFile = new File(['mock-data'], 'model.gltf', { type: 'model/gltf+json' })

      const result = await FormatConverter.gltfToStl(mockFile)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to load')
    })
  })

  describe('objToStl', () => {
    it('should convert OBJ file to STL successfully', async () => {
      const mockFile = new File(['mock-data'], 'model.obj', { type: 'model/obj' })

      const result = await FormatConverter.objToStl(mockFile)

      expect(result.success).toBe(true)
      expect(result.data).toBeInstanceOf(Blob)
      expect(BABYLON.SceneLoader.AppendAsync).toHaveBeenCalledWith(
        '',
        'mock-url',
        expect.anything(),
        undefined,
        '.obj'
      )
    })

    it('should handle conversion errors', async () => {
      vi.mocked(BABYLON.SceneLoader.AppendAsync).mockRejectedValueOnce(
        new Error('Failed to load')
      )

      const mockFile = new File(['mock-data'], 'model.obj', { type: 'model/obj' })

      const result = await FormatConverter.objToStl(mockFile)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to load')
    })
  })

  describe('convertToStl', () => {
    it('should route GLB files to glbToStl', async () => {
      const mockFile = new File(['mock-data'], 'model.glb', { type: 'model/gltf-binary' })

      const result = await FormatConverter.convertToStl(mockFile)

      expect(result.success).toBe(true)
      expect(BABYLON.SceneLoader.AppendAsync).toHaveBeenCalledWith(
        '',
        'mock-url',
        expect.anything(),
        undefined,
        '.glb'
      )
    })

    it('should route GLTF files to gltfToStl', async () => {
      const mockFile = new File(['mock-data'], 'model.gltf', { type: 'model/gltf+json' })

      const result = await FormatConverter.convertToStl(mockFile)

      expect(result.success).toBe(true)
      expect(BABYLON.SceneLoader.AppendAsync).toHaveBeenCalledWith(
        '',
        'mock-url',
        expect.anything(),
        undefined,
        '.gltf'
      )
    })

    it('should route OBJ files to objToStl', async () => {
      const mockFile = new File(['mock-data'], 'model.obj', { type: 'model/obj' })

      const result = await FormatConverter.convertToStl(mockFile)

      expect(result.success).toBe(true)
      expect(BABYLON.SceneLoader.AppendAsync).toHaveBeenCalledWith(
        '',
        'mock-url',
        expect.anything(),
        undefined,
        '.obj'
      )
    })

    it('should return original file for STL format', async () => {
      const mockFile = new File(['mock-data'], 'model.stl', { type: 'model/stl' })

      const result = await FormatConverter.convertToStl(mockFile)

      expect(result.success).toBe(true)
      expect(result.data).toBe(mockFile)
    })

    it('should return info message for 3MF format', async () => {
      const mockFile = new File(['mock-data'], 'model.3mf', { type: 'application/3mf' })

      const result = await FormatConverter.convertToStl(mockFile)

      expect(result.success).toBe(false)
      expect(result.error).toContain('3MF')
      expect(result.error).toContain('Bambu Studio')
    })

    it('should handle unsupported formats', async () => {
      const mockFile = new File(['mock-data'], 'model.fbx', { type: 'application/octet-stream' })

      const result = await FormatConverter.convertToStl(mockFile)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unsupported')
      expect(result.error).toContain('fbx')
    })

    it('should pass conversion options through', async () => {
      const mockMesh = { scaling: { scaleInPlace: vi.fn() } }
      const mockScene = {
        dispose: vi.fn(),
        meshes: [mockMesh],
      }
      vi.mocked(BABYLON.Scene).mockImplementationOnce(function() {
        return mockScene as never
      })

      const mockFile = new File(['mock-data'], 'model.glb', { type: 'model/gltf-binary' })

      await FormatConverter.convertToStl(mockFile, { scale: 3, binary: false })

      expect(mockMesh.scaling.scaleInPlace).toHaveBeenCalledWith(3)
    })
  })
})
