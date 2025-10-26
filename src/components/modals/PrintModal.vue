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
        <!-- 连接状态 -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">连接状态</span>
            <div class="flex items-center">
              <div 
                :class="[
                  'w-2 h-2 rounded-full mr-2',
                  connected ? 'bg-green-500' : 'bg-red-500'
                ]"
              ></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ connected ? '已连接' : '未连接' }}
              </span>
            </div>
          </div>
          
          <button
            @click="handleCheckConnection"
            :disabled="isChecking"
            class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {{ isChecking ? '检查中...' : '检查 Bambu Connect' }}
          </button>
        </div>

        <!-- Bambu Connect 说明 -->
        <div v-if="connected" class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Bambu Connect 已连接</h4>
              <p class="text-sm text-blue-700 dark:text-blue-300">
                点击"发送到打印机"将直接在 Bambu Connect 中打开模型文件，您可以在那里选择打印机和设置打印参数。
              </p>
            </div>
          </div>
        </div>

        <!-- 文件信息 -->
        <div v-if="modelInfo" class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">模型信息</h4>
          <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <div>文件名: {{ modelInfo.name || '未知' }}</div>
            <div v-if="modelInfo.faces">面数: {{ modelInfo.faces.toLocaleString() }}</div>
            <div v-if="modelInfo.vertices">顶点数: {{ modelInfo.vertices.toLocaleString() }}</div>
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
        <button
          @click="handleSendToPrint"
          :disabled="!connected || !modelInfo || !modelInfo.url"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          发送到打印机
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useBambuConnect } from '@/composables/useBambuConnect'

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

// Bambu Connect 相关
const {
  connected,
  error,
  isChecking,
  checkBambuConnect,
  importFileToBambuConnect
} = useBambuConnect()

// 监听弹窗显示状态，自动检查连接
watch(() => props.isVisible, (visible) => {
  if (visible && !connected.value) {
    handleCheckConnection()
  }
})

// 方法
const handleCheckConnection = async () => {
  try {
    await checkBambuConnect()
  } catch (err) {
    console.error('Failed to check Bambu Connect:', err)
  }
}

const handleSendToPrint = async () => {
  // 详细检查模型信息
  if (!props.modelInfo) {
    emit('print-error', '请先选择要打印的3D模型')
    return
  }

  if (!props.modelInfo.url) {
    emit('print-error', '模型文件路径缺失，无法发送到打印机')
    return
  }

  if (!props.modelInfo.name) {
    emit('print-error', '模型文件名缺失，请重新选择模型')
    return
  }

  // 检查连接状态
  if (!connected.value) {
    emit('print-error', '未连接到 Bambu Connect，请先检查连接')
    return
  }

  try {
    console.log('Sending model to Bambu Connect:', {
      url: props.modelInfo.url,
      name: props.modelInfo.name
    })

    // 使用bambu-connect://import-file协议发送文件
    const result = await importFileToBambuConnect(
      props.modelInfo.url,
      props.modelInfo.name
    )

    if (result.success) {
      emit('print-success', result.message)
      emit('close')
    } else {
      emit('print-error', `发送失败: ${result.message}`)
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '发送到打印机时发生未知错误'
    emit('print-error', `连接错误: ${errorMessage}`)
    console.error('Print error:', err)
  }
}
</script>