import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Model3D } from '@/types/model'

export const useModelStore = defineStore('model', () => {
  const currentModel = ref<Model3D | null>(null)
  const modelHistory = ref<Model3D[]>([])

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

  return {
    currentModel,
    modelHistory,
    addModel,
    removeModel,
    getModelById
  }
})
