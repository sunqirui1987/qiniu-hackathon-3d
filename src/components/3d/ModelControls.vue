<template>
  <div class="bg-white rounded-lg shadow-md p-4 space-y-4">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">
      控制面板
    </h3>

    <div class="space-y-3">
      <div class="flex flex-col space-y-2">
        <label class="text-sm font-medium text-gray-700">缩放控制</label>
        <div class="flex gap-2">
          <button
            class="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            @click="handleZoomIn"
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
              />
            </svg>
            放大
          </button>
          <button
            class="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            @click="handleZoomOut"
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
              />
            </svg>
            缩小
          </button>
        </div>
      </div>

      <div class="flex flex-col space-y-2">
        <label class="text-sm font-medium text-gray-700">旋转控制</label>
        <div class="grid grid-cols-3 gap-2">
          <button
            class="col-start-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            @click="handleRotate('up')"
          >
            <svg
              class="w-5 h-5 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
          <button
            class="col-start-1 row-start-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            @click="handleRotate('left')"
          >
            <svg
              class="w-5 h-5 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            class="col-start-2 row-start-2 px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors font-medium text-xs"
            @click="handleRotate('center')"
          >
            中
          </button>
          <button
            class="col-start-3 row-start-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            @click="handleRotate('right')"
          >
            <svg
              class="w-5 h-5 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          <button
            class="col-start-2 row-start-3 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            @click="handleRotate('down')"
          >
            <svg
              class="w-5 h-5 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="pt-2 border-t border-gray-200">
        <button
          class="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          @click="handleReset"
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          重置视图
        </button>
      </div>
    </div>

    <div
      v-if="showAdvanced"
      class="pt-4 border-t border-gray-200 space-y-3"
    >
      <h4 class="text-sm font-semibold text-gray-700">
        高级选项
      </h4>
      
      <div class="flex items-center justify-between">
        <label class="text-sm text-gray-600">显示网格</label>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            v-model="showGrid"
            type="checkbox"
            class="sr-only peer"
            @change="handleGridToggle"
          >
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
        </label>
      </div>

      <div class="flex items-center justify-between">
        <label class="text-sm text-gray-600">显示坐标轴</label>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            v-model="showAxis"
            type="checkbox"
            class="sr-only peer"
            @change="handleAxisToggle"
          >
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
        </label>
      </div>
    </div>

    <button
      class="w-full text-sm text-blue-600 hover:text-blue-700 py-2 flex items-center justify-center gap-1"
      @click="showAdvanced = !showAdvanced"
    >
      {{ showAdvanced ? '收起' : '展开' }}高级选项
      <svg
        class="w-4 h-4 transition-transform"
        :class="{ 'rotate-180': showAdvanced }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Emits {
  (e: 'zoom', delta: number): void
  (e: 'rotate', direction: string): void
  (e: 'reset'): void
  (e: 'toggleGrid', show: boolean): void
  (e: 'toggleAxis', show: boolean): void
}

const emit = defineEmits<Emits>()

const showAdvanced = ref(false)
const showGrid = ref(false)
const showAxis = ref(false)

const handleZoomIn = () => {
  emit('zoom', -0.1)
}

const handleZoomOut = () => {
  emit('zoom', 0.1)
}

const handleRotate = (direction: string) => {
  emit('rotate', direction)
}

const handleReset = () => {
  emit('reset')
}

const handleGridToggle = () => {
  emit('toggleGrid', showGrid.value)
}

const handleAxisToggle = () => {
  emit('toggleAxis', showAxis.value)
}
</script>
