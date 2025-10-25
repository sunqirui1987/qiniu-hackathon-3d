<template>
  <div
    id="app"
    class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col"
  >
    <!-- 顶部导航栏 -->
    <header class="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6">
      <!-- 左侧：Logo和标题 -->
      <div class="flex items-center space-x-4">
        <div class="flex items-center">
          <span class="text-xl font-bold text-gray-800 dark:text-gray-100">3D工作室</span>
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          AI驱动3D生成打印平台
        </div>
      </div>

      <!-- 右侧：功能按钮和用户信息 -->
      <div class="flex items-center space-x-4">
        <!-- 模型库按钮 -->
        <button
          class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          title="模型库"
          @click="showLibrary"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          模型库
        </button>

        <!-- 搜索按钮 -->
        <button
          class="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          title="搜索 (Ctrl+K)"
          @click="uiStore.toggleSearch"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        
        <!-- 主题切换按钮 -->
        <button
          class="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          :title="uiStore.theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'"
          @click="uiStore.toggleTheme"
        >
          <svg v-if="uiStore.theme === 'dark'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        <!-- 设置按钮 -->
        <button
          class="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          title="设置"
          @click="showSettings"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <!-- 当前模型信息 -->
        <div v-if="modelStore.currentModel" class="hidden md:flex items-center text-sm text-gray-600 dark:text-gray-300">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          当前模型: {{ modelStore.currentModel.name }}
        </div>
        
        <!-- 用户信息和登出 -->
        <div v-if="authStore.isAuthenticated" class="flex items-center space-x-3">
          <div class="flex items-center space-x-2">
            <img
              v-if="authStore.user?.avatar"
              :src="authStore.user.avatar"
              :alt="authStore.user.name"
              class="w-8 h-8 rounded-full"
            >
            <span class="hidden md:inline text-sm text-gray-700 dark:text-gray-300">
              {{ authStore.user?.name }}
            </span>
          </div>
          <button
            class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            title="退出登录"
            @click="handleLogout"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="flex-1 overflow-hidden">
      <router-view v-slot="{ Component, route: currentRoute }">
        <transition
          :name="transitionName"
          mode="out-in"
          @before-enter="beforeEnter"
          @after-enter="afterEnter"
        >
          <component
            :is="Component"
            :key="currentRoute.path"
          />
        </transition>
      </router-view>
    </main>

    <!-- 全局搜索组件 -->
    <GlobalSearch />

    <!-- 设置弹窗 -->
    <SettingsModal v-if="showSettingsModal" @close="showSettingsModal = false" />
    
    <!-- 模型库弹窗 -->
    <LibraryModal v-if="showLibraryModal" @close="showLibraryModal = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { useModelStore } from '@/stores/model'
import { useAuthStore } from '@/stores/auth'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import GlobalSearch from '@/components/global/GlobalSearch.vue'
import SettingsModal from '@/components/modals/SettingsModal.vue'
import LibraryModal from '@/components/modals/LibraryModal.vue'

const uiStore = useUIStore()
const modelStore = useModelStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

// 弹窗控制
const showSettingsModal = ref(false)
const showLibraryModal = ref(false)

useKeyboardShortcuts()

onMounted(() => {
  authStore.init()
  uiStore.initTheme()
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const showSettings = () => {
  showSettingsModal.value = true
}

const showLibrary = () => {
  showLibraryModal.value = true
}



const transitionName = computed(() => {
  return 'fade'
})

const beforeEnter = () => {
  uiStore.setLoading(true)
}

const afterEnter = () => {
  uiStore.setLoading(false)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
