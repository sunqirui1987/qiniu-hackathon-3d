<template>
  <div class="print-status p-6 bg-white rounded-lg shadow-md">
    <h3 class="text-xl font-semibold mb-4">
      当前打印任务
    </h3>

    <div
      v-if="!currentJob"
      class="empty-state text-center py-8 text-gray-500"
    >
      <p class="text-lg mb-2">
        暂无进行中的打印任务
      </p>
      <p class="text-sm">
        打印任务将在这里显示
      </p>
    </div>

    <div
      v-else
      class="current-job"
    >
      <div class="job-header mb-4">
        <h4 class="text-lg font-medium mb-2">
          {{ currentJob.modelName }}
        </h4>
        <div
          class="status-badge inline-block px-3 py-1 rounded-full text-sm"
          :class="getStatusBadgeClass(currentJob.status)"
        >
          {{ getStatusText(currentJob.status) }}
        </div>
      </div>

      <div class="job-details space-y-3 mb-4">
        <div class="detail-item">
          <span class="text-gray-600 text-sm">打印机:</span>
          <span class="font-medium ml-2">{{ currentJob.settings.printer }}</span>
        </div>
        <div class="detail-item">
          <span class="text-gray-600 text-sm">材料:</span>
          <span class="font-medium ml-2">{{ currentJob.settings.material }}</span>
        </div>
        <div class="detail-item">
          <span class="text-gray-600 text-sm">层高:</span>
          <span class="font-medium ml-2">{{ currentJob.settings.layerHeight }}mm</span>
        </div>
        <div class="detail-item">
          <span class="text-gray-600 text-sm">填充率:</span>
          <span class="font-medium ml-2">{{ currentJob.settings.infillDensity }}%</span>
        </div>
      </div>

      <div
        v-if="currentJob.status === 'printing'"
        class="progress-section"
      >
        <div class="flex justify-between mb-2">
          <span class="text-sm text-gray-600">打印进度</span>
          <span class="text-sm font-medium">{{ currentJob.progress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div
            class="bg-blue-600 h-3 rounded-full transition-all duration-300"
            :style="{ width: `${currentJob.progress}%` }"
          />
        </div>
      </div>

      <div
        v-if="currentJob.startedAt"
        class="time-info mt-4 text-sm text-gray-600"
      >
        <p>开始时间: {{ formatDate(currentJob.startedAt) }}</p>
        <p
          v-if="currentJob.completedAt"
          class="mt-1"
        >
          完成时间: {{ formatDate(currentJob.completedAt) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePrintStore } from '@/stores/print'
import type { PrintJob } from '@/types/print'

const printStore = usePrintStore()

const currentJob = computed(() => printStore.currentPrintJob)

const getStatusText = (status: PrintJob['status']) => {
  const statusMap: Record<PrintJob['status'], string> = {
    pending: '等待中',
    printing: '打印中',
    completed: '已完成',
    failed: '失败'
  }
  return statusMap[status]
}

const getStatusBadgeClass = (status: PrintJob['status']) => {
  const classMap: Record<PrintJob['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    printing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  }
  return classMap[status]
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
