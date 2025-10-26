<template>
  <div class="p-6">
    <div class="space-y-6">
      <div class="text-center mb-6">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">重拓扑</h3>
        <p class="text-gray-600 dark:text-gray-400 text-sm">优化3D模型的网格结构</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- 输入源选择 -->
        <div class="form-group">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">输入源</label>
          <div class="space-y-3">
            <label class="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <input
                type="radio"
                value="existing_task"
                v-model="retopologyOptions.input_source"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
              />
              <div>
                <div class="text-sm font-medium text-gray-900 dark:text-white">使用现有任务</div>
                <div class="text-xs text-gray-500">从已生成的3D模型中选择</div>
              </div>
            </label>
            
            <label class="flex items-center gap-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <input
                type="radio"
                value="upload_model"
                v-model="retopologyOptions.input_source"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
              />
              <div>
                <div class="text-sm font-medium text-gray-900 dark:text-white">上传模型URL</div>
                <div class="text-xs text-gray-500">提供3D模型的下载链接</div>
              </div>
            </label>
          </div>
        </div>

        <!-- 现有任务选择 -->
        <div v-if="retopologyOptions.input_source === 'existing_task'" class="form-group">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">选择任务</label>
          <select
            v-model="retopologyOptions.task_id"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">请选择一个任务</option>
            <option v-for="task in availableTasks" :key="task.id" :value="task.id">
              {{ task.name }} - {{ task.created_at }}
            </option>
          </select>
        </div>

        <!-- 模型URL输入 -->
        <div v-if="retopologyOptions.input_source === 'upload_model'" class="form-group">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              模型URL *
            </span>
          </label>
          <input
            type="url"
            v-model="retopologyOptions.model_url"
            placeholder="https://example.com/model.obj"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <div class="text-xs text-gray-500 mt-1">支持 OBJ、PLY、STL 等格式</div>
        </div>

        <!-- 拓扑类型 -->
        <div class="form-group">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">拓扑类型</label>
          <div class="grid grid-cols-2 gap-3">
            <label class="relative">
              <input
                type="radio"
                value="triangle"
                v-model="retopologyOptions.topology"
                class="sr-only"
              />
              <div :class="[
                'p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 text-center',
                retopologyOptions.topology === 'triangle'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
              ]">
                <div class="text-sm font-medium">三角形网格</div>
                <div class="text-xs text-gray-500 mt-1">Triangle</div>
              </div>
            </label>
            <label class="relative">
              <input
                type="radio"
                value="quad"
                v-model="retopologyOptions.topology"
                class="sr-only"
              />
              <div :class="[
                'p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 text-center',
                retopologyOptions.topology === 'quad'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
              ]">
                <div class="text-sm font-medium">四边形网格</div>
                <div class="text-xs text-gray-500 mt-1">Quad</div>
              </div>
            </label>
          </div>
        </div>

        <!-- 目标多边形数量 -->
        <div class="form-group">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            目标多边形数量: {{ retopologyOptions.target_polycount.toLocaleString() }}
          </label>
          <input
            type="range"
            v-model="retopologyOptions.target_polycount"
            min="100"
            max="300000"
            step="1000"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>100</span>
            <span>300,000</span>
          </div>
        </div>

        <!-- 高级选项 -->
        <div class="form-group">
          <button
            type="button"
            @click="showAdvancedOptions = !showAdvancedOptions"
            class="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <svg :class="['w-4 h-4 transition-transform', showAdvancedOptions ? 'rotate-90' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            高级选项
          </button>
          
          <div v-if="showAdvancedOptions" class="mt-4 space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <!-- 质量设置 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">重拓扑质量</label>
              <select
                v-model="retopologyOptions.quality"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="low">低质量 (快速)</option>
                <option value="medium">中等质量 (平衡)</option>
                <option value="high">高质量 (精细)</option>
              </select>
            </div>

            <!-- 保持边界 -->
            <label class="flex items-center gap-3">
              <input
                type="checkbox"
                v-model="retopologyOptions.preserve_boundaries"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">保持边界特征</span>
            </label>

            <!-- 保持UV -->
            <label class="flex items-center gap-3">
              <input
                type="checkbox"
                v-model="retopologyOptions.preserve_uv"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">保持UV坐标</span>
            </label>
          </div>
        </div>

        <!-- 生成按钮 -->
        <button
          type="submit"
          :disabled="!isFormValid || props.isProcessing"
          class="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
        >
          <span v-if="props.isProcessing" class="flex items-center justify-center gap-2">
            <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            处理中...
          </span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            开始重拓扑
          </span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// Props
interface Task {
  id: string
  name: string
  created_at: string
}

interface Props {
  retopologyOptions?: {
    input_source: string
    task_id: string
    model_url: string
    topology: string
    target_polycount: number
    quality: string
    preserve_boundaries: boolean
    preserve_uv: boolean
  }
  availableTasks?: Task[]
  isProcessing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  retopologyOptions: () => ({
    input_source: 'existing_task',
    task_id: '',
    model_url: '',
    topology: 'triangle',
    target_polycount: 30000,
    quality: 'medium',
    preserve_boundaries: true,
    preserve_uv: false
  }),
  availableTasks: () => [],
  isProcessing: false
})

// Emits
const emit = defineEmits<{
  'update:retopologyOptions': [value: any]
  'process-retopology': []
  'processing-completed': []
}>()

// Local state
const retopologyOptions = reactive({ ...props.retopologyOptions })
const showAdvancedOptions = ref(false)

// Computed
const isFormValid = computed(() => {
  if (retopologyOptions.input_source === 'existing_task') {
    return retopologyOptions.task_id !== ''
  } else if (retopologyOptions.input_source === 'upload_model') {
    return retopologyOptions.model_url.trim() !== ''
  }
  return false
})

// Methods
const handleSubmit = () => {
  emit('update:retopologyOptions', retopologyOptions)
  emit('process-retopology')
}

// Watch for prop changes
import { watch } from 'vue'

watch(() => props.retopologyOptions, (newVal) => {
  Object.assign(retopologyOptions, newVal)
}, { deep: true })
</script>