<template>
  <div class="print-queue p-6 bg-white rounded-lg shadow-md">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold">
        打印队列
      </h3>
      <span class="text-sm text-gray-600">
        共 {{ printQueue.length }} 个任务
      </span>
    </div>

    <div
      v-if="printQueue.length === 0"
      class="empty-state text-center py-8 text-gray-500"
    >
      <p class="text-lg mb-2">
        暂无打印任务
      </p>
      <p class="text-sm">
        请先添加模型到打印队列
      </p>
    </div>

    <div
      v-else
      class="queue-list space-y-3"
    >
      <div
        v-for="job in printQueue"
        :key="job.id"
        class="queue-item p-4 border rounded-lg hover:bg-gray-50 transition-colors"
        :class="getJobStatusClass(job.status)"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h4 class="font-medium mb-1">
              {{ job.modelName }}
            </h4>
            <div class="text-sm text-gray-600 space-y-1">
              <p>状态: {{ getStatusText(job.status) }}</p>
              <p>材料: {{ job.settings.material }}</p>
              <p>层高: {{ job.settings.layerHeight }}mm</p>
              <p>填充率: {{ job.settings.infillDensity }}%</p>
            </div>
            <div
              v-if="job.status === 'printing'"
              class="progress-section mt-2"
            >
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-blue-600 h-2 rounded-full transition-all"
                  :style="{ width: `${job.progress}%` }"
                />
              </div>
              <p class="text-xs text-gray-600 mt-1">
                进度: {{ job.progress }}%
              </p>
            </div>
          </div>
          <div class="ml-4 flex flex-col gap-2">
            <button
              v-if="job.status === 'pending'"
              class="text-red-600 hover:text-red-700 text-sm"
              @click="removeJob(job.id)"
            >
              删除
            </button>
            <button
              v-if="job.status === 'completed' || job.status === 'failed'"
              class="text-gray-600 hover:text-gray-700 text-sm"
              @click="removeJob(job.id)"
            >
              移除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePrintStore } from '@/stores/print'
import type { PrintJob } from '@/types/print'

const printStore = usePrintStore()

const printQueue = computed(() => printStore.printQueue)

const getStatusText = (status: PrintJob['status']) => {
  const statusMap: Record<PrintJob['status'], string> = {
    pending: '等待中',
    printing: '打印中',
    completed: '已完成',
    failed: '失败'
  }
  return statusMap[status]
}

const getJobStatusClass = (status: PrintJob['status']) => {
  const classMap: Record<PrintJob['status'], string> = {
    pending: 'border-yellow-200',
    printing: 'border-blue-200',
    completed: 'border-green-200',
    failed: 'border-red-200'
  }
  return classMap[status]
}

const removeJob = (id: string) => {
  printStore.removePrintJob(id)
}
</script>
