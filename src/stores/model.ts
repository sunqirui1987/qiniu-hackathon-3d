import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Model3D, GenerateTask } from '@/types/model'
import { indexedDB } from '@/utils/indexedDB'

interface ModelCache {
  [key: string]: Model3D
}

interface TaskQueueItem {
  task: GenerateTask
  priority: number
  addedAt: Date
}

export const useModelStore = defineStore('model', () => {
  const currentModel = ref<Model3D | null>(null)
  const modelHistory = ref<Model3D[]>([])
  const generateTasks = ref<GenerateTask[]>([])
  const modelCache = ref<ModelCache>({})
  const taskQueue = ref<TaskQueueItem[]>([])
  const maxCacheSize = ref<number>(50)
  const maxHistorySize = ref<number>(100)

  const pendingTasks = computed(() => 
    generateTasks.value.filter(t => t.status === 'pending')
  )

  const activeTasks = computed(() => 
    generateTasks.value.filter(t => ['preview', 'refine'].includes(t.status))
  )

  const completedTasks = computed(() => 
    generateTasks.value.filter(t => t.status === 'completed')
  )

  const failedTasks = computed(() => 
    generateTasks.value.filter(t => t.status === 'failed')
  )

  const taskQueueLength = computed(() => taskQueue.value.length)

  const cacheSize = computed(() => Object.keys(modelCache.value).length)

  function addModel(model: Model3D) {
    modelHistory.value.unshift(model)
    currentModel.value = model

    if (modelHistory.value.length > maxHistorySize.value) {
      const removed = modelHistory.value.splice(maxHistorySize.value)
      removed.forEach(m => delete modelCache.value[m.id])
    }

    cacheModel(model)
  }

  function removeModel(id: string) {
    modelHistory.value = modelHistory.value.filter((m) => m.id !== id)
    delete modelCache.value[id]
    
    if (currentModel.value?.id === id) {
      currentModel.value = modelHistory.value[0] || null
    }
  }

  function getModelById(id: string) {
    if (modelCache.value[id]) {
      return modelCache.value[id]
    }
    return modelHistory.value.find((m) => m.id === id)
  }

  function cacheModel(model: Model3D) {
    modelCache.value[model.id] = model

    if (cacheSize.value > maxCacheSize.value) {
      const sortedHistory = [...modelHistory.value].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      const toRemove = sortedHistory.slice(maxCacheSize.value)
      toRemove.forEach(m => delete modelCache.value[m.id])
    }
  }

  function clearCache() {
    modelCache.value = {}
  }

  function getCachedModel(id: string) {
    return modelCache.value[id]
  }

  function addGenerateTask(task: GenerateTask) {
    generateTasks.value.push(task)
  }

  function updateGenerateTask(id: string, updates: Partial<GenerateTask>) {
    const task = generateTasks.value.find((t) => t.id === id)
    if (task) {
      Object.assign(task, updates)
      
      if (updates.status === 'completed' && updates.result) {
        cacheModel(updates.result)
      }
    }
  }

  function removeGenerateTask(id: string) {
    generateTasks.value = generateTasks.value.filter((t) => t.id !== id)
  }

  function clearCompletedTasks() {
    generateTasks.value = generateTasks.value.filter((t) => t.status !== 'completed')
  }

  function clearFailedTasks() {
    generateTasks.value = generateTasks.value.filter((t) => t.status !== 'failed')
  }

  function clearAllTasks() {
    generateTasks.value = []
  }

  function addToQueue(task: GenerateTask, priority: number = 0) {
    const queueItem: TaskQueueItem = {
      task,
      priority,
      addedAt: new Date()
    }
    taskQueue.value.push(queueItem)
    sortQueue()
  }

  function removeFromQueue(taskId: string) {
    taskQueue.value = taskQueue.value.filter(item => item.task.id !== taskId)
  }

  function getNextQueuedTask(): GenerateTask | null {
    if (taskQueue.value.length === 0) {
      return null
    }
    const item = taskQueue.value.shift()
    return item ? item.task : null
  }

  function sortQueue() {
    taskQueue.value.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority
      }
      return a.addedAt.getTime() - b.addedAt.getTime()
    })
  }

  function updateQueuePriority(taskId: string, priority: number) {
    const item = taskQueue.value.find(item => item.task.id === taskId)
    if (item) {
      item.priority = priority
      sortQueue()
    }
  }

  function clearQueue() {
    taskQueue.value = []
  }

  function getQueuePosition(taskId: string): number {
    return taskQueue.value.findIndex(item => item.task.id === taskId)
  }

  async function syncToIndexedDB() {
    try {
      const models = modelHistory.value.map(model => ({
        id: model.id,
        name: model.name,
        path: model.url,
        format: model.format,
        size: model.size || 0,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
        thumbnail: model.thumbnail,
        tags: [],
        category: undefined,
        metadata: model.metadata
      }))
      await indexedDB.saveModels(models)
    } catch (error) {
      console.error('Failed to sync to IndexedDB:', error)
    }
  }

  async function loadFromIndexedDB() {
    try {
      await indexedDB.init()
      const models = await indexedDB.getAllModels()
      models.forEach(model => {
        const model3d: Model3D = {
          id: model.id,
          name: model.name,
          url: model.path,
          format: model.format,
          createdAt: model.createdAt,
          updatedAt: model.updatedAt,
          thumbnail: model.thumbnail,
          size: model.size,
          metadata: model.metadata
        }
        modelHistory.value.push(model3d)
        cacheModel(model3d)
      })
    } catch (error) {
      console.error('Failed to load from IndexedDB:', error)
    }
  }

  function exportHistory(): string {
    return JSON.stringify({
      models: modelHistory.value,
      tasks: generateTasks.value,
      exportedAt: new Date().toISOString()
    })
  }

  function importHistory(data: string) {
    try {
      const parsed = JSON.parse(data)
      if (parsed.models) {
        modelHistory.value = parsed.models
        parsed.models.forEach((model: Model3D) => cacheModel(model))
      }
      if (parsed.tasks) {
        generateTasks.value = parsed.tasks
      }
    } catch (error) {
      console.error('Failed to import history:', error)
      throw new Error('Invalid history data format')
    }
  }

  return {
    currentModel,
    modelHistory,
    generateTasks,
    modelCache,
    taskQueue,
    maxCacheSize,
    maxHistorySize,
    pendingTasks,
    activeTasks,
    completedTasks,
    failedTasks,
    taskQueueLength,
    cacheSize,
    addModel,
    removeModel,
    getModelById,
    cacheModel,
    clearCache,
    getCachedModel,
    addGenerateTask,
    updateGenerateTask,
    removeGenerateTask,
    clearCompletedTasks,
    clearFailedTasks,
    clearAllTasks,
    addToQueue,
    removeFromQueue,
    getNextQueuedTask,
    sortQueue,
    updateQueuePriority,
    clearQueue,
    getQueuePosition,
    exportHistory,
    importHistory,
    syncToIndexedDB,
    loadFromIndexedDB
  }
})
