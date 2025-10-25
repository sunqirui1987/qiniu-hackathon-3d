import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useMeshyTask } from '../useMeshyTask'
import type { MeshyTaskStatus } from '../../utils/meshyClient'

const mockClientInstance = vi.hoisted(() => ({
  getTextTo3DTaskStatus: vi.fn(),
  getImageTo3DTaskStatus: vi.fn(),
  pollTaskUntilComplete: vi.fn(),
}))

vi.mock('../../utils/meshyClient', () => ({
  MeshyClient: vi.fn(() => mockClientInstance()),
}))

describe('useMeshyTask', () => {
  beforeEach(() => {
    const instance = mockClientInstance()
    instance.getTextTo3DTaskStatus.mockReset()
    instance.getImageTo3DTaskStatus.mockReset()
    instance.pollTaskUntilComplete.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with empty tasks', () => {
      const { tasks, currentTaskId, currentTask, activeTasks, completedTasks, failedTasks } =
        useMeshyTask('test-api-key')

      expect(tasks.value.size).toBe(0)
      expect(currentTaskId.value).toBeNull()
      expect(currentTask.value).toBeNull()
      expect(activeTasks.value).toHaveLength(0)
      expect(completedTasks.value).toHaveLength(0)
      expect(failedTasks.value).toHaveLength(0)
    })
  })

  describe('createTask', () => {
    it('should create a new task with default values', () => {
      const { createTask, tasks, currentTaskId } = useMeshyTask('test-api-key')

      const task = createTask('task-1', 'text-to-3d')

      expect(task.id).toBe('task-1')
      expect(task.type).toBe('text-to-3d')
      expect(task.status).toBe('PENDING')
      expect(task.progress).toBe(0)
      expect(tasks.value.has('task-1')).toBe(true)
      expect(currentTaskId.value).toBe('task-1')
    })

    it('should create task with initial status', () => {
      const { createTask } = useMeshyTask('test-api-key')

      const initialStatus: Partial<MeshyTaskStatus> = {
        status: 'IN_PROGRESS',
        progress: 50,
        created_at: '2024-01-01T00:00:00Z',
      }

      const task = createTask('task-2', 'image-to-3d', initialStatus)

      expect(task.status).toBe('IN_PROGRESS')
      expect(task.progress).toBe(50)
      expect(task.createdAt).toEqual(new Date('2024-01-01T00:00:00Z'))
    })
  })

  describe('getTaskStatus', () => {
    it('should get text-to-3d task status', async () => {
      const mockStatus: MeshyTaskStatus = {
        id: 'task-1',
        status: 'IN_PROGRESS',
        progress: 50,
        created_at: '2024-01-01T00:00:00Z',
      }

      mockClientInstance().getTextTo3DTaskStatus.mockResolvedValue(mockStatus)

      const { createTask, getTaskStatus, tasks } = useMeshyTask('test-api-key')

      createTask('task-1', 'text-to-3d')
      await getTaskStatus('task-1', 'text-to-3d')

      expect(mockClientInstance().getTextTo3DTaskStatus).toHaveBeenCalledWith('task-1')
      const task = tasks.value.get('task-1')
      expect(task?.status).toBe('IN_PROGRESS')
      expect(task?.progress).toBe(50)
    })

    it('should get image-to-3d task status', async () => {
      const mockStatus: MeshyTaskStatus = {
        id: 'task-2',
        status: 'SUCCEEDED',
        progress: 100,
        created_at: '2024-01-01T00:00:00Z',
        finished_at: '2024-01-01T00:10:00Z',
        model_urls: {
          glb: 'https://example.com/model.glb',
        },
      }

      mockClientInstance().getImageTo3DTaskStatus.mockResolvedValue(mockStatus)

      const { createTask, getTaskStatus, tasks } = useMeshyTask('test-api-key')

      createTask('task-2', 'image-to-3d')
      await getTaskStatus('task-2', 'image-to-3d')

      expect(mockClientInstance().getImageTo3DTaskStatus).toHaveBeenCalledWith('task-2')
      const task = tasks.value.get('task-2')
      expect(task?.status).toBe('SUCCEEDED')
      expect(task?.result).toBeDefined()
    })
  })

  describe('pollTask', () => {
    it('should poll task until complete', async () => {
      const mockFinalStatus: MeshyTaskStatus = {
        id: 'task-1',
        status: 'SUCCEEDED',
        progress: 100,
        created_at: '2024-01-01T00:00:00Z',
        finished_at: '2024-01-01T00:10:00Z',
        model_urls: {
          glb: 'https://example.com/model.glb',
        },
        thumbnail_url: 'https://example.com/thumbnail.png',
      }

      mockClientInstance().pollTaskUntilComplete.mockResolvedValue(mockFinalStatus)

      const { createTask, pollTask, tasks } = useMeshyTask('test-api-key')

      createTask('task-1', 'text-to-3d')
      const result = await pollTask('task-1', 'text-to-3d')

      expect(result.status).toBe('SUCCEEDED')
      const task = tasks.value.get('task-1')
      expect(task?.status).toBe('SUCCEEDED')
      expect(task?.result).toBeDefined()
      expect(task?.result?.url).toBe('https://example.com/model.glb')
    })

    it('should update task on progress callback', async () => {
      let progressCallbackInvoked = false

      mockClientInstance().pollTaskUntilComplete.mockImplementation(async (_taskId, _type, options) => {
        if (options?.onProgress) {
          options.onProgress(50, {
            id: 'task-1',
            status: 'IN_PROGRESS',
            progress: 50,
            created_at: '2024-01-01T00:00:00Z',
          })
          progressCallbackInvoked = true
        }
        return {
          id: 'task-1',
          status: 'SUCCEEDED',
          progress: 100,
          created_at: '2024-01-01T00:00:00Z',
          finished_at: '2024-01-01T00:10:00Z',
          model_urls: { glb: 'https://example.com/model.glb' },
        }
      })

      const { createTask, pollTask, tasks } = useMeshyTask('test-api-key')

      createTask('task-1', 'text-to-3d')
      await pollTask('task-1', 'text-to-3d')

      expect(progressCallbackInvoked).toBe(true)
      const task = tasks.value.get('task-1')
      expect(task?.progress).toBe(100)
    })
  })

  describe('computed properties', () => {
    it('should compute currentTask', () => {
      const { createTask, currentTask, currentTaskId } = useMeshyTask('test-api-key')

      expect(currentTask.value).toBeNull()

      createTask('task-1', 'text-to-3d')
      expect(currentTask.value?.id).toBe('task-1')

      currentTaskId.value = 'non-existent'
      expect(currentTask.value).toBeNull()
    })

    it('should compute activeTasks', () => {
      const { createTask, activeTasks } = useMeshyTask('test-api-key')

      createTask('task-1', 'text-to-3d', { status: 'PENDING' })
      createTask('task-2', 'text-to-3d', { status: 'IN_PROGRESS' })
      createTask('task-3', 'text-to-3d', { status: 'SUCCEEDED' })

      expect(activeTasks.value).toHaveLength(2)
      expect(activeTasks.value.map((t) => t.id)).toContain('task-1')
      expect(activeTasks.value.map((t) => t.id)).toContain('task-2')
    })

    it('should compute completedTasks', () => {
      const { createTask, completedTasks } = useMeshyTask('test-api-key')

      createTask('task-1', 'text-to-3d', { status: 'PENDING' })
      createTask('task-2', 'text-to-3d', { status: 'SUCCEEDED' })
      createTask('task-3', 'text-to-3d', { status: 'SUCCEEDED' })

      expect(completedTasks.value).toHaveLength(2)
      expect(completedTasks.value.every((t) => t.status === 'SUCCEEDED')).toBe(true)
    })

    it('should compute failedTasks', () => {
      const { createTask, failedTasks } = useMeshyTask('test-api-key')

      createTask('task-1', 'text-to-3d', { status: 'SUCCEEDED' })
      createTask('task-2', 'text-to-3d', { status: 'FAILED' })
      createTask('task-3', 'text-to-3d', { status: 'EXPIRED' })

      expect(failedTasks.value).toHaveLength(2)
      expect(failedTasks.value.map((t) => t.id)).toContain('task-2')
      expect(failedTasks.value.map((t) => t.id)).toContain('task-3')
    })
  })

  describe('getTaskResult', () => {
    it('should return task result if available', () => {
      const { createTask, getTaskResult, tasks } = useMeshyTask('test-api-key')

      createTask('task-1', 'text-to-3d', {
        status: 'SUCCEEDED',
        model_urls: { glb: 'https://example.com/model.glb' },
        created_at: '2024-01-01T00:00:00Z',
        finished_at: '2024-01-01T00:10:00Z',
      })

      const task = tasks.value.get('task-1')
      if (task) {
        task.result = {
          id: 'task-1',
          name: 'Model',
          url: 'https://example.com/model.glb',
          format: 'glb',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }

      const result = getTaskResult('task-1')

      expect(result).toBeDefined()
      expect(result?.id).toBe('task-1')
    })

    it('should return undefined for non-existent task', () => {
      const { getTaskResult } = useMeshyTask('test-api-key')

      const result = getTaskResult('non-existent')

      expect(result).toBeUndefined()
    })
  })

  describe('removeTask', () => {
    it('should remove task from tasks map', () => {
      const { createTask, removeTask, tasks } = useMeshyTask('test-api-key')

      createTask('task-1', 'text-to-3d')
      expect(tasks.value.has('task-1')).toBe(true)

      const removed = removeTask('task-1')

      expect(removed).toBe(true)
      expect(tasks.value.has('task-1')).toBe(false)
    })

    it('should clear currentTaskId if removing current task', () => {
      const { createTask, removeTask, currentTaskId } = useMeshyTask('test-api-key')

      createTask('task-1', 'text-to-3d')
      expect(currentTaskId.value).toBe('task-1')

      removeTask('task-1')

      expect(currentTaskId.value).toBeNull()
    })

    it('should return false for non-existent task', () => {
      const { removeTask } = useMeshyTask('test-api-key')

      const removed = removeTask('non-existent')

      expect(removed).toBe(false)
    })
  })

  describe('clearCompletedTasks', () => {
    it('should remove all completed tasks', () => {
      const { createTask, clearCompletedTasks, tasks } = useMeshyTask('test-api-key')

      createTask('task-1', 'text-to-3d', { status: 'SUCCEEDED' })
      createTask('task-2', 'text-to-3d', { status: 'IN_PROGRESS' })
      createTask('task-3', 'text-to-3d', { status: 'SUCCEEDED' })

      clearCompletedTasks()

      expect(tasks.value.size).toBe(1)
      expect(tasks.value.has('task-2')).toBe(true)
    })
  })

  describe('clearFailedTasks', () => {
    it('should remove all failed and expired tasks', () => {
      const { createTask, clearFailedTasks, tasks } = useMeshyTask('test-api-key')

      createTask('task-1', 'text-to-3d', { status: 'FAILED' })
      createTask('task-2', 'text-to-3d', { status: 'SUCCEEDED' })
      createTask('task-3', 'text-to-3d', { status: 'EXPIRED' })
      createTask('task-4', 'text-to-3d', { status: 'IN_PROGRESS' })

      clearFailedTasks()

      expect(tasks.value.size).toBe(2)
      expect(tasks.value.has('task-2')).toBe(true)
      expect(tasks.value.has('task-4')).toBe(true)
    })
  })

  describe('clearAllTasks', () => {
    it('should remove all tasks and reset currentTaskId', () => {
      const { createTask, clearAllTasks, tasks, currentTaskId } = useMeshyTask('test-api-key')

      createTask('task-1', 'text-to-3d')
      createTask('task-2', 'image-to-3d')
      createTask('task-3', 'text-to-3d')

      clearAllTasks()

      expect(tasks.value.size).toBe(0)
      expect(currentTaskId.value).toBeNull()
    })
  })
})
