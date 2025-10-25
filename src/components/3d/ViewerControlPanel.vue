<template>
  <div class="viewer-control-panel bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl">
    <!-- 标题栏 -->
    <div class="flex items-center justify-between p-4 border-b border-gray-700/50">
      <h3 class="text-lg font-semibold text-white">控制面板</h3>
      <button
        @click="$emit('close')"
        class="p-1 text-gray-400 hover:text-white transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="p-4 space-y-6 max-h-96 overflow-y-auto">
      <!-- 模型信息 -->
      <div class="space-y-3">
        <h4 class="text-sm font-medium text-gray-300 flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          模型信息
        </h4>
        <div class="bg-gray-800/50 rounded-lg p-3 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">顶点数:</span>
            <span class="text-white">{{ modelInfo.vertices || 0 }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">面数:</span>
            <span class="text-white">{{ modelInfo.faces || 0 }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">文件大小:</span>
            <span class="text-white">{{ formatFileSize(modelInfo.fileSize) }}</span>
          </div>
        </div>
      </div>

      <!-- 变换控制 -->
      <div class="space-y-3">
        <h4 class="text-sm font-medium text-gray-300 flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          变换
        </h4>
        
        <!-- 位置 -->
        <div class="space-y-2">
          <label class="text-xs text-gray-400 font-medium">位置</label>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="text-xs text-gray-500">X</label>
              <input
                type="number"
                v-model.number="transform.position.x"
                @input="updateTransform"
                class="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                step="0.1"
              >
            </div>
            <div>
              <label class="text-xs text-gray-500">Y</label>
              <input
                type="number"
                v-model.number="transform.position.y"
                @input="updateTransform"
                class="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                step="0.1"
              >
            </div>
            <div>
              <label class="text-xs text-gray-500">Z</label>
              <input
                type="number"
                v-model.number="transform.position.z"
                @input="updateTransform"
                class="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                step="0.1"
              >
            </div>
          </div>
        </div>

        <!-- 旋转 -->
        <div class="space-y-2">
          <label class="text-xs text-gray-400 font-medium">旋转 (度)</label>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="text-xs text-gray-500">X</label>
              <input
                type="number"
                v-model.number="transform.rotation.x"
                @input="updateTransform"
                class="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                step="1"
              >
            </div>
            <div>
              <label class="text-xs text-gray-500">Y</label>
              <input
                type="number"
                v-model.number="transform.rotation.y"
                @input="updateTransform"
                class="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                step="1"
              >
            </div>
            <div>
              <label class="text-xs text-gray-500">Z</label>
              <input
                type="number"
                v-model.number="transform.rotation.z"
                @input="updateTransform"
                class="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                step="1"
              >
            </div>
          </div>
        </div>

        <!-- 缩放 -->
        <div class="space-y-2">
          <label class="text-xs text-gray-400 font-medium">缩放</label>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="text-xs text-gray-500">X</label>
              <input
                type="number"
                v-model.number="transform.scale.x"
                @input="updateTransform"
                class="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                step="0.1"
                min="0.1"
              >
            </div>
            <div>
              <label class="text-xs text-gray-500">Y</label>
              <input
                type="number"
                v-model.number="transform.scale.y"
                @input="updateTransform"
                class="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                step="0.1"
                min="0.1"
              >
            </div>
            <div>
              <label class="text-xs text-gray-500">Z</label>
              <input
                type="number"
                v-model.number="transform.scale.z"
                @input="updateTransform"
                class="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                step="0.1"
                min="0.1"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- 材质设置 -->
      <div class="space-y-3">
        <h4 class="text-sm font-medium text-gray-300 flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
          </svg>
          材质
        </h4>
        
        <div class="space-y-3">
          <!-- 颜色 -->
          <div>
            <label class="text-xs text-gray-400 font-medium mb-2 block">基础颜色</label>
            <div class="flex items-center space-x-2">
              <input
                type="color"
                v-model="material.color"
                @input="updateMaterial"
                class="w-8 h-8 rounded border border-gray-600 bg-gray-800"
              >
              <input
                type="text"
                v-model="material.color"
                @input="updateMaterial"
                class="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
              >
            </div>
          </div>

          <!-- 金属度 -->
          <div>
            <label class="text-xs text-gray-400 font-medium mb-2 block">
              金属度: {{ material.metallic.toFixed(2) }}
            </label>
            <input
              type="range"
              v-model.number="material.metallic"
              @input="updateMaterial"
              min="0"
              max="1"
              step="0.01"
              class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            >
          </div>

          <!-- 粗糙度 -->
          <div>
            <label class="text-xs text-gray-400 font-medium mb-2 block">
              粗糙度: {{ material.roughness.toFixed(2) }}
            </label>
            <input
              type="range"
              v-model.number="material.roughness"
              @input="updateMaterial"
              min="0"
              max="1"
              step="0.01"
              class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            >
          </div>

          <!-- 透明度 -->
          <div>
            <label class="text-xs text-gray-400 font-medium mb-2 block">
              透明度: {{ material.opacity.toFixed(2) }}
            </label>
            <input
              type="range"
              v-model.number="material.opacity"
              @input="updateMaterial"
              min="0"
              max="1"
              step="0.01"
              class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            >
          </div>
        </div>
      </div>

      <!-- 光照设置 -->
      <div class="space-y-3">
        <h4 class="text-sm font-medium text-gray-300 flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          光照
        </h4>
        
        <div class="space-y-3">
          <!-- 环境光强度 -->
          <div>
            <label class="text-xs text-gray-400 font-medium mb-2 block">
              环境光强度: {{ lighting.ambientIntensity.toFixed(2) }}
            </label>
            <input
              type="range"
              v-model.number="lighting.ambientIntensity"
              @input="updateLighting"
              min="0"
              max="2"
              step="0.01"
              class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            >
          </div>

          <!-- 主光源强度 -->
          <div>
            <label class="text-xs text-gray-400 font-medium mb-2 block">
              主光源强度: {{ lighting.directionalIntensity.toFixed(2) }}
            </label>
            <input
              type="range"
              v-model.number="lighting.directionalIntensity"
              @input="updateLighting"
              min="0"
              max="3"
              step="0.01"
              class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            >
          </div>

          <!-- 阴影 -->
          <label class="flex items-center space-x-2 text-sm text-gray-300 hover:text-white transition-colors cursor-pointer">
            <input
              type="checkbox"
              v-model="lighting.shadows"
              @change="updateLighting"
              class="w-3 h-3 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            >
            <span>启用阴影</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// Props
interface Props {
  modelInfo?: {
    vertices?: number
    faces?: number
    fileSize?: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  modelInfo: () => ({
    vertices: 0,
    faces: 0,
    fileSize: 0
  })
})

// Emits
const emit = defineEmits<{
  close: []
  transformChange: [transform: any]
  materialChange: [material: any]
  lightingChange: [lighting: any]
}>()

// State
const transform = reactive({
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 }
})

const material = reactive({
  color: '#ffffff',
  metallic: 0.0,
  roughness: 0.5,
  opacity: 1.0
})

const lighting = reactive({
  ambientIntensity: 0.3,
  directionalIntensity: 1.0,
  shadows: true
})

// Methods
const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const updateTransform = () => {
  emit('transformChange', { ...transform })
}

const updateMaterial = () => {
  emit('materialChange', { ...material })
}

const updateLighting = () => {
  emit('lightingChange', { ...lighting })
}
</script>

<style scoped>
.viewer-control-panel {
  min-width: 280px;
  max-width: 320px;
}

/* 自定义滑块样式 */
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #1f2937;
}

.slider::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #1f2937;
}

/* 自定义滚动条 */
.viewer-control-panel::-webkit-scrollbar {
  width: 4px;
}

.viewer-control-panel::-webkit-scrollbar-track {
  background: rgba(55, 65, 81, 0.3);
  border-radius: 2px;
}

.viewer-control-panel::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 2px;
}

.viewer-control-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style>