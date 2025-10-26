<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
      <!-- 标题栏 -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          3D打印设置
        </h3>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 内容区域 -->
      <div class="p-6">
        <!-- Bambu Studio 说明 -->
        <div v-if="bambuStudioSupported" class="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 class="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Bambu Studio 打印</h4>
              <p class="text-sm text-green-700 dark:text-green-300">
                点击"发送到 Bambu Studio"将上传模型文件并直接在 Bambu Studio 中打开进行打印设置。
              </p>
            </div>
          </div>
        </div>

        <!-- 不支持提示 -->
        <div v-else class="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 class="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">环境不支持</h4>
              <p class="text-sm text-yellow-700 dark:text-yellow-300">
                当前环境不支持 Bambu Studio 协议，请确保在支持自定义协议的浏览器中使用。
              </p>
            </div>
          </div>
        </div>

        <!-- 文件信息 -->
        <div v-if="modelInfo" class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">模型信息</h4>
          <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <div>文件名: {{ modelInfo.name || '未知' }}</div>
            <div v-if="modelInfo.faces">面数: {{ (modelInfo.faces || 0).toLocaleString() }}</div>
            <div v-if="modelInfo.vertices">顶点数: {{ (modelInfo.vertices || 0).toLocaleString() }}</div>
            <div v-if="modelInfo.fileSize">文件大小: {{ modelInfo.fileSize }}</div>
          </div>
        </div>

        <!-- 错误信息 -->
        <div v-if="error" class="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
          <p class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          取消
        </button>
        
        <!-- Bambu Studio 按钮 -->
        <button
          @click="handleSendToBambuStudio"
          :disabled="!bambuStudioSupported || !modelInfo || !modelInfo.url || isSendingToBambuStudio"
          class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          {{ isSendingToBambuStudio ? '发送中...' : '发送到 Bambu Studio' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BambuStudioClient } from '@/utils/bambuStudioClient'

interface Props {
  isVisible: boolean
  modelInfo?: {
    name?: string
    faces?: number
    vertices?: number
    fileSize?: string
    url?: string
  }
}

interface Emits {
  'close': []
  'print-success': [message: string]
  'print-error': [error: string]
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: false,
  modelInfo: undefined
})

const emit = defineEmits<Emits>()

// Bambu Studio 相关
const isSendingToBambuStudio = ref(false)
const bambuStudioSupported = ref(BambuStudioClient.isBambuStudioSupported())
const error = ref('')

const handleSendToBambuStudio = async () => {
  // 清除之前的错误
  error.value = ''
  
  // 详细检查模型信息
  if (!props.modelInfo) {
    error.value = '请先选择要打印的3D模型'
    emit('print-error', error.value)
    return
  }

  if (!props.modelInfo.url) {
    error.value = '模型文件路径缺失，无法发送到 Bambu Studio'
    emit('print-error', error.value)
    return
  }

  if (!props.modelInfo.name) {
    error.value = '模型文件名缺失，请重新选择模型'
    emit('print-error', error.value)
    return
  }

  isSendingToBambuStudio.value = true

  try {
    console.log('Sending model to Bambu Studio:', {
      url: props.modelInfo.url,
      name: props.modelInfo.name
    })

    const result = await BambuStudioClient.sendToBambuStudio(
      props.modelInfo.url,
      props.modelInfo.name
    )

    if (result.success) {
      emit('print-success', result.message)
      emit('close')
    } else {
      error.value = `发送失败: ${result.message}`
      emit('print-error', error.value)
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '发送到 Bambu Studio 时发生未知错误'
    error.value = `发送错误: ${errorMessage}`
    emit('print-error', error.value)
    console.error('Bambu Studio error:', err)
  } finally {
    isSendingToBambuStudio.value = false
  }
}
</script>