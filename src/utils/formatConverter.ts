import * as BABYLON from '@babylonjs/core'
import { STLExport } from '@babylonjs/serializers'

export interface ConversionResult {
  success: boolean
  data?: Blob
  error?: string
}

export interface ConversionOptions {
  binary?: boolean
  scale?: number
}

export class FormatConverter {
  static async glbToStl(
    file: File,
    options: ConversionOptions = {}
  ): Promise<ConversionResult> {
    try {
      const { binary = true, scale = 1 } = options

      const arrayBuffer = await file.arrayBuffer()
      const blob = new Blob([arrayBuffer])
      const url = URL.createObjectURL(blob)

      const engine = new BABYLON.NullEngine()
      const scene = new BABYLON.Scene(engine)

      await BABYLON.SceneLoader.AppendAsync('', url, scene, undefined, '.glb')

      URL.revokeObjectURL(url)

      if (scale !== 1) {
        scene.meshes.forEach((mesh) => {
          mesh.scaling.scaleInPlace(scale)
        })
      }

      const stlData = STLExport.CreateSTL(scene, !binary)

      const stlBlob = new Blob([stlData], {
        type: binary ? 'application/octet-stream' : 'text/plain',
      })

      scene.dispose()
      engine.dispose()

      return {
        success: true,
        data: stlBlob,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to convert GLB to STL',
      }
    }
  }

  static async gltfToStl(
    file: File,
    options: ConversionOptions = {}
  ): Promise<ConversionResult> {
    try {
      const { binary = true, scale = 1 } = options

      const arrayBuffer = await file.arrayBuffer()
      const blob = new Blob([arrayBuffer])
      const url = URL.createObjectURL(blob)

      const engine = new BABYLON.NullEngine()
      const scene = new BABYLON.Scene(engine)

      await BABYLON.SceneLoader.AppendAsync('', url, scene, undefined, '.gltf')

      URL.revokeObjectURL(url)

      if (scale !== 1) {
        scene.meshes.forEach((mesh) => {
          mesh.scaling.scaleInPlace(scale)
        })
      }

      const stlData = STLExport.CreateSTL(scene, !binary)

      const stlBlob = new Blob([stlData], {
        type: binary ? 'application/octet-stream' : 'text/plain',
      })

      scene.dispose()
      engine.dispose()

      return {
        success: true,
        data: stlBlob,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to convert GLTF to STL',
      }
    }
  }

  static async objToStl(
    file: File,
    options: ConversionOptions = {}
  ): Promise<ConversionResult> {
    try {
      const { binary = true, scale = 1 } = options

      const arrayBuffer = await file.arrayBuffer()
      const blob = new Blob([arrayBuffer])
      const url = URL.createObjectURL(blob)

      const engine = new BABYLON.NullEngine()
      const scene = new BABYLON.Scene(engine)

      await BABYLON.SceneLoader.AppendAsync('', url, scene, undefined, '.obj')

      URL.revokeObjectURL(url)

      if (scale !== 1) {
        scene.meshes.forEach((mesh) => {
          mesh.scaling.scaleInPlace(scale)
        })
      }

      const stlData = STLExport.CreateSTL(scene, !binary)

      const stlBlob = new Blob([stlData], {
        type: binary ? 'application/octet-stream' : 'text/plain',
      })

      scene.dispose()
      engine.dispose()

      return {
        success: true,
        data: stlBlob,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to convert OBJ to STL',
      }
    }
  }

  static async convertToStl(
    file: File,
    options: ConversionOptions = {}
  ): Promise<ConversionResult> {
    const extension = file.name.split('.').pop()?.toLowerCase()

    switch (extension) {
      case 'glb':
        return this.glbToStl(file, options)
      case 'gltf':
        return this.gltfToStl(file, options)
      case 'obj':
        return this.objToStl(file, options)
      case 'stl':
        return {
          success: true,
          data: file,
        }
      case '3mf':
        return {
          success: false,
          error: '3MF format is supported natively by Bambu Studio',
        }
      default:
        return {
          success: false,
          error: `Unsupported file format: ${extension}`,
        }
    }
  }

  static getSupportedFormats(): string[] {
    return ['glb', 'gltf', 'obj', 'stl', '3mf']
  }

  static isFormatSupported(filename: string): boolean {
    const extension = filename.split('.').pop()?.toLowerCase()
    return extension ? this.getSupportedFormats().includes(extension) : false
  }

  static needsConversion(filename: string): boolean {
    const extension = filename.split('.').pop()?.toLowerCase()
    return extension !== 'stl' && extension !== '3mf'
  }
}
