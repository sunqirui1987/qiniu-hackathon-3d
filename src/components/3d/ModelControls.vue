<template>
  <div class="model-controls">
    <h3 class="controls-title">
      Controls
    </h3>
    
    <div class="control-section">
      <h4 class="section-title">
        Zoom
      </h4>
      <div class="button-group">
        <button
          class="control-button"
          @click="$emit('zoomIn')"
        >
          <span class="icon">+</span> Zoom In
        </button>
        <button
          class="control-button"
          @click="$emit('zoomOut')"
        >
          <span class="icon">−</span> Zoom Out
        </button>
      </div>
    </div>
    
    <div class="control-section">
      <h4 class="section-title">
        Rotation
      </h4>
      <div class="button-group">
        <button
          class="control-button"
          @click="$emit('rotateX')"
        >
          Rotate X
        </button>
        <button
          class="control-button"
          @click="$emit('rotateY')"
        >
          Rotate Y
        </button>
        <button
          class="control-button"
          @click="$emit('rotateZ')"
        >
          Rotate Z
        </button>
      </div>
    </div>
    
    <div class="control-section">
      <h4 class="section-title">
        View
      </h4>
      <div class="button-group">
        <button
          class="control-button primary"
          @click="$emit('resetView')"
        >
          Reset View
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Emits {
  (e: 'zoomIn'): void
  (e: 'zoomOut'): void
  (e: 'rotateX'): void
  (e: 'rotateY'): void
  (e: 'rotateZ'): void
  (e: 'resetView'): void
}

defineEmits<Emits>()
</script>

<style scoped>
.model-controls {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.controls-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1f2937;
}

.control-section {
  margin-bottom: 16px;
}

.control-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 8px;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-button {
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: white;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.control-button:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.control-button:active {
  transform: scale(0.98);
}

.control-button.primary {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.control-button.primary:hover {
  background-color: #2563eb;
  border-color: #2563eb;
}

.icon {
  font-size: 18px;
  font-weight: 600;
}
</style>
