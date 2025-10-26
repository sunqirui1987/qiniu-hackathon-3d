<template>
  <div class="p-6">
    <div class="space-y-6">
      <div class="text-center mb-6">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">文生3D</h3>
        <p class="text-gray-600 dark:text-gray-400 text-sm">通过文本描述生成3D模型</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- 提示词输入 -->
        <div class="form-group">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              描述提示词 *
            </span>
          </label>
          <textarea
            v-model="textPrompt"
            placeholder="描述你想要生成的3D模型，例如：一个怪物面具"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none transition-all duration-300"
            rows="3"
            maxlength="600"
          ></textarea>
          <div class="text-xs text-gray-500 mt-1">{{ textPrompt.length }}/600 字符</div>
        </div>

        <!-- 艺术风格 -->
        <div class="form-group">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">艺术风格</label>
          <div class="grid grid-cols-2 gap-3">
            <label class="relative">
              <input
                type="radio"
                value="realistic"
                v-model="textOptions.art_style"
                class="sr-only"
              />
              <div :class="[
                'p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 text-center',
                textOptions.art_style === 'realistic'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
              ]">
                <div class="text-sm font-medium">写实风格</div>
                <div class="text-xs text-gray-500 mt-1">Realistic</div>
              </div>
            </label>
            <label class="relative">
              <input
                type="radio"
                value="sculpture"
                v-model="textOptions.art_style"
                class="sr-only"
              />
              <div :class="[
                'p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 text-center',
                textOptions.art_style === 'sculpture'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
              ]">
                <div class="text-sm font-medium">雕塑风格</div>
                <div class="text-xs text-gray-500 mt-1">Sculpture</div>
              </div>
            </label>
          </div>
        </div>

        <!-- AI模型选择 -->
        <div class="form-group">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">AI模型</label>
          <select
            v-model="textOptions.ai_model"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="meshy-5">Meshy-5 (推荐)</option>
            <option value="meshy-4">Meshy-4</option>
            <option value="latest">Meshy-6 Preview (最新)</option>
          </select>
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
            <!-- 拓扑类型 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">拓扑类型</label>
              <select
                v-model="textOptions.topology"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="triangle">三角形网格</option>
                <option value="quad">四边形网格</option>
              </select>
            </div>

            <!-- 目标多边形数量 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                目标多边形数量: {{ textOptions.target_polycount.toLocaleString() }}
              </label>
              <input
                type="range"
                v-model="textOptions.target_polycount"
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

            <!-- 其他选项 -->
            <div class="space-y-3">
              <label class="flex items-center gap-3">
                <input
                  type="checkbox"
                  v-model="textOptions.should_remesh"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">启用重网格化</span>
              </label>
              
              <label class="flex items-center gap-3">
                <input
                  type="checkbox"
                  v-model="textOptions.is_a_t_pose"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">生成A/T姿势</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 生成按钮 -->
        <button
          type="submit"
          :disabled="!textPrompt.trim() || isGenerating"
          class="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
        >
          <span v-if="isGenerating" class="flex items-center justify-center gap-2">
            <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            生成中...
          </span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            开始生成
          </span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// Props
interface Props {
  textPrompt?: string
  textOptions?: {
    art_style: string
    ai_model: string
    topology: string
    target_polycount: number
    should_remesh: boolean
    is_a_t_pose: boolean
  }
  isGenerating?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  textPrompt: '',
  textOptions: () => ({
    art_style: 'realistic',
    ai_model: 'meshy-5',
    topology: 'triangle',
    target_polycount: 30000,
    should_remesh: false,
    is_a_t_pose: false
  }),
  isGenerating: false
})

// Emits
const emit = defineEmits<{
  'update:textPrompt': [value: string]
  'update:textOptions': [value: any]
  'generate-from-text': []
}>()

// Local state
const textPrompt = ref(props.textPrompt)
const textOptions = reactive({ ...props.textOptions })
const showAdvancedOptions = ref(false)

// Methods
const handleSubmit = () => {
  emit('update:textPrompt', textPrompt.value)
  emit('update:textOptions', textOptions)
  emit('generate-from-text')
}

// Watch for prop changes
import { watch } from 'vue'

watch(() => props.textPrompt, (newVal) => {
  textPrompt.value = newVal
})

watch(() => props.textOptions, (newVal) => {
  Object.assign(textOptions, newVal)
}, { deep: true })
</script>