<template>
  <div
    id="app"
    class="min-h-screen bg-gray-50 flex"
  >
    <aside
      :class="[
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out',
        uiStore.sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <div class="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        <router-link
          to="/"
          class="flex items-center"
        >
          <span class="text-xl font-bold text-gray-800">3D平台</span>
        </router-link>
        <button
          class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          @click="uiStore.toggleSidebar"
        >
          <svg
            class="w-6 h-6"
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

      <nav class="px-2 py-4 space-y-1">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
          active-class="bg-blue-50 text-blue-600"
          exact-active-class="bg-blue-50 text-blue-600"
          :class="item.class || 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'"
        >
          <component
            :is="item.icon"
            class="mr-3 h-5 w-5"
          />
          {{ item.name }}
        </router-link>
      </nav>

      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div class="text-xs text-gray-500 text-center">
          AI驱动3D生成打印平台
        </div>
      </div>
    </aside>

    <div
      v-if="uiStore.sidebarOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
      @click="uiStore.toggleSidebar"
    />

    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
        <button
          class="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
          @click="uiStore.toggleSidebar"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div class="hidden lg:block flex-1">
          <h1 class="text-lg font-semibold text-gray-800">
            {{ currentPageTitle }}
          </h1>
        </div>

        <div class="flex items-center space-x-4">
          <div
            v-if="modelStore.currentModel"
            class="hidden md:flex items-center text-sm text-gray-600"
          >
            <svg
              class="w-4 h-4 mr-1"
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
            当前模型: {{ modelStore.currentModel.name }}
          </div>
          
          <div
            v-if="authStore.isAuthenticated"
            class="flex items-center space-x-3"
          >
            <div class="flex items-center space-x-2">
              <img
                v-if="authStore.user?.avatar"
                :src="authStore.user.avatar"
                :alt="authStore.user.name"
                class="w-8 h-8 rounded-full"
              />
              <span class="hidden md:inline text-sm text-gray-700">
                {{ authStore.user?.name }}
              </span>
            </div>
            <button
              @click="handleLogout"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
              title="退出登录"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-auto p-4 lg:p-6">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { useModelStore } from '@/stores/model'
import { useAuthStore } from '@/stores/auth'

const uiStore = useUIStore()
const modelStore = useModelStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

onMounted(() => {
  authStore.init()
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const HomeIcon = () => h('svg', { 
  class: 'w-5 h-5',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
  })
])

const GenerateIcon = () => h('svg', {
  class: 'w-5 h-5',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
  })
])

const ViewerIcon = () => h('svg', {
  class: 'w-5 h-5',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
  })
])

const PrintIcon = () => h('svg', {
  class: 'w-5 h-5',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z'
  })
])

const LibraryIcon = () => h('svg', {
  class: 'w-5 h-5',
  fill: 'none',
  stroke: 'currentColor',
  viewBox: '0 0 24 24'
}, [
  h('path', {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'stroke-width': '2',
    d: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
  })
])

const navItems = [
  { name: '首页', path: '/', icon: HomeIcon },
  { name: '3D生成', path: '/generate', icon: GenerateIcon },
  { name: '3D查看器', path: '/viewer', icon: ViewerIcon },
  { name: '打印管理', path: '/print', icon: PrintIcon },
  { name: '模型库', path: '/library', icon: LibraryIcon }
]

const currentPageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/': '首页',
    '/generate': '3D生成',
    '/viewer': '3D查看器',
    '/print': '打印管理',
    '/library': '模型库'
  }
  return titles[route.path] || '3D平台'
})

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
