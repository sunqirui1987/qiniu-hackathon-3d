import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useImageTo3D } from '../useImageTo3D'
import { MeshyClient } from '../../utils/meshyClient'

vi.mock('../../utils/meshyClient', () => {
  class MockMeshyClient {
    uploadImage = vi.fn()
    createImageTo3D = vi.fn()
    pollTaskUntilComplete = vi.fn()
    cancelTask = vi.fn()
  }
  return {
    MeshyClient: MockMeshyClient,
  }
})

vi.mock('../../utils/errorHandler', () => ({
  getUserFriendlyErrorMessage: vi.fn((error) => {
    if (error instanceof Error) return error.message
    return String(error)
  }),
}))

describe('useImageTo3D', () => {
  let mockClient: {
    uploadImage: ReturnType<typeof vi.fn>
    createImageTo3D: ReturnType<typeof vi.fn>
    pollTaskUntilComplete: ReturnType<typeof vi.fn>
    cancelTask: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    mockClient = new (MeshyClient as never)()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with idle state', () => {
      const {
        status,
        progress,
        error,
        result,
        isUploading,
        isGenerating,
        isCompleted,
        hasError,
      } = useImageTo3D('test-api-key')

      expect(status.value).toBe('idle')
      expect(progress.value).toBe(0)
      expect(error.value).toBeNull()
      expect(result.value).toBeNull()
      expect(isUploading.value).toBe(false)
      expect(isGenerating.value).toBe(false)
      expect(isCompleted.value).toBe(false)
      expect(hasError.value).toBe(false)
    })
  })

  describe('generateFromImage with File', () => {
    it('should upload file and generate 3D model successfully', async () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' })
      const mockUploadResponse = {
        url: 'https://example.com/uploaded.png',
        filename: 'test.png',
      }
      const mockTaskResponse = { result: 'task-id' }
      const mockTaskStatus = {
        id: 'task-id',
        status: 'SUCCEEDED' as const,
        progress: 100,
        model_urls: {
          glb: 'https://example.com/model.glb',
        },
        thumbnail_url: 'https://example.com/thumbnail.png',
        created_at: '2024-01-01T00:00:00Z',
        finished_at: '2024-01-01T00:10:00Z',
      }

      mockClient.uploadImage.mockResolvedValue(mockUploadResponse)
      mockClient.createImageTo3D.mockResolvedValue(mockTaskResponse)
      mockClient.pollTaskUntilComplete.mockResolvedValue(mockTaskStatus)

      const { generateFromImage, status, result, uploadedImageUrl } = useImageTo3D('test-api-key')

      const model = await generateFromImage({
        image: mockFile,
        enablePBR: true,
      })

      expect(mockClient.uploadImage).toHaveBeenCalledWith(mockFile)
      expect(uploadedImageUrl.value).toBe('https://example.com/uploaded.png')
      expect(status.value).toBe('completed')
      expect(result.value).toEqual(model)
      expect(model.id).toBe('task-id')
      expect(model.url).toBe('https://example.com/model.glb')
    })

    it('should update status from uploading to generating', async () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' })
      const statusUpdates: string[] = []

      mockClient.uploadImage.mockImplementation(async () => {
        statusUpdates.push('uploading')
        return { url: 'https://example.com/uploaded.png', filename: 'test.png' }
      })
      mockClient.createImageTo3D.mockImplementation(async () => {
        statusUpdates.push('generating')
        return { result: 'task-id' }
      })
      mockClient.pollTaskUntilComplete.mockResolvedValue({
        id: 'task-id',
        status: 'SUCCEEDED' as const,
        progress: 100,
        model_urls: { glb: 'https://example.com/model.glb' },
        created_at: '2024-01-01T00:00:00Z',
        finished_at: '2024-01-01T00:10:00Z',
      })

      const { generateFromImage, status } = useImageTo3D('test-api-key')

      expect(status.value).toBe('idle')

      const promise = generateFromImage({ image: mockFile })
      
      await new Promise((resolve) => setTimeout(resolve, 10))
      
      await promise

      expect(statusUpdates).toContain('uploading')
      expect(statusUpdates).toContain('generating')
    })
  })

  describe('generateFromImage with URL', () => {
    it('should skip upload and use provided URL', async () => {
      const imageUrl = 'https://example.com/image.png'
      const mockTaskResponse = { result: 'task-id' }
      const mockTaskStatus = {
        id: 'task-id',
        status: 'SUCCEEDED' as const,
        progress: 100,
        model_urls: {
          glb: 'https://example.com/model.glb',
        },
        created_at: '2024-01-01T00:00:00Z',
        finished_at: '2024-01-01T00:10:00Z',
      }

      mockClient.createImageTo3D.mockResolvedValue(mockTaskResponse)
      mockClient.pollTaskUntilComplete.mockResolvedValue(mockTaskStatus)

      const { generateFromImage, uploadedImageUrl } = useImageTo3D('test-api-key')

      await generateFromImage({ image: imageUrl })

      expect(mockClient.uploadImage).not.toHaveBeenCalled()
      expect(uploadedImageUrl.value).toBe(imageUrl)
      expect(mockClient.createImageTo3D).toHaveBeenCalledWith(
        expect.objectContaining({ image_url: imageUrl })
      )
    })
  })

  describe('progress tracking', () => {
    it('should update progress during generation', async () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' })
      const progressUpdates: number[] = []

      mockClient.uploadImage.mockResolvedValue({
        url: 'https://example.com/uploaded.png',
        filename: 'test.png',
      })
      mockClient.createImageTo3D.mockResolvedValue({ result: 'task-id' })
      mockClient.pollTaskUntilComplete.mockImplementation(async (_taskId, _type, options) => {
        if (options?.onProgress) {
          options.onProgress(25)
          options.onProgress(50)
          options.onProgress(75)
          options.onProgress(100)
        }
        return {
          id: 'task-id',
          status: 'SUCCEEDED' as const,
          progress: 100,
          model_urls: { glb: 'https://example.com/model.glb' },
          created_at: '2024-01-01T00:00:00Z',
          finished_at: '2024-01-01T00:10:00Z',
        }
      })

      const { generateFromImage, progress } = useImageTo3D('test-api-key')

      await generateFromImage({ image: mockFile })

      expect(progress.value).toBe(100)
    })
  })

  describe('error handling', () => {
    it('should handle upload errors', async () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' })
      mockClient.uploadImage.mockRejectedValue(new Error('Upload failed'))

      const { generateFromImage, status, error, hasError } = useImageTo3D('test-api-key')

      await expect(generateFromImage({ image: mockFile })).rejects.toThrow('Upload failed')

      expect(status.value).toBe('error')
      expect(error.value).toBe('Upload failed')
      expect(hasError.value).toBe(true)
    })

    it('should handle generation errors', async () => {
      const imageUrl = 'https://example.com/image.png'
      mockClient.createImageTo3D.mockRejectedValue(new Error('Generation failed'))

      const { generateFromImage, status, error } = useImageTo3D('test-api-key')

      await expect(generateFromImage({ image: imageUrl })).rejects.toThrow('Generation failed')

      expect(status.value).toBe('error')
      expect(error.value).toBe('Generation failed')
    })
  })

  describe('cancel', () => {
    it('should cancel ongoing generation', async () => {
      mockClient.uploadImage.mockResolvedValue({
        url: 'https://example.com/uploaded.png',
        filename: 'test.png',
      })
      mockClient.createImageTo3D.mockResolvedValue({ result: 'task-id' })
      mockClient.pollTaskUntilComplete.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 10000))
      )

      const mockFile = new File(['test'], 'test.png', { type: 'image/png' })
      const { generateFromImage, cancel, status, error, isCancelled } = useImageTo3D('test-api-key')

      const generatePromise = generateFromImage({ image: mockFile })
      
      await new Promise((resolve) => setTimeout(resolve, 100))
      
      cancel()

      await generatePromise.catch(() => {})

      expect(status.value).toBe('cancelled')
      expect(error.value).toBe('Generation cancelled by user')
      expect(isCancelled.value).toBe(true)
      expect(mockClient.cancelTask).toHaveBeenCalledWith('task-id')
    })

    it('should not cancel if not generating or uploading', () => {
      const { cancel, status } = useImageTo3D('test-api-key')

      cancel()

      expect(status.value).toBe('idle')
      expect(mockClient.cancelTask).not.toHaveBeenCalled()
    })
  })

  describe('retry', () => {
    it('should retry generation and increment retry count', async () => {
      mockClient.uploadImage.mockResolvedValue({
        url: 'https://example.com/uploaded.png',
        filename: 'test.png',
      })
      mockClient.createImageTo3D.mockResolvedValue({ result: 'task-id' })
      mockClient.pollTaskUntilComplete.mockResolvedValue({
        id: 'task-id',
        status: 'SUCCEEDED' as const,
        progress: 100,
        model_urls: { glb: 'https://example.com/model.glb' },
        created_at: '2024-01-01T00:00:00Z',
        finished_at: '2024-01-01T00:10:00Z',
      })

      const mockFile = new File(['test'], 'test.png', { type: 'image/png' })
      const { retry, retryCount } = useImageTo3D('test-api-key')

      expect(retryCount.value).toBe(0)

      await retry({ image: mockFile })
      expect(retryCount.value).toBe(1)

      await retry({ image: mockFile })
      expect(retryCount.value).toBe(2)
    })
  })

  describe('reset', () => {
    it('should reset all state to initial values', async () => {
      const imageUrl = 'https://example.com/image.png'
      mockClient.createImageTo3D.mockResolvedValue({ result: 'task-id' })
      mockClient.pollTaskUntilComplete.mockResolvedValue({
        id: 'task-id',
        status: 'SUCCEEDED' as const,
        progress: 100,
        model_urls: { glb: 'https://example.com/model.glb' },
        created_at: '2024-01-01T00:00:00Z',
        finished_at: '2024-01-01T00:10:00Z',
      })

      const {
        generateFromImage,
        reset,
        status,
        progress,
        error,
        result,
        taskId,
        uploadedImageUrl,
        retryCount,
      } = useImageTo3D('test-api-key')

      await generateFromImage({ image: imageUrl })

      expect(status.value).toBe('completed')

      reset()

      expect(status.value).toBe('idle')
      expect(progress.value).toBe(0)
      expect(error.value).toBeNull()
      expect(result.value).toBeNull()
      expect(taskId.value).toBeNull()
      expect(uploadedImageUrl.value).toBeNull()
      expect(retryCount.value).toBe(0)
    })
  })

  describe('computed properties', () => {
    it('should compute all status flags correctly', () => {
      const { status, isUploading, isGenerating, isCompleted, hasError, isCancelled } = useImageTo3D('test-api-key')

      status.value = 'uploading'
      expect(isUploading.value).toBe(true)
      expect(isGenerating.value).toBe(false)

      status.value = 'generating'
      expect(isUploading.value).toBe(false)
      expect(isGenerating.value).toBe(true)

      status.value = 'completed'
      expect(isCompleted.value).toBe(true)

      status.value = 'error'
      expect(hasError.value).toBe(true)

      status.value = 'cancelled'
      expect(isCancelled.value).toBe(true)
    })
  })
})
