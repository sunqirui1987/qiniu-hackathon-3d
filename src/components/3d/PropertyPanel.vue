<template>
  <div class="property-panel">
    <h3 class="panel-title">
      Model Properties
    </h3>
    
    <div
      v-if="modelInfo"
      class="properties"
    >
      <div class="property-item">
        <span class="property-label">Name</span>
        <span class="property-value">{{ modelInfo.name || 'Unnamed' }}</span>
      </div>
      
      <div class="property-item">
        <span class="property-label">Vertices</span>
        <span class="property-value">{{ formatNumber(modelInfo.vertices) }}</span>
      </div>
      
      <div class="property-item">
        <span class="property-label">Faces</span>
        <span class="property-value">{{ formatNumber(modelInfo.faces) }}</span>
      </div>
      
      <div
        v-if="modelInfo.dimensions"
        class="property-section"
      >
        <h4 class="section-title">
          Dimensions
        </h4>
        <div class="property-item">
          <span class="property-label">Width (X)</span>
          <span class="property-value">{{ formatDimension(modelInfo.dimensions.x) }}</span>
        </div>
        <div class="property-item">
          <span class="property-label">Height (Y)</span>
          <span class="property-value">{{ formatDimension(modelInfo.dimensions.y) }}</span>
        </div>
        <div class="property-item">
          <span class="property-label">Depth (Z)</span>
          <span class="property-value">{{ formatDimension(modelInfo.dimensions.z) }}</span>
        </div>
      </div>
      
      <div class="property-section">
        <h4 class="section-title">
          Print Recommendations
        </h4>
        <div class="recommendation">
          <p class="recommendation-text">
            <strong>Layer Height:</strong> {{ modelInfo.printRecommendations?.layerHeight || '0.2mm' }}
          </p>
          <p class="recommendation-text">
            <strong>Supports:</strong> {{ modelInfo.printRecommendations?.needsSupports ? 'Required' : 'Not needed' }}
          </p>
          <p class="recommendation-text">
            <strong>Infill:</strong> {{ modelInfo.printRecommendations?.infill || '20%' }}
          </p>
        </div>
      </div>
    </div>
    
    <div
      v-else
      class="no-model"
    >
      <p class="no-model-text">
        No model loaded
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
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

interface Props {
  modelInfo?: ModelInfo | null
}

defineProps<Props>()

function formatNumber(num: number | undefined): string {
  if (num === undefined) return '0'
  return num.toLocaleString()
}

function formatDimension(dim: number | undefined): string {
  if (dim === undefined) return '0.00'
  return `${dim.toFixed(2)} units`
}
</script>

<style scoped>
.property-panel {
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

.properties {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.property-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.property-item:last-child {
  border-bottom: none;
}

.property-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.property-value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 600;
}

.property-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px solid #e5e7eb;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.recommendation {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recommendation-text {
  font-size: 13px;
  color: #374151;
  margin: 0;
}

.no-model {
  padding: 32px 0;
  text-align: center;
}

.no-model-text {
  color: #9ca3af;
  font-size: 14px;
}
</style>
