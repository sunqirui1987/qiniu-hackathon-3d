import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePrintStore } from '../print'
import type { PrintJob } from '@/types/print'

const mockPrintJob: PrintJob = {
  id: 'test-job-1',
  modelId: 'model-123',
  modelName: 'Test Model',
  status: 'pending',
  progress: 0,
  settings: {
    printer: 'Bambu Lab X1 Carbon',
    material: 'PLA',
    layerHeight: 0.2,
    infillDensity: 20,
    supports: false,
  },
  createdAt: new Date('2025-01-01T00:00:00Z'),
}

const mockLocalStorage = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

describe('usePrintStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    mockLocalStorage.clear()
  })

  describe('initialization', () => {
    it('should initialize with empty state', () => {
      const store = usePrintStore()

      expect(store.printQueue).toEqual([])
      expect(store.currentPrintJob).toBeNull()
    })

    it('should load queue from localStorage on initialization', () => {
      const savedQueue = [mockPrintJob]
      mockLocalStorage.setItem('bambu_print_queue', JSON.stringify(savedQueue))

      const store = usePrintStore()

      expect(store.printQueue).toHaveLength(1)
      expect(store.printQueue[0].id).toBe('test-job-1')
      expect(store.printQueue[0].createdAt).toBeInstanceOf(Date)
    })

    it('should handle invalid localStorage data gracefully', () => {
      mockLocalStorage.setItem('bambu_print_queue', 'invalid-json')

      const store = usePrintStore()

      expect(store.printQueue).toEqual([])
    })
  })

  describe('addPrintJob', () => {
    it('should add a print job to the queue', () => {
      const store = usePrintStore()

      store.addPrintJob(mockPrintJob)

      expect(store.printQueue).toHaveLength(1)
      expect(store.printQueue[0]).toEqual(mockPrintJob)
    })

    it('should persist queue to localStorage', async () => {
      const store = usePrintStore()

      store.addPrintJob(mockPrintJob)

      await vi.waitFor(() => {
        const stored = mockLocalStorage.getItem('bambu_print_queue')
        expect(stored).toBeTruthy()
        const parsed = JSON.parse(stored!)
        expect(parsed).toHaveLength(1)
      })
    })

    it('should add multiple jobs', () => {
      const store = usePrintStore()
      const job2 = { ...mockPrintJob, id: 'test-job-2', modelName: 'Model 2' }

      store.addPrintJob(mockPrintJob)
      store.addPrintJob(job2)

      expect(store.printQueue).toHaveLength(2)
    })
  })

  describe('removePrintJob', () => {
    it('should remove a print job from the queue', () => {
      const store = usePrintStore()
      store.addPrintJob(mockPrintJob)

      store.removePrintJob('test-job-1')

      expect(store.printQueue).toHaveLength(0)
    })

    it('should clear current print job if it matches removed job', () => {
      const store = usePrintStore()
      store.addPrintJob(mockPrintJob)
      store.currentPrintJob = mockPrintJob

      store.removePrintJob('test-job-1')

      expect(store.currentPrintJob).toBeNull()
    })

    it('should not affect other jobs', () => {
      const store = usePrintStore()
      const job2 = { ...mockPrintJob, id: 'test-job-2' }
      store.addPrintJob(mockPrintJob)
      store.addPrintJob(job2)

      store.removePrintJob('test-job-1')

      expect(store.printQueue).toHaveLength(1)
      expect(store.printQueue[0].id).toBe('test-job-2')
    })
  })

  describe('updateJobStatus', () => {
    it('should update job status', () => {
      const store = usePrintStore()
      store.addPrintJob(mockPrintJob)

      store.updateJobStatus('test-job-1', 'printing')

      expect(store.printQueue[0].status).toBe('printing')
    })

    it('should set startedAt when status changes to printing', () => {
      const store = usePrintStore()
      store.addPrintJob(mockPrintJob)

      store.updateJobStatus('test-job-1', 'printing')

      expect(store.printQueue[0].startedAt).toBeInstanceOf(Date)
    })

    it('should set completedAt when status changes to completed', () => {
      const store = usePrintStore()
      store.addPrintJob(mockPrintJob)

      store.updateJobStatus('test-job-1', 'completed')

      expect(store.printQueue[0].completedAt).toBeInstanceOf(Date)
    })

    it('should handle non-existent job gracefully', () => {
      const store = usePrintStore()

      expect(() => {
        store.updateJobStatus('non-existent', 'completed')
      }).not.toThrow()
    })
  })

  describe('updateJobProgress', () => {
    it('should update job progress', () => {
      const store = usePrintStore()
      store.addPrintJob(mockPrintJob)

      store.updateJobProgress('test-job-1', 50)

      expect(store.printQueue[0].progress).toBe(50)
    })

    it('should clamp progress to 0-100 range', () => {
      const store = usePrintStore()
      store.addPrintJob(mockPrintJob)

      store.updateJobProgress('test-job-1', 150)
      expect(store.printQueue[0].progress).toBe(100)

      store.updateJobProgress('test-job-1', -10)
      expect(store.printQueue[0].progress).toBe(0)
    })
  })

  describe('clearCompletedJobs', () => {
    it('should remove only completed jobs', () => {
      const store = usePrintStore()
      const job1 = { ...mockPrintJob, id: 'job-1', status: 'completed' as const }
      const job2 = { ...mockPrintJob, id: 'job-2', status: 'printing' as const }
      const job3 = { ...mockPrintJob, id: 'job-3', status: 'completed' as const }

      store.addPrintJob(job1)
      store.addPrintJob(job2)
      store.addPrintJob(job3)

      store.clearCompletedJobs()

      expect(store.printQueue).toHaveLength(1)
      expect(store.printQueue[0].id).toBe('job-2')
    })
  })

  describe('clearAllJobs', () => {
    it('should remove all jobs and clear current job', () => {
      const store = usePrintStore()
      store.addPrintJob(mockPrintJob)
      store.addPrintJob({ ...mockPrintJob, id: 'job-2' })
      store.currentPrintJob = mockPrintJob

      store.clearAllJobs()

      expect(store.printQueue).toHaveLength(0)
      expect(store.currentPrintJob).toBeNull()
    })
  })

  describe('getJobById', () => {
    it('should return job by id', () => {
      const store = usePrintStore()
      store.addPrintJob(mockPrintJob)

      const job = store.getJobById('test-job-1')

      expect(job).toBeDefined()
      expect(job?.id).toBe('test-job-1')
    })

    it('should return undefined for non-existent job', () => {
      const store = usePrintStore()

      const job = store.getJobById('non-existent')

      expect(job).toBeUndefined()
    })
  })

  describe('getPendingJobs', () => {
    it('should return only pending jobs', () => {
      const store = usePrintStore()
      const job1 = { ...mockPrintJob, id: 'job-1', status: 'pending' as const }
      const job2 = { ...mockPrintJob, id: 'job-2', status: 'printing' as const }
      const job3 = { ...mockPrintJob, id: 'job-3', status: 'pending' as const }

      store.addPrintJob(job1)
      store.addPrintJob(job2)
      store.addPrintJob(job3)

      const pending = store.getPendingJobs()

      expect(pending).toHaveLength(2)
      expect(pending.every((j) => j.status === 'pending')).toBe(true)
    })
  })

  describe('getActiveJobs', () => {
    it('should return only printing jobs', () => {
      const store = usePrintStore()
      const job1 = { ...mockPrintJob, id: 'job-1', status: 'pending' as const }
      const job2 = { ...mockPrintJob, id: 'job-2', status: 'printing' as const }
      const job3 = { ...mockPrintJob, id: 'job-3', status: 'printing' as const }

      store.addPrintJob(job1)
      store.addPrintJob(job2)
      store.addPrintJob(job3)

      const active = store.getActiveJobs()

      expect(active).toHaveLength(2)
      expect(active.every((j) => j.status === 'printing')).toBe(true)
    })
  })



  describe('localStorage persistence', () => {
    it('should persist changes to localStorage', async () => {
      const store = usePrintStore()

      store.addPrintJob(mockPrintJob)
      store.updateJobStatus('test-job-1', 'printing')

      await vi.waitFor(() => {
        const stored = mockLocalStorage.getItem('bambu_print_queue')
        expect(stored).toBeTruthy()
        const parsed = JSON.parse(stored!)
        expect(parsed[0].status).toBe('printing')
      })
    })

    it('should restore dates correctly from localStorage', () => {
      const jobWithDates = {
        ...mockPrintJob,
        startedAt: new Date('2025-01-01T10:00:00Z'),
        completedAt: new Date('2025-01-01T11:00:00Z'),
      }

      mockLocalStorage.setItem('bambu_print_queue', JSON.stringify([jobWithDates]))

      const store = usePrintStore()

      expect(store.printQueue[0].startedAt).toBeInstanceOf(Date)
      expect(store.printQueue[0].completedAt).toBeInstanceOf(Date)
    })
  })
})
