<template>
  <div class="bg-white rounded-lg shadow-md p-4">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">
      导入模型
    </h3>

    <div
      class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
      :class="{ 'border-blue-500 bg-blue-50': isDragging }"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept=".glb,.gltf,.stl,.obj"
        class="hidden"
        @change="handleFileSelect"
      >

      <svg
        class="w-16 h-16 mx-auto mb-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>

      <p class="text-lg font-medium text-gray-700 mb-2">
        拖拽文件到此处或点击选择
      </p>
      <p class="text-sm text-gray-500">
        支持格式: GLB, GLTF, STL, OBJ
      </p>
    </div>

    <div
      v-if="uploadError"
      class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
    >
      <p class="text-sm text-red-700">
        {{ uploadError }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Emits {
  (e: 'fileSelected', file: File): void
}

const emit = defineEmits<Emits>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const uploadError = ref<string | null>(null)

const ALLOWED_EXTENSIONS = ['.glb', '.gltf', '.stl', '.obj']
const MAX_FILE_SIZE = 100 * 1024 * 1024

const validateFile = (file: File): boolean => {
  uploadError.value = null

  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    uploadError.value = `不支持的文件格式。请使用: ${ALLOWED_EXTENSIONS.join(', ')}`
    return false
  }

  if (file.size > MAX_FILE_SIZE) {
    uploadError.value = `文件过大。最大支持 ${MAX_FILE_SIZE / 1024 / 1024} MB`
    return false
  }

  return true
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file && validateFile(file)) {
    emit('fileSelected', file)
  }

  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const handleDragOver = (event: DragEvent) => {
  isDragging.value = true
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  
  if (file && validateFile(file)) {
    emit('fileSelected', file)
  }
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}
</script>
