import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { PrintJob } from '@/types/print'

const STORAGE_KEY = 'bambu_print_queue'

function loadQueueFromStorage(): PrintJob[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored)
    return parsed.map((job: PrintJob) => ({
      ...job,
      createdAt: new Date(job.createdAt),
      startedAt: job.startedAt ? new Date(job.startedAt) : undefined,
      completedAt: job.completedAt ? new Date(job.completedAt) : undefined,
    }))
  } catch (error) {
    console.error('Failed to load print queue from storage:', error)
    return []
  }
}

function saveQueueToStorage(queue: PrintJob[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
  } catch (error) {
    console.error('Failed to save print queue to storage:', error)
  }
}

export const usePrintStore = defineStore('print', () => {
  const printQueue = ref<PrintJob[]>(loadQueueFromStorage())
  const currentPrintJob = ref<PrintJob | null>(null)
  const bambuConnected = ref(false)

  watch(
    printQueue,
    (newQueue) => {
      saveQueueToStorage(newQueue)
    },
    { deep: true }
  )

  function addPrintJob(job: PrintJob) {
    printQueue.value.push(job)
  }

  function removePrintJob(id: string) {
    printQueue.value = printQueue.value.filter((j) => j.id !== id)
    if (currentPrintJob.value?.id === id) {
      currentPrintJob.value = null
    }
  }

  function updateJobStatus(id: string, status: PrintJob['status']) {
    const job = printQueue.value.find((j) => j.id === id)
    if (job) {
      job.status = status
      if (status === 'printing' && !job.startedAt) {
        job.startedAt = new Date()
      }
      if (status === 'completed' && !job.completedAt) {
        job.completedAt = new Date()
      }
    }
  }

  function updateJobProgress(id: string, progress: number) {
    const job = printQueue.value.find((j) => j.id === id)
    if (job) {
      job.progress = Math.min(Math.max(progress, 0), 100)
    }
  }

  function clearCompletedJobs() {
    printQueue.value = printQueue.value.filter((j) => j.status !== 'completed')
  }

  function clearAllJobs() {
    printQueue.value = []
    currentPrintJob.value = null
  }

  function getJobById(id: string): PrintJob | undefined {
    return printQueue.value.find((j) => j.id === id)
  }

  function getPendingJobs(): PrintJob[] {
    return printQueue.value.filter((j) => j.status === 'pending')
  }

  function getActiveJobs(): PrintJob[] {
    return printQueue.value.filter((j) => j.status === 'printing')
  }

  function setBambuConnected(connected: boolean) {
    bambuConnected.value = connected
  }

  return {
    printQueue,
    currentPrintJob,
    bambuConnected,
    addPrintJob,
    removePrintJob,
    updateJobStatus,
    updateJobProgress,
    clearCompletedJobs,
    clearAllJobs,
    getJobById,
    getPendingJobs,
    getActiveJobs,
    setBambuConnected,
  }
})
