import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useMeshyTask } from '../useMeshyTask'
import { MeshyClient } from '../../utils/meshyClient'

vi.mock('../../utils/meshyClient', () => {
  return {
    MeshyClient: vi.fn()
  }
})

describe('useMeshyTask', () => {
  let mockClient: any

  beforeEach(() => {
    mockClient = {
      getTextTo3DTaskStatus: vi.fn(),
      getImageTo3DTaskStatus: vi.fn(),
      pollTaskUntilComplete: vi.fn(),
    }
    vi.mocked(MeshyClient).mockImplementation(() => mockClient)
  })

  it('should initialize with empty tasks', () => {
    const { tasks, currentTask, activeTasks, completedTasks, failedTasks } = useMeshyTask('test-api-key')

    expect(tasks.value.size).toBe(0)
    expect(currentTask.value).toBeNull()
    expect(activeTasks.value).toHaveLength(0)
    expect(completedTasks.value).toHaveLength(0)
    expect(failedTasks.value).toHaveLength(0)
  })

  it('should create a new task', () => {
    const { createTask, tasks, currentTask } = useMeshyTask('test-api-key')

    const task = createTask('task-123', 'text-to-3d')

    expect(task.id).toBe('task-123')
    expect(task.type).toBe('text-to-3d')
    expect(task.status).toBe('PENDING')
    expect(tasks.value.size).toBe(1)
    expect(currentTask.value).toEqual(task)
  })

  it('should get task status', async () => {
    const { createTask, getTaskStatus } = useMeshyTask('test-api-key')

    createTask('task-123', 'text-to-3d')

    const mockStatus = {
      id: 'task-123',
      status: 'IN_PROGRESS' as const,
      progress: 50,
      created_at: new Date().toISOString(),
    }

    mockClient.getTextTo3DTaskStatus.mockResolvedValue(mockStatus)

    const status = await getTaskStatus('task-123', 'text-to-3d')

    expect(status).toEqual(mockStatus)
    expect(mockClient.getTextTo3DTaskStatus).toHaveBeenCalledWith('task-123')
  })

  it('should poll task until complete', async () => {
    const { createTask, pollTask } = useMeshyTask('test-api-key')

    createTask('task-456', 'image-to-3d')

    const mockFinalStatus = {
      id: 'task-456',
      status: 'SUCCEEDED' as const,
      progress: 100,
      model_urls: { glb: 'https://example.com/model.glb' },
      created_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
    }

    mockClient.pollTaskUntilComplete.mockResolvedValue(mockFinalStatus)

    const status = await pollTask('task-456', 'image-to-3d')

    expect(status).toEqual(mockFinalStatus)
  })

  it('should categorize tasks correctly', () => {
    const { createTask, tasks, activeTasks, completedTasks, failedTasks } = useMeshyTask('test-api-key')

    const task1 = createTask('task-1', 'text-to-3d')
    task1.status = 'PENDING'

    const task2 = createTask('task-2', 'text-to-3d')
    task2.status = 'IN_PROGRESS'

    const task3 = createTask('task-3', 'image-to-3d')
    task3.status = 'SUCCEEDED'

    const task4 = createTask('task-4', 'image-to-3d')
    task4.status = 'FAILED'

    expect(activeTasks.value).toHaveLength(2)
    expect(activeTasks.value.map(t => t.id)).toContain('task-1')
    expect(activeTasks.value.map(t => t.id)).toContain('task-2')
    
    expect(completedTasks.value).toHaveLength(1)
    expect(completedTasks.value[0].id).toBe('task-3')
    
    expect(failedTasks.value).toHaveLength(1)
    expect(failedTasks.value[0].id).toBe('task-4')
  })

  it('should remove task', () => {
    const { createTask, removeTask, tasks } = useMeshyTask('test-api-key')

    createTask('task-1', 'text-to-3d')
    createTask('task-2', 'image-to-3d')

    expect(tasks.value.size).toBe(2)

    const removed = removeTask('task-1')

    expect(removed).toBe(true)
    expect(tasks.value.size).toBe(1)
    expect(tasks.value.has('task-1')).toBe(false)
  })

  it('should get task result', () => {
    const { createTask, tasks, getTaskResult } = useMeshyTask('test-api-key')

    const task = createTask('task-123', 'text-to-3d')
    task.result = {
      id: 'task-123',
      name: 'Model',
      url: 'https://example.com/model.glb',
      format: 'glb',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = getTaskResult('task-123')

    expect(result).toBeTruthy()
    expect(result?.id).toBe('task-123')
  })

  it('should clear completed tasks', () => {
    const { createTask, clearCompletedTasks, tasks } = useMeshyTask('test-api-key')

    const task1 = createTask('task-1', 'text-to-3d')
    task1.status = 'SUCCEEDED'

    const task2 = createTask('task-2', 'text-to-3d')
    task2.status = 'IN_PROGRESS'

    const task3 = createTask('task-3', 'image-to-3d')
    task3.status = 'SUCCEEDED'

    expect(tasks.value.size).toBe(3)

    clearCompletedTasks()

    expect(tasks.value.size).toBe(1)
    expect(tasks.value.has('task-2')).toBe(true)
  })

  it('should clear failed tasks', () => {
    const { createTask, clearFailedTasks, tasks } = useMeshyTask('test-api-key')

    const task1 = createTask('task-1', 'text-to-3d')
    task1.status = 'FAILED'

    const task2 = createTask('task-2', 'text-to-3d')
    task2.status = 'IN_PROGRESS'

    const task3 = createTask('task-3', 'image-to-3d')
    task3.status = 'EXPIRED'

    expect(tasks.value.size).toBe(3)

    clearFailedTasks()

    expect(tasks.value.size).toBe(1)
    expect(tasks.value.has('task-2')).toBe(true)
  })

  it('should clear all tasks', () => {
    const { createTask, clearAllTasks, tasks, currentTask } = useMeshyTask('test-api-key')

    createTask('task-1', 'text-to-3d')
    createTask('task-2', 'image-to-3d')
    createTask('task-3', 'text-to-3d')

    expect(tasks.value.size).toBe(3)

    clearAllTasks()

    expect(tasks.value.size).toBe(0)
    expect(currentTask.value).toBeNull()
  })

  it('should update current task id when creating task', () => {
    const { createTask, currentTaskId } = useMeshyTask('test-api-key')

    createTask('task-1', 'text-to-3d')
    expect(currentTaskId.value).toBe('task-1')

    createTask('task-2', 'image-to-3d')
    expect(currentTaskId.value).toBe('task-2')
  })

  it('should reset current task id when removing current task', () => {
    const { createTask, removeTask, currentTaskId } = useMeshyTask('test-api-key')

    createTask('task-1', 'text-to-3d')
    expect(currentTaskId.value).toBe('task-1')

    removeTask('task-1')
    expect(currentTaskId.value).toBeNull()
  })
})
