<template>
  <div class="p-6">
    <div class="space-y-6">
      <div class="text-center mb-6">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">图生3D</h3>
        <p class="text-gray-600 dark:text-gray-400 text-sm">通过图片生成3D模型</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- 图片上传 -->
        <div class="form-group">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              上传图片 *
            </span>
          </label>
          
          <div v-if="!selectedImage" class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <input
              ref="imageInput"
              type="file"
              accept=".jpg,.jpeg,.png"
              @change="handleImageUpload"
              class="hidden"
            />
            <button
              type="button"
              @click="imageInput?.click()"
              class="flex flex-col items-center gap-3 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span class="text-sm font-medium">点击上传图片</span>
              <span class="text-xs">支持 JPG、JPEG、PNG 格式</span>
            </button>
          </div>
          
          <div v-else class="relative">
            <img :src="selectedImage" alt="预览图片" class="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600" />
            <button
              type="button"
              @click="clearImage"
              class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- AI模型选择 -->
        <div class="form-group">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">AI模型</label>
          <select
            v-model="imageOptions.ai_model"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="meshy-5">Meshy-5 (推荐)</option>
            <option value="meshy-4">Meshy-4</option>
            <option value="latest">Meshy-6 Preview (最新)</option>
          </select>
        </div>

        <!-- 纹理提示词 -->
        <div class="form-group">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">纹理提示词</label>
          <textarea
            v-model="imageOptions.texture_prompt"
            placeholder="描述你想要的纹理风格（可选）"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            rows="2"
            maxlength="600"
          ></textarea>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            已自动启用纹理生成、PBR贴图和重网格化
          </p>
        </div>

        <!-- 高级选项 -->
        <div class="form-group">
          <button
            type="button"
            @click="showAdvancedOptions = !showAdvancedOptions"
            class="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <span>高级选项</span>
            <svg
              :class="['w-4 h-4 transition-transform duration-200', showAdvancedOptions ? 'rotate-180' : '']"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div
            v-show="showAdvancedOptions"
            class="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-all duration-200"
          >
            <!-- 拓扑类型 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">拓扑类型</label>
              <select
                v-model="imageOptions.topology"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="triangle">三角形网格</option>
                <option value="quad">四边形网格</option>
              </select>
            </div>

            <!-- 目标多边形数量 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                目标多边形数量: {{ imageOptions.target_polycount?.toLocaleString() || '30,000' }}
              </label>
              <input
                type="range"
                v-model="imageOptions.target_polycount"
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
                  v-model="imageOptions.is_a_t_pose"
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
          :disabled="!selectedImage || props.isGenerating || isSubmitting"
          class="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
        >
          <span v-if="props.isGenerating || isSubmitting" class="flex items-center justify-center gap-2">
            <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isSubmitting ? '提交中...' : '生成中...' }}
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
  selectedImage?: string
  imageOptions?: {
    ai_model: string
    should_texture: boolean
    enable_pbr: boolean
    texture_prompt: string
    topology: string
    target_polycount: number
    should_remesh: boolean
    is_a_t_pose: boolean
  }
  isGenerating?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectedImage: '',
  imageOptions: () => ({
    ai_model: 'latest',
    should_texture: true,
    enable_pbr: true,
    texture_prompt: '',
    topology: 'triangle',
    target_polycount: 30000,
    should_remesh: true,
    is_a_t_pose: false
  }),
  isGenerating: false
})

// Emits
const emit = defineEmits<{
  'update:selectedImage': [value: string]
  'update:imageOptions': [value: any]
  'generate-from-image': [file: File | null]
  'image-upload': [file: File]
  'clear-image': []
  'generation-completed': []
}>()

// Local state
const selectedImage = ref(props.selectedImage)
const imageOptions = reactive({ ...props.imageOptions })
const imageInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const showAdvancedOptions = ref(false)
const isSubmitting = ref(false)
const lastSubmitTime = ref(0)

// Methods
const handleSubmit = () => {
  // 防止频繁点击 - 2秒内只能提交一次
  const now = Date.now()
  if (now - lastSubmitTime.value < 2000) {
    return
  }
  
  // 检查是否已经在生成中
  if (props.isGenerating || isSubmitting.value) {
    return
  }
  
  // 设置提交状态
  isSubmitting.value = true
  lastSubmitTime.value = now
  
  // 延迟重置提交状态，给用户视觉反馈
  setTimeout(() => {
    isSubmitting.value = false
  }, 1000)
  
  emit('update:selectedImage', selectedImage.value)
  emit('update:imageOptions', imageOptions)
  emit('generate-from-image', selectedFile.value)
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      selectedImage.value = e.target?.result as string
      emit('update:selectedImage', selectedImage.value)
    }
    reader.readAsDataURL(file)
    emit('image-upload', file)
  }
}

const clearImage = () => {
  selectedImage.value = ''
  selectedFile.value = null
  if (imageInput.value) {
    imageInput.value.value = ''
  }
  emit('update:selectedImage', '')
  emit('clear-image')
}

// Watch for prop changes
import { watch, onMounted } from 'vue'

// 确保默认值在组件挂载时正确应用
onMounted(() => {
  // 确保默认选择正确应用
  if (!imageOptions.ai_model) {
    imageOptions.ai_model = 'latest'
  }
  if (!imageOptions.topology) {
    imageOptions.topology = 'triangle'
  }
  
  // 固定纹理相关选项为true
  imageOptions.should_texture = true
  imageOptions.enable_pbr = true
  imageOptions.should_remesh = true
  
  // 触发更新事件，确保父组件知道默认值
  emit('update:imageOptions', imageOptions)
})

watch(() => props.selectedImage, (newVal) => {
  selectedImage.value = newVal
})

watch(() => props.imageOptions, (newVal) => {
  Object.assign(imageOptions, newVal)
}, { deep: true })

watch(() => props.isGenerating, (newVal) => {
  // 当外部isGenerating状态变化时，重置本地提交状态
  if (newVal) {
    isSubmitting.value = false
  }
})
</script>