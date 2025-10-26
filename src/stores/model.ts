import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Model3D } from '@/types/model'
import { indexedDB } from '@/utils/indexedDB'

interface ModelCache {
  [key: string]: Model3D
}

export const useModelStore = defineStore('model', () => {
  // 当前模型
  const currentModel = ref<Model3D | null>(null)
  
  // 模型历史记录
  const modelHistory = ref<Model3D[]>([])
  
  // 模型缓存
  const modelCache = ref<ModelCache>({})
  
  // 配置
  const maxCacheSize = ref<number>(50)
  const maxHistorySize = ref<number>(100)

  // 计算属性
  const cacheSize = computed(() => Object.keys(modelCache.value).length)
  const historySize = computed(() => modelHistory.value.length)

  // 添加模型到历史记录
  function addModel(model: Model3D) {
    // 避免重复添加
    const existingIndex = modelHistory.value.findIndex(m => m.id === model.id)
    if (existingIndex !== -1) {
      modelHistory.value.splice(existingIndex, 1)
    }
    
    modelHistory.value.unshift(model)
    currentModel.value = model

    // 限制历史记录大小
    if (modelHistory.value.length > maxHistorySize.value) {
      const removed = modelHistory.value.splice(maxHistorySize.value)
      // 从缓存中移除被删除的模型
      removed.forEach(m => {
        delete modelCache.value[m.id]
      })
    }

    // 同步到IndexedDB
    syncToIndexedDB()
  }

  // 移除模型
  function removeModel(modelId: string) {
    const index = modelHistory.value.findIndex(m => m.id === modelId)
    if (index !== -1) {
      modelHistory.value.splice(index, 1)
    }
    
    delete modelCache.value[modelId]
    
    if (currentModel.value?.id === modelId) {
      currentModel.value = modelHistory.value[0] || null
    }

    syncToIndexedDB()
  }

  // 根据ID获取模型
  function getModelById(id: string): Model3D | undefined {
    return modelHistory.value.find(m => m.id === id) || modelCache.value[id]
  }

  // 设置当前模型
  function setCurrentModel(model: Model3D | null) {
    currentModel.value = model
  }

  // 缓存模型
  function cacheModel(model: Model3D) {
    modelCache.value[model.id] = model

    // 限制缓存大小
    if (cacheSize.value > maxCacheSize.value) {
      const keys = Object.keys(modelCache.value)
      const oldestKey = keys[0]
      delete modelCache.value[oldestKey]
    }
  }

  // 获取缓存的模型
  function getCachedModel(id: string): Model3D | undefined {
    return modelCache.value[id]
  }

  // 清理缓存
  function clearCache() {
    modelCache.value = {}
  }

  // 清理历史记录
  function clearHistory() {
    modelHistory.value = []
    currentModel.value = null
    syncToIndexedDB()
  }

  // 导出历史记录
  function exportHistory(): string {
    return JSON.stringify({
      models: modelHistory.value,
      exportedAt: new Date().toISOString()
    })
  }

  // 导入历史记录
  function importHistory(data: string): boolean {
    try {
      const parsed = JSON.parse(data)
      if (parsed.models && Array.isArray(parsed.models)) {
        modelHistory.value = parsed.models
        syncToIndexedDB()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to import history:', error)
      return false
    }
  }

  // 同步到IndexedDB
  async function syncToIndexedDB() {
    try {
      await indexedDB.init()
      // 这里可以实现具体的同步逻辑
      console.log('Syncing to IndexedDB...')
    } catch (error) {
      console.error('Failed to sync to IndexedDB:', error)
    }
  }

  // 从IndexedDB加载
  async function loadFromIndexedDB() {
    try {
      await indexedDB.init()
      // 这里可以实现具体的加载逻辑
      console.log('Loading from IndexedDB...')
    } catch (error) {
      console.error('Failed to load from IndexedDB:', error)
    }
  }

  return {
    // 状态
    currentModel,
    modelHistory,
    modelCache,
    maxCacheSize,
    maxHistorySize,
    
    // 计算属性
    cacheSize,
    historySize,
    
    // 方法
    addModel,
    removeModel,
    getModelById,
    setCurrentModel,
    cacheModel,
    getCachedModel,
    clearCache,
    clearHistory,
    exportHistory,
    importHistory,
    syncToIndexedDB,
    loadFromIndexedDB
  }
})
