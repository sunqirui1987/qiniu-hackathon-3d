import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Model3D, GenerateTask } from '@/types/model'

export const useModelStore = defineStore('model', () => {
  const currentModel = ref<Model3D | null>(null)
  const modelHistory = ref<Model3D[]>([])
  const generateTasks = ref<GenerateTask[]>([])

  function addModel(model: Model3D) {
    modelHistory.value.unshift(model)
    currentModel.value = model
  }

  function removeModel(id: string) {
    modelHistory.value = modelHistory.value.filter((m) => m.id !== id)
  }

  function getModelById(id: string) {
    return modelHistory.value.find((m) => m.id === id)
  }

  function addGenerateTask(task: GenerateTask) {
    generateTasks.value.push(task)
  }

  function updateGenerateTask(id: string, updates: Partial<GenerateTask>) {
    const task = generateTasks.value.find((t) => t.id === id)
    if (task) {
      Object.assign(task, updates)
    }
  }

  function removeGenerateTask(id: string) {
    generateTasks.value = generateTasks.value.filter((t) => t.id !== id)
  }

  return {
    currentModel,
    modelHistory,
    generateTasks,
    addModel,
    removeModel,
    getModelById,
    addGenerateTask,
    updateGenerateTask,
    removeGenerateTask
  }
})
