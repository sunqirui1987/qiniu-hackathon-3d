import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import PrintQueue from '../PrintQueue.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import type { PrintJob } from '@/types/print'

describe('PrintQueue', () => {
  let wrapper: VueWrapper<InstanceType<typeof PrintQueue>>
  let mockQueue: PrintJob[]

  beforeEach(() => {
    mockQueue = [
      {
        id: '1',
        modelId: 'model-1',
        modelName: 'Test Model 1',
        status: 'pending',
        progress: 0,
        settings: {
          printer: 'Bambu Lab X1 Carbon',
          material: 'PLA',
          layerHeight: 0.2,
          infillDensity: 20,
          supports: true,
        },
        createdAt: new Date('2024-01-01T10:00:00'),
      },
      {
        id: '2',
        modelId: 'model-2',
        modelName: 'Test Model 2',
        status: 'printing',
        progress: 50,
        settings: {
          printer: 'Bambu Lab P1P',
          material: 'ABS',
          layerHeight: 0.15,
          infillDensity: 30,
          supports: false,
        },
        createdAt: new Date('2024-01-01T09:00:00'),
        startedAt: new Date('2024-01-01T09:30:00'),
      },
    ]
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component Rendering', () => {
    it('should render the component', () => {
      wrapper = mount(PrintQueue, {
        props: {
          queue: mockQueue,
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should render queue header', () => {
      wrapper = mount(PrintQueue, {
        props: {
          queue: mockQueue,
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })

      expect(wrapper.text()).toContain('Print Queue')
    })

    it('should display job count', () => {
      wrapper = mount(PrintQueue, {
        props: {
          queue: mockQueue,
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })

      expect(wrapper.text()).toContain('2 jobs')
    })
  })

  describe('Empty State', () => {
    it('should show empty state when queue is empty', () => {
      wrapper = mount(PrintQueue, {
        props: {
          queue: [],
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })

      expect(wrapper.text()).toContain('No print jobs in queue')
    })

    it('should not show footer buttons when queue is empty', () => {
      wrapper = mount(PrintQueue, {
        props: {
          queue: [],
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })

      const buttons = wrapper.findAllComponents(Button)
      expect(buttons.length).toBe(0)
    })
  })

  describe('Job Display', () => {
    beforeEach(() => {
      wrapper = mount(PrintQueue, {
        props: {
          queue: mockQueue,
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })
    })

    it('should display all jobs', () => {
      expect(wrapper.text()).toContain('Test Model 1')
      expect(wrapper.text()).toContain('Test Model 2')
    })

    it('should display job settings', () => {
      expect(wrapper.text()).toContain('Bambu Lab X1 Carbon')
      expect(wrapper.text()).toContain('PLA')
      expect(wrapper.text()).toContain('0.2mm')
      expect(wrapper.text()).toContain('20%')
    })

    it('should display correct status badge', () => {
      const text = wrapper.text()
      expect(text).toContain('Pending')
      expect(text).toContain('Printing')
    })
  })

  describe('Status Display', () => {
    it('should show pending status with yellow badge', () => {
      wrapper = mount(PrintQueue, {
        props: {
          queue: [mockQueue[0]],
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })

      const badge = wrapper.find('.bg-yellow-100')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toContain('Pending')
    })

    it('should show printing status with blue badge', () => {
      wrapper = mount(PrintQueue, {
        props: {
          queue: [mockQueue[1]],
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })

      const badge = wrapper.find('.bg-blue-100')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toContain('Printing')
    })

    it('should show completed status with green badge', () => {
      const completedJob: PrintJob = {
        ...mockQueue[0],
        status: 'completed',
        progress: 100,
      }

      wrapper = mount(PrintQueue, {
        props: {
          queue: [completedJob],
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })

      const badge = wrapper.find('.bg-green-100')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toContain('Completed')
    })

    it('should show failed status with red badge', () => {
      const failedJob: PrintJob = {
        ...mockQueue[0],
        status: 'failed',
      }

      wrapper = mount(PrintQueue, {
        props: {
          queue: [failedJob],
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })

      const badge = wrapper.find('.bg-red-100')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toContain('Failed')
    })
  })

  describe('Progress Display', () => {
    it('should show progress bar for printing jobs', () => {
      wrapper = mount(PrintQueue, {
        props: {
          queue: [mockQueue[1]],
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })

      const progressBar = wrapper.findComponent(ProgressBar)
      expect(progressBar.exists()).toBe(true)
      expect(progressBar.props('progress')).toBe(50)
    })

    it('should show progress percentage', () => {
      wrapper = mount(PrintQueue, {
        props: {
          queue: [mockQueue[1]],
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })

      expect(wrapper.text()).toContain('50%')
    })

    it('should not show progress bar for pending jobs', () => {
      wrapper = mount(PrintQueue, {
        props: {
          queue: [mockQueue[0]],
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })

      const progressBar = wrapper.findComponent(ProgressBar)
      expect(progressBar.exists()).toBe(false)
    })
  })

  describe('Job Actions', () => {
    beforeEach(() => {
      wrapper = mount(PrintQueue, {
        props: {
          queue: mockQueue,
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })
    })

    it('should show start button for pending jobs', () => {
      const buttons = wrapper.findAllComponents(Button)
      const startButton = buttons.find((btn) => btn.text() === 'Start')
      expect(startButton).toBeTruthy()
    })

    it('should show remove button for all jobs', () => {
      const buttons = wrapper.findAllComponents(Button)
      const removeButtons = buttons.filter((btn) => btn.text() === 'Remove')
      expect(removeButtons.length).toBeGreaterThan(0)
    })

    it('should emit start event when start button clicked', async () => {
      const buttons = wrapper.findAllComponents(Button)
      const startButton = buttons.find((btn) => btn.text() === 'Start')
      
      await startButton?.trigger('click')
      await nextTick()

      expect(wrapper.emitted('start')).toBeTruthy()
      expect(wrapper.emitted('start')?.[0]).toEqual(['1'])
    })

    it('should emit remove event when remove button clicked', async () => {
      const buttons = wrapper.findAllComponents(Button)
      const removeButton = buttons.find((btn) => btn.text() === 'Remove')
      
      await removeButton?.trigger('click')
      await nextTick()

      expect(wrapper.emitted('remove')).toBeTruthy()
    })
  })

  describe('Queue Actions', () => {
    beforeEach(() => {
      wrapper = mount(PrintQueue, {
        props: {
          queue: mockQueue,
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })
    })

    it('should show clear completed button', () => {
      const buttons = wrapper.findAllComponents(Button)
      const clearCompletedButton = buttons.find((btn) => btn.text() === 'Clear Completed')
      expect(clearCompletedButton).toBeTruthy()
    })

    it('should show clear all button', () => {
      const buttons = wrapper.findAllComponents(Button)
      const clearAllButton = buttons.find((btn) => btn.text() === 'Clear All')
      expect(clearAllButton).toBeTruthy()
    })

    it('should emit clearCompleted event', async () => {
      const buttons = wrapper.findAllComponents(Button)
      const clearCompletedButton = buttons.find((btn) => btn.text() === 'Clear Completed')
      
      await clearCompletedButton?.trigger('click')
      await nextTick()

      expect(wrapper.emitted('clearCompleted')).toBeTruthy()
    })

    it('should emit clearAll event', async () => {
      const buttons = wrapper.findAllComponents(Button)
      const clearAllButton = buttons.find((btn) => btn.text() === 'Clear All')
      
      await clearAllButton?.trigger('click')
      await nextTick()

      expect(wrapper.emitted('clearAll')).toBeTruthy()
    })
  })

  describe('Singular/Plural Job Count', () => {
    it('should display "job" for single job', () => {
      wrapper = mount(PrintQueue, {
        props: {
          queue: [mockQueue[0]],
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })

      expect(wrapper.text()).toContain('1 job')
    })

    it('should display "jobs" for multiple jobs', () => {
      wrapper = mount(PrintQueue, {
        props: {
          queue: mockQueue,
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })

      expect(wrapper.text()).toContain('2 jobs')
    })
  })

  describe('Reactive Updates', () => {
    it('should update when queue prop changes', async () => {
      wrapper = mount(PrintQueue, {
        props: {
          queue: [mockQueue[0]],
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })

      expect(wrapper.text()).toContain('1 job')

      await wrapper.setProps({ queue: mockQueue })
      await nextTick()

      expect(wrapper.text()).toContain('2 jobs')
    })

    it('should show empty state when queue becomes empty', async () => {
      wrapper = mount(PrintQueue, {
        props: {
          queue: mockQueue,
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })

      await wrapper.setProps({ queue: [] })
      await nextTick()

      expect(wrapper.text()).toContain('No print jobs in queue')
    })
  })
})
