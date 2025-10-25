<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-4xl font-bold mb-2">
        3D生成打印平台
      </h1>
      <p class="text-gray-600">
        欢迎使用AI驱动的3D模型生成和打印平台
      </p>
    </div>

    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-6">
        快速开始
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          v-for="action in quickActions"
          :key="action.id"
          class="hover:shadow-xl transition-shadow cursor-pointer"
          @click="handleQuickAction(action.route)"
        >
          <template #header>
            <div class="flex items-center gap-3">
              <div
                class="w-12 h-12 rounded-lg flex items-center justify-center"
                :class="action.iconBg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  :class="action.iconColor"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    :d="action.iconPath"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-semibold">
                {{ action.title }}
              </h3>
            </div>
          </template>
          <p class="text-gray-600 text-sm">
            {{ action.description }}
          </p>
        </Card>
      </div>
    </section>

    <section
      v-if="recentModels.length > 0"
      class="mb-12"
    >
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-semibold">
          最近生成的模型
        </h2>
        <Button
          variant="secondary"
          @click="handleViewAll"
        >
          查看全部
        </Button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ModelCard
          v-for="model in recentModels.slice(0, 4)"
          :key="model.id"
          :model="model"
          @view="handleViewModel"
          @print="handlePrintModel"
          @delete="handleDeleteModel"
        />
      </div>
    </section>

    <section
      v-else
      class="mb-12"
    >
      <Card>
        <div class="text-center py-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-16 w-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h3 class="text-xl font-semibold mb-2">
            还没有生成的模型
          </h3>
          <p class="text-gray-600 mb-6">
            开始创建您的第一个3D模型吧！
          </p>
          <Button
            variant="primary"
            @click="handleQuickAction('/generate')"
          >
            开始生成
          </Button>
        </div>
      </Card>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <template #header>
          <h3 class="text-lg font-semibold">
            统计信息
          </h3>
        </template>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">总模型数</span>
            <span class="text-2xl font-bold text-blue-600">
              {{ modelHistory.length }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">进行中任务</span>
            <span class="text-2xl font-bold text-yellow-600">
              {{ activeTasks.length }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">已完成任务</span>
            <span class="text-2xl font-bold text-green-600">
              {{ completedTasks.length }}
            </span>
          </div>
        </div>
      </Card>

      <Card>
        <template #header>
          <h3 class="text-lg font-semibold">
            快速链接
          </h3>
        </template>
        <div class="space-y-2">
          <a
            v-for="link in quickLinks"
            :key="link.name"
            href="#"
            class="block p-2 hover:bg-gray-50 rounded-md transition-colors"
            @click.prevent="handleQuickAction(link.route)"
          >
            {{ link.name }}
          </a>
        </div>
      </Card>

      <Card>
        <template #header>
          <h3 class="text-lg font-semibold">
            帮助 & 文档
          </h3>
        </template>
        <div class="space-y-2">
          <p class="text-sm text-gray-600">
            了解如何使用平台的各项功能
          </p>
          <ul class="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>文本生成3D模型</li>
            <li>图片生成3D模型</li>
            <li>模型编辑与导出</li>
            <li>3D打印设置</li>
          </ul>
        </div>
      </Card>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useModelStore } from '@/stores/model'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import ModelCard from '@/components/library/ModelCard.vue'
import type { ModelFile } from '@/types/model'

const router = useRouter()
const modelStore = useModelStore()
const { modelHistory, activeTasks, completedTasks } = storeToRefs(modelStore)

const quickActions = [
  {
    id: 'text-to-3d',
    title: '文本生成',
    description: '使用AI从文本描述生成3D模型',
    route: '/generate',
    iconPath: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    id: 'image-to-3d',
    title: '图片生成',
    description: '从图片快速生成3D模型',
    route: '/generate',
    iconPath: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600'
  },
  {
    id: 'library',
    title: '模型库',
    description: '浏览和管理您的3D模型',
    route: '/library',
    iconPath: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    id: 'print',
    title: '3D打印',
    description: '连接打印机并开始打印',
    route: '/print',
    iconPath: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600'
  }
]

const quickLinks = [
  { name: '生成新模型', route: '/generate' },
  { name: '查看模型库', route: '/library' },
  { name: '3D查看器', route: '/viewer' },
  { name: '打印管理', route: '/print' }
]

const recentModels = computed(() => {
  return modelHistory.value.map(model => ({
    id: model.id,
    name: model.name,
    path: model.url,
    format: model.format,
    size: model.size || 0,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
    thumbnail: model.thumbnail,
    tags: [],
    metadata: model.metadata
  })) as ModelFile[]
})

const handleQuickAction = (route: string) => {
  router.push(route)
}

const handleViewAll = () => {
  router.push('/library')
}

const handleViewModel = (model: ModelFile) => {
  router.push({ name: 'viewer', query: { modelId: model.id } })
}

const handlePrintModel = (model: ModelFile) => {
  router.push({ name: 'print', query: { modelId: model.id } })
}

const handleDeleteModel = async (model: ModelFile) => {
  if (confirm(`确定要删除模型 "${model.name}" 吗？`)) {
    modelStore.removeModel(model.id)
    await modelStore.syncToIndexedDB()
  }
}

onMounted(async () => {
  await modelStore.loadFromIndexedDB()
})
</script>
