<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">
      打印管理
    </h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-6">
        <BambuConnector
          @settings-change="handleSettingsChange"
          @printer-select="handlePrinterSelect"
        />

        <PrintStatus
          :current-job="currentPrintJob"
          @cancel="handleCancelPrint"
          @clear="handleClearCurrentJob"
          @retry="handleRetryPrint"
        />
      </div>

      <div>
        <PrintQueue
          :queue="printQueue"
          @start="handleStartPrint"
          @remove="handleRemoveJob"
          @clear-completed="handleClearCompleted"
          @clear-all="handleClearAll"
        />
      </div>
    </div>

    <Toast
      v-if="toast.show"
      :message="toast.message"
      :type="toast.type"
      @close="toast.show = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { usePrintStore } from '@/stores/print'
import { useBambuConnect } from '@/composables/useBambuConnect'
import BambuConnector from '@/components/print/BambuConnector.vue'
import PrintQueue from '@/components/print/PrintQueue.vue'
import PrintStatus from '@/components/print/PrintStatus.vue'
import Toast from '@/components/ui/Toast.vue'
import type { PrintSettings } from '@/types/print'

const printStore = usePrintStore()
const { printQueue, currentPrintJob } = storeToRefs(printStore)

const { sendToPrint } = useBambuConnect()

const currentSettings = ref<PrintSettings | null>(null)
const selectedPrinter = ref<string>('')

const toast = ref({
  show: false,
  message: '',
  type: 'info' as 'success' | 'error' | 'info',
})

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  toast.value = {
    show: true,
    message,
    type,
  }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

const handleSettingsChange = (settings: PrintSettings) => {
  currentSettings.value = settings
}

const handlePrinterSelect = (printer: string) => {
  selectedPrinter.value = printer
}

const handleStartPrint = async (jobId: string) => {
  const job = printQueue.value.find((j) => j.id === jobId)
  if (!job) {
    showToast('Print job not found', 'error')
    return
  }

  const modelPath = `/models/${job.modelId}.stl`

  const result = await sendToPrint(modelPath, job.settings)

  if (result.success) {
    printStore.updateJobStatus(jobId, 'printing')
    printStore.currentPrintJob = job
    showToast('Print job started successfully', 'success')

    simulatePrintProgress(jobId)
  } else {
    printStore.updateJobStatus(jobId, 'failed')
    showToast(result.message, 'error')
  }
}

const simulatePrintProgress = (jobId: string) => {
  const interval = setInterval(() => {
    const job = printQueue.value.find((j) => j.id === jobId)
    if (!job || job.status !== 'printing') {
      clearInterval(interval)
      return
    }

    job.progress = Math.min(job.progress + 5, 100)

    if (job.progress >= 100) {
      printStore.updateJobStatus(jobId, 'completed')
      job.completedAt = new Date()
      clearInterval(interval)
      showToast('Print completed successfully', 'success')
    }
  }, 2000)
}

const handleRemoveJob = (jobId: string) => {
  printStore.removePrintJob(jobId)
  showToast('Print job removed', 'info')
}

const handleCancelPrint = () => {
  if (currentPrintJob.value) {
    printStore.updateJobStatus(currentPrintJob.value.id, 'failed')
    printStore.currentPrintJob = null
    showToast('Print cancelled', 'info')
  }
}

const handleClearCurrentJob = () => {
  if (currentPrintJob.value) {
    printStore.removePrintJob(currentPrintJob.value.id)
    printStore.currentPrintJob = null
    showToast('Print job cleared', 'info')
  }
}

const handleRetryPrint = async () => {
  if (currentPrintJob.value) {
    const jobId = currentPrintJob.value.id
    printStore.updateJobStatus(jobId, 'pending')
    printStore.currentPrintJob = null
    await handleStartPrint(jobId)
  }
}

const handleClearCompleted = () => {
  const completedJobs = printQueue.value.filter((j) => j.status === 'completed')
  completedJobs.forEach((job) => {
    printStore.removePrintJob(job.id)
  })
  showToast(`Cleared ${completedJobs.length} completed jobs`, 'info')
}

const handleClearAll = () => {
  const count = printQueue.value.length
  printQueue.value.forEach((job) => {
    printStore.removePrintJob(job.id)
  })
  printStore.currentPrintJob = null
  showToast(`Cleared ${count} jobs`, 'info')
}
</script>
