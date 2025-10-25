<template>
  <Card>
    <template #header>
      <h2 class="text-xl font-semibold">
        Current Print Job
      </h2>
    </template>

    <div
      v-if="!currentJob"
      class="text-center py-8 text-gray-500"
    >
      <p>No active print job</p>
    </div>

    <div
      v-else
      class="space-y-4"
    >
      <div class="border-b border-gray-200 pb-4">
        <h3 class="text-lg font-medium text-gray-900">
          {{ currentJob.modelName }}
        </h3>
        <p class="text-sm text-gray-500 mt-1">
          Started: {{ formatTime(currentJob.startedAt) }}
        </p>
      </div>

      <div class="space-y-3">
        <div
          :class="[
            'flex items-center justify-center py-3 rounded-lg',
            getStatusBackgroundColor(currentJob.status),
          ]"
        >
          <span
            :class="[
              'text-lg font-semibold',
              getStatusTextColor(currentJob.status),
            ]"
          >
            {{ getStatusText(currentJob.status) }}
          </span>
        </div>

        <div v-if="currentJob.status === 'printing'">
          <div class="mb-2">
            <ProgressBar :progress="currentJob.progress" />
          </div>
          <div class="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span class="font-medium">{{ currentJob.progress }}%</span>
          </div>
          <div
            v-if="estimatedTimeRemaining"
            class="mt-2 text-sm text-gray-600 text-center"
          >
            Estimated time remaining: {{ estimatedTimeRemaining }}
          </div>
        </div>

        <div class="space-y-2 text-sm bg-gray-50 p-3 rounded-md">
          <h4 class="font-medium text-gray-700">
            Print Settings
          </h4>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <span class="text-gray-500">Printer:</span>
              <span class="ml-2 font-medium">{{ currentJob.settings.printer }}</span>
            </div>
            <div>
              <span class="text-gray-500">Material:</span>
              <span class="ml-2 font-medium">{{ currentJob.settings.material }}</span>
            </div>
            <div>
              <span class="text-gray-500">Layer Height:</span>
              <span class="ml-2 font-medium">{{ currentJob.settings.layerHeight }}mm</span>
            </div>
            <div>
              <span class="text-gray-500">Infill:</span>
              <span class="ml-2 font-medium">{{ currentJob.settings.infillDensity }}%</span>
            </div>
            <div>
              <span class="text-gray-500">Supports:</span>
              <span class="ml-2 font-medium">{{ currentJob.settings.supports ? 'Yes' : 'No' }}</span>
            </div>
            <div v-if="currentJob.settings.temperature">
              <span class="text-gray-500">Temperature:</span>
              <span class="ml-2 font-medium">{{ currentJob.settings.temperature }}°C</span>
            </div>
          </div>
        </div>

        <div
          v-if="currentJob.status === 'completed'"
          class="text-center text-sm text-gray-600"
        >
          <p>Completed at {{ formatTime(currentJob.completedAt) }}</p>
          <p class="mt-1">
            Total time: {{ calculateDuration() }}
          </p>
        </div>

        <div class="flex space-x-2">
          <Button
            v-if="currentJob.status === 'printing'"
            variant="danger"
            class="flex-1"
            @click="emit('cancel')"
          >
            Cancel Print
          </Button>
          <Button
            v-if="currentJob.status === 'completed' || currentJob.status === 'failed'"
            variant="secondary"
            class="flex-1"
            @click="emit('clear')"
          >
            Clear
          </Button>
          <Button
            v-if="currentJob.status === 'failed'"
            variant="primary"
            class="flex-1"
            @click="emit('retry')"
          >
            Retry
          </Button>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import type { PrintJob } from '@/types/print'

interface Props {
  currentJob: PrintJob | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  cancel: []
  clear: []
  retry: []
}>()

const estimatedTimeRemaining = computed(() => {
  if (!props.currentJob || props.currentJob.status !== 'printing') {
    return null
  }

  if (props.currentJob.progress === 0) {
    return 'Calculating...'
  }

  const elapsedMs = props.currentJob.startedAt
    ? Date.now() - new Date(props.currentJob.startedAt).getTime()
    : 0

  const totalMs = (elapsedMs / props.currentJob.progress) * 100
  const remainingMs = totalMs - elapsedMs

  return formatDuration(remainingMs)
})

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

const getStatusBackgroundColor = (status: PrintJob['status']): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100'
    case 'printing':
      return 'bg-blue-100'
    case 'completed':
      return 'bg-green-100'
    case 'failed':
      return 'bg-red-100'
    default:
      return 'bg-gray-100'
  }
}

const getStatusTextColor = (status: PrintJob['status']): string => {
  switch (status) {
    case 'pending':
      return 'text-yellow-800'
    case 'printing':
      return 'text-blue-800'
    case 'completed':
      return 'text-green-800'
    case 'failed':
      return 'text-red-800'
    default:
      return 'text-gray-800'
  }
}

const formatTime = (date?: Date): string => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDuration = (ms: number): string => {
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

const calculateDuration = (): string => {
  if (!props.currentJob?.startedAt || !props.currentJob?.completedAt) {
    return 'N/A'
  }

  const startMs = new Date(props.currentJob.startedAt).getTime()
  const endMs = new Date(props.currentJob.completedAt).getTime()
  const durationMs = endMs - startMs

  return formatDuration(durationMs)
}
</script>
