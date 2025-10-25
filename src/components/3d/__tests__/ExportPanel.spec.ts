import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ExportPanel from '../ExportPanel.vue'

describe('ExportPanel', () => {
  it('should render export panel', () => {
    const wrapper = mount(ExportPanel, {
      props: {
        hasModel: false,
      },
    })
    
    expect(wrapper.text()).toContain('导出模型')
  })

  it('should show warning when no model is loaded', () => {
    const wrapper = mount(ExportPanel, {
      props: {
        hasModel: false,
      },
    })
    
    expect(wrapper.text()).toContain('请先加载模型')
  })

  it('should show export options when model is loaded', () => {
    const wrapper = mount(ExportPanel, {
      props: {
        hasModel: true,
      },
    })
    
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('STL')
    expect(wrapper.text()).toContain('GLB')
    expect(wrapper.text()).toContain('OBJ')
    expect(wrapper.text()).toContain('GLTF')
  })

  it('should allow changing file name', async () => {
    const wrapper = mount(ExportPanel, {
      props: {
        hasModel: true,
      },
    })
    
    const input = wrapper.find('input[type="text"]')
    await input.setValue('my-model')
    
    expect((input.element as HTMLInputElement).value).toBe('my-model')
  })

  it('should emit export event with correct parameters', async () => {
    const wrapper = mount(ExportPanel, {
      props: {
        hasModel: true,
      },
    })
    
    const input = wrapper.find('input[type="text"]')
    await input.setValue('my-model')
    
    const formatButtons = wrapper.findAll('button')
    const glbButton = formatButtons.find(btn => btn.text().includes('GLB'))
    await glbButton?.trigger('click')
    
    const exportButton = formatButtons.find(btn => btn.text().includes('导出模型'))
    await exportButton?.trigger('click')
    
    expect(wrapper.emitted('export')).toBeTruthy()
    expect(wrapper.emitted('export')?.[0]).toEqual(['glb', 'my-model'])
  })

  it('should support all export formats', async () => {
    const wrapper = mount(ExportPanel, {
      props: {
        hasModel: true,
      },
    })
    
    const formatButtons = wrapper.findAll('button')
    
    expect(formatButtons.some(btn => btn.text().includes('STL'))).toBe(true)
    expect(formatButtons.some(btn => btn.text().includes('GLB'))).toBe(true)
    expect(formatButtons.some(btn => btn.text().includes('OBJ'))).toBe(true)
    expect(formatButtons.some(btn => btn.text().includes('GLTF'))).toBe(true)
  })
})
