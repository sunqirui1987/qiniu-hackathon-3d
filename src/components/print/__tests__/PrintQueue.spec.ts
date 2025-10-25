import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PrintQueue from '../PrintQueue.vue'
import { usePrintStore } from '@/stores/print'
import type { PrintJob } from '@/types/print'

describe('PrintQueue.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render component correctly', () => {
    const wrapper = mount(PrintQueue)

    expect(wrapper.find('.print-queue').exists()).toBe(true)
  })

  it('should show empty state when no jobs in queue', () => {
    const wrapper = mount(PrintQueue)

    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('暂无打印任务')
  })

  it('should display print jobs correctly', () => {
    const printStore = usePrintStore()

    const testJob: PrintJob = {
      id: '1',
      modelId: 'model-1',
      modelName: 'Test Model',
      status: 'pending',
      progress: 0,
      settings: {
        printer: 'Bambu X1',
        material: 'PLA',
        layerHeight: 0.2,
        infillDensity: 20,
        supports: false
      },
      createdAt: new Date()
    }

    printStore.addPrintJob(testJob)

    const wrapper = mount(PrintQueue)

    expect(wrapper.find('.queue-list').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Model')
    expect(wrapper.text()).toContain('PLA')
    expect(wrapper.text()).toContain('0.2mm')
    expect(wrapper.text()).toContain('20%')
  })

  it('should display correct status text', () => {
    const printStore = usePrintStore()

    printStore.addPrintJob({
      id: '1',
      modelId: 'model-1',
      modelName: 'Test Model',
      status: 'printing',
      progress: 50,
      settings: {
        printer: 'Bambu X1',
        material: 'PLA',
        layerHeight: 0.2,
        infillDensity: 20,
        supports: false
      },
      createdAt: new Date()
    })

    const wrapper = mount(PrintQueue)

    expect(wrapper.text()).toContain('打印中')
  })

  it('should show progress bar for printing jobs', () => {
    const printStore = usePrintStore()

    printStore.addPrintJob({
      id: '1',
      modelId: 'model-1',
      modelName: 'Test Model',
      status: 'printing',
      progress: 50,
      settings: {
        printer: 'Bambu X1',
        material: 'PLA',
        layerHeight: 0.2,
        infillDensity: 20,
        supports: false
      },
      createdAt: new Date()
    })

    const wrapper = mount(PrintQueue)

    expect(wrapper.find('.progress-section').exists()).toBe(true)
    expect(wrapper.text()).toContain('50%')
  })

  it('should remove job when delete button is clicked', async () => {
    const printStore = usePrintStore()

    printStore.addPrintJob({
      id: '1',
      modelId: 'model-1',
      modelName: 'Test Model',
      status: 'pending',
      progress: 0,
      settings: {
        printer: 'Bambu X1',
        material: 'PLA',
        layerHeight: 0.2,
        infillDensity: 20,
        supports: false
      },
      createdAt: new Date()
    })

    const wrapper = mount(PrintQueue)

    expect(wrapper.find('.queue-item').exists()).toBe(true)

    await wrapper.find('button').trigger('click')

    expect(printStore.printQueue.length).toBe(0)
  })

  it('should display correct count of jobs', () => {
    const printStore = usePrintStore()

    printStore.addPrintJob({
      id: '1',
      modelId: 'model-1',
      modelName: 'Test Model 1',
      status: 'pending',
      progress: 0,
      settings: {
        printer: 'Bambu X1',
        material: 'PLA',
        layerHeight: 0.2,
        infillDensity: 20,
        supports: false
      },
      createdAt: new Date()
    })

    printStore.addPrintJob({
      id: '2',
      modelId: 'model-2',
      modelName: 'Test Model 2',
      status: 'pending',
      progress: 0,
      settings: {
        printer: 'Bambu X1',
        material: 'PLA',
        layerHeight: 0.2,
        infillDensity: 20,
        supports: false
      },
      createdAt: new Date()
    })

    const wrapper = mount(PrintQueue)

    expect(wrapper.text()).toContain('共 2 个任务')
  })

  it('should apply correct status class to job items', () => {
    const printStore = usePrintStore()

    printStore.addPrintJob({
      id: '1',
      modelId: 'model-1',
      modelName: 'Test Model',
      status: 'completed',
      progress: 100,
      settings: {
        printer: 'Bambu X1',
        material: 'PLA',
        layerHeight: 0.2,
        infillDensity: 20,
        supports: false
      },
      createdAt: new Date()
    })

    const wrapper = mount(PrintQueue)

    expect(wrapper.find('.queue-item').classes()).toContain('border-green-200')
  })
})
