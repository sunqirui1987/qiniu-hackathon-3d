<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div
      v-if="$slots.header"
      class="mb-4 pb-4 border-b border-gray-200"
    >
      <slot name="header" />
    </div>
    <div>
      <slot />
    </div>
    <div
      v-if="$slots.footer"
      class="mt-4 pt-4 border-t border-gray-200"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
