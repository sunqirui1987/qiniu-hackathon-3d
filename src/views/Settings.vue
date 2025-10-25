<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
        设置
      </h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        管理您的应用程序偏好设置
      </p>
    </div>

    <div class="space-y-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            外观
          </h2>
        </div>
        <div class="px-6 py-4 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                主题
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                选择浅色或深色主题
              </p>
            </div>
            <div class="flex items-center space-x-2">
              <button
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  uiStore.theme === 'light'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                ]"
                @click="uiStore.setTheme('light')"
              >
                <svg
                  class="w-4 h-4 inline-block mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                浅色
              </button>
              <button
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  uiStore.theme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                ]"
                @click="uiStore.setTheme('dark')"
              >
                <svg
                  class="w-4 h-4 inline-block mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
                深色
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                侧边栏
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                默认显示或隐藏侧边栏
              </p>
            </div>
            <button
              :class="[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                uiStore.sidebarOpen ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              ]"
              @click="uiStore.toggleSidebar()"
            >
              <span
                :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  uiStore.sidebarOpen ? 'translate-x-6' : 'translate-x-1'
                ]"
              />
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            键盘快捷键
          </h2>
        </div>
        <div class="px-6 py-4">
          <div class="space-y-3">
            <div class="flex items-center justify-between py-2">
              <span class="text-sm text-gray-700 dark:text-gray-300">
                打开全局搜索
              </span>
              <kbd class="px-3 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
                Ctrl + K
              </kbd>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-sm text-gray-700 dark:text-gray-300">
                切换主题
              </span>
              <kbd class="px-3 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
                Ctrl + Shift + T
              </kbd>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-sm text-gray-700 dark:text-gray-300">
                切换侧边栏
              </span>
              <kbd class="px-3 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
                Ctrl + B
              </kbd>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-sm text-gray-700 dark:text-gray-300">
                打开设置
              </span>
              <kbd class="px-3 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
                Ctrl + ,
              </kbd>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-sm text-gray-700 dark:text-gray-300">
                跳转到首页
              </span>
              <kbd class="px-3 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
                Ctrl + H
              </kbd>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            用户信息
          </h2>
        </div>
        <div class="px-6 py-4">
          <div
            v-if="authStore.user"
            class="flex items-center space-x-4"
          >
            <img
              v-if="authStore.user.avatar"
              :src="authStore.user.avatar"
              :alt="authStore.user.name"
              class="w-16 h-16 rounded-full"
            >
            <div
              v-else
              class="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold"
            >
              {{ authStore.user.name?.charAt(0).toUpperCase() }}
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                {{ authStore.user.name }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ authStore.user.email }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            关于
          </h2>
        </div>
        <div class="px-6 py-4 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-700 dark:text-gray-300">版本</span>
            <span class="text-sm font-medium text-gray-900 dark:text-gray-100">v0.0.1</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-700 dark:text-gray-300">应用名称</span>
            <span class="text-sm font-medium text-gray-900 dark:text-gray-100">3D平台</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'

const uiStore = useUIStore()
const authStore = useAuthStore()
</script>
