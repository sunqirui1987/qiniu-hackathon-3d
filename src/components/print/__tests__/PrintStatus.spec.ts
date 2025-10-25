import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PrintStatus from '../PrintStatus.vue'
import { usePrintStore } from '@/stores/print'

describe('PrintStatus.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render component correctly', () => {
    const wrapper = mount(PrintStatus)

    expect(wrapper.find('.print-status').exists()).toBe(true)
  })

  it('should show empty state when no current job', () => {
    const wrapper = mount(PrintStatus)

    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('暂无进行中的打印任务')
  })

  it('should display current job when available', () => {
    const printStore = usePrintStore()

    printStore.currentPrintJob = {
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
        supports: false,
        temperature: 200
      },
      createdAt: new Date(),
      startedAt: new Date()
    }

    const wrapper = mount(PrintStatus)

    expect(wrapper.find('.current-job').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Model')
    expect(wrapper.text()).toContain('Bambu X1')
    expect(wrapper.text()).toContain('PLA')
    expect(wrapper.text()).toContain('0.2mm')
    expect(wrapper.text()).toContain('20%')
  })

  it('should show progress bar when job is printing', () => {
    const printStore = usePrintStore()

    printStore.currentPrintJob = {
      id: '1',
      modelId: 'model-1',
      modelName: 'Test Model',
      status: 'printing',
      progress: 75,
      settings: {
        printer: 'Bambu X1',
        material: 'PLA',
        layerHeight: 0.2,
        infillDensity: 20,
        supports: false
      },
      createdAt: new Date(),
      startedAt: new Date()
    }

    const wrapper = mount(PrintStatus)

    expect(wrapper.find('.progress-section').exists()).toBe(true)
    expect(wrapper.text()).toContain('75%')
  })

  it('should display correct status badge', () => {
    const printStore = usePrintStore()

    printStore.currentPrintJob = {
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
      createdAt: new Date(),
      startedAt: new Date(),
      completedAt: new Date()
    }

    const wrapper = mount(PrintStatus)

    expect(wrapper.find('.status-badge').exists()).toBe(true)
    expect(wrapper.text()).toContain('已完成')
    expect(wrapper.find('.status-badge').classes()).toContain('bg-green-100')
  })

  it('should display start and completion time', () => {
    const printStore = usePrintStore()

    const startedAt = new Date('2024-01-01T10:00:00')
    const completedAt = new Date('2024-01-01T12:00:00')

    printStore.currentPrintJob = {
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
      createdAt: new Date(),
      startedAt: startedAt,
      completedAt: completedAt
    }

    const wrapper = mount(PrintStatus)

    expect(wrapper.find('.time-info').exists()).toBe(true)
    expect(wrapper.text()).toContain('开始时间')
    expect(wrapper.text()).toContain('完成时间')
  })

  it('should not show progress bar when job is not printing', () => {
    const printStore = usePrintStore()

    printStore.currentPrintJob = {
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

    const wrapper = mount(PrintStatus)

    expect(wrapper.find('.progress-section').exists()).toBe(false)
  })

  it('should display status badge with correct color for different statuses', () => {
    const printStore = usePrintStore()

    printStore.currentPrintJob = {
      id: '1',
      modelId: 'model-1',
      modelName: 'Test Model',
      status: 'failed',
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

    const wrapper = mount(PrintStatus)

    expect(wrapper.find('.status-badge').classes()).toContain('bg-red-100')
    expect(wrapper.text()).toContain('失败')
  })
})
