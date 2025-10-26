import { ref } from 'vue'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  persistent?: boolean
}

const notifications = ref<Notification[]>([])
let notificationId = 0

export function useNotification() {
  
  const addNotification = (notification: Omit<Notification, 'id'>): string => {
    const id = `notification-${++notificationId}`
    const newNotification: Notification = {
      id,
      duration: 5000,
      persistent: false,
      ...notification
    }
    
    notifications.value.push(newNotification)
    
    // 自动移除非持久化通知
    if (!newNotification.persistent && newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }
    
    return id
  }
  
  const removeNotification = (id: string): void => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  const clearAllNotifications = (): void => {
    notifications.value = []
  }
  
  // 便捷方法
  const showSuccess = (title: string, message?: string, duration?: number): string => {
    return addNotification({
      type: 'success',
      title,
      message,
      duration
    })
  }
  
  const showError = (title: string, message?: string, persistent = false): string => {
    return addNotification({
      type: 'error',
      title,
      message,
      persistent,
      duration: persistent ? 0 : 8000
    })
  }
  
  const showWarning = (title: string, message?: string, duration?: number): string => {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration
    })
  }
  
  const showInfo = (title: string, message?: string, duration?: number): string => {
    return addNotification({
      type: 'info',
      title,
      message,
      duration
    })
  }
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}