import { ref, computed } from 'vue'
import { MeshyClient, MeshyTaskStatus } from '../utils/meshyClient'
import type { Model3D } from '../types/model'

export interface TaskInfo {
  id: string
  type: 'text-to-3d' | 'image-to-3d'
  status: MeshyTaskStatus['status']
  progress: number
  result?: Model3D
  error?: string
  createdAt: Date
  finishedAt?: Date
}

export function useMeshyTask(apiKey: string) {
  const client = new MeshyClient(apiKey)
  
  const tasks = ref<Map<string, TaskInfo>>(new Map())
  const currentTaskId = ref<string | null>(null)
  
  const currentTask = computed(() => {
    if (!currentTaskId.value) return null
    return tasks.value.get(currentTaskId.value) || null
  })
  
  const activeTasks = computed(() => {
    return Array.from(tasks.value.values()).filter(
      task => task.status === 'PENDING' || task.status === 'IN_PROGRESS'
    )
  })
  
  const completedTasks = computed(() => {
    return Array.from(tasks.value.values()).filter(
      task => task.status === 'SUCCEEDED'
    )
  })
  
  const failedTasks = computed(() => {
    return Array.from(tasks.value.values()).filter(
      task => task.status === 'FAILED' || task.status === 'EXPIRED'
    )
  })

  const createTask = (
    taskId: string,
    type: 'text-to-3d' | 'image-to-3d',
    initialStatus?: Partial<MeshyTaskStatus>
  ): TaskInfo => {
    const task: TaskInfo = {
      id: taskId,
      type,
      status: initialStatus?.status || 'PENDING',
      progress: initialStatus?.progress || 0,
      createdAt: initialStatus?.created_at ? new Date(initialStatus.created_at) : new Date(),
      finishedAt: initialStatus?.finished_at ? new Date(initialStatus.finished_at) : undefined,
    }
    
    tasks.value.set(taskId, task)
    currentTaskId.value = taskId
    
    return task
  }

  const getTaskStatus = async (
    taskId: string,
    type?: 'text-to-3d' | 'image-to-3d' // type 参数现在是可选的，因为统一使用一个端点
  ): Promise<MeshyTaskStatus> => {
    const status = await client.getTaskStatus(taskId)
    
    updateTask(taskId, status)
    
    return status
  }

  const pollTask = async (
    taskId: string,
    type?: 'text-to-3d' | 'image-to-3d', // type 参数现在是可选的
    options?: {
      maxAttempts?: number
      pollInterval?: number
      onProgress?: (progress: number, status: MeshyTaskStatus) => void
    }
  ): Promise<MeshyTaskStatus> => {
    const finalStatus = await client.pollTaskUntilComplete(
      taskId,
      {
        ...options,
        onProgress: (progress: number, status: MeshyTaskStatus) => {
          updateTask(taskId, status)
          options?.onProgress?.(progress, status)
        },
      }
    )
    
    updateTask(taskId, finalStatus)
    
    return finalStatus
  }

  const getTaskResult = (taskId: string): Model3D | undefined => {
    return tasks.value.get(taskId)?.result
  }

  const removeTask = (taskId: string): boolean => {
    const deleted = tasks.value.delete(taskId)
    if (currentTaskId.value === taskId) {
      currentTaskId.value = null
    }
    return deleted
  }

  const clearCompletedTasks = () => {
    Array.from(tasks.value.entries()).forEach(([id, task]) => {
      if (task.status === 'SUCCEEDED') {
        tasks.value.delete(id)
      }
    })
  }

  const clearFailedTasks = () => {
    Array.from(tasks.value.entries()).forEach(([id, task]) => {
      if (task.status === 'FAILED' || task.status === 'EXPIRED') {
        tasks.value.delete(id)
      }
    })
  }

  const clearAllTasks = () => {
    tasks.value.clear()
    currentTaskId.value = null
  }

  const updateTask = (taskId: string, status: MeshyTaskStatus) => {
    const task = tasks.value.get(taskId)
    if (!task) return
    
    task.status = status.status
    task.progress = status.progress
    task.error = status.error
    task.finishedAt = status.finished_at ? new Date(status.finished_at) : undefined
    
    if (status.status === 'SUCCEEDED' && status.model_urls) {
      task.result = convertTaskToModel(status)
    }
  }

  const convertTaskToModel = (taskStatus: MeshyTaskStatus): Model3D => {
    const url = taskStatus.model_urls?.glb || taskStatus.model_urls?.obj || ''
    
    return {
      id: taskStatus.id,
      name: `Model ${taskStatus.id}`,
      url,
      format: 'glb',
      createdAt: new Date(taskStatus.created_at),
      updatedAt: new Date(taskStatus.finished_at || taskStatus.created_at),
      thumbnail: taskStatus.thumbnail_url,
    }
  }

  return {
    tasks,
    currentTaskId,
    currentTask,
    activeTasks,
    completedTasks,
    failedTasks,
    createTask,
    getTaskStatus,
    pollTask,
    getTaskResult,
    removeTask,
    clearCompletedTasks,
    clearFailedTasks,
    clearAllTasks,
  }
}
