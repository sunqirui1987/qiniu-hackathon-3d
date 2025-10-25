<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
      <!-- 头部 -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">设置</h2>
        <button
          @click="$emit('close')"
          class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 内容 -->
      <div class="p-6 space-y-6">
        <!-- 主题设置 -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">外观</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700 dark:text-gray-300">主题模式</span>
              <select
                v-model="selectedTheme"
                @change="handleThemeChange"
                class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="light">浅色</option>
                <option value="dark">深色</option>
                <option value="system">跟随系统</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 模型设置 -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">模型设置</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700 dark:text-gray-300">默认质量</span>
              <select
                v-model="defaultQuality"
                class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="draft">草图</option>
                <option value="standard">标准</option>
                <option value="high">高质量</option>
              </select>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700 dark:text-gray-300">自动保存</span>
              <button
                @click="autoSave = !autoSave"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  autoSave ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                ]"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    autoSave ? 'translate-x-6' : 'translate-x-1'
                  ]"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- 存储设置 -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">存储</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-700 dark:text-gray-300">缓存大小</span>
              <span class="text-sm text-gray-500 dark:text-gray-400">256 MB</span>
            </div>
            <button
              @click="clearCache"
              class="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              清除缓存
            </button>
          </div>
        </div>

        <!-- 关于 -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">关于</h3>
          <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div>版本: 1.0.0</div>
            <div>构建时间: 2024-01-01</div>
            <div>© 2024 3D工作室. 保留所有权利.</div>
          </div>
        </div>
      </div>

      <!-- 底部 -->
      <div class="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          取消
        </button>
        <button
          @click="saveSettings"
          class="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          保存
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUIStore } from '@/stores/ui'

const emit = defineEmits<{
  close: []
}>()

const uiStore = useUIStore()

const selectedTheme = ref(uiStore.theme)
const defaultQuality = ref('standard')
const autoSave = ref(true)

onMounted(() => {
  // 从本地存储加载设置
  const savedQuality = localStorage.getItem('defaultQuality')
  const savedAutoSave = localStorage.getItem('autoSave')
  
  if (savedQuality) defaultQuality.value = savedQuality
  if (savedAutoSave) autoSave.value = savedAutoSave === 'true'
})

const handleThemeChange = () => {
  uiStore.setTheme(selectedTheme.value as 'light' | 'dark' | 'system')
}

const clearCache = () => {
  // 清除缓存逻辑
  localStorage.removeItem('modelCache')
  alert('缓存已清除')
}

const saveSettings = () => {
  // 保存设置到本地存储
  localStorage.setItem('defaultQuality', defaultQuality.value)
  localStorage.setItem('autoSave', autoSave.value.toString())
  
  emit('close')
}
</script>