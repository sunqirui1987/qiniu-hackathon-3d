<template>
  <div class="search-bar-container p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
    <div class="flex flex-col md:flex-row gap-4">
      <!-- 搜索输入框 -->
      <div class="flex-1">
        <div class="relative">
          <svg
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            :value="searchQuery"
            type="text"
            placeholder="搜索模型..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          >
        </div>
      </div>

      <!-- 分类筛选 -->
      <select
        :value="selectedCategory"
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        @change="$emit('update:selectedCategory', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">所有分类</option>
        <option value="character">角色</option>
        <option value="object">物品</option>
        <option value="building">建筑</option>
        <option value="vehicle">载具</option>
      </select>

      <!-- 排序选项 -->
      <select
        :value="sortBy"
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        @change="$emit('update:sortBy', ($event.target as HTMLSelectElement).value)"
      >
        <option value="date-desc">最新优先</option>
        <option value="date-asc">最旧优先</option>
        <option value="name-asc">名称 A-Z</option>
        <option value="name-desc">名称 Z-A</option>
        <option value="size-asc">文件大小(小→大)</option>
        <option value="size-desc">文件大小(大→小)</option>
      </select>
    </div>

    <!-- 结果统计 -->
    <div class="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
      <span>共 {{ totalCount }} 个模型</span>
      <button
        v-if="hasFilters"
        class="text-blue-600 dark:text-blue-400 hover:underline"
        @click="$emit('clearFilters')"
      >
        清除筛选
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  searchQuery: string
  selectedCategory: string
  sortBy: string
  totalCount: number
}>()

defineEmits<{
  'update:searchQuery': [value: string]
  'update:selectedCategory': [value: string]
  'update:sortBy': [value: string]
  'clearFilters': []
}>()

const hasFilters = computed(() => {
  return props.searchQuery !== '' || props.selectedCategory !== ''
})
</script>
