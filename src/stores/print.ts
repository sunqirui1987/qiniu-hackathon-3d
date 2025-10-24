import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PrintJob } from '@/types/print'

export const usePrintStore = defineStore('print', () => {
  const printQueue = ref<PrintJob[]>([])
  const currentPrintJob = ref<PrintJob | null>(null)
  const bambuConnected = ref(false)

  function addPrintJob(job: PrintJob) {
    printQueue.value.push(job)
  }

  function removePrintJob(id: string) {
    printQueue.value = printQueue.value.filter((j) => j.id !== id)
  }

  function updateJobStatus(id: string, status: PrintJob['status']) {
    const job = printQueue.value.find((j) => j.id === id)
    if (job) {
      job.status = status
    }
  }

  return {
    printQueue,
    currentPrintJob,
    bambuConnected,
    addPrintJob,
    removePrintJob,
    updateJobStatus
  }
})
