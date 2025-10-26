<template>
  <div class="p-6">
    <!-- 占位区域 - 当没有选中模型时显示 -->
    <div v-if="!selectedItem" class="flex flex-col items-center justify-center h-96 text-center">
      <div class="mb-6">
        <svg class="w-24 h-24 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M13 13h4a2 2 0 012 2v4a2 2 0 01-2 2h-4m-6-4a2 2 0 01-2-2V9a2 2 0 012-2h2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">选择模型进行纹理生成</h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
          请先从右侧历史面板选择一个已生成的3D模型，或者生成新的3D模型后再进行纹理生成操作
        </p>
      </div>
      
      <div class="flex items-center gap-2 text-blue-600 dark:text-blue-400">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        <span class="text-sm font-medium">查看右侧历史面板</span>
      </div>
    </div>

    <!-- 主要内容区域 - 当有选中模型时显示 -->
    <div v-else class="space-y-6">
      <div class="text-center mb-6">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">贴图</h3>
        <p class="text-gray-600 dark:text-gray-400 text-sm">为3D模型生成纹理贴图</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- 当前选择的模型信息 - 当有选中模型时显示 -->
        <div v-if="selectedItem" class="form-group">
          <div class="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm font-medium text-blue-900 dark:text-blue-100">
                已选择模型【{{ selectedItem.id }}】
              </span>
            </div>
          </div>
        </div>



        <!-- 纹理输入方式选择 -->
        <div class="form-group">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">纹理输入方式</label>
          <div class="grid grid-cols-2 gap-3">
            <label class="relative">
              <input
                type="radio"
                value="text_prompt"
                v-model="textureOptions.texture_input_type"
                class="sr-only"
              />
              <div :class="[
                'p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 text-center',
                textureOptions.texture_input_type === 'text_prompt'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
              ]">
                <svg class="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <div class="text-sm font-medium">文字描述</div>
                <div class="text-xs text-gray-500 mt-1">通过文字描述生成纹理</div>
              </div>
            </label>
            <label class="relative">
              <input
                type="radio"
                value="image_reference"
                v-model="textureOptions.texture_input_type"
                class="sr-only"
              />
              <div :class="[
                'p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 text-center',
                textureOptions.texture_input_type === 'image_reference'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
              ]">
                <svg class="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div class="text-sm font-medium">参考图片</div>
                <div class="text-xs text-gray-500 mt-1">上传图片作为纹理参考</div>
              </div>
            </label>
          </div>
        </div>

        <!-- 纹理风格描述 - 文字描述模式 -->
        <div v-if="textureOptions.texture_input_type === 'text_prompt'" class="form-group">
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

        <!-- 参考图片上传 - 图片参考模式 -->
        <div v-if="textureOptions.texture_input_type === 'image_reference'" class="form-group">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              参考图片 *
            </span>
          </label>
          
          <!-- 图片上传区域 -->
          <div class="relative">
            <input
              type="file"
              ref="imageInput"
              @change="handleImageUpload"
              accept="image/*"
              class="hidden"
            />
            
            <!-- 上传按钮或预览区域 -->
            <div v-if="!textureOptions.reference_image" 
                 @click="$refs.imageInput?.click()"
                 class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
              <svg class="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">点击上传参考图片</p>
              <p class="text-xs text-gray-500">支持 JPG、PNG、WebP 格式，最大 10MB</p>
            </div>
            
            <!-- 图片预览 -->
            <div v-else class="relative">
              <img :src="textureOptions.reference_image" alt="参考图片" class="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600" />
              <button
                type="button"
                @click="removeImage"
                class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- 图片描述 -->
          <div class="mt-3">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">图片描述（可选）</label>
            <input
              type="text"
              v-model="textureOptions.image_description"
              placeholder="描述这张图片的纹理特征，帮助AI更好地理解"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
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
    texture_input_type: string
    texture_prompt: string
    reference_image: string
    image_description: string
    texture_type: string
    resolution: string
    quality: string
    seamless: boolean
    preserve_uv: boolean
    generate_normal: boolean
  }
  availableTasks?: Task[]
  isProcessing?: boolean
  selectedItem?: any
}

const props = withDefaults(defineProps<Props>(), {
  textureOptions: () => ({
    input_source: 'existing_task',
    task_id: '',
    model_url: '',
    texture_input_type: 'text_prompt',
    texture_prompt: '',
    reference_image: '',
    image_description: '',
    texture_type: 'diffuse',
    resolution: '1024',
    quality: 'standard',
    seamless: false,
    preserve_uv: true,
    generate_normal: false
  }),
  availableTasks: () => [],
  isProcessing: false,
  selectedItem: null
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
const imageInput = ref<HTMLInputElement>()

// Computed
const isFormValid = computed(() => {
  // 如果有选中的模型，则只需要检查纹理输入
  if (props.selectedItem) {
    if (textureOptions.texture_input_type === 'text_prompt') {
      return textureOptions.texture_prompt.trim() !== ''
    } else if (textureOptions.texture_input_type === 'image_reference') {
      return textureOptions.reference_image !== ''
    }
  }
  
  // 如果没有选中模型，需要检查输入源
  const hasValidInput = textureOptions.input_source === 'existing_task' 
    ? textureOptions.task_id !== ''
    : textureOptions.model_url.trim() !== ''
  
  const hasValidTexture = textureOptions.texture_input_type === 'text_prompt'
    ? textureOptions.texture_prompt.trim() !== ''
    : textureOptions.reference_image !== ''
  
  return hasValidInput && hasValidTexture
})

// Methods
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // 检查文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('图片文件大小不能超过 10MB')
      return
    }
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择有效的图片文件')
      return
    }
    
    // 创建 FileReader 来读取文件
    const reader = new FileReader()
    reader.onload = (e) => {
      textureOptions.reference_image = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = () => {
  textureOptions.reference_image = ''
  textureOptions.image_description = ''
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

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