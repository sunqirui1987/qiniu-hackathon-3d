import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const loading = ref(false)
  const sidebarOpen = ref(true)

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function setLoading(value: boolean) {
    loading.value = value
  }

  return {
    loading,
    sidebarOpen,
    toggleSidebar,
    setLoading
  }
})
