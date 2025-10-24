<template>
  <div :class="cardClasses">
    <div v-if="$slots.header" :class="headerClasses">
      <slot name="header" />
    </div>
    <div :class="bodyClasses">
      <slot />
    </div>
    <div v-if="$slots.footer" :class="footerClasses">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: boolean
  hoverable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'md',
  shadow: true,
  hoverable: false,
})

const paddingClasses = computed(() => {
  switch (props.padding) {
    case 'none':
      return 'p-0'
    case 'sm':
      return 'p-3'
    case 'md':
      return 'p-6'
    case 'lg':
      return 'p-8'
    default:
      return 'p-6'
  }
})

const cardClasses = computed(() => [
  'bg-white rounded-lg',
  paddingClasses.value,
  props.shadow && 'shadow-md',
  props.hoverable && 'hover:shadow-lg transition-shadow cursor-pointer',
])

const headerClasses = computed(() => [
  'mb-4 pb-4 border-b border-gray-200',
])

const bodyClasses = computed(() => [])

const footerClasses = computed(() => [
  'mt-4 pt-4 border-t border-gray-200',
])
</script>
