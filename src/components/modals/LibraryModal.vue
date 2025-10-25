<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
      <!-- 头部 -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">模型库</h2>
        <button
          @click="$emit('close')"
          class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 搜索和筛选 -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex space-x-4">
          <div class="flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索模型..."
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            >
          </div>
          <select
            v-model="selectedCategory"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">所有分类</option>
            <option value="character">角色</option>
            <option value="object">物品</option>
            <option value="building">建筑</option>
            <option value="vehicle">载具</option>
          </select>
        </div>
      </div>

      <!-- 模型网格 -->
      <div class="flex-1 overflow-y-auto p-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="model in filteredModels"
            :key="model.id"
            class="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            @click="selectModel(model)"
          >
            <!-- 模型预览图 -->
            <div class="aspect-square bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
              <img
                v-if="model.thumbnail"
                :src="model.thumbnail"
                :alt="model.name"
                class="w-full h-full object-cover"
              >
              <svg
                v-else
                class="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>

            <!-- 模型信息 -->
            <div class="p-4">
              <h3 class="font-medium text-gray-900 dark:text-gray-100 mb-1">{{ model.name }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ model.description }}</p>
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                  {{ getCategoryName(model.category) }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ model.fileSize }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div
          v-if="filteredModels.length === 0"
          class="text-center py-12"
        >
          <svg
            class="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <p class="text-gray-500 dark:text-gray-400">没有找到匹配的模型</p>
        </div>
      </div>

      <!-- 底部 -->
      <div class="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          共 {{ models.length }} 个模型
        </div>
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  close: []
}>()

interface Model {
  id: string
  name: string
  description: string
  category: string
  thumbnail?: string
  fileSize: string
}

const searchQuery = ref('')
const selectedCategory = ref('')

// 示例模型数据
const models = ref<Model[]>([
  {
    id: '1',
    name: '现代椅子',
    description: '简约现代风格的办公椅',
    category: 'object',
    fileSize: '2.5 MB'
  },
  {
    id: '2',
    name: '卡通角色',
    description: '可爱的3D卡通人物模型',
    category: 'character',
    fileSize: '5.2 MB'
  },
  {
    id: '3',
    name: '现代建筑',
    description: '现代风格的办公楼模型',
    category: 'building',
    fileSize: '12.8 MB'
  },
  {
    id: '4',
    name: '跑车',
    description: '高性能跑车3D模型',
    category: 'vehicle',
    fileSize: '8.9 MB'
  },
  {
    id: '5',
    name: '咖啡杯',
    description: '精美的陶瓷咖啡杯',
    category: 'object',
    fileSize: '1.8 MB'
  },
  {
    id: '6',
    name: '机器人',
    description: '未来科技风格机器人',
    category: 'character',
    fileSize: '7.3 MB'
  }
])

const filteredModels = computed(() => {
  return models.value.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         model.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = !selectedCategory.value || model.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const getCategoryName = (category: string) => {
  const categoryNames: Record<string, string> = {
    character: '角色',
    object: '物品',
    building: '建筑',
    vehicle: '载具'
  }
  return categoryNames[category] || category
}

const selectModel = (model: Model) => {
  // 这里可以添加选择模型的逻辑
  console.log('选择模型:', model)
  // 可以发送事件给父组件或者直接操作store
  emit('close')
}
</script>