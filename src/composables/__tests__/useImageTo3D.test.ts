import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useImageTo3D } from '../useImageTo3D'

const mockClient = {
  uploadImage: vi.fn(),
  createImageTo3D: vi.fn(),
  pollTaskUntilComplete: vi.fn(),
}

vi.mock('../../utils/meshyClient', () => {
  return {
    MeshyClient: vi.fn(function() {
      return mockClient
    })
  }
})

describe('useImageTo3D', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with correct default state', () => {
    const { status, progress, error, result, isUploading, isGenerating, isCompleted } = useImageTo3D('test-api-key')

    expect(status.value).toBe('idle')
    expect(progress.value).toBe(0)
    expect(error.value).toBeNull()
    expect(result.value).toBeNull()
    expect(isUploading.value).toBe(false)
    expect(isGenerating.value).toBe(false)
    expect(isCompleted.value).toBe(false)
  })

  it('should upload image and generate model from File', async () => {
    const { generateFromImage, status, uploadedImageUrl } = useImageTo3D('test-api-key')

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    mockClient.uploadImage.mockResolvedValue({
      url: 'https://example.com/uploaded.jpg',
      filename: 'test.jpg'
    })
    mockClient.createImageTo3D.mockResolvedValue({ result: 'task-123' })
    mockClient.pollTaskUntilComplete.mockResolvedValue({
      id: 'task-123',
      status: 'SUCCEEDED',
      progress: 100,
      model_urls: { glb: 'https://example.com/model.glb' },
      created_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      thumbnail_url: 'https://example.com/thumb.jpg',
    })

    const promise = generateFromImage({
      image: mockFile,
      topology: 'triangle',
      targetPolycount: 30000,
      shouldTexture: true,
      enablePBR: true,
    })

    expect(status.value).toBe('uploading')
    
    const result = await promise

    expect(mockClient.uploadImage).toHaveBeenCalledWith(mockFile)
    expect(uploadedImageUrl.value).toBe('https://example.com/uploaded.jpg')
    expect(result.url).toBe('https://example.com/model.glb')
  })

  it('should generate model from URL string without uploading', async () => {
    const { generateFromImage, uploadedImageUrl } = useImageTo3D('test-api-key')

    const imageUrl = 'https://example.com/existing-image.jpg'

    mockClient.createImageTo3D.mockResolvedValue({ result: 'task-456' })
    mockClient.pollTaskUntilComplete.mockResolvedValue({
      id: 'task-456',
      status: 'SUCCEEDED',
      progress: 100,
      model_urls: { glb: 'https://example.com/model.glb' },
      created_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
    })

    await generateFromImage({
      image: imageUrl,
      topology: 'quad',
      targetPolycount: 50000,
      shouldTexture: false,
      enablePBR: false,
    })

    expect(mockClient.uploadImage).not.toHaveBeenCalled()
    expect(uploadedImageUrl.value).toBe(imageUrl)
  })

  it('should handle errors during upload', async () => {
    const { generateFromImage, status, error } = useImageTo3D('test-api-key')

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    mockClient.uploadImage.mockRejectedValue(new Error('Upload failed'))

    await expect(generateFromImage({
      image: mockFile,
      topology: 'triangle',
      targetPolycount: 30000,
      shouldTexture: true,
      enablePBR: true,
    })).rejects.toThrow()

    expect(status.value).toBe('error')
    expect(error.value).toBeTruthy()
  })

  it('should handle errors during generation', async () => {
    const { generateFromImage, status, error } = useImageTo3D('test-api-key')

    mockClient.uploadImage.mockResolvedValue({ url: 'https://example.com/img.jpg' })
    mockClient.createImageTo3D.mockRejectedValue(new Error('Generation failed'))

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    await expect(generateFromImage({
      image: mockFile,
      topology: 'triangle',
      targetPolycount: 30000,
      shouldTexture: true,
      enablePBR: true,
    })).rejects.toThrow()

    expect(status.value).toBe('error')
    expect(error.value).toBeTruthy()
  })

  it('should reset state correctly', () => {
    const { status, progress, error, result, uploadedImageUrl, reset } = useImageTo3D('test-api-key')

    status.value = 'completed'
    progress.value = 100
    error.value = 'Some error'
    uploadedImageUrl.value = 'https://example.com/img.jpg'

    reset()

    expect(status.value).toBe('idle')
    expect(progress.value).toBe(0)
    expect(error.value).toBeNull()
    expect(result.value).toBeNull()
    expect(uploadedImageUrl.value).toBeNull()
  })

  it('should update progress during generation', async () => {
    const { generateFromImage, progress } = useImageTo3D('test-api-key')

    let progressCallback: any

    mockClient.uploadImage.mockResolvedValue({ url: 'https://example.com/img.jpg' })
    mockClient.createImageTo3D.mockResolvedValue({ result: 'task-123' })
    mockClient.pollTaskUntilComplete.mockImplementation(async (taskId: string, type: string, options: any) => {
      progressCallback = options.onProgress
      if (progressCallback) {
        progressCallback(50)
      }
      return {
        id: 'task-123',
        status: 'SUCCEEDED',
        progress: 100,
        model_urls: { glb: 'https://example.com/model.glb' },
        created_at: new Date().toISOString(),
        finished_at: new Date().toISOString(),
      }
    })

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    await generateFromImage({
      image: mockFile,
      topology: 'triangle',
      targetPolycount: 30000,
      shouldTexture: true,
      enablePBR: true,
    })

    expect(progressCallback).toBeDefined()
  })
})
