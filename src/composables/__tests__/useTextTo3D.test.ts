import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTextTo3D } from '../useTextTo3D'

vi.mock('../../utils/meshyClient', () => ({
  MeshyClient: vi.fn().mockImplementation(() => ({
    createTextTo3DPreview: vi.fn().mockResolvedValue({ result: 'preview-task-id' }),
    createTextTo3DRefine: vi.fn().mockResolvedValue({ result: 'refine-task-id' }),
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

describe('useTextTo3D', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with correct default state', () => {
    const { status, progress, error, result } = useTextTo3D('test-api-key')
    
    expect(status.value).toBe('idle')
    expect(progress.value).toBe(0)
    expect(error.value).toBe(null)
    expect(result.value).toBe(null)
  })

  it('has computed properties', () => {
    const { isGenerating, isCompleted, hasError } = useTextTo3D('test-api-key')
    
    expect(isGenerating.value).toBe(false)
    expect(isCompleted.value).toBe(false)
    expect(hasError.value).toBe(false)
  })

  it('exposes cancel method', () => {
    const { cancel } = useTextTo3D('test-api-key')
    expect(typeof cancel).toBe('function')
  })

  it('exposes retry method', () => {
    const { retry } = useTextTo3D('test-api-key')
    expect(typeof retry).toBe('function')
  })

  it('exposes reset method', () => {
    const { reset } = useTextTo3D('test-api-key')
    expect(typeof reset).toBe('function')
    reset()
  })

  it('has retryCount state', () => {
    const { retryCount } = useTextTo3D('test-api-key')
    expect(retryCount.value).toBe(0)
  })
})
