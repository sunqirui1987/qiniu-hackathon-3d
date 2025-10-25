<template>
  <div class="viewer-toolbar bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg p-2 shadow-xl">
    <!-- 视图控制 -->
    <div class="flex items-center space-x-1 mb-2">
      <div class="text-xs text-gray-400 font-medium mb-1 px-2">视图控制</div>
    </div>
    <div class="flex items-center space-x-1 mb-3">
      <button
        v-for="view in viewModes"
        :key="view.name"
        :class="[
          'p-2 rounded-md transition-all duration-200 group relative',
          currentView === view.name
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
        ]"
        @click="setView(view.name)"
        :title="view.label"
      >
        <component :is="view.icon" class="w-4 h-4" />
        <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          {{ view.label }}
        </div>
      </button>
    </div>

    <!-- 操作工具 -->
    <div class="flex items-center space-x-1 mb-2">
      <div class="text-xs text-gray-400 font-medium mb-1 px-2">操作工具</div>
    </div>
    <div class="flex items-center space-x-1 mb-3">
      <button
        v-for="tool in tools"
        :key="tool.name"
        :class="[
          'p-2 rounded-md transition-all duration-200 group relative',
          activeTool === tool.name
            ? 'bg-green-600 text-white shadow-lg'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
        ]"
        @click="setTool(tool.name)"
        :title="tool.label"
      >
        <component :is="tool.icon" class="w-4 h-4" />
        <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          {{ tool.label }}
        </div>
      </button>
    </div>

    <!-- 显示选项 -->
    <div class="flex items-center space-x-1 mb-2">
      <div class="text-xs text-gray-400 font-medium mb-1 px-2">显示选项</div>
    </div>
    <div class="space-y-2">
      <label class="flex items-center space-x-2 text-sm text-gray-300 hover:text-white transition-colors cursor-pointer">
        <input
          type="checkbox"
          v-model="showWireframe"
          @change="toggleWireframe"
          class="w-3 h-3 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
        >
        <span>线框模式</span>
      </label>
      <label class="flex items-center space-x-2 text-sm text-gray-300 hover:text-white transition-colors cursor-pointer">
        <input
          type="checkbox"
          v-model="showGrid"
          @change="toggleGrid"
          class="w-3 h-3 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
        >
        <span>网格</span>
      </label>
      <label class="flex items-center space-x-2 text-sm text-gray-300 hover:text-white transition-colors cursor-pointer">
        <input
          type="checkbox"
          v-model="showAxes"
          @change="toggleAxes"
          class="w-3 h-3 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
        >
        <span>坐标轴</span>
      </label>
    </div>

    <!-- 快捷操作 -->
    <div class="flex items-center space-x-1 mb-2 mt-4">
      <div class="text-xs text-gray-400 font-medium mb-1 px-2">快捷操作</div>
    </div>
    <div class="space-y-1">
      <button
        class="w-full p-2 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-all duration-200 text-sm"
        @click="resetView"
      >
        重置视图
      </button>
      <button
        class="w-full p-2 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-all duration-200 text-sm"
        @click="fitToScreen"
      >
        适应屏幕
      </button>
      <button
        class="w-full p-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-all duration-200 text-sm"
        @click="takeScreenshot"
      >
        截图
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'

// Props
interface Props {
  currentView?: string
  activeTool?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentView: 'perspective',
  activeTool: 'rotate'
})

// Emits
const emit = defineEmits<{
  viewChange: [view: string]
  toolChange: [tool: string]
  wireframeToggle: [enabled: boolean]
  gridToggle: [enabled: boolean]
  axesToggle: [enabled: boolean]
  resetView: []
  fitToScreen: []
  screenshot: []
}>()

// State
const currentView = ref(props.currentView)
const activeTool = ref(props.activeTool)
const showWireframe = ref(false)
const showGrid = ref(true)
const showAxes = ref(true)

// Icons
const PerspectiveIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' })
])

const TopIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 6h16M4 12h16M4 18h16' })
])

const FrontIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' })
])

const SideIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4' })
])

const RotateIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' })
])

const PanIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M7 16l-4-4m0 0l4-4m-4 4h18' })
])

const ZoomIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7' })
])

const SelectIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122' })
])

// View modes
const viewModes = [
  { name: 'perspective', label: '透视视图', icon: PerspectiveIcon },
  { name: 'top', label: '顶视图', icon: TopIcon },
  { name: 'front', label: '前视图', icon: FrontIcon },
  { name: 'side', label: '侧视图', icon: SideIcon }
]

// Tools
const tools = [
  { name: 'rotate', label: '旋转', icon: RotateIcon },
  { name: 'pan', label: '平移', icon: PanIcon },
  { name: 'zoom', label: '缩放', icon: ZoomIcon },
  { name: 'select', label: '选择', icon: SelectIcon }
]

// Methods
const setView = (view: string) => {
  currentView.value = view
  emit('viewChange', view)
}

const setTool = (tool: string) => {
  activeTool.value = tool
  emit('toolChange', tool)
}

const toggleWireframe = () => {
  emit('wireframeToggle', showWireframe.value)
}

const toggleGrid = () => {
  emit('gridToggle', showGrid.value)
}

const toggleAxes = () => {
  emit('axesToggle', showAxes.value)
}

const resetView = () => {
  emit('resetView')
}

const fitToScreen = () => {
  emit('fitToScreen')
}

const takeScreenshot = () => {
  emit('screenshot')
}
</script>

<style scoped>
.viewer-toolbar {
  min-width: 200px;
  max-width: 220px;
}

/* 自定义滚动条 */
.viewer-toolbar::-webkit-scrollbar {
  width: 4px;
}

.viewer-toolbar::-webkit-scrollbar-track {
  background: rgba(55, 65, 81, 0.3);
  border-radius: 2px;
}

.viewer-toolbar::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 2px;
}

.viewer-toolbar::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style>