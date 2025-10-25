<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">
        AI 3D模型生成
      </h1>
      <p class="text-gray-600">
        使用文本描述或图片生成高质量3D模型
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex gap-4 mb-6 border-b border-gray-200">
            <button
              class="pb-3 px-4 font-medium transition-colors relative"
              :class="[
                generationMode === 'text' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              ]"
              @click="generationMode = 'text'"
            >
              文本生成
            </button>
            <button
              class="pb-3 px-4 font-medium transition-colors relative"
              :class="[
                generationMode === 'image' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              ]"
              @click="generationMode = 'image'"
            >
              图片生成
            </button>
          </div>

          <div v-if="generationMode === 'text'">
            <TextInput
              v-model="textPrompt"
              :disabled="isGenerating"
              @update:options="textOptions = $event"
            />
          </div>

          <div v-else>
            <ImageUpload
              v-model="selectedImage"
              :disabled="isGenerating"
              @update:options="imageOptions = $event"
            />
          </div>

          <div class="mt-6 flex gap-3">
            <button
              class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!canGenerate || isGenerating"
              @click="handleGenerate"
            >
              {{ isGenerating ? '生成中...' : '开始生成' }}
            </button>
            
            <button
              v-if="isGenerating"
              class="px-6 py-3 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
              @click="handleCancelGeneration"
            >
              取消
            </button>
            
            <button
              v-else
              class="px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
              @click="handleReset"
            >
              重置
            </button>
          </div>
        </div>

        <div
          v-if="showHistory"
          class="bg-white rounded-lg shadow-md p-6"
        >
          <h2 class="text-lg font-semibold text-gray-800 mb-4">
            生成历史
          </h2>
          <div
            v-if="generationHistory.length === 0"
            class="text-center py-8 text-gray-500"
          >
            暂无生成记录
          </div>
          <div
            v-else
            class="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            <div
              v-for="item in generationHistory"
              :key="item.id"
              class="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
              @click="viewModel(item)"
            >
              <div class="aspect-square bg-gray-100 rounded-md mb-2 overflow-hidden">
                <img
                  v-if="item.thumbnail"
                  :src="item.thumbnail"
                  :alt="item.name"
                  class="w-full h-full object-cover"
                >
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-gray-400"
                >
                  <svg
                    class="w-12 h-12"
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
              </div>
              <p class="text-sm font-medium text-gray-800 truncate">
                {{ item.name }}
              </p>
              <p class="text-xs text-gray-500">
                {{ formatDate(item.createdAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-1">
        <div class="sticky top-6">
          <GenerateProgress
            :status="currentStatus"
            :progress="currentProgress"
            :error="currentError"
            :preview-url="previewUrl"
            :task-details="taskDetails"
            :estimated-time="estimatedTime"
            :on-cancel="handleCancelGeneration"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useModelStore } from '@/stores/model'
import TextInput from '../components/forms/TextInput.vue'
import ImageUpload from '../components/forms/ImageUpload.vue'
import GenerateProgress from '../components/generate/GenerateProgress.vue'
import type { Model3D } from '../types/model'
import MeshyClient from '@/utils/meshyClient'
import type { MeshyTaskStatus } from '@/utils/meshyClient'

const modelStore = useModelStore()

type GenerationMode = 'text' | 'image'

interface TextGenerateOptions {
  artStyle: 'realistic' | 'sculpture'
  aiModel: 'meshy-4' | 'meshy-5' | 'latest'
  topology: 'triangle' | 'quad'
  targetPolycount: number
  enablePBR: boolean
  seed?: number
  texturePrompt?: string
}

interface ImageGenerateOptions {
  topology: 'triangle' | 'quad'
  targetPolycount: number
  shouldTexture: boolean
  enablePBR: boolean
  texturePrompt?: string
}

interface TaskDetails {
  id: string
  type: 'text-to-3d' | 'image-to-3d'
  createdAt?: Date
}

const router = useRouter()

const meshyClient = new MeshyClient('')

const generationMode = ref<GenerationMode>('text')
const textPrompt = ref<string>('')
const selectedImage = ref<File | null>(null)
const textOptions = ref<TextGenerateOptions>({
  artStyle: 'realistic',
  aiModel: 'latest',
  topology: 'triangle',
  targetPolycount: 30000,
  enablePBR: true,
})
const imageOptions = ref<ImageGenerateOptions>({
  topology: 'triangle',
  targetPolycount: 30000,
  shouldTexture: true,
  enablePBR: true,
})

const currentStatus = ref<'idle' | 'uploading' | 'generating' | 'completed' | 'error'>('idle')
const currentProgress = ref<number>(0)
const currentError = ref<string | null>(null)
const previewUrl = ref<string | null>(null)
const taskDetails = ref<TaskDetails | null>(null)
const estimatedTime = ref<string | undefined>(undefined)

const generationHistory = ref<Model3D[]>([])
const showHistory = ref(true)

const canGenerate = computed(() => {
  if (generationMode.value === 'text') {
    return textPrompt.value.trim().length > 0
  } else {
    return selectedImage.value !== null
  }
})

const isGenerating = computed(() => {
  return currentStatus.value === 'generating' || currentStatus.value === 'uploading'
})

const handleGenerate = async () => {
  try {
    currentError.value = null
    currentProgress.value = 0
    previewUrl.value = null

    if (generationMode.value === 'text') {
      await generateFromText()
    } else {
      await generateFromImage()
    }
  } catch (error) {
    currentStatus.value = 'error'
    currentError.value = error instanceof Error ? error.message : '生成失败，请重试'
  }
}

const generateFromText = async () => {
  try {
    currentStatus.value = 'generating'
    currentProgress.value = 0
    estimatedTime.value = '约4-6分钟'

    const previewResponse = await meshyClient.createTextTo3DPreview({
      prompt: textPrompt.value,
      art_style: textOptions.value.artStyle,
      ai_model: textOptions.value.aiModel,
      topology: textOptions.value.topology,
      target_polycount: textOptions.value.targetPolycount,
      seed: textOptions.value.seed,
    })

    const previewTaskId = previewResponse.result
    taskDetails.value = {
      id: previewTaskId,
      type: 'text-to-3d',
      createdAt: new Date(),
    }

    const previewStatus = await meshyClient.pollTaskUntilComplete(
      previewTaskId,
      'text-to-3d',
      {
        onProgress: (progress, status) => {
          currentProgress.value = progress * 0.5
          if (status.thumbnail_url) {
            previewUrl.value = status.thumbnail_url
          }
        },
      }
    )

    if (textOptions.value.enablePBR) {
      currentProgress.value = 50
      estimatedTime.value = '约2-3分钟'

      const refineResponse = await meshyClient.createTextTo3DRefine({
        preview_task_id: previewTaskId,
        enable_pbr: true,
        texture_prompt: textOptions.value.texturePrompt,
      })

      const refineTaskId = refineResponse.result
      const refineStatus = await meshyClient.pollTaskUntilComplete(
        refineTaskId,
        'text-to-3d',
        {
          onProgress: (progress, status) => {
            currentProgress.value = 50 + progress * 0.5
            if (status.thumbnail_url) {
              previewUrl.value = status.thumbnail_url
            }
          },
        }
      )

      await handleTaskCompletion(refineStatus, 'text')
    } else {
      currentProgress.value = 100
      await handleTaskCompletion(previewStatus, 'text')
    }
  } catch (error) {
    throw error
  }
}

const generateFromImage = async () => {
  if (!selectedImage.value) return

  try {
    currentStatus.value = 'uploading'
    currentProgress.value = 10
    estimatedTime.value = '上传中...'

    const uploadResult = await meshyClient.uploadImage(selectedImage.value)

    currentStatus.value = 'generating'
    currentProgress.value = 20
    estimatedTime.value = '约3-5分钟'

    const response = await meshyClient.createImageTo3D({
      image_url: uploadResult.url,
      topology: imageOptions.value.topology,
      target_polycount: imageOptions.value.targetPolycount,
      should_texture: imageOptions.value.shouldTexture,
      enable_pbr: imageOptions.value.enablePBR,
      texture_prompt: imageOptions.value.texturePrompt,
    })

    const taskId = response.result
    taskDetails.value = {
      id: taskId,
      type: 'image-to-3d',
      createdAt: new Date(),
    }

    const finalStatus = await meshyClient.pollTaskUntilComplete(
      taskId,
      'image-to-3d',
      {
        onProgress: (progress, status) => {
          currentProgress.value = 20 + progress * 0.8
          if (status.thumbnail_url) {
            previewUrl.value = status.thumbnail_url
          }
        },
      }
    )

    await handleTaskCompletion(finalStatus, 'image')
  } catch (error) {
    throw error
  }
}

const handleTaskCompletion = async (status: MeshyTaskStatus, mode: 'text' | 'image') => {
  currentProgress.value = 100
  currentStatus.value = 'completed'
  estimatedTime.value = undefined

  const modelUrl = status.model_urls?.glb || status.model_urls?.fbx || status.model_urls?.obj
  if (!modelUrl) {
    throw new Error('No model URL found in task result')
  }

  const newModel: Model3D = {
    id: status.id,
    name: mode === 'text' 
      ? textPrompt.value.substring(0, 50) 
      : selectedImage.value?.name.replace(/\.[^/.]+$/, '') || 'Image Model',
    url: modelUrl,
    format: 'glb',
    createdAt: new Date(),
    updatedAt: new Date(),
    thumbnail: status.thumbnail_url || 'https://via.placeholder.com/300x300?text=3D+Model',
  }

  generationHistory.value.unshift(newModel)
  modelStore.addModel(newModel)

  setTimeout(() => {
    router.push({
      name: 'viewer',
      query: { modelId: newModel.id, fromGenerate: 'true' }
    })
  }, 1500)
}

const handleCancelGeneration = () => {
  if (taskDetails.value) {
    meshyClient.cancelTask(taskDetails.value.id)
  }
  currentStatus.value = 'idle'
  currentProgress.value = 0
  estimatedTime.value = undefined
  taskDetails.value = null
}

const handleReset = () => {
  textPrompt.value = ''
  selectedImage.value = null
  currentStatus.value = 'idle'
  currentProgress.value = 0
  currentError.value = null
  previewUrl.value = null
  taskDetails.value = null
  estimatedTime.value = undefined
}

const viewModel = (model: Model3D) => {
  router.push({
    name: 'viewer',
    query: { id: model.id }
  })
}

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onUnmounted(() => {
  meshyClient.cancelAllTasks()
})
</script>
