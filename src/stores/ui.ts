import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const loading = ref(false)
  const sidebarOpen = ref(true)
  const theme = ref<'light' | 'dark'>('light')
  const searchOpen = ref(false)
  const searchQuery = ref('')

  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    theme.value = savedTheme || (prefersDark ? 'dark' : 'light')
    applyTheme(theme.value)
  }

  const applyTheme = (newTheme: 'light' | 'dark') => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  watch(theme, (newTheme) => {
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  })

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function setLoading(value: boolean) {
    loading.value = value
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme
  }

  function toggleSearch() {
    searchOpen.value = !searchOpen.value
    if (!searchOpen.value) {
      searchQuery.value = ''
    }
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  return {
    loading,
    sidebarOpen,
    theme,
    searchOpen,
    searchQuery,
    toggleSidebar,
    setLoading,
    toggleTheme,
    setTheme,
    initTheme,
    toggleSearch,
    setSearchQuery
  }
})
