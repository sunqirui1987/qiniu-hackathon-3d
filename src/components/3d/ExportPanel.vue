<template>
  <div class="export-panel">
    <h3 class="panel-title">
      Export Model
    </h3>
    
    <div class="export-options">
      <div class="export-option">
        <h4 class="option-title">
          STL Format
        </h4>
        <p class="option-description">
          Best for 3D printing. Binary format with high compatibility.
        </p>
        <button
          :disabled="!hasModel || isExporting"
          class="export-button"
          @click="$emit('exportSTL')"
        >
          <span
            v-if="isExporting && exportFormat === 'stl'"
            class="spinner"
          />
          <span v-else>Export STL</span>
        </button>
      </div>
      
      <div class="export-option">
        <h4 class="option-title">
          GLB Format
        </h4>
        <p class="option-description">
          Includes textures and materials. Best for sharing and viewing.
        </p>
        <button
          :disabled="!hasModel || isExporting"
          class="export-button"
          @click="$emit('exportGLB')"
        >
          <span
            v-if="isExporting && exportFormat === 'glb'"
            class="spinner"
          />
          <span v-else>Export GLB</span>
        </button>
      </div>
      
      <div class="export-option">
        <h4 class="option-title">
          OBJ Format
        </h4>
        <p class="option-description">
          Universal format supported by most 3D software.
        </p>
        <button
          :disabled="!hasModel || isExporting"
          class="export-button"
          @click="$emit('exportOBJ')"
        >
          <span
            v-if="isExporting && exportFormat === 'obj'"
            class="spinner"
          />
          <span v-else>Export OBJ</span>
        </button>
      </div>
    </div>
    
    <div
      v-if="!hasModel"
      class="no-model-warning"
    >
      <p>Please load a model before exporting</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  hasModel: boolean
}

interface Emits {
  (e: 'exportSTL'): void
  (e: 'exportGLB'): void
  (e: 'exportOBJ'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const isExporting = ref(false)
const exportFormat = ref<'stl' | 'glb' | 'obj' | null>(null)

function startExport(format: 'stl' | 'glb' | 'obj') {
  isExporting.value = true
  exportFormat.value = format
  
  setTimeout(() => {
    isExporting.value = false
    exportFormat.value = null
  }, 2000)
}

defineExpose({
  startExport
})
</script>

<style scoped>
.export-panel {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1f2937;
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.export-option {
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.option-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.option-description {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.export-button {
  width: 100%;
  padding: 10px 16px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.export-button:hover:not(:disabled) {
  background-color: #059669;
}

.export-button:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.no-model-warning {
  margin-top: 16px;
  padding: 12px;
  background-color: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 6px;
  text-align: center;
}

.no-model-warning p {
  color: #92400e;
  font-size: 14px;
  margin: 0;
}
</style>
