<template>
  <div class="p-6">
    <div class="space-y-6">
      <div class="text-center mb-6">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">贴图</h3>
        <p class="text-gray-600 dark:text-gray-400 text-sm">为3D模型生成纹理贴图</p>
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
                v-model="textureOptions.input_source"
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
                v-model="textureOptions.input_source"
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
        <div v-if="textureOptions.input_source === 'existing_task'" class="form-group">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">选择任务</label>
          <select
            v-model="textureOptions.task_id"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">请选择一个任务</option>
            <option v-for="task in availableTasks" :key="task.id" :value="task.id">
              {{ task.name }} - {{ task.created_at }}
            </option>
          </select>
        </div>

        <!-- 模型URL输入 -->
        <div v-if="textureOptions.input_source === 'upload_model'" class="form-group">
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
            v-model="textureOptions.model_url"
            placeholder="https://example.com/model.obj"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <div class="text-xs text-gray-500 mt-1">支持 OBJ、PLY、STL 等格式</div>
        </div>

        <!-- 纹理风格描述 -->
        <div class="form-group">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M13 13h4a2 2 0 012 2v4a2 2 0 01-2 2h-4m-6-4a2 2 0 01-2-2V9a2 2 0 012-2h2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2M7 7h10" />
              </svg>
              纹理风格描述 *
            </span>
          </label>
          <textarea
            v-model="textureOptions.texture_prompt"
            placeholder="描述你想要的纹理风格，例如：木质纹理、金属表面、石头材质等"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none transition-all duration-300"
            rows="3"
            maxlength="600"
          ></textarea>
          <div class="text-xs text-gray-500 mt-1">{{ textureOptions.texture_prompt.length }}/600 字符</div>
        </div>

        <!-- 纹理类型 -->
        <div class="form-group">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">纹理类型</label>
          <div class="grid grid-cols-2 gap-3">
            <label class="relative">
              <input
                type="radio"
                value="diffuse"
                v-model="textureOptions.texture_type"
                class="sr-only"
              />
              <div :class="[
                'p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 text-center',
                textureOptions.texture_type === 'diffuse'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
              ]">
                <div class="text-sm font-medium">漫反射贴图</div>
                <div class="text-xs text-gray-500 mt-1">Diffuse</div>
              </div>
            </label>
            <label class="relative">
              <input
                type="radio"
                value="pbr"
                v-model="textureOptions.texture_type"
                class="sr-only"
              />
              <div :class="[
                'p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 text-center',
                textureOptions.texture_type === 'pbr'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
              ]">
                <div class="text-sm font-medium">PBR材质</div>
                <div class="text-xs text-gray-500 mt-1">PBR Material</div>
              </div>
            </label>
          </div>
        </div>

        <!-- 纹理分辨率 -->
        <div class="form-group">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">纹理分辨率</label>
          <select
            v-model="textureOptions.resolution"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="512">512x512</option>
            <option value="1024">1024x1024 (推荐)</option>
            <option value="2048">2048x2048</option>
            <option value="4096">4096x4096</option>
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
            <!-- 纹理质量 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">纹理质量</label>
              <select
                v-model="textureOptions.quality"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="draft">草图质量 (快速)</option>
                <option value="standard">标准质量 (平衡)</option>
                <option value="high">高质量 (精细)</option>
              </select>
            </div>

            <!-- 无缝纹理 -->
            <label class="flex items-center gap-3">
              <input
                type="checkbox"
                v-model="textureOptions.seamless"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">生成无缝纹理</span>
            </label>

            <!-- 保持UV -->
            <label class="flex items-center gap-3">
              <input
                type="checkbox"
                v-model="textureOptions.preserve_uv"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">保持原有UV映射</span>
            </label>

            <!-- 生成法线贴图 -->
            <label class="flex items-center gap-3">
              <input
                type="checkbox"
                v-model="textureOptions.generate_normal"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">生成法线贴图</span>
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
            生成中...
          </span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M13 13h4a2 2 0 012 2v4a2 2 0 01-2 2h-4m-6-4a2 2 0 01-2-2V9a2 2 0 012-2h2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2M7 7h10" />
            </svg>
            生成纹理
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
  textureOptions?: {
    input_source: string
    task_id: string
    model_url: string
    texture_prompt: string
    texture_type: string
    resolution: string
    quality: string
    seamless: boolean
    preserve_uv: boolean
    generate_normal: boolean
  }
  availableTasks?: Task[]
  isProcessing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  textureOptions: () => ({
    input_source: 'existing_task',
    task_id: '',
    model_url: '',
    texture_prompt: '',
    texture_type: 'diffuse',
    resolution: '1024',
    quality: 'standard',
    seamless: false,
    preserve_uv: true,
    generate_normal: false
  }),
  availableTasks: () => [],
  isProcessing: false
})

// Emits
const emit = defineEmits<{
  'update:textureOptions': [value: any]
  'generate-texture': []
  'generation-completed': []
}>()

// Local state
const textureOptions = reactive({ ...props.textureOptions })
const showAdvancedOptions = ref(false)

// Computed
const isFormValid = computed(() => {
  const hasValidInput = textureOptions.input_source === 'existing_task' 
    ? textureOptions.task_id !== ''
    : textureOptions.model_url.trim() !== ''
  
  return hasValidInput && textureOptions.texture_prompt.trim() !== ''
})

// Methods
const handleSubmit = () => {
  emit('update:textureOptions', textureOptions)
  emit('generate-texture')
}

// Watch for prop changes
import { watch } from 'vue'

watch(() => props.textureOptions, (newVal) => {
  Object.assign(textureOptions, newVal)
}, { deep: true })
</script>