<template>
  <div class="file-import">
    <h3 class="import-title">
      Import Model
    </h3>
    
    <div
      class="dropzone"
      :class="{ 'dropzone-active': isDragging }"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
    >
      <div class="dropzone-content">
        <div class="icon-container">
          <svg
            class="upload-icon"
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
        </div>
        <p class="dropzone-text">
          Drag and drop your 3D model file here
        </p>
        <p class="dropzone-subtext">
          or
        </p>
        <button
          class="browse-button"
          @click="triggerFileInput"
        >
          Browse Files
        </button>
        <p class="supported-formats">
          Supported formats: GLB, GLTF, STL, OBJ
        </p>
      </div>
    </div>
    
    <input
      ref="fileInputRef"
      type="file"
      accept=".glb,.gltf,.stl,.obj"
      class="file-input"
      @change="handleFileSelect"
    >
    
    <div
      v-if="error"
      class="error-message"
    >
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Emits {
  (e: 'fileSelected', file: File): void
  (e: 'error', message: string): void
}

const emit = defineEmits<Emits>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const error = ref<string | null>(null)

const ALLOWED_EXTENSIONS = ['.glb', '.gltf', '.stl', '.obj']

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    validateAndEmitFile(file)
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  
  if (file) {
    validateAndEmitFile(file)
  }
}

function validateAndEmitFile(file: File) {
  error.value = null
  
  const fileName = file.name.toLowerCase()
  const isValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext))
  
  if (!isValidExtension) {
    const errorMsg = `Invalid file format. Please select a GLB, GLTF, STL, or OBJ file.`
    error.value = errorMsg
    emit('error', errorMsg)
    return
  }
  
  if (file.size > 100 * 1024 * 1024) {
    const errorMsg = 'File size too large. Maximum size is 100MB.'
    error.value = errorMsg
    emit('error', errorMsg)
    return
  }
  
  emit('fileSelected', file)
}
</script>

<style scoped>
.file-import {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.import-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1f2937;
}

.dropzone {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  transition: all 0.2s;
  cursor: pointer;
}

.dropzone:hover {
  border-color: #9ca3af;
  background-color: #f9fafb;
}

.dropzone-active {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.icon-container {
  width: 64px;
  height: 64px;
  color: #9ca3af;
}

.upload-icon {
  width: 100%;
  height: 100%;
}

.dropzone-text {
  font-size: 16px;
  color: #374151;
  font-weight: 500;
  margin: 0;
}

.dropzone-subtext {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.browse-button {
  padding: 10px 24px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.browse-button:hover {
  background-color: #2563eb;
}

.supported-formats {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

.file-input {
  display: none;
}

.error-message {
  margin-top: 12px;
  padding: 12px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 14px;
}
</style>
