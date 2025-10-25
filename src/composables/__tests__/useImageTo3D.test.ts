import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useImageTo3D } from '../useImageTo3D'

vi.mock('../../utils/meshyClient', () => ({
  MeshyClient: vi.fn().mockImplementation(() => ({
    uploadImage: vi.fn().mockResolvedValue({ url: 'https://example.com/image.jpg', filename: 'image.jpg' }),
    createImageTo3D: vi.fn().mockResolvedValue({ result: 'task-id' }),
    pollTaskUntilComplete: vi.fn().mockResolvedValue({
      id: 'task-id',
      status: 'SUCCEEDED',
      progress: 100,
      model_urls: { glb: 'https://example.com/model.glb' },
      thumbnail_url: 'https://example.com/thumb.jpg',
      created_at: new Date().toISOString(),
      finished_at: new Date().toISOString()
    }),
    cancelTask: vi.fn(),
  }))
}))

describe('useImageTo3D', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with correct default state', () => {
    const { status, progress, error, result } = useImageTo3D('test-api-key')
    
    expect(status.value).toBe('idle')
    expect(progress.value).toBe(0)
    expect(error.value).toBe(null)
    expect(result.value).toBe(null)
  })

  it('has uploading-specific computed properties', () => {
    const { isUploading, isGenerating, isCompleted, hasError } = useImageTo3D('test-api-key')
    
    expect(isUploading.value).toBe(false)
    expect(isGenerating.value).toBe(false)
    expect(isCompleted.value).toBe(false)
    expect(hasError.value).toBe(false)
  })

  it('exposes cancel method', () => {
    const { cancel } = useImageTo3D('test-api-key')
    expect(typeof cancel).toBe('function')
  })

  it('exposes retry method', () => {
    const { retry } = useImageTo3D('test-api-key')
    expect(typeof retry).toBe('function')
  })

  it('exposes reset method', () => {
    const { reset } = useImageTo3D('test-api-key')
    expect(typeof reset).toBe('function')
    reset()
  })

  it('has retryCount state', () => {
    const { retryCount } = useImageTo3D('test-api-key')
    expect(retryCount.value).toBe(0)
  })

  it('has uploadedImageUrl state', () => {
    const { uploadedImageUrl } = useImageTo3D('test-api-key')
    expect(uploadedImageUrl.value).toBe(null)
  })
})
