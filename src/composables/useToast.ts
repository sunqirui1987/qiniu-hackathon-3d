import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastMessage {
  id: number
  message: string
  type: ToastType
  duration?: number
}

const toasts = ref<ToastMessage[]>([])
let toastId = 0

export function useToast() {
  const show = (message: string, type: ToastType = 'info', duration = 3000) => {
    const id = ++toastId
    toasts.value.push({ id, message, type, duration })

    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }

    return id
  }

  const remove = (id: number) => {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message: string, duration?: number) => {
    return show(message, 'success', duration)
  }

  const error = (message: string, duration?: number) => {
    return show(message, 'error', duration)
  }

  const info = (message: string, duration?: number) => {
    return show(message, 'info', duration)
  }

  const warning = (message: string, duration?: number) => {
    return show(message, 'warning', duration)
  }

  const clear = () => {
    toasts.value = []
  }

  return {
    toasts,
    show,
    remove,
    success,
    error,
    info,
    warning,
    clear
  }
}
