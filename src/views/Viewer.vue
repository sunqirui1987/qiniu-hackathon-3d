<template>
  <div class="viewer-page">
    <div class="page-header">
      <h1 class="page-title">
        3D Model Viewer
      </h1>
      <p class="page-description">
        View, analyze, and export your 3D models
      </p>
    </div>
    
    <div class="viewer-layout">
      <div class="viewer-main">
        <Babylon3DViewer
          ref="viewerRef"
          :model-url="currentModelUrl"
          :auto-load="false"
          @viewer-ready="handleViewerReady"
          @model-loaded="handleModelLoaded"
          @model-error="handleModelError"
        />
      </div>
      
      <div class="viewer-sidebar">
        <FileImport
          @file-selected="handleFileSelected"
          @error="handleImportError"
        />
        
        <ModelControls
          @zoom-in="handleZoomIn"
          @zoom-out="handleZoomOut"
          @rotate-x="handleRotateX"
          @rotate-y="handleRotateY"
          @rotate-z="handleRotateZ"
          @reset-view="handleResetView"
        />
        
        <PropertyPanel :model-info="modelInfo" />
        
        <ExportPanel
          :has-model="hasModel"
          @export-stl="handleExportSTL"
          @export-glb="handleExportGLB"
          @export-obj="handleExportOBJ"
        />
      </div>
    </div>
    
    <Teleport to="body">
      <div
        v-if="notification"
        class="notification"
        :class="`notification-${notification.type}`"
      >
        {{ notification.message }}
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Babylon3DViewer from '@/components/3d/Babylon3DViewer.vue'
import FileImport from '@/components/3d/FileImport.vue'
import ModelControls from '@/components/3d/ModelControls.vue'
import PropertyPanel from '@/components/3d/PropertyPanel.vue'
import ExportPanel from '@/components/3d/ExportPanel.vue'
import type { ArcRotateCamera } from '@babylonjs/core'

interface ModelInfo {
  name?: string
  vertices: number
  faces: number
  dimensions?: {
    x: number
    y: number
    z: number
  }
  printRecommendations?: {
    layerHeight?: string
    needsSupports?: boolean
    infill?: string
  }
}

interface Notification {
  type: 'success' | 'error' | 'info'
  message: string
}

const viewerRef = ref<InstanceType<typeof Babylon3DViewer> | null>(null)
const currentModelUrl = ref<string | null>(null)
const modelInfo = ref<ModelInfo | null>(null)
const notification = ref<Notification | null>(null)

const hasModel = computed(() => !!viewerRef.value?.currentModel?.value)

function handleViewerReady() {
  showNotification('Viewer initialized successfully', 'success')
}

function handleModelLoaded() {
  showNotification('Model loaded successfully', 'success')
  updateModelInfo()
}

function handleModelError(error: string) {
  showNotification(`Error: ${error}`, 'error')
}

function handleImportError(error: string) {
  showNotification(error, 'error')
}

function handleFileSelected(file: File) {
  const url = URL.createObjectURL(file)
  currentModelUrl.value = url
  viewerRef.value?.loadModel(url)
  modelInfo.value = {
    name: file.name,
    vertices: 0,
    faces: 0
  }
}

function updateModelInfo() {
  if (!viewerRef.value?.currentModel?.value) return
  
  const mesh = viewerRef.value.currentModel.value
  const boundingInfo = mesh.getBoundingInfo()
  const size = boundingInfo.boundingBox.maximum.subtract(boundingInfo.boundingBox.minimum)
  
  const totalVertices = mesh.getTotalVertices()
  const totalIndices = mesh.getTotalIndices()
  
  modelInfo.value = {
    ...modelInfo.value,
    vertices: totalVertices,
    faces: Math.floor(totalIndices / 3),
    dimensions: {
      x: Math.abs(size.x),
      y: Math.abs(size.y),
      z: Math.abs(size.z)
    },
    printRecommendations: {
      layerHeight: '0.2mm',
      needsSupports: size.y > size.x * 1.5,
      infill: '20%'
    }
  }
}

function handleZoomIn() {
  if (!viewerRef.value?.camera?.value) return
  const camera = viewerRef.value.camera.value as ArcRotateCamera
  if (camera.radius) {
    camera.radius *= 0.8
  }
}

function handleZoomOut() {
  if (!viewerRef.value?.camera?.value) return
  const camera = viewerRef.value.camera.value as ArcRotateCamera
  if (camera.radius) {
    camera.radius *= 1.2
  }
}

function handleRotateX() {
  if (!viewerRef.value?.camera?.value) return
  const camera = viewerRef.value.camera.value as ArcRotateCamera
  if (camera.alpha !== undefined) {
    camera.alpha += Math.PI / 4
  }
}

function handleRotateY() {
  if (!viewerRef.value?.camera?.value) return
  const camera = viewerRef.value.camera.value as ArcRotateCamera
  if (camera.beta !== undefined) {
    camera.beta = Math.max(0.1, Math.min(Math.PI - 0.1, camera.beta + Math.PI / 8))
  }
}

function handleRotateZ() {
  if (!viewerRef.value?.currentModel?.value) return
  const model = viewerRef.value.currentModel.value
  model.rotation.z += Math.PI / 4
}

function handleResetView() {
  if (!viewerRef.value?.camera?.value) return
  const camera = viewerRef.value.camera.value as ArcRotateCamera
  if (camera.alpha !== undefined && camera.beta !== undefined && camera.radius !== undefined) {
    camera.alpha = -Math.PI / 2
    camera.beta = Math.PI / 2.5
    camera.radius = 3
  }
  showNotification('View reset', 'info')
}

async function handleExportSTL() {
  if (!viewerRef.value) return
  
  try {
    const blob = await viewerRef.value.exportSTL()
    if (blob) {
      downloadBlob(blob, `${modelInfo.value?.name || 'model'}.stl`)
      showNotification('STL exported successfully', 'success')
    }
  } catch (error) {
    showNotification('Failed to export STL', 'error')
  }
}

async function handleExportGLB() {
  if (!viewerRef.value) return
  
  try {
    const blob = await viewerRef.value.exportGLB()
    if (blob) {
      downloadBlob(blob, `${modelInfo.value?.name || 'model'}.glb`)
      showNotification('GLB exported successfully', 'success')
    }
  } catch (error) {
    showNotification('Failed to export GLB', 'error')
  }
}

function handleExportOBJ() {
  showNotification('OBJ export coming soon', 'info')
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function showNotification(message: string, type: 'success' | 'error' | 'info') {
  notification.value = { message, type }
  setTimeout(() => {
    notification.value = null
  }, 3000)
}
</script>

<style scoped>
.viewer-page {
  min-height: 100vh;
  background-color: #f3f4f6;
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.viewer-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 24px;
  height: calc(100vh - 140px);
}

.viewer-main {
  min-height: 600px;
}

.viewer-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

@media (max-width: 1200px) {
  .viewer-layout {
    grid-template-columns: 1fr;
    height: auto;
  }
  
  .viewer-main {
    height: 600px;
  }
}

.notification {
  position: fixed;
  top: 24px;
  right: 24px;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-success {
  background-color: #10b981;
  color: white;
}

.notification-error {
  background-color: #ef4444;
  color: white;
}

.notification-info {
  background-color: #3b82f6;
  color: white;
}
</style>
