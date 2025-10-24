<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'px-6 py-3 rounded-lg shadow-lg',
            getTypeClasses(toast.type),
          ]"
        >
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast, type ToastType } from '@/composables/useToast'

const { toasts } = useToast()

const getTypeClasses = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'bg-green-500 text-white'
    case 'error':
      return 'bg-red-500 text-white'
    case 'warning':
      return 'bg-yellow-500 text-white'
    case 'info':
      return 'bg-blue-500 text-white'
    default:
      return 'bg-blue-500 text-white'
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
