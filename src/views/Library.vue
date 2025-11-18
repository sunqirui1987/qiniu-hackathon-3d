<template>
  <div class="library-page h-full flex flex-col bg-gray-50 dark:bg-gray-900">
    <!-- 页面头部 -->
    <div class="page-header bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">模型库</h1>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">管理和浏览您的3D模型资源</p>
        </div>
        <div class="flex gap-3">
          <button
            class="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            :class="{ 'bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-300': selectionMode }"
            @click="toggleSelectionMode"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            {{ selectionMode ? '退出选择' : '批量操作' }}
          </button>
          <button
            class="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            @click="handleImport"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            导入模型
          </button>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选栏 -->
    <SearchBar
      v-model:search-query="searchQuery"
      v-model:selected-category="selectedCategory"
      v-model:sort-by="sortBy"
      :total-count="filteredModels.length"
      @clear-filters="clearFilters"
    />

    <!-- 模型网格 -->
    <ModelGrid
      :models="sortedModels"
      :selected-ids="selectedIds"
      :selection-mode="selectionMode"
      :loading="loading"
      @select-model="handleSelectModel"
      @view-model="handleViewModel"
      @print-model="handlePrintModel"
      @toggle-selection="toggleSelection"
      @select-all="selectAll"
      @clear-selection="clearSelection"
      @batch-print="handleBatchPrint"
      @batch-delete="handleBatchDelete"
    />

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">确认删除</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ deleteMessage }}
        </p>
        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            @click="showDeleteConfirm = false"
          >
            取消
          </button>
          <button
            class="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            @click="confirmDelete"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import SearchBar from '@/components/library/SearchBar.vue'
import ModelGrid from '@/components/library/ModelGrid.vue'

interface ModelMetadata {
  vertices: number
  faces: number
  materials: number
}

interface Model {
  id: string
  name: string
  description: string
  category: string
  thumbnail?: string
  fileSize: string
  createdAt: Date
  metadata?: ModelMetadata
}

const router = useRouter()

// 搜索和筛选状态
const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref('date-desc')

// 选择模式
const selectionMode = ref(false)
const selectedIds = ref<string[]>([])

// 删除确认
const showDeleteConfirm = ref(false)
const deleteMessage = ref('')
const pendingDeleteIds = ref<string[]>([])

// 加载状态
const loading = ref(false)

// 示例模型数据
const models = ref<Model[]>([
  {
    id: '1',
    name: '现代椅子',
    description: '简约现代风格的办公椅，适合家居和办公场景',
    category: 'object',
    fileSize: '2.5 MB',
    createdAt: new Date('2025-11-15'),
    metadata: {
      vertices: 12500,
      faces: 24800,
      materials: 3
    }
  },
  {
    id: '2',
    name: '卡通角色',
    description: '可爱的3D卡通人物模型，带有完整骨骼绑定',
    category: 'character',
    fileSize: '5.2 MB',
    createdAt: new Date('2025-11-14'),
    metadata: {
      vertices: 45000,
      faces: 88000,
      materials: 5
    }
  },
  {
    id: '3',
    name: '现代建筑',
    description: '现代风格的办公楼模型，包含内部结构',
    category: 'building',
    fileSize: '12.8 MB',
    createdAt: new Date('2025-11-13'),
    metadata: {
      vertices: 150000,
      faces: 280000,
      materials: 12
    }
  },
  {
    id: '4',
    name: '跑车',
    description: '高性能跑车3D模型，精细建模',
    category: 'vehicle',
    fileSize: '8.9 MB',
    createdAt: new Date('2025-11-12'),
    metadata: {
      vertices: 85000,
      faces: 165000,
      materials: 8
    }
  },
  {
    id: '5',
    name: '咖啡杯',
    description: '精美的陶瓷咖啡杯，带有真实纹理',
    category: 'object',
    fileSize: '1.8 MB',
    createdAt: new Date('2025-11-11'),
    metadata: {
      vertices: 8000,
      faces: 15600,
      materials: 2
    }
  },
  {
    id: '6',
    name: '机器人',
    description: '未来科技风格机器人，带有关节动画',
    category: 'character',
    fileSize: '7.3 MB',
    createdAt: new Date('2025-11-10'),
    metadata: {
      vertices: 62000,
      faces: 118000,
      materials: 6
    }
  }
])

// 筛选后的模型
const filteredModels = computed(() => {
  return models.value.filter(model => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = !selectedCategory.value || model.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

// 排序后的模型
const sortedModels = computed(() => {
  const sorted = [...filteredModels.value]

  switch (sortBy.value) {
    case 'date-desc':
      return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    case 'date-asc':
      return sorted.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name, 'zh-CN'))
    case 'size-asc':
      return sorted.sort((a, b) => parseFileSize(a.fileSize) - parseFileSize(b.fileSize))
    case 'size-desc':
      return sorted.sort((a, b) => parseFileSize(b.fileSize) - parseFileSize(a.fileSize))
    default:
      return sorted
  }
})

// 解析文件大小（简化版本）
const parseFileSize = (size: string): number => {
  const num = parseFloat(size)
  if (size.includes('MB')) return num * 1024 * 1024
  if (size.includes('KB')) return num * 1024
  return num
}

// 清除筛选
const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
}

// 切换选择模式
const toggleSelectionMode = () => {
  selectionMode.value = !selectionMode.value
  if (!selectionMode.value) {
    selectedIds.value = []
  }
}

// 切换单个模型选择
const toggleSelection = (id: string) => {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
}

// 全选
const selectAll = () => {
  selectedIds.value = sortedModels.value.map(m => m.id)
}

// 取消选择
const clearSelection = () => {
  selectedIds.value = []
}

// 选择模型
const handleSelectModel = (model: Model) => {
  if (selectionMode.value) {
    toggleSelection(model.id)
  } else {
    handleViewModel(model)
  }
}

// 查看模型
const handleViewModel = (model: Model) => {
  console.log('查看模型:', model)
  // TODO: 导航到3D查看器页面
  // router.push({ name: 'viewer', params: { id: model.id } })
}

// 打印模型
const handlePrintModel = (model: Model) => {
  console.log('打印模型:', model)
  // TODO: 打开打印弹窗或导航到打印页面
}

// 导入模型
const handleImport = () => {
  console.log('导入模型')
  // TODO: 打开文件选择对话框
}

// 批量打印
const handleBatchPrint = () => {
  console.log('批量打印:', selectedIds.value)
  // TODO: 实现批量打印逻辑
}

// 批量删除
const handleBatchDelete = () => {
  pendingDeleteIds.value = [...selectedIds.value]
  deleteMessage.value = `确定要删除这 ${selectedIds.value.length} 个模型吗？此操作不可撤销。`
  showDeleteConfirm.value = true
}

// 确认删除
const confirmDelete = () => {
  models.value = models.value.filter(m => !pendingDeleteIds.value.includes(m.id))
  selectedIds.value = []
  showDeleteConfirm.value = false
  pendingDeleteIds.value = []
  console.log('已删除模型')
}
</script>
