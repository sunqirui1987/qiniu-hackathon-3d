<template>
  <div class="left-tab-panel w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex">
    <!-- 左侧垂直主标签 -->
    <div class="main-tabs w-16 bg-gray-100 dark:bg-gray-900 flex flex-col border-r border-gray-200 dark:border-gray-700">
      <button
        v-for="menu in mainMenus"
        :key="menu.id"
        @click="handleMainMenuClick(menu.id)"
        :class="[
          'h-16 flex flex-col items-center justify-center text-xs font-medium transition-colors duration-200 relative',
          activeMainMenu === menu.id
            ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
        ]"
      >
        <!-- 激活指示器 -->
        <div 
          v-if="activeMainMenu === menu.id"
          class="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-600 dark:bg-blue-400"
        ></div>
        
        <component :is="menu.icon" class="w-5 h-5 mb-1" />
        <span class="text-center leading-tight">{{ menu.name }}</span>
      </button>
    </div>

    <!-- 右侧内容区域 -->
    <div class="content-wrapper flex-1 flex flex-col">
      <!-- 子菜单（仅在模型菜单激活时显示） -->
      <div v-if="activeMainMenu === 'model'" class="sub-menu flex bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <button
          v-for="subMenu in subMenus"
          :key="subMenu.id"
          @click="$emit('tab-change', subMenu.id)"
          :class="[
            'flex-1 py-3 px-4 text-sm font-medium transition-colors duration-200 relative',
            activeTab === subMenu.id
              ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
              : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-800'
          ]"
        >
          <!-- 激活指示器 -->
          <div 
            v-if="activeTab === subMenu.id"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
          ></div>
          
          <div class="flex items-center justify-center gap-2">
            <component :is="subMenu.icon" class="w-4 h-4" />
            <span>{{ subMenu.name }}</span>
          </div>
        </button>
      </div>

      <!-- 内容区域 -->
      <div class="content-area flex-1 overflow-y-auto bg-white dark:bg-gray-800">
        <!-- 文生3D面板 -->
        <TextTo3D
          v-if="activeMainMenu === 'model' && activeTab === 'text-to-3d'"
          :text-prompt="textPrompt"
          :text-options="textOptions"
          :is-processing="isGenerating"
          @update:text-prompt="$emit('update:textPrompt', $event)"
          @update:text-options="$emit('update:textOptions', $event)"
          @generate-from-text="$emit('generate-from-text')"
        />

        <!-- 图生3D面板 -->
        <ImageTo3D
          v-if="activeMainMenu === 'model' && activeTab === 'image-to-3d'"
          :selected-image="selectedImage"
          :image-options="imageOptions"
          :is-processing="isGenerating"
          @update:selected-image="$emit('update:selectedImage', $event)"
          @update:image-options="$emit('update:imageOptions', $event)"
          @generate-from-image="$emit('generate-from-image')"
        />

        <!-- 重拓扑面板 -->
        <Retopology
          v-if="activeMainMenu === 'retopology'"
          :retopology-options="retopologyOptions"
          :current-model="currentModel"
          :model-info="modelInfo"
          :is-processing="isProcessing"
          @update:retopology-options="$emit('update:retopologyOptions', $event)"
          @start-retopology="$emit('start-retopology')"
        />

        <!-- 贴图面板 -->
        <Texture
          v-if="activeMainMenu === 'texture'"
          :texture-options="textureOptions"
          :is-processing="isProcessing"
          @update:texture-options="$emit('update:textureOptions', $event)"
          @generate-texture="$emit('generate-texture')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import TextTo3D from './TextTo3D.vue'
import ImageTo3D from './ImageTo3D.vue'
import Retopology from './Retopology.vue'
import Texture from './Texture.vue'

// 主菜单图标组件
const ModelIcon = () => h('svg', { 
  xmlns: 'http://www.w3.org/2000/svg',
  width: '24', 
  height: '24', 
  viewBox: '0 0 24 24', 
  fill: 'none', 
  stroke: 'currentColor', 
  'stroke-width': '1.5', 
  'stroke-linecap': 'round', 
  'stroke-linejoin': 'round', 
  class: 'tabler-icon tabler-icon-cube size-5' 
}, [
  h('path', { d: 'M21 16.008v-8.018a1.98 1.98 0 0 0 -1 -1.717l-7 -4.008a2.016 2.016 0 0 0 -2 0l-7 4.008c-.619 .355 -1 1.01 -1 1.718v8.018c0 .709 .381 1.363 1 1.717l7 4.008a2.016 2.016 0 0 0 2 0l7 -4.008c.619 -.355 1 -1.01 1 -1.718z' }),
  h('path', { d: 'M12 22v-10' }),
  h('path', { d: 'M12 12l8.73 -5.04' }),
  h('path', { d: 'M3.27 6.96l8.73 5.04' })
])

const RetopologyIcon = () => h('svg', { 
  width: '24', 
  height: '24', 
  viewBox: '0 0 24 24', 
  fill: 'none', 
  xmlns: 'http://www.w3.org/2000/svg',
  class: 'size-5' 
}, [
  h('path', { 
    'fill-rule': 'evenodd', 
    'clip-rule': 'evenodd', 
    d: 'M13.848 12.66a1 1 0 0 1 .005-1.73l6.683-3.858c.761-.44.756-1.548-.01-1.995L13.308.862a2 2 0 0 0-2.009-.004L3.423 5.405a2 2 0 0 0-1 1.742l.045 9.211a2 2 0 0 0 .992 1.718l7.955 4.644a2 2 0 0 0 2.008.005l7.17-4.139c.76-.44.755-1.547-.01-1.994l-6.735-3.932Zm-2.243-2.179-.04-8.045-6.908 3.989 6.948 4.056Zm-7.68-2.746.04 8.038 6.896-3.982v-.007l-6.935-4.05Zm.79 9.337 6.942 4.053-.04-8.03-.006-.005-6.896 3.982Zm8.407-3.1.035 7.175 6.16-3.557-6.195-3.617Zm-.056-11.514.034 7.174 6.161-3.556-6.195-3.618Z', 
    fill: 'currentColor' 
  })
])

const TextureIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z' })
])

// 子菜单图标组件
const TextIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' })
])

const ImageIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' })
])

// Props
interface Props {
  activeTab: string
  activeMainMenu?: string
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

const props = withDefaults(defineProps<Props>(), {
  activeMainMenu: 'model'
})

// Emits
const emit = defineEmits([
  'tab-change',
  'main-menu-change',
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

// 主菜单配置
const mainMenus = [
  { id: 'model', name: '模型', icon: ModelIcon },
  { id: 'retopology', name: '重拓扑', icon: RetopologyIcon },
  { id: 'texture', name: '贴图', icon: TextureIcon },
]

// 子菜单配置（模型菜单下的子选项）
const subMenus = [
  { id: 'text-to-3d', name: '文生3D', icon: TextIcon },
  { id: 'image-to-3d', name: '图生3D', icon: ImageIcon },
]

// 方法
const handleMainMenuClick = (menuId: string) => {
  emit('main-menu-change', menuId)
  // 如果点击模型菜单，默认选择文生3D
  if (menuId === 'model') {
    emit('tab-change', 'text-to-3d')
  }
}
</script>

<style scoped>
.bg-gray-750 {
  background-color: rgb(55, 65, 81);
}

/* 主菜单样式 */
.main-menu button {
  position: relative;
  transition: all 0.2s ease;
}

.main-menu button:hover {
  transform: translateX(2px);
}

/* 子菜单样式 */
.sub-menu button {
  position: relative;
}

.sub-menu button::after {
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

.sub-menu button.active::after {
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