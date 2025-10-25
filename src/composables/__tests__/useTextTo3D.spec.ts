import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useTextTo3D } from '../useTextTo3D'

const mockClientInstance = vi.hoisted(() => ({
  createTextTo3DPreview: vi.fn(),
  createTextTo3DRefine: vi.fn(),
  pollTaskUntilComplete: vi.fn(),
  cancelTask: vi.fn(),
}))

vi.mock('../../utils/meshyClient', () => ({
  MeshyClient: vi.fn(() => mockClientInstance()),
}))

vi.mock('../../utils/errorHandler', () => ({
  getUserFriendlyErrorMessage: vi.fn((error) => {
    if (error instanceof Error) return error.message
    return String(error)
  }),
}))

describe('useTextTo3D', () => {
  beforeEach(() => {
    const instance = mockClientInstance()
    instance.createTextTo3DPreview.mockReset()
    instance.createTextTo3DRefine.mockReset()
    instance.pollTaskUntilComplete.mockReset()
    instance.cancelTask.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with idle state', () => {
      const { status, progress, error, result, isGenerating, isCompleted, hasError } = useTextTo3D('test-api-key')

      expect(status.value).toBe('idle')
      expect(progress.value).toBe(0)
      expect(error.value).toBeNull()
      expect(result.value).toBeNull()
      expect(isGenerating.value).toBe(false)
      expect(isCompleted.value).toBe(false)
      expect(hasError.value).toBe(false)
    })
  })

  describe('generateModel', () => {
    it('should generate a 3D model successfully', async () => {
      const mockPreviewResponse = { result: 'preview-task-id' }
      const mockPreviewStatus = {
        id: 'preview-task-id',
        status: 'SUCCEEDED' as const,
        progress: 100,
        created_at: '2024-01-01T00:00:00Z',
        finished_at: '2024-01-01T00:05:00Z',
      }
      const mockRefineResponse = { result: 'refine-task-id' }
      const mockRefineStatus = {
        id: 'refine-task-id',
        status: 'SUCCEEDED' as const,
        progress: 100,
        model_urls: {
          glb: 'https://example.com/model.glb',
        },
        thumbnail_url: 'https://example.com/thumbnail.png',
        created_at: '2024-01-01T00:05:00Z',
        finished_at: '2024-01-01T00:10:00Z',
      }

      mockClientInstance().createTextTo3DPreview.mockResolvedValue(mockPreviewResponse)
      mockClientInstance().pollTaskUntilComplete
        .mockResolvedValueOnce(mockPreviewStatus)
        .mockResolvedValueOnce(mockRefineStatus)
      mockClientInstance().createTextTo3DRefine.mockResolvedValue(mockRefineResponse)

      const { generateModel, status, progress, result } = useTextTo3D('test-api-key')

      const model = await generateModel({
        prompt: 'A futuristic robot',
        enablePBR: true,
      })

      expect(status.value).toBe('completed')
      expect(progress.value).toBe(100)
      expect(result.value).toEqual(model)
      expect(model.id).toBe('refine-task-id')
      expect(model.url).toBe('https://example.com/model.glb')
      expect(model.thumbnail).toBe('https://example.com/thumbnail.png')
    })

    it('should update progress during generation', async () => {
      const mockPreviewResponse = { result: 'preview-task-id' }
      const mockRefineResponse = { result: 'refine-task-id' }

      mockClientInstance().createTextTo3DPreview.mockResolvedValue(mockPreviewResponse)
      mockClientInstance().createTextTo3DRefine.mockResolvedValue(mockRefineResponse)
      mockClientInstance().pollTaskUntilComplete.mockImplementation(async (_taskId, _type, options) => {
        if (options?.onProgress) {
          options.onProgress(50)
          options.onProgress(75)
          options.onProgress(100)
        }
        return {
          id: _taskId,
          status: 'SUCCEEDED' as const,
          progress: 100,
          model_urls: { glb: 'https://example.com/model.glb' },
          created_at: '2024-01-01T00:00:00Z',
          finished_at: '2024-01-01T00:10:00Z',
        }
      })

      const { generateModel, progress } = useTextTo3D('test-api-key')

      await generateModel({ prompt: 'A robot' })

      expect(progress.value).toBe(100)
    })

    it('should handle generation errors', async () => {
      mockClientInstance().createTextTo3DPreview.mockRejectedValue(new Error('API Error'))

      const { generateModel, status, error, hasError } = useTextTo3D('test-api-key')

      await expect(generateModel({ prompt: 'A robot' })).rejects.toThrow('API Error')

      expect(status.value).toBe('error')
      expect(error.value).toBe('API Error')
      expect(hasError.value).toBe(true)
    })

    it('should reset state before starting new generation', async () => {
      mockClientInstance().createTextTo3DPreview.mockRejectedValue(new Error('First error'))

      const { generateModel, status, error } = useTextTo3D('test-api-key')

      await expect(generateModel({ prompt: 'First' })).rejects.toThrow()
      expect(status.value).toBe('error')
      expect(error.value).toBe('First error')

      mockClientInstance().createTextTo3DPreview.mockResolvedValue({ result: 'task-id' })
      mockClientInstance().createTextTo3DRefine.mockResolvedValue({ result: 'refine-id' })
      mockClientInstance().pollTaskUntilComplete.mockResolvedValue({
        id: 'refine-id',
        status: 'SUCCEEDED' as const,
        progress: 100,
        model_urls: { glb: 'https://example.com/model.glb' },
        created_at: '2024-01-01T00:00:00Z',
        finished_at: '2024-01-01T00:10:00Z',
      })

      await generateModel({ prompt: 'Second' })

      expect(status.value).toBe('completed')
      expect(error.value).toBeNull()
    })
  })

  describe('cancel', () => {
    it('should cancel ongoing generation', async () => {
      mockClientInstance().createTextTo3DPreview.mockResolvedValue({ result: 'preview-task-id' })
      mockClientInstance().pollTaskUntilComplete.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 10000))
      )

      const { generateModel, cancel, status, error, isCancelled } = useTextTo3D('test-api-key')

      const generatePromise = generateModel({ prompt: 'A robot' })
      
      await new Promise((resolve) => setTimeout(resolve, 50))
      
      cancel()

      await generatePromise.catch(() => {})

      expect(status.value).toBe('cancelled')
      expect(error.value).toBe('Generation cancelled by user')
      expect(isCancelled.value).toBe(true)
      expect(mockClientInstance().cancelTask).toHaveBeenCalledWith('preview-task-id')
    })

    it('should not cancel if not generating', () => {
      const { cancel, status } = useTextTo3D('test-api-key')

      cancel()

      expect(status.value).toBe('idle')
      expect(mockClientInstance().cancelTask).not.toHaveBeenCalled()
    })
  })

  describe('retry', () => {
    it('should retry generation and increment retry count', async () => {
      mockClientInstance().createTextTo3DPreview.mockResolvedValue({ result: 'task-id' })
      mockClientInstance().createTextTo3DRefine.mockResolvedValue({ result: 'refine-id' })
      mockClientInstance().pollTaskUntilComplete.mockResolvedValue({
        id: 'refine-id',
        status: 'SUCCEEDED' as const,
        progress: 100,
        model_urls: { glb: 'https://example.com/model.glb' },
        created_at: '2024-01-01T00:00:00Z',
        finished_at: '2024-01-01T00:10:00Z',
      })

      const { retry, retryCount } = useTextTo3D('test-api-key')

      expect(retryCount.value).toBe(0)

      await retry({ prompt: 'A robot' })

      expect(retryCount.value).toBe(1)

      await retry({ prompt: 'A robot' })

      expect(retryCount.value).toBe(2)
    })
  })

  describe('reset', () => {
    it('should reset all state to initial values', async () => {
      mockClientInstance().createTextTo3DPreview.mockResolvedValue({ result: 'task-id' })
      mockClientInstance().createTextTo3DRefine.mockResolvedValue({ result: 'refine-id' })
      mockClientInstance().pollTaskUntilComplete.mockResolvedValue({
        id: 'refine-id',
        status: 'SUCCEEDED' as const,
        progress: 100,
        model_urls: { glb: 'https://example.com/model.glb' },
        created_at: '2024-01-01T00:00:00Z',
        finished_at: '2024-01-01T00:10:00Z',
      })

      const { generateModel, reset, status, progress, error, result, retryCount } = useTextTo3D('test-api-key')

      await generateModel({ prompt: 'A robot' })

      expect(status.value).toBe('completed')

      reset()

      expect(status.value).toBe('idle')
      expect(progress.value).toBe(0)
      expect(error.value).toBeNull()
      expect(result.value).toBeNull()
      expect(retryCount.value).toBe(0)
    })
  })

  describe('computed properties', () => {
    it('should compute isGenerating correctly', () => {
      const { status, isGenerating } = useTextTo3D('test-api-key')

      expect(isGenerating.value).toBe(false)

      status.value = 'generating'
      expect(isGenerating.value).toBe(true)

      status.value = 'completed'
      expect(isGenerating.value).toBe(false)
    })

    it('should compute isCompleted correctly', () => {
      const { status, isCompleted } = useTextTo3D('test-api-key')

      expect(isCompleted.value).toBe(false)

      status.value = 'completed'
      expect(isCompleted.value).toBe(true)
    })

    it('should compute hasError correctly', () => {
      const { status, hasError } = useTextTo3D('test-api-key')

      expect(hasError.value).toBe(false)

      status.value = 'error'
      expect(hasError.value).toBe(true)
    })

    it('should compute isCancelled correctly', () => {
      const { status, isCancelled } = useTextTo3D('test-api-key')

      expect(isCancelled.value).toBe(false)

      status.value = 'cancelled'
      expect(isCancelled.value).toBe(true)
    })
  })
})
