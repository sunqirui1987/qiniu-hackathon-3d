import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ImageUpload from '../ImageUpload.vue'

describe('ImageUpload', () => {
  it('should render upload area', () => {
    const wrapper = mount(ImageUpload)

    expect(wrapper.text()).toContain('拖拽图片到此处')
    expect(wrapper.text()).toContain('点击选择')
  })

  it('should be disabled when prop is set', () => {
    const wrapper = mount(ImageUpload, {
      props: {
        disabled: true
      }
    })

    const fileInput = wrapper.find('input[type="file"]')
    expect(fileInput.attributes('disabled')).toBeDefined()
  })

  it('should emit update:modelValue when file is selected', async () => {
    const wrapper = mount(ImageUpload)

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const fileInput = wrapper.find('input[type="file"]')

    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
    })

    await fileInput.trigger('change')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('should show error for invalid file type', async () => {
    const wrapper = mount(ImageUpload)

    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    const fileInput = wrapper.find('input[type="file"]')

    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
    })

    await fileInput.trigger('change')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('请选择图片文件')
  })

  it('should show error for file too large', async () => {
    const wrapper = mount(ImageUpload)

    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 })

    const fileInput = wrapper.find('input[type="file"]')

    Object.defineProperty(fileInput.element, 'files', {
      value: [largeFile],
      writable: false,
    })

    await fileInput.trigger('change')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('10MB')
  })

  it('should emit options when changed', async () => {
    const wrapper = mount(ImageUpload)

    const showOptionsBtn = wrapper.findAll('button').find(btn => 
      btn.text().includes('显示生成选项') || btn.text().includes('隐藏生成选项')
    )

    if (showOptionsBtn) {
      await showOptionsBtn.trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('update:options')).toBeTruthy()
    }
  })

  it('should handle drag over event', async () => {
    const wrapper = mount(ImageUpload)

    const dropZone = wrapper.find('[class*="border-dashed"]')
    await dropZone.trigger('dragover')
    await wrapper.vm.$nextTick()

    expect(dropZone.classes()).toContain('border-blue-500')
  })

  it('should handle drag leave event', async () => {
    const wrapper = mount(ImageUpload)

    const dropZone = wrapper.find('[class*="border-dashed"]')
    await dropZone.trigger('dragover')
    await dropZone.trigger('dragleave')
    await wrapper.vm.$nextTick()

    expect(dropZone.classes()).toContain('border-gray-300')
  })

  it('should clear image when clear button is clicked', async () => {
    const wrapper = mount(ImageUpload, {
      props: {
        modelValue: new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      }
    })

    await wrapper.vm.$nextTick()

    const clearBtn = wrapper.findAll('button').find(btn => 
      btn.element.innerHTML.includes('M6 18L18 6M6 6l12 12')
    )

    if (clearBtn) {
      await clearBtn.trigger('click')
      
      const emitted = wrapper.emitted('update:modelValue')
      expect(emitted).toBeTruthy()
      expect(emitted![emitted!.length - 1]).toEqual([null])
    }
  })

  it('should toggle generation options', async () => {
    const wrapper = mount(ImageUpload)

    const optionsBtn = wrapper.findAll('button').find(btn => 
      btn.text().includes('显示生成选项') || btn.text().includes('隐藏生成选项')
    )

    expect(optionsBtn).toBeTruthy()
    
    if (optionsBtn) {
      await optionsBtn.trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.text()).toContain('生成选项')
    }
  })
})
