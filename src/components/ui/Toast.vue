<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="visible"
        :class="[
          'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50',
          typeClasses,
        ]"
      >
        {{ message }}
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
})

const typeClasses = computed(() => {
  switch (props.type) {
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
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
