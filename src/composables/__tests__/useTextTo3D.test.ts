import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTextTo3D } from '../useTextTo3D'
import { MeshyClient } from '../../utils/meshyClient'

vi.mock('../../utils/meshyClient', () => {
  return {
    MeshyClient: vi.fn()
  }
})

describe('useTextTo3D', () => {
  let mockClient: any

  beforeEach(() => {
    mockClient = {
      createTextTo3DPreview: vi.fn(),
      createTextTo3DRefine: vi.fn(),
      pollTaskUntilComplete: vi.fn(),
    }
    vi.mocked(MeshyClient).mockImplementation(() => mockClient)
  })

  it('should initialize with correct default state', () => {
    const { status, progress, error, result, isGenerating, isCompleted, hasError } = useTextTo3D('test-api-key')

    expect(status.value).toBe('idle')
    expect(progress.value).toBe(0)
    expect(error.value).toBeNull()
    expect(result.value).toBeNull()
    expect(isGenerating.value).toBe(false)
    expect(isCompleted.value).toBe(false)
    expect(hasError.value).toBe(false)
  })

  it('should update status to generating when generateModel is called', async () => {
    const { generateModel, status } = useTextTo3D('test-api-key')

    mockClient.createTextTo3DPreview.mockResolvedValue({ result: 'preview-task-123' })
    mockClient.pollTaskUntilComplete.mockResolvedValue({
      id: 'preview-task-123',
      status: 'SUCCEEDED',
      progress: 100,
      model_urls: { glb: 'https://example.com/model.glb' },
      created_at: new Date().toISOString(),
    })
    mockClient.createTextTo3DRefine.mockResolvedValue({ result: 'refine-task-456' })

    const promise = generateModel({
      prompt: 'Test prompt',
      artStyle: 'realistic',
      aiModel: 'latest',
      topology: 'triangle',
      targetPolycount: 30000,
      enablePBR: true,
    })

    expect(status.value).toBe('generating')
    await promise
  })

  it('should complete successfully and return model', async () => {
    const { generateModel, status, progress, result } = useTextTo3D('test-api-key')

    const mockPreviewTask = {
      id: 'preview-task-123',
      status: 'SUCCEEDED',
      progress: 100,
      model_urls: { glb: 'https://example.com/preview.glb' },
      created_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
    }

    const mockRefineTask = {
      id: 'refine-task-456',
      status: 'SUCCEEDED',
      progress: 100,
      model_urls: { glb: 'https://example.com/model.glb' },
      created_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      thumbnail_url: 'https://example.com/thumb.jpg',
    }

    mockClient.createTextTo3DPreview.mockResolvedValue({ result: 'preview-task-123' })
    mockClient.createTextTo3DRefine.mockResolvedValue({ result: 'refine-task-456' })
    mockClient.pollTaskUntilComplete
      .mockResolvedValueOnce(mockPreviewTask)
      .mockResolvedValueOnce(mockRefineTask)

    const model = await generateModel({
      prompt: 'A cute cat',
      artStyle: 'realistic',
      aiModel: 'latest',
      topology: 'triangle',
      targetPolycount: 30000,
      enablePBR: true,
    })

    expect(status.value).toBe('completed')
    expect(progress.value).toBe(100)
    expect(result.value).toBeTruthy()
    expect(model.url).toBe('https://example.com/model.glb')
    expect(model.thumbnail).toBe('https://example.com/thumb.jpg')
  })

  it('should handle errors correctly', async () => {
    const { generateModel, status, error, hasError } = useTextTo3D('test-api-key')

    mockClient.createTextTo3DPreview.mockRejectedValue(new Error('API Error'))

    await expect(generateModel({
      prompt: 'Test',
      artStyle: 'realistic',
      aiModel: 'latest',
      topology: 'triangle',
      targetPolycount: 30000,
      enablePBR: false,
    })).rejects.toThrow()

    expect(status.value).toBe('error')
    expect(error.value).toBeTruthy()
    expect(hasError.value).toBe(true)
  })

  it('should reset state correctly', () => {
    const { status, progress, error, result, reset } = useTextTo3D('test-api-key')

    status.value = 'completed'
    progress.value = 100
    error.value = 'Some error'

    reset()

    expect(status.value).toBe('idle')
    expect(progress.value).toBe(0)
    expect(error.value).toBeNull()
    expect(result.value).toBeNull()
  })

  it('should track progress during generation', async () => {
    const { generateModel, progress } = useTextTo3D('test-api-key')

    let progressCallbackPreview: any
    let progressCallbackRefine: any

    mockClient.createTextTo3DPreview.mockResolvedValue({ result: 'preview-task-123' })
    mockClient.createTextTo3DRefine.mockResolvedValue({ result: 'refine-task-456' })
    mockClient.pollTaskUntilComplete.mockImplementation(async (taskId: string, type: string, options: any) => {
      if (taskId === 'preview-task-123') {
        progressCallbackPreview = options.onProgress
        if (progressCallbackPreview) {
          progressCallbackPreview(50)
        }
        return {
          id: 'preview-task-123',
          status: 'SUCCEEDED',
          progress: 100,
          model_urls: { glb: 'https://example.com/preview.glb' },
          created_at: new Date().toISOString(),
        }
      } else {
        progressCallbackRefine = options.onProgress
        if (progressCallbackRefine) {
          progressCallbackRefine(80)
        }
        return {
          id: 'refine-task-456',
          status: 'SUCCEEDED',
          progress: 100,
          model_urls: { glb: 'https://example.com/model.glb' },
          created_at: new Date().toISOString(),
          finished_at: new Date().toISOString(),
        }
      }
    })

    await generateModel({
      prompt: 'Test',
      artStyle: 'realistic',
      aiModel: 'latest',
      topology: 'triangle',
      targetPolycount: 30000,
      enablePBR: false,
    })

    expect(progressCallbackPreview).toBeDefined()
    expect(progressCallbackRefine).toBeDefined()
  })
})
