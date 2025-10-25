import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'

export function useKeyboardShortcuts() {
  const router = useRouter()
  const uiStore = useUIStore()

  const handleKeyDown = (event: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const modKey = isMac ? event.metaKey : event.ctrlKey

    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      if (!(modKey && event.key === 'k')) {
        return
      }
    }

    if (modKey && event.key === 'k') {
      event.preventDefault()
      uiStore.toggleSearch()
      return
    }

    if (modKey && event.shiftKey && event.key === 'T') {
      event.preventDefault()
      uiStore.toggleTheme()
      return
    }

    if (modKey && event.key === 'b') {
      event.preventDefault()
      uiStore.toggleSidebar()
      return
    }

    if (modKey && event.key === ',') {
      event.preventDefault()
      router.push('/settings')
      return
    }

    if (modKey && event.key === 'h') {
      event.preventDefault()
      router.push('/')
      return
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    handleKeyDown
  }
}
