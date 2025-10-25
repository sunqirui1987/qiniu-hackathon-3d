<template>
  <div class="bg-white rounded-lg shadow-md p-4 space-y-4">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">
      模型属性
    </h3>

    <div
      v-if="!modelInfo"
      class="text-center py-8 text-gray-400"
    >
      <svg
        class="w-12 h-12 mx-auto mb-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p class="text-sm">
        暂无模型信息
      </p>
    </div>

    <div
      v-else
      class="space-y-4"
    >
      <div class="space-y-3">
        <h4 class="text-sm font-semibold text-gray-700 border-b pb-2">
          基本信息
        </h4>
        
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-gray-50 rounded-lg p-3">
            <p class="text-xs text-gray-500 mb-1">
              顶点数
            </p>
            <p class="text-lg font-semibold text-gray-800">
              {{ formatNumber(modelInfo.vertices) }}
            </p>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-3">
            <p class="text-xs text-gray-500 mb-1">
              三角面数
            </p>
            <p class="text-lg font-semibold text-gray-800">
              {{ formatNumber(modelInfo.faces) }}
            </p>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-3">
            <p class="text-xs text-gray-500 mb-1">
              材质数
            </p>
            <p class="text-lg font-semibold text-gray-800">
              {{ modelInfo.materials }}
            </p>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-3">
            <p class="text-xs text-gray-500 mb-1">
              复杂度
            </p>
            <p
              class="text-lg font-semibold"
              :class="complexityColor"
            >
              {{ complexity }}
            </p>
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <h4 class="text-sm font-semibold text-gray-700 border-b pb-2">
          尺寸信息
        </h4>
        
        <div class="space-y-2">
          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-sm text-gray-600">宽度 (X)</span>
            <span class="text-sm font-medium text-gray-800">{{ formatDimension(modelInfo.boundingBox.size.x) }}</span>
          </div>
          
          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-sm text-gray-600">高度 (Y)</span>
            <span class="text-sm font-medium text-gray-800">{{ formatDimension(modelInfo.boundingBox.size.y) }}</span>
          </div>
          
          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-sm text-gray-600">深度 (Z)</span>
            <span class="text-sm font-medium text-gray-800">{{ formatDimension(modelInfo.boundingBox.size.z) }}</span>
          </div>
          
          <div class="flex justify-between items-center py-2 bg-blue-50 rounded-lg px-3 mt-2">
            <span class="text-sm font-medium text-blue-700">体积</span>
            <span class="text-sm font-semibold text-blue-800">{{ volume }} 单位³</span>
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <h4 class="text-sm font-semibold text-gray-700 border-b pb-2">
          中心点坐标
        </h4>
        
        <div class="grid grid-cols-3 gap-2">
          <div class="bg-red-50 rounded-lg p-2 text-center">
            <p class="text-xs text-red-600 mb-1">
              X
            </p>
            <p class="text-sm font-semibold text-red-700">
              {{ formatCoord(modelInfo.boundingBox.center.x) }}
            </p>
          </div>
          
          <div class="bg-green-50 rounded-lg p-2 text-center">
            <p class="text-xs text-green-600 mb-1">
              Y
            </p>
            <p class="text-sm font-semibold text-green-700">
              {{ formatCoord(modelInfo.boundingBox.center.y) }}
            </p>
          </div>
          
          <div class="bg-blue-50 rounded-lg p-2 text-center">
            <p class="text-xs text-blue-600 mb-1">
              Z
            </p>
            <p class="text-sm font-semibold text-blue-700">
              {{ formatCoord(modelInfo.boundingBox.center.z) }}
            </p>
          </div>
        </div>
      </div>

      <div class="pt-3 border-t border-gray-200">
        <div class="flex items-center justify-between text-xs text-gray-500">
          <span>打印建议</span>
          <span
            class="px-2 py-1 rounded-full"
            :class="printabilityBadge"
          >
            {{ printability }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ModelInfo } from '@/composables/use3DViewer'

interface Props {
  modelInfo: ModelInfo | null
}

const props = defineProps<Props>()

const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-CN')
}

const formatDimension = (value: number): string => {
  return value.toFixed(2) + ' 单位'
}

const formatCoord = (value: number): string => {
  return value.toFixed(2)
}

const complexity = computed(() => {
  if (!props.modelInfo) return '-'
  const faces = props.modelInfo.faces
  if (faces < 10000) return '低'
  if (faces < 100000) return '中'
  if (faces < 500000) return '高'
  return '极高'
})

const complexityColor = computed(() => {
  const comp = complexity.value
  if (comp === '低') return 'text-green-600'
  if (comp === '中') return 'text-blue-600'
  if (comp === '高') return 'text-orange-600'
  return 'text-red-600'
})

const volume = computed(() => {
  if (!props.modelInfo) return '0'
  const size = props.modelInfo.boundingBox.size
  const vol = size.x * size.y * size.z
  return vol.toFixed(2)
})

const printability = computed(() => {
  if (!props.modelInfo) return '未知'
  const size = props.modelInfo.boundingBox.size
  const maxDim = Math.max(size.x, size.y, size.z)
  
  if (maxDim < 100) return '适合小型打印机'
  if (maxDim < 200) return '适合中型打印机'
  if (maxDim < 300) return '需要大型打印机'
  return '可能需要分块打印'
})

const printabilityBadge = computed(() => {
  const p = printability.value
  if (p.includes('小型')) return 'bg-green-100 text-green-700'
  if (p.includes('中型')) return 'bg-blue-100 text-blue-700'
  if (p.includes('大型')) return 'bg-orange-100 text-orange-700'
  return 'bg-red-100 text-red-700'
})
</script>
