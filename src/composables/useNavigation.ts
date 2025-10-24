import { useRouter, type RouteLocationRaw } from 'vue-router'
import { useModelStore } from '../stores/model'

export function useNavigation() {
  const router = useRouter()
  const modelStore = useModelStore()

  const navigateToViewer = (modelId?: string) => {
    if (modelId) {
      const model = modelStore.getModelById(modelId)
      if (model) {
        modelStore.currentModel = model
      }
    }
    
    if (!modelStore.currentModel && modelStore.modelHistory.length > 0) {
      modelStore.currentModel = modelStore.modelHistory[0]
    }

    router.push('/viewer')
  }

  const navigateToPrint = (modelId?: string) => {
    if (modelId) {
      const model = modelStore.getModelById(modelId)
      if (model) {
        modelStore.currentModel = model
      }
    }

    if (!modelStore.currentModel && modelStore.modelHistory.length > 0) {
      modelStore.currentModel = modelStore.modelHistory[0]
    }

    router.push('/print')
  }

  const navigateToGenerate = () => {
    router.push('/generate')
  }

  const navigateToLibrary = () => {
    router.push('/library')
  }

  const navigateToHome = () => {
    router.push('/')
  }

  const goBack = () => {
    router.back()
  }

  const navigateTo = (location: RouteLocationRaw) => {
    router.push(location)
  }

  return {
    navigateToViewer,
    navigateToPrint,
    navigateToGenerate,
    navigateToLibrary,
    navigateToHome,
    goBack,
    navigateTo
  }
}
