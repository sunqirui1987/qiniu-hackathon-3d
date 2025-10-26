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

      <!-- 分类标签页 -->
      <div class="category-tabs flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="$emit('category-change', category.id)"
          :class="[
            'flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors',
            activeCategory === category.id
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          ]"
        >
          {{ category.name }}
        </button>
      </div>
    </div>

    <!-- 历史列表 -->
    <div class="history-list flex-1 overflow-y-auto p-4">
      <div v-if="displayHistory.length === 0" class="empty-state text-center py-12">
        <svg class="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p class="text-gray-500 dark:text-gray-500 text-sm">暂无生成历史</p>
      </div>

      <!-- 网格布局 -->
      <div v-else class="grid grid-cols-3 gap-3">
        <div
          v-for="item in displayHistory"
          :key="item.id"
          @click="$emit('load-history-item', item)"
          :class="[
            'history-item group relative rounded-lg overflow-hidden cursor-pointer transition-all',
            selectedItemId === item.id
              ? 'bg-blue-600 ring-2 ring-blue-400 ring-opacity-75 shadow-lg'
              : 'bg-gray-800 hover:ring-2 hover:ring-blue-500 hover:ring-opacity-50'
          ]"
        >
          <!-- 缩略图 -->
          <div class="aspect-square bg-gray-700 relative">
            <img
              v-if="item.thumbnail_url"
              :src="item.thumbnail_url"
              :alt="getTaskName(item)"
              class="w-full h-full object-cover"
            >
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>

            <!-- 状态指示器 -->
            <div class="absolute top-2 left-2">
              <span
                :class="[
                  'px-1.5 py-0.5 text-xs rounded-full text-white',
                  getStatusBadgeClass(item.status)
                ]"
              >
                {{ getStatusIcon(item.status) }}
              </span>
            </div>



            <!-- 进度条（仅在生成中显示） -->
            <div v-if="['PENDING', 'IN_PROGRESS'].includes(item.status)" class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
              <div class="w-full bg-gray-600 rounded-full h-1">
                <div 
                  class="bg-blue-500 h-1 rounded-full transition-all duration-300"
                  :style="{ width: `${item.progress || 0}%` }"
                ></div>
              </div>
              <p class="text-xs text-white mt-1 text-center">{{ item.progress || 0 }}%</p>
            </div>


          </div>

          <!-- 底部信息（可选，简化版） -->
          <div :class="[
            'p-2',
            selectedItemId === item.id ? 'bg-blue-600' : 'bg-gray-800'
          ]">
            <p :class="[
              'text-xs truncate',
              selectedItemId === item.id ? 'text-blue-100' : 'text-gray-300'
            ]" :title="getTaskName(item)">
              {{ getTaskName(item) }}
            </p>
            <p :class="[
              'text-xs',
              selectedItemId === item.id ? 'text-blue-200' : 'text-gray-500'
            ]">{{ formatDate(item.created_at) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'

// 类型定义 - 匹配Meshy API响应格式
interface HistoryItem {
  id: string
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED' | 'CANCELED'
  progress: number
  model_urls?: {
    glb?: string
    fbx?: string
    obj?: string
    usdz?: string
    mtl?: string
    blend?: string
    stl?: string
  }
  texture_urls?: Array<{
    base_color?: string
    metallic?: string
    normal?: string
    roughness?: string
  }>
  thumbnail_url?: string
  prompt?: string
  art_style?: string
  created_at: number
  started_at?: number
  finished_at?: number
  task_error?: {
    message: string
  }
  type?: 'text-to-3d' | 'image-to-3d'
}

// Props
interface Props {
  activeCategory: string
  textTo3dTasks?: HistoryItem[]
  imageTo3dTasks?: HistoryItem[]
  selectedItemId?: string // 新增：当前选中的项目ID
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits([
  'category-change',
  'load-history-item',
  'clear-history',
  'refresh-history' // 新增：通知父组件刷新历史数据
])

// 定时器引用
let refreshTimer: NodeJS.Timeout | null = null

// 分类配置
const categories = [
  { id: 'all', name: '全部' },
  { id: 'text-to-3d', name: '白模' },
  { id: 'image-to-3d', name: '纹理' }
]

// 计算属性 - 简化版，直接显示所有数据
const displayHistory = computed(() => {
  switch (props.activeCategory) {
    case 'text-to-3d':
      return props.textTo3dTasks || []
    case 'image-to-3d':
      return props.imageTo3dTasks || []
    case 'all':
    default:
      return [...(props.textTo3dTasks || []), ...(props.imageTo3dTasks || [])]
  }
})

// 刷新历史数据的方法
const refreshHistoryData = () => {
  emit('refresh-history')
}

// 启动定时器
const startAutoRefresh = () => {
  // 清除现有定时器
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  
  // 设置每2秒刷新一次
  refreshTimer = setInterval(() => {
    refreshHistoryData()
  }, 2000)
}

// 停止定时器
const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 生命周期钩子
onMounted(() => {
  // 组件挂载时立即拉取一次数据
  refreshHistoryData()
  
  // 启动定时刷新
  startAutoRefresh()
})

onUnmounted(() => {
  // 组件销毁时清理定时器
  stopAutoRefresh()
})

// 方法
const formatDate = (timestamp: number | undefined) => {
  if (!timestamp) return '未知时间'
  
  const date = new Date(timestamp)
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

const getTaskName = (item: HistoryItem) => {
  if (item.prompt) {
    return item.prompt.length > 20 ? item.prompt.slice(0, 20) + '...' : item.prompt
  }
  return item.type === 'text-to-3d' ? '文生3D任务' : '图生3D任务'
}

// 网格布局专用方法
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'SUCCEEDED':
      return '✓'
    case 'PENDING':
      return '⏳'
    case 'IN_PROGRESS':
      return '⚡'
    case 'FAILED':
    case 'EXPIRED':
    case 'CANCELED':
      return '✗'
    default:
      return '?'
  }
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'SUCCEEDED':
      return 'bg-green-600'
    case 'PENDING':
      return 'bg-yellow-600'
    case 'IN_PROGRESS':
      return 'bg-blue-600'
    case 'FAILED':
    case 'EXPIRED':
    case 'CANCELED':
      return 'bg-red-600'
    default:
      return 'bg-gray-600'
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