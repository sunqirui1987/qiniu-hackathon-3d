<template>
  <div class="right-history-panel w-80 bg-gray-100 dark:bg-gray-800 border-l border-gray-300 dark:border-gray-700 flex flex-col">
    <!-- 标题栏 -->
    <div class="header p-4 border-b border-gray-300 dark:border-gray-700">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">生成历史</h3>
        <button
          @click="$emit('clear-history')"
          class="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          title="清空历史"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <!-- 筛选器 -->
      <div class="filter-tabs flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
        <button
          v-for="filter in filters"
          :key="filter.id"
          @click="$emit('filter-change', filter.id)"
          :class="[
            'flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors',
            activeFilter === filter.id
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          ]"
        >
          {{ filter.name }}
        </button>
      </div>
    </div>

    <!-- 历史列表 -->
    <div class="history-list flex-1 overflow-y-auto p-4">
      <div v-if="filteredHistory.length === 0" class="empty-state text-center py-12">
        <svg class="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p class="text-gray-500 dark:text-gray-500 text-sm">暂无生成历史</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="item in filteredHistory"
          :key="item.id"
          @click="$emit('load-history-item', item)"
          class="history-item bg-white dark:bg-gray-750 rounded-lg p-4 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <!-- 缩略图和基本信息 -->
          <div class="flex gap-3 mb-3">
            <div class="thumbnail w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
              <img
                v-if="item.thumbnail"
                :src="item.thumbnail"
                :alt="item.name"
                class="w-full h-full object-cover"
              >
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-8 h-8 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate mb-1">{{ item.name }}</h4>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">{{ formatDate(item.createdAt) }}</p>
              
              <!-- 状态标签 -->
              <div class="flex items-center gap-2">
                <span
                  :class="[
                    'px-2 py-1 text-xs rounded-full',
                    getStatusClass(item.status)
                  ]"
                >
                  {{ getStatusText(item.status) }}
                </span>
                <span
                  :class="[
                    'px-2 py-1 text-xs rounded-full',
                    getTypeClass(item.type)
                  ]"
                >
                  {{ getTypeText(item.type) }}
                </span>
              </div>
            </div>
          </div>

          <!-- 详细信息 -->
          <div class="details space-y-2">
            <div v-if="item.prompt" class="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
              <span class="text-gray-500 dark:text-gray-500">提示词:</span> {{ item.prompt }}
            </div>
            
            <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>{{ item.modelInfo?.faces || 'N/A' }} 面</span>
              <span>{{ formatFileSize(item.fileSize) }}</span>
            </div>

            <!-- 进度条（仅在生成中显示） -->
            <div v-if="item.status === 'generating'" class="progress mt-2">
              <div class="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-1.5">
                <div 
                  class="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  :style="{ width: `${item.progress || 0}%` }"
                ></div>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">{{ item.progressText || '生成中...' }}</p>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="actions flex gap-2 mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
            <button
              v-if="item.status === 'completed'"
              @click.stop="$emit('download-model', item)"
              class="flex-1 py-1.5 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              下载
            </button>
            <button
              v-if="item.status === 'completed'"
              @click.stop="$emit('load-in-viewer', item)"
              class="flex-1 py-1.5 px-3 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            >
              查看
            </button>
            <button
              @click.stop="$emit('delete-history-item', item)"
              class="py-1.5 px-3 text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 border border-red-500 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 rounded transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部统计信息 -->
    <div class="footer p-4 border-t border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
      <div class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
        <div class="flex justify-between">
          <span>总计:</span>
          <span>{{ history.length }} 个项目</span>
        </div>
        <div class="flex justify-between">
          <span>已完成:</span>
          <span>{{ completedCount }} 个</span>
        </div>
        <div class="flex justify-between">
          <span>生成中:</span>
          <span>{{ generatingCount }} 个</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 类型定义
interface HistoryItem {
  id: string
  name: string
  type: 'text-to-3d' | 'image-to-3d' | 'retopology' | 'texture'
  status: 'generating' | 'completed' | 'failed'
  createdAt?: Date
  prompt?: string
  thumbnail?: string
  fileSize?: number
  modelInfo?: {
    faces: number
    vertices: number
  }
  progress?: number
  progressText?: string
  modelUrl?: string
}

// Props
interface Props {
  history: HistoryItem[]
  activeFilter: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits([
  'filter-change',
  'load-history-item',
  'download-model',
  'load-in-viewer',
  'delete-history-item',
  'clear-history'
])

// 筛选器配置
const filters = [
  { id: 'all', name: '全部' },
  { id: 'completed', name: '已完成' },
  { id: 'generating', name: '生成中' },
  { id: 'failed', name: '失败' }
]

// 计算属性
const filteredHistory = computed(() => {
  if (props.activeFilter === 'all') {
    return props.history
  }
  return props.history.filter(item => item.status === props.activeFilter)
})

const completedCount = computed(() => {
  return props.history.filter(item => item.status === 'completed').length
})

const generatingCount = computed(() => {
  return props.history.filter(item => item.status === 'generating').length
})

// 方法
const formatDate = (date: Date | undefined) => {
  if (!date) return '未知时间'
  
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'N/A'
  
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500/20 text-green-400'
    case 'generating':
      return 'bg-blue-500/20 text-blue-400'
    case 'failed':
      return 'bg-red-500/20 text-red-400'
    default:
      return 'bg-gray-500/20 text-gray-400'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return '已完成'
    case 'generating':
      return '生成中'
    case 'failed':
      return '失败'
    default:
      return '未知'
  }
}

const getTypeClass = (type: string) => {
  switch (type) {
    case 'text-to-3d':
      return 'bg-purple-500/20 text-purple-400'
    case 'image-to-3d':
      return 'bg-orange-500/20 text-orange-400'
    case 'retopology':
      return 'bg-cyan-500/20 text-cyan-400'
    case 'texture':
      return 'bg-pink-500/20 text-pink-400'
    default:
      return 'bg-gray-500/20 text-gray-400'
  }
}

const getTypeText = (type: string) => {
  switch (type) {
    case 'text-to-3d':
      return '文生3D'
    case 'image-to-3d':
      return '图生3D'
    case 'retopology':
      return '重拓扑'
    case 'texture':
      return '贴图'
    default:
      return '未知'
  }
}
</script>

<style scoped>
.bg-gray-750 {
  background-color: rgb(55, 65, 81);
}

/* 文本截断 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 历史项目悬停效果 */
.history-item {
  transition: all 0.2s ease;
}

.history-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 自定义滚动条 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(55, 65, 81, 0.3);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

/* 进度条动画 */
.progress .bg-blue-500 {
  transition: width 0.3s ease;
}

/* 操作按钮组 */
.actions button {
  transition: all 0.2s ease;
}

.actions button:hover {
  transform: translateY(-1px);
}
</style>