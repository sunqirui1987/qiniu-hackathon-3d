import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useMeshyTask } from '../useMeshyTask'

vi.mock('../../utils/meshyClient', () => ({
  MeshyClient: class {
    getTextTo3DTaskStatus = vi.fn().mockResolvedValue({
      id: 'task-id',
      status: 'PENDING',
      progress: 0,
      created_at: new Date().toISOString()
    })
    getImageTo3DTaskStatus = vi.fn().mockResolvedValue({
      id: 'task-id',
      status: 'PENDING',
      progress: 0,
      created_at: new Date().toISOString()
    })
    pollTaskUntilComplete = vi.fn().mockResolvedValue({
      id: 'task-id',
      status: 'SUCCEEDED',
      progress: 100,
      model_urls: { glb: 'https://example.com/model.glb' },
      created_at: new Date().toISOString(),
      finished_at: new Date().toISOString()
    })
  }
}))

describe('useMeshyTask', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with empty tasks', () => {
    const { tasks, currentTaskId } = useMeshyTask('test-api-key')
    
    expect(tasks.value.size).toBe(0)
    expect(currentTaskId.value).toBe(null)
  })

  it('exposes createTask method', () => {
    const { createTask } = useMeshyTask('test-api-key')
    expect(typeof createTask).toBe('function')
    
    const task = createTask('task-1', 'text-to-3d')
    expect(task.id).toBe('task-1')
    expect(task.type).toBe('text-to-3d')
  })

  it('exposes getTaskStatus method', () => {
    const { getTaskStatus } = useMeshyTask('test-api-key')
    expect(typeof getTaskStatus).toBe('function')
  })

  it('exposes pollTask method', () => {
    const { pollTask } = useMeshyTask('test-api-key')
    expect(typeof pollTask).toBe('function')
  })

  it('has computed properties for task lists', () => {
    const { activeTasks, completedTasks, failedTasks } = useMeshyTask('test-api-key')
    
    expect(Array.isArray(activeTasks.value)).toBe(true)
    expect(Array.isArray(completedTasks.value)).toBe(true)
    expect(Array.isArray(failedTasks.value)).toBe(true)
  })

  it('exposes removeTask method', () => {
    const { removeTask, createTask } = useMeshyTask('test-api-key')
    createTask('task-1', 'text-to-3d')
    expect(typeof removeTask).toBe('function')
    removeTask('task-1')
  })

  it('exposes clear methods', () => {
    const { clearCompletedTasks, clearFailedTasks, clearAllTasks } = useMeshyTask('test-api-key')
    
    expect(typeof clearCompletedTasks).toBe('function')
    expect(typeof clearFailedTasks).toBe('function')
    expect(typeof clearAllTasks).toBe('function')
  })

  it('exposes getTaskResult method', () => {
    const { getTaskResult } = useMeshyTask('test-api-key')
    expect(typeof getTaskResult).toBe('function')
  })
})
