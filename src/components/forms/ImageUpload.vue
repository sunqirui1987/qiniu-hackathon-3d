<template>
  <div class="space-y-4">
    <div
      class="relative border-2 border-dashed rounded-lg p-8 text-center transition-colors"
      :class="[
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50',
        disabled && 'opacity-50 cursor-not-allowed'
      ]"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        class="hidden"
        :disabled="disabled"
        @change="handleFileChange"
      >

      <div
        v-if="!previewUrl"
        class="space-y-3"
      >
        <div class="flex justify-center">
          <svg
            class="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        
        <div>
          <p class="text-sm text-gray-600">
            拖拽图片到此处，或
            <button
              class="text-blue-600 hover:text-blue-700 font-medium"
              :disabled="disabled"
              @click="triggerFileInput"
            >
              点击选择
            </button>
          </p>
          <p class="text-xs text-gray-500 mt-1">
            支持 JPG, PNG, GIF 格式，最大 10MB
          </p>
        </div>
      </div>

      <div
        v-else
        class="space-y-3"
      >
        <div class="relative inline-block">
          <img
            :src="previewUrl"
            :alt="fileName"
            class="max-w-full max-h-64 rounded-lg shadow-lg"
          >
          <button
            v-if="!disabled"
            class="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            @click="clearImage"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        
        <div class="text-sm text-gray-600">
          <p class="font-medium">
            {{ fileName }}
          </p>
          <p class="text-xs text-gray-500">
            {{ fileSize }}
          </p>
        </div>

        <button
          v-if="!disabled"
          class="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          @click="triggerFileInput"
        >
          更换图片
        </button>
      </div>
    </div>

    <div
      v-if="error"
      class="p-3 bg-red-50 border border-red-200 rounded-md"
    >
      <p class="text-sm text-red-600">
        {{ error }}
      </p>
    </div>

    <div
      v-if="showOptions"
      class="space-y-4 p-4 bg-gray-50 rounded-md"
    >
      <h3 class="text-sm font-semibold text-gray-700 mb-3">
        生成选项
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            拓扑类型
          </label>
          <select
            v-model="options.topology"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            :disabled="disabled"
          >
            <option value="triangle">
              三角形
            </option>
            <option value="quad">
              四边形
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            目标面数: {{ options.targetPolycount }}
          </label>
          <input
            v-model.number="options.targetPolycount"
            type="range"
            min="10000"
            max="100000"
            step="5000"
            class="w-full"
            :disabled="disabled"
          >
        </div>

        <div class="flex items-center">
          <input
            id="should-texture"
            v-model="options.shouldTexture"
            type="checkbox"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            :disabled="disabled"
          >
          <label
            for="should-texture"
            class="ml-2 text-sm text-gray-700"
          >
            生成纹理
          </label>
        </div>

        <div class="flex items-center">
          <input
            id="enable-pbr-image"
            v-model="options.enablePBR"
            type="checkbox"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            :disabled="disabled"
          >
          <label
            for="enable-pbr-image"
            class="ml-2 text-sm text-gray-700"
          >
            启用PBR材质
          </label>
        </div>
      </div>

      <div v-if="options.shouldTexture">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          纹理描述 (可选)
        </label>
        <input
          v-model="options.texturePrompt"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          placeholder="描述纹理细节..."
          :disabled="disabled"
        >
      </div>
    </div>

    <button
      class="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
      @click="showOptions = !showOptions"
    >
      {{ showOptions ? '隐藏' : '显示' }}生成选项
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface ImageGenerateOptions {
  topology: 'triangle' | 'quad'
  targetPolycount: number
  shouldTexture: boolean
  enablePBR: boolean
  texturePrompt?: string
}

interface Props {
  modelValue?: File | null
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: File | null]
  'update:options': [options: ImageGenerateOptions]
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const previewUrl = ref<string | null>(null)
const fileName = ref<string>('')
const error = ref<string | null>(null)
const showOptions = ref(false)

const options = ref<ImageGenerateOptions>({
  topology: 'triangle',
  targetPolycount: 30000,
  shouldTexture: true,
  enablePBR: true,
  texturePrompt: '',
})

const fileSize = computed(() => {
  if (!props.modelValue) return ''
  const bytes = props.modelValue.size
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
})

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleDragOver = () => {
  if (!props.disabled) {
    isDragging.value = true
  }
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (props.disabled) return

  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

const processFile = (file: File) => {
  error.value = null

  if (!file.type.startsWith('image/')) {
    error.value = '请选择图片文件'
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    error.value = '图片大小不能超过 10MB'
    return
  }

  fileName.value = file.name

  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)

  emit('update:modelValue', file)
}

const clearImage = () => {
  previewUrl.value = null
  fileName.value = ''
  error.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
  emit('update:modelValue', null)
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      clearImage()
    }
  }
)

watch(
  options,
  (newOptions) => {
    emit('update:options', { ...newOptions })
  },
  { deep: true }
)
</script>
