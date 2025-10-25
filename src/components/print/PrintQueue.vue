<template>
  <Card>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">
          Print Queue
        </h2>
        <span class="text-sm text-gray-500">
          {{ queue.length }} {{ queue.length === 1 ? 'job' : 'jobs' }}
        </span>
      </div>
    </template>

    <div
      v-if="queue.length === 0"
      class="text-center py-8 text-gray-500"
    >
      <p>No print jobs in queue</p>
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="job in queue"
        :key="job.id"
        class="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="font-medium text-gray-900">
              {{ job.modelName }}
            </h3>
            <p class="text-sm text-gray-500 mt-1">
              {{ formatDate(job.createdAt) }}
            </p>
            <div class="mt-2 space-y-1 text-sm text-gray-600">
              <div class="flex items-center space-x-2">
                <span class="font-medium">Printer:</span>
                <span>{{ job.settings.printer }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="font-medium">Material:</span>
                <span>{{ job.settings.material }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="font-medium">Layer:</span>
                <span>{{ job.settings.layerHeight }}mm</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="font-medium">Infill:</span>
                <span>{{ job.settings.infillDensity }}%</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col items-end space-y-2">
            <span
              :class="[
                'px-2 py-1 text-xs font-medium rounded-full',
                getStatusColor(job.status),
              ]"
            >
              {{ getStatusText(job.status) }}
            </span>

            <div class="flex space-x-2">
              <Button
                v-if="job.status === 'pending'"
                variant="primary"
                @click="emit('start', job.id)"
              >
                Start
              </Button>
              <Button
                variant="danger"
                @click="emit('remove', job.id)"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>

        <div
          v-if="job.status === 'printing'"
          class="mt-3"
        >
          <ProgressBar :progress="job.progress" />
          <p class="text-xs text-gray-500 mt-1 text-right">
            {{ job.progress }}%
          </p>
        </div>
      </div>
    </div>

    <template
      v-if="queue.length > 0"
      #footer
    >
      <div class="flex justify-between">
        <Button
          variant="secondary"
          @click="emit('clearCompleted')"
        >
          Clear Completed
        </Button>
        <Button
          variant="danger"
          @click="emit('clearAll')"
        >
          Clear All
        </Button>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import type { PrintJob } from '@/types/print'

interface Props {
  queue: PrintJob[]
}

defineProps<Props>()

const emit = defineEmits<{
  start: [jobId: string]
  remove: [jobId: string]
  clearCompleted: []
  clearAll: []
}>()

const getStatusColor = (status: PrintJob['status']): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'printing':
      return 'bg-blue-100 text-blue-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: PrintJob['status']): string => {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'printing':
      return 'Printing'
    case 'completed':
      return 'Completed'
    case 'failed':
      return 'Failed'
    default:
      return 'Unknown'
  }
}

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
