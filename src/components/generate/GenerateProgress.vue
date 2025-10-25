<template>
  <div class="space-y-4">
    <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-800">
          {{ statusText }}
        </h3>
        <button
          v-if="canCancel && onCancel"
          class="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          @click="handleCancel"
        >
          取消生成
        </button>
      </div>

      <div class="space-y-3">
        <div class="flex justify-between text-sm text-gray-600 mb-1">
          <span>{{ stageText }}</span>
          <span class="font-medium">{{ progress }}%</span>
        </div>
        
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div
            class="h-3 rounded-full transition-all duration-300"
            :class="progressColorClass"
            :style="{ width: `${progress}%` }"
          />
        </div>

        <div
          v-if="status === 'generating'"
          class="flex items-center text-sm text-gray-600"
        >
          <svg
            class="animate-spin h-4 w-4 mr-2 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>正在生成中...</span>
        </div>

        <div
          v-if="estimatedTime && status === 'generating'"
          class="text-sm text-gray-500"
        >
          预计剩余时间: {{ estimatedTime }}
        </div>
      </div>

      <div
        v-if="error"
        class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md"
      >
        <div class="flex items-start">
          <svg
            class="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          <div class="flex-1">
            <p class="text-sm font-medium text-red-800">
              生成失败
            </p>
            <p class="text-sm text-red-600 mt-1">
              {{ error }}
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="status === 'completed'"
        class="mt-4 p-3 bg-green-50 border border-green-200 rounded-md"
      >
        <div class="flex items-center">
          <svg
            class="w-5 h-5 text-green-600 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <p class="text-sm font-medium text-green-800">
            生成完成!
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="previewUrl && status === 'generating'"
      class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
    >
      <h4 class="text-sm font-semibold text-gray-700 mb-3">
        预览
      </h4>
      <div class="flex justify-center">
        <img
          :src="previewUrl"
          alt="Preview"
          class="max-w-full max-h-64 rounded-lg shadow-md"
        >
      </div>
      <p class="text-xs text-gray-500 mt-2 text-center">
        这是生成的中间预览结果
      </p>
    </div>

    <div
      v-if="taskDetails"
      class="bg-gray-50 border border-gray-200 rounded-lg p-4"
    >
      <h4 class="text-sm font-semibold text-gray-700 mb-2">
        任务详情
      </h4>
      <div class="space-y-1 text-sm text-gray-600">
        <div class="flex justify-between">
          <span>任务ID:</span>
          <span class="font-mono text-xs">{{ taskDetails.id }}</span>
        </div>
        <div class="flex justify-between">
          <span>类型:</span>
          <span>{{ taskDetails.type === 'text-to-3d' ? '文本生成' : '图片生成' }}</span>
        </div>
        <div
          v-if="taskDetails.createdAt"
          class="flex justify-between"
        >
          <span>开始时间:</span>
          <span>{{ formatTime(taskDetails.createdAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface TaskDetails {
  id: string
  type: 'text-to-3d' | 'image-to-3d'
  createdAt?: Date
}

interface Props {
  status: 'idle' | 'uploading' | 'generating' | 'completed' | 'error'
  progress: number
  error?: string | null
  previewUrl?: string | null
  taskDetails?: TaskDetails | null
  estimatedTime?: string
  onCancel?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  status: 'idle',
  progress: 0,
  error: null,
  previewUrl: null,
  taskDetails: null,
  estimatedTime: undefined,
  onCancel: undefined,
})

const statusText = computed(() => {
  switch (props.status) {
    case 'idle':
      return '等待开始'
    case 'uploading':
      return '上传图片中'
    case 'generating':
      return '生成中'
    case 'completed':
      return '生成完成'
    case 'error':
      return '生成失败'
    default:
      return '未知状态'
  }
})

const stageText = computed(() => {
  if (props.status === 'uploading') {
    return '正在上传图片...'
  }
  
  if (props.status === 'generating') {
    if (props.progress < 50) {
      return '第一阶段: 生成预览模型'
    } else {
      return '第二阶段: 精细化处理'
    }
  }
  
  return statusText.value
})

const progressColorClass = computed(() => {
  switch (props.status) {
    case 'uploading':
      return 'bg-yellow-500'
    case 'generating':
      return 'bg-blue-600'
    case 'completed':
      return 'bg-green-600'
    case 'error':
      return 'bg-red-600'
    default:
      return 'bg-gray-400'
  }
})

const canCancel = computed(() => {
  return props.status === 'generating' || props.status === 'uploading'
})

const handleCancel = () => {
  if (props.onCancel) {
    props.onCancel()
  }
}

const formatTime = (date: Date): string => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
</script>
