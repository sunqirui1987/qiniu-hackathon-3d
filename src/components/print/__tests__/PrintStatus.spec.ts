import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import PrintStatus from '../PrintStatus.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import type { PrintJob } from '@/types/print'

describe('PrintStatus', () => {
  let wrapper: VueWrapper<InstanceType<typeof PrintStatus>>
  let mockJob: PrintJob

  beforeEach(() => {
    mockJob = {
      id: '1',
      modelId: 'model-1',
      modelName: 'Test Model',
      status: 'printing',
      progress: 50,
      settings: {
        printer: 'Bambu Lab X1 Carbon',
        material: 'PLA',
        layerHeight: 0.2,
        infillDensity: 20,
        supports: true,
        temperature: 200,
      },
      createdAt: new Date('2024-01-01T10:00:00'),
      startedAt: new Date('2024-01-01T10:30:00'),
    }
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component Rendering', () => {
    it('should render the component', () => {
      wrapper = mount(PrintStatus, {
        props: {
          currentJob: mockJob,
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

    it('should render header', () => {
      wrapper = mount(PrintStatus, {
        props: {
          currentJob: mockJob,
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })

      expect(wrapper.text()).toContain('Current Print Job')
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no job', () => {
      wrapper = mount(PrintStatus, {
        props: {
          currentJob: null,
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })

      expect(wrapper.text()).toContain('No active print job')
    })

    it('should not show progress bar when no job', () => {
      wrapper = mount(PrintStatus, {
        props: {
          currentJob: null,
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

  describe('Job Information Display', () => {
    beforeEach(() => {
      wrapper = mount(PrintStatus, {
        props: {
          currentJob: mockJob,
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

    it('should display model name', () => {
      expect(wrapper.text()).toContain('Test Model')
    })

    it('should display all print settings', () => {
      const text = wrapper.text()
      expect(text).toContain('Bambu Lab X1 Carbon')
      expect(text).toContain('PLA')
      expect(text).toContain('0.2mm')
      expect(text).toContain('20%')
      expect(text).toContain('Yes')
      expect(text).toContain('200°C')
    })

    it('should show "No" for supports when disabled', async () => {
      const jobWithoutSupports = {
        ...mockJob,
        settings: { ...mockJob.settings, supports: false },
      }

      await wrapper.setProps({ currentJob: jobWithoutSupports })
      await nextTick()

      expect(wrapper.text()).toContain('No')
    })
  })

  describe('Status Display', () => {
    it('should show printing status with blue background', () => {
      wrapper = mount(PrintStatus, {
        props: {
          currentJob: mockJob,
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })

      const statusElement = wrapper.find('.bg-blue-100')
      expect(statusElement.exists()).toBe(true)
      expect(statusElement.text()).toContain('Printing')
    })

    it('should show pending status with yellow background', async () => {
      const pendingJob = { ...mockJob, status: 'pending' as const }

      wrapper = mount(PrintStatus, {
        props: {
          currentJob: pendingJob,
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })

      const statusElement = wrapper.find('.bg-yellow-100')
      expect(statusElement.exists()).toBe(true)
      expect(statusElement.text()).toContain('Pending')
    })

    it('should show completed status with green background', () => {
      const completedJob = {
        ...mockJob,
        status: 'completed' as const,
        progress: 100,
        completedAt: new Date('2024-01-01T11:30:00'),
      }

      wrapper = mount(PrintStatus, {
        props: {
          currentJob: completedJob,
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })

      const statusElement = wrapper.find('.bg-green-100')
      expect(statusElement.exists()).toBe(true)
      expect(statusElement.text()).toContain('Completed')
    })

    it('should show failed status with red background', () => {
      const failedJob = { ...mockJob, status: 'failed' as const }

      wrapper = mount(PrintStatus, {
        props: {
          currentJob: failedJob,
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })

      const statusElement = wrapper.find('.bg-red-100')
      expect(statusElement.exists()).toBe(true)
      expect(statusElement.text()).toContain('Failed')
    })
  })

  describe('Progress Display', () => {
    it('should show progress bar when printing', () => {
      wrapper = mount(PrintStatus, {
        props: {
          currentJob: mockJob,
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
      wrapper = mount(PrintStatus, {
        props: {
          currentJob: mockJob,
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

    it('should not show progress bar for completed job', () => {
      const completedJob = {
        ...mockJob,
        status: 'completed' as const,
        progress: 100,
        completedAt: new Date(),
      }

      wrapper = mount(PrintStatus, {
        props: {
          currentJob: completedJob,
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

  describe('Action Buttons', () => {
    it('should show cancel button when printing', () => {
      wrapper = mount(PrintStatus, {
        props: {
          currentJob: mockJob,
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
      const cancelButton = buttons.find((btn) => btn.text() === 'Cancel Print')
      expect(cancelButton).toBeTruthy()
    })

    it('should show clear button when completed', () => {
      const completedJob = {
        ...mockJob,
        status: 'completed' as const,
        completedAt: new Date(),
      }

      wrapper = mount(PrintStatus, {
        props: {
          currentJob: completedJob,
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
      const clearButton = buttons.find((btn) => btn.text() === 'Clear')
      expect(clearButton).toBeTruthy()
    })

    it('should show retry and clear buttons when failed', () => {
      const failedJob = {
        ...mockJob,
        status: 'failed' as const,
      }

      wrapper = mount(PrintStatus, {
        props: {
          currentJob: failedJob,
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
      const retryButton = buttons.find((btn) => btn.text() === 'Retry')
      const clearButton = buttons.find((btn) => btn.text() === 'Clear')
      
      expect(retryButton).toBeTruthy()
      expect(clearButton).toBeTruthy()
    })
  })

  describe('Event Emissions', () => {
    it('should emit cancel event', async () => {
      wrapper = mount(PrintStatus, {
        props: {
          currentJob: mockJob,
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
      const cancelButton = buttons.find((btn) => btn.text() === 'Cancel Print')
      
      await cancelButton?.trigger('click')
      await nextTick()

      expect(wrapper.emitted('cancel')).toBeTruthy()
    })

    it('should emit clear event', async () => {
      const completedJob = {
        ...mockJob,
        status: 'completed' as const,
        completedAt: new Date(),
      }

      wrapper = mount(PrintStatus, {
        props: {
          currentJob: completedJob,
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
      const clearButton = buttons.find((btn) => btn.text() === 'Clear')
      
      await clearButton?.trigger('click')
      await nextTick()

      expect(wrapper.emitted('clear')).toBeTruthy()
    })

    it('should emit retry event', async () => {
      const failedJob = {
        ...mockJob,
        status: 'failed' as const,
      }

      wrapper = mount(PrintStatus, {
        props: {
          currentJob: failedJob,
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
      const retryButton = buttons.find((btn) => btn.text() === 'Retry')
      
      await retryButton?.trigger('click')
      await nextTick()

      expect(wrapper.emitted('retry')).toBeTruthy()
    })
  })

  describe('Completion Display', () => {
    it('should show completion time', () => {
      const completedJob = {
        ...mockJob,
        status: 'completed' as const,
        progress: 100,
        completedAt: new Date('2024-01-01T11:30:00'),
      }

      wrapper = mount(PrintStatus, {
        props: {
          currentJob: completedJob,
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })

      expect(wrapper.text()).toContain('Completed at')
      expect(wrapper.text()).toContain('Total time')
    })
  })

  describe('Reactive Updates', () => {
    it('should update when job prop changes', async () => {
      wrapper = mount(PrintStatus, {
        props: {
          currentJob: mockJob,
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })

      expect(wrapper.text()).toContain('Test Model')

      const newJob = { ...mockJob, modelName: 'New Model' }
      await wrapper.setProps({ currentJob: newJob })
      await nextTick()

      expect(wrapper.text()).toContain('New Model')
    })

    it('should show empty state when job becomes null', async () => {
      wrapper = mount(PrintStatus, {
        props: {
          currentJob: mockJob,
        },
        global: {
          components: {
            Card,
            Button,
            ProgressBar,
          },
        },
      })

      await wrapper.setProps({ currentJob: null })
      await nextTick()

      expect(wrapper.text()).toContain('No active print job')
    })
  })
})
