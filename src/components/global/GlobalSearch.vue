<template>
  <Teleport to="body">
    <Transition name="search-modal">
      <div
        v-if="uiStore.searchOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="close"
      >
        <div class="flex min-h-screen items-start justify-center px-4 pt-20">
          <Transition name="search-backdrop">
            <div
              v-if="uiStore.searchOpen"
              class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              @click="close"
            />
          </Transition>

          <div
            class="relative w-full max-w-2xl transform rounded-lg bg-white dark:bg-gray-800 shadow-2xl transition-all"
            @click.stop
          >
            <div class="flex items-center border-b border-gray-200 dark:border-gray-700 px-4">
              <svg
                class="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref="searchInput"
                v-model="searchQuery"
                type="text"
                class="flex-1 bg-transparent px-4 py-4 text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none"
                placeholder="搜索模型、页面或功能..."
                @keydown.esc="close"
                @keydown.down.prevent="moveSelection(1)"
                @keydown.up.prevent="moveSelection(-1)"
                @keydown.enter.prevent="selectItem"
              >
              <kbd class="hidden sm:inline-flex items-center px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded">
                ESC
              </kbd>
            </div>

            <div
              v-if="searchQuery && filteredResults.length > 0"
              class="max-h-96 overflow-y-auto p-2"
            >
              <div
                v-for="(item, index) in filteredResults"
                :key="item.id"
                :class="[
                  'flex items-center px-4 py-3 rounded-md cursor-pointer transition-colors',
                  selectedIndex === index
                    ? 'bg-blue-50 dark:bg-blue-900/30'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                ]"
                @click="navigateTo(item)"
                @mouseenter="selectedIndex = index"
              >
                <component
                  :is="item.icon"
                  class="h-5 w-5 mr-3 text-gray-400"
                />
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ item.title }}
                  </div>
                  <div
                    v-if="item.description"
                    class="text-xs text-gray-500 dark:text-gray-400"
                  >
                    {{ item.description }}
                  </div>
                </div>
                <span class="text-xs text-gray-400">{{ item.category }}</span>
              </div>
            </div>

            <div
              v-else-if="searchQuery && filteredResults.length === 0"
              class="px-6 py-14 text-center"
            >
              <svg
                class="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
                未找到匹配结果
              </p>
            </div>

            <div
              v-else
              class="px-6 py-14 text-center"
            >
              <svg
                class="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
                开始输入以搜索...
              </p>
            </div>

            <div class="border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <span class="flex items-center">
                    <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded mr-1">↑</kbd>
                    <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded mr-2">↓</kbd>
                    导航
                  </span>
                  <span class="flex items-center">
                    <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded mr-2">Enter</kbd>
                    选择
                  </span>
                </div>
                <span>按 Ctrl+K 或 Cmd+K 打开搜索</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, h } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'

const router = useRouter()
const uiStore = useUIStore()

const searchInput = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')
const selectedIndex = ref(0)

const HomeIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' })
])

const GenerateIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' })
])

const ViewerIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' })
])

const PrintIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z' })
])

const LibraryIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' })
])

const SettingsIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' })
])

interface SearchItem {
  id: string
  title: string
  description?: string
  category: string
  path?: string
  icon: () => any
  action?: () => void
}

const searchItems = computed<SearchItem[]>(() => {
  const items: SearchItem[] = [
    { id: 'home', title: '首页', description: '快速访问和最近模型', category: '页面', path: '/', icon: HomeIcon },
    { id: 'generate', title: '3D生成', description: 'AI生成3D模型', category: '页面', path: '/generate', icon: GenerateIcon },
    { id: 'viewer', title: '3D查看器', description: '查看和编辑3D模型', category: '页面', path: '/viewer', icon: ViewerIcon },
    { id: 'print', title: '打印管理', description: '管理3D打印任务', category: '页面', path: '/print', icon: PrintIcon },
    { id: 'library', title: '模型库', description: '浏览所有3D模型', category: '页面', path: '/library', icon: LibraryIcon },
    { id: 'settings', title: '设置', description: '应用程序设置和偏好', category: '页面', path: '/settings', icon: SettingsIcon }
  ]

  return items
})

const filteredResults = computed(() => {
  if (!searchQuery.value) return []
  
  const query = searchQuery.value.toLowerCase()
  return searchItems.value.filter(item => 
    item.title.toLowerCase().includes(query) ||
    item.description?.toLowerCase().includes(query) ||
    item.category.toLowerCase().includes(query)
  )
})

const moveSelection = (direction: number) => {
  const newIndex = selectedIndex.value + direction
  if (newIndex >= 0 && newIndex < filteredResults.value.length) {
    selectedIndex.value = newIndex
  }
}

const selectItem = () => {
  const item = filteredResults.value[selectedIndex.value]
  if (item) {
    navigateTo(item)
  }
}

const navigateTo = (item: SearchItem) => {
  if (item.action) {
    item.action()
  } else if (item.path) {
    router.push(item.path)
  }
  close()
}

const close = () => {
  uiStore.toggleSearch()
}

watch(() => uiStore.searchOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    searchInput.value?.focus()
    selectedIndex.value = 0
    searchQuery.value = ''
  }
})

watch(searchQuery, () => {
  selectedIndex.value = 0
})
</script>

<style scoped>
.search-modal-enter-active,
.search-modal-leave-active {
  transition: opacity 0.2s ease;
}

.search-modal-enter-from,
.search-modal-leave-to {
  opacity: 0;
}

.search-modal-enter-active > div > div {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.search-modal-enter-from > div > div {
  transform: scale(0.95);
  opacity: 0;
}

.search-backdrop-enter-active,
.search-backdrop-leave-active {
  transition: opacity 0.2s ease;
}

.search-backdrop-enter-from,
.search-backdrop-leave-to {
  opacity: 0;
}
</style>
