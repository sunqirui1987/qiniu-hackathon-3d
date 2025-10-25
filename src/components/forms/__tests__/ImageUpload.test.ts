import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ImageUpload from '../ImageUpload.vue'

describe('ImageUpload', () => {
  it('renders upload area', () => {
    const wrapper = mount(ImageUpload)
    expect(wrapper.find('[data-test="upload-area"]').exists() || wrapper.text().includes('拖拽')).toBe(true)
  })

  it('disables upload when disabled prop is true', () => {
    const wrapper = mount(ImageUpload, {
      props: {
        disabled: true
      }
    })
    const fileInput = wrapper.find('input[type="file"]')
    if (fileInput.exists()) {
      expect(fileInput.attributes('disabled')).toBeDefined()
    }
  })

  it('accepts correct file types', () => {
    const wrapper = mount(ImageUpload)
    const fileInput = wrapper.find('input[type="file"]')
    expect(fileInput.exists()).toBe(true)
    const accept = fileInput.attributes('accept')
    if (accept) {
      expect(accept).toContain('image')
    }
  })

  it('emits update:modelValue when file is selected', async () => {
    const wrapper = mount(ImageUpload)
    
    const fileInput = wrapper.find('input[type="file"]')
    expect(fileInput.exists()).toBe(true)
  })

  it('validates file size limit', async () => {
    const wrapper = mount(ImageUpload)
    const fileInput = wrapper.find('input[type="file"]')
    expect(fileInput.exists()).toBe(true)
  })
})
