<template>
  <div class="left-tab-panel w-80 bg-gray-100 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 flex flex-col">
    <!-- Tab标签栏 -->
    <div class="tab-header flex border-b border-gray-300 dark:border-gray-700">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="$emit('tab-change', tab.id)"
        :class="[
          'flex-1 py-3 px-4 text-sm font-medium transition-colors border-b-2',
          activeTab === tab.id
            ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-gray-200 dark:bg-gray-750'
            : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-750'
        ]"
      >
        <div class="flex items-center justify-center gap-2">
          <component :is="tab.icon" class="w-4 h-4" />
          <span>{{ tab.name }}</span>
        </div>
      </button>
    </div>

    <!-- Tab内容区域 -->
    <div class="tab-content flex-1 overflow-y-auto">
      <!-- 文生3D面板 -->
      <div v-if="activeTab === 'text-to-3d'" class="p-6 space-y-6">
        <div>
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">文本生成3D模型</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">描述文本</label>
              <textarea
                :value="textPrompt"
                @input="$emit('update:textPrompt', $event.target.value)"
                placeholder="描述你想要生成的3D模型，例如：一只可爱的小猫咪..."
                class="w-full h-32 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
              ></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">生成参数</label>
              <div class="space-y-3">
                <div>
                  <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">质量等级</label>
                  <select 
                    :value="textOptions.quality" 
                    @change="$emit('update:textOptions', { ...textOptions, quality: $event.target.value })"
                    class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-sm"
                  >
                    <option value="draft">草图 (快速)</option>
                    <option value="standard">标准</option>
                    <option value="high">高质量</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">风格</label>
                  <select 
                    :value="textOptions.style" 
                    @change="$emit('update:textOptions', { ...textOptions, style: $event.target.value })"
                    class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-sm"
                  >
                    <option value="realistic">写实</option>
                    <option value="cartoon">卡通</option>
                    <option value="abstract">抽象</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              @click="$emit('generate-from-text')"
              :disabled="!textPrompt.trim() || isGenerating"
              class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
              {{ isGenerating ? '生成中...' : '开始生成' }}
            </button>

            <!-- 生成进度 -->
            <div v-if="isGenerating && activeTab === 'text-to-3d'" class="space-y-3">
              <div class="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${generationProgress}%` }"
                ></div>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 text-center">{{ generationStatus }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 图生3D面板 -->
      <div v-if="activeTab === 'image-to-3d'" class="p-6 space-y-6">
        <div>
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">图片生成3D模型</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">上传图片</label>
              <div class="border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 dark:hover:border-gray-500 transition-colors">
                <input
                  type="file"
                  ref="imageInput"
                  @change="handleImageUpload"
                  accept="image/*"
                  class="hidden"
                >
                <div v-if="selectedImage" class="space-y-3">
                  <img :src="selectedImage" alt="预览" class="max-w-full h-40 object-contain mx-auto rounded">
                  <div class="flex gap-2 justify-center">
                    <button
                      @click="clearImage"
                      class="px-3 py-1 text-red-400 hover:text-red-300 text-sm border border-red-400 rounded hover:bg-red-400/10 transition-colors"
                    >
                      清除图片
                    </button>
                    <button
                      @click="$refs.imageInput?.click()"
                      class="px-3 py-1 text-blue-400 hover:text-blue-300 text-sm border border-blue-400 rounded hover:bg-blue-400/10 transition-colors"
                    >
                      重新选择
                    </button>
                  </div>
                </div>
                <div v-else class="space-y-2">
                  <svg class="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <button
                    @click="$refs.imageInput?.click()"
                    class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    点击上传图片
                  </button>
                  <p class="text-xs text-gray-500 dark:text-gray-500">支持 JPG、PNG、GIF 格式</p>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">生成参数</label>
              <div class="space-y-3">
                <div>
                  <label class="block text-xs text-gray-400 mb-1">模型复杂度</label>
                  <select 
                    :value="imageOptions.complexity" 
                    @change="$emit('update:imageOptions', { ...imageOptions, complexity: $event.target.value })"
                    class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  >
                    <option value="simple">简单</option>
                    <option value="medium">中等</option>
                    <option value="complex">复杂</option>
                  </select>
                </div>
              </div>
            </div>
            
            <button
              @click="$emit('generate-from-image')"
              :disabled="!selectedImage || isGenerating"
              class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
              {{ isGenerating ? '生成中...' : '开始生成' }}
            </button>

            <!-- 生成进度 -->
            <div v-if="isGenerating && activeTab === 'image-to-3d'" class="space-y-3">
              <div class="w-full bg-gray-700 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${generationProgress}%` }"
                ></div>
              </div>
              <p class="text-sm text-gray-400 text-center">{{ generationStatus }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 拓模型面板 -->
      <div v-if="activeTab === 'retopology'" class="p-6 space-y-6">
        <div>
          <h3 class="text-lg font-semibold mb-4 text-white">模型重拓扑</h3>
          <div class="space-y-4">
            <div class="bg-gray-750 rounded-lg p-4 border border-gray-600">
              <div class="flex items-center gap-3 mb-3">
                <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm font-medium text-gray-300">当前模型信息</span>
              </div>
              <div v-if="currentModel" class="text-sm text-gray-400 space-y-1">
                <p>面数: {{ modelInfo?.faces || 'N/A' }}</p>
                <p>顶点数: {{ modelInfo?.vertices || 'N/A' }}</p>
                <p>文件大小: {{ modelInfo?.fileSize || 'N/A' }}</p>
              </div>
              <div v-else class="text-sm text-gray-500">
                请先加载一个3D模型
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">目标面数</label>
              <input
                :value="retopologyOptions.targetFaces"
                @input="$emit('update:retopologyOptions', { ...retopologyOptions, targetFaces: parseInt($event.target.value) })"
                type="number"
                min="100"
                max="50000"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="10000"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">优化选项</label>
              <div class="space-y-2">
                <label class="flex items-center space-x-2 text-sm text-gray-300">
                  <input 
                    type="checkbox" 
                    :checked="retopologyOptions.preserveUV" 
                    @change="$emit('update:retopologyOptions', { ...retopologyOptions, preserveUV: $event.target.checked })"
                    class="rounded"
                  >
                  <span>保持UV映射</span>
                </label>
                <label class="flex items-center space-x-2 text-sm text-gray-300">
                  <input 
                    type="checkbox" 
                    :checked="retopologyOptions.preserveSharp" 
                    @change="$emit('update:retopologyOptions', { ...retopologyOptions, preserveSharp: $event.target.checked })"
                    class="rounded"
                  >
                  <span>保持锐利边缘</span>
                </label>
              </div>
            </div>

            <button
              @click="$emit('start-retopology')"
              :disabled="!currentModel || isProcessing"
              class="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
              {{ isProcessing ? '处理中...' : '开始重拓扑' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 贴图面板 -->
      <div v-if="activeTab === 'texture'" class="p-6 space-y-6">
        <div>
          <h3 class="text-lg font-semibold mb-4 text-white">AI贴图生成</h3>
          <div class="space-y-4">
            <div class="bg-gray-750 rounded-lg p-4 border border-gray-600">
              <div class="flex items-center gap-3 mb-3">
                <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="text-sm font-medium text-gray-300">模型状态</span>
              </div>
              <div v-if="currentModel" class="text-sm text-gray-400">
                <p>✓ 模型已加载，可以生成贴图</p>
              </div>
              <div v-else class="text-sm text-gray-500">
                请先加载一个3D模型
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">贴图描述</label>
              <textarea
                :value="texturePrompt"
                @input="$emit('update:texturePrompt', $event.target.value)"
                placeholder="描述你想要的贴图效果，例如：木质纹理、金属表面、彩色涂装..."
                class="w-full h-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">贴图类型</label>
              <select 
                :value="textureOptions.type" 
                @change="$emit('update:textureOptions', { ...textureOptions, type: $event.target.value })"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="diffuse">漫反射贴图</option>
                <option value="pbr">PBR材质包</option>
                <option value="stylized">风格化贴图</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">分辨率</label>
              <select 
                :value="textureOptions.resolution" 
                @change="$emit('update:textureOptions', { ...textureOptions, resolution: $event.target.value })"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="512">512x512</option>
                <option value="1024">1024x1024</option>
                <option value="2048">2048x2048</option>
              </select>
            </div>

            <button
              @click="$emit('generate-texture')"
              :disabled="!currentModel || !texturePrompt.trim() || isProcessing"
              class="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
              {{ isProcessing ? '生成中...' : '生成贴图' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'

// 图标组件
const TextIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' })
])

const ImageIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' })
])

const RetopologyIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' })
])

const TextureIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z' })
])

// Props
interface Props {
  activeTab: string
  textPrompt: string
  selectedImage: string
  texturePrompt: string
  textOptions: any
  imageOptions: any
  retopologyOptions: any
  textureOptions: any
  currentModel: string
  modelInfo: any
  isGenerating: boolean
  isProcessing: boolean
  generationProgress: number
  generationStatus: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits([
  'tab-change',
  'update:textPrompt',
  'update:selectedImage',
  'update:texturePrompt',
  'update:textOptions',
  'update:imageOptions',
  'update:retopologyOptions',
  'update:textureOptions',
  'generate-from-text',
  'generate-from-image',
  'start-retopology',
  'generate-texture'
])

// Tab配置
const tabs = [
  { id: 'text-to-3d', name: '文生3D', icon: TextIcon },
  { id: 'image-to-3d', name: '图生3D', icon: ImageIcon },
  { id: 'retopology', name: '拓模型', icon: RetopologyIcon },
  { id: 'texture', name: '贴图', icon: TextureIcon },
]

// Refs
const imageInput = ref()

// 方法
const handleImageUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      emit('update:selectedImage', e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }
}

const clearImage = () => {
  emit('update:selectedImage', '')
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}
</script>

<style scoped>
.bg-gray-750 {
  background-color: rgb(55, 65, 81);
}

/* Tab样式 */
.tab-header button {
  position: relative;
}

.tab-header button::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: currentColor;
  transform: scaleX(0);
  transition: transform 0.2s ease;
}

.tab-header button.active::after {
  transform: scaleX(1);
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
</style>