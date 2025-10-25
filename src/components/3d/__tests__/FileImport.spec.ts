import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FileImport from '../FileImport.vue'

describe('FileImport', () => {
  it('should render drag and drop area', () => {
    const wrapper = mount(FileImport)
    
    expect(wrapper.find('.border-dashed').exists()).toBe(true)
    expect(wrapper.text()).toContain('拖拽文件到此处或点击选择')
    expect(wrapper.text()).toContain('支持格式: GLB, GLTF, STL, OBJ')
  })

  it('should emit fileSelected event when file is selected', async () => {
    const wrapper = mount(FileImport)
    
    const file = new File(['content'], 'test.glb', { type: 'model/gltf-binary' })
    const input = wrapper.find('input[type="file"]')
    
    Object.defineProperty(input.element, 'files', {
      value: [file],
      writable: false,
    })
    
    await input.trigger('change')
    
    expect(wrapper.emitted('fileSelected')).toBeTruthy()
    expect(wrapper.emitted('fileSelected')?.[0]).toEqual([file])
  })

  it('should accept valid file extensions', async () => {
    const wrapper = mount(FileImport)
    
    const validFiles = [
      new File(['content'], 'test.glb', { type: 'model/gltf-binary' }),
      new File(['content'], 'test.gltf', { type: 'model/gltf+json' }),
      new File(['content'], 'test.stl', { type: 'model/stl' }),
      new File(['content'], 'test.obj', { type: 'model/obj' }),
    ]
    
    for (const file of validFiles) {
      const input = wrapper.find('input[type="file"]')
      Object.defineProperty(input.element, 'files', {
        value: [file],
        writable: false,
      })
      
      await input.trigger('change')
      
      expect(wrapper.emitted('fileSelected')).toBeTruthy()
    }
  })

  it('should reject invalid file extensions', async () => {
    const wrapper = mount(FileImport)
    
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    const input = wrapper.find('input[type="file"]')
    
    Object.defineProperty(input.element, 'files', {
      value: [file],
      writable: false,
    })
    
    await input.trigger('change')
    
    expect(wrapper.emitted('fileSelected')).toBeFalsy()
    expect(wrapper.text()).toContain('不支持的文件格式')
  })
})
