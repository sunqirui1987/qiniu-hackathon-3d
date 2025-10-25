import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import FileImport from '../FileImport.vue'

describe('FileImport.vue', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mount(FileImport)
  })

  describe('Rendering', () => {
    it('renders the component title', () => {
      expect(wrapper.find('h3').text()).toBe('导入模型')
    })

    it('renders the upload area with instructions', () => {
      const uploadArea = wrapper.find('.border-dashed')
      expect(uploadArea.exists()).toBe(true)
      expect(wrapper.text()).toContain('拖拽文件到此处或点击选择')
      expect(wrapper.text()).toContain('支持格式: GLB, GLTF, STL, OBJ')
    })

    it('renders upload icon', () => {
      const icon = wrapper.find('svg')
      expect(icon.exists()).toBe(true)
    })

    it('renders hidden file input', () => {
      const fileInput = wrapper.find('input[type="file"]')
      expect(fileInput.exists()).toBe(true)
      expect(fileInput.classes()).toContain('hidden')
      expect(fileInput.attributes('accept')).toBe('.glb,.gltf,.stl,.obj')
    })

    it('does not show error message initially', () => {
      expect(wrapper.find('.bg-red-50').exists()).toBe(false)
    })
  })

  describe('File Selection', () => {
    it('opens file dialog when upload area is clicked', async () => {
      const fileInput = wrapper.find('input[type="file"]')
      const clickSpy = vi.spyOn(fileInput.element as HTMLInputElement, 'click')
      
      const uploadArea = wrapper.find('.border-dashed')
      await uploadArea.trigger('click')
      
      expect(clickSpy).toHaveBeenCalled()
    })

    it('emits fileSelected event with valid GLB file', async () => {
      const file = new File(['glb content'], 'test-model.glb', { type: 'model/gltf-binary' })
      const fileInput = wrapper.find('input[type="file"]')
      
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false,
      })
      
      await fileInput.trigger('change')
      
      expect(wrapper.emitted('fileSelected')).toBeTruthy()
      expect(wrapper.emitted('fileSelected')?.[0]).toEqual([file])
    })

    it('emits fileSelected event with valid GLTF file', async () => {
      const file = new File(['gltf content'], 'test-model.gltf', { type: 'model/gltf+json' })
      const fileInput = wrapper.find('input[type="file"]')
      
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false,
      })
      
      await fileInput.trigger('change')
      
      expect(wrapper.emitted('fileSelected')).toBeTruthy()
      expect(wrapper.emitted('fileSelected')?.[0]).toEqual([file])
    })

    it('emits fileSelected event with valid STL file', async () => {
      const file = new File(['stl content'], 'test-model.stl', { type: 'application/octet-stream' })
      const fileInput = wrapper.find('input[type="file"]')
      
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false,
      })
      
      await fileInput.trigger('change')
      
      expect(wrapper.emitted('fileSelected')).toBeTruthy()
      expect(wrapper.emitted('fileSelected')?.[0]).toEqual([file])
    })

    it('emits fileSelected event with valid OBJ file', async () => {
      const file = new File(['obj content'], 'test-model.obj', { type: 'text/plain' })
      const fileInput = wrapper.find('input[type="file"]')
      
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false,
      })
      
      await fileInput.trigger('change')
      
      expect(wrapper.emitted('fileSelected')).toBeTruthy()
      expect(wrapper.emitted('fileSelected')?.[0]).toEqual([file])
    })

    it('resets file input value after selection', async () => {
      const file = new File(['content'], 'test-model.glb', { type: 'model/gltf-binary' })
      const fileInput = wrapper.find('input[type="file"]')
      
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false,
      })
      
      await fileInput.trigger('change')
      
      expect((fileInput.element as HTMLInputElement).value).toBe('')
    })
  })

  describe('File Validation', () => {
    it('shows error for unsupported file format', async () => {
      const file = new File(['content'], 'test-file.pdf', { type: 'application/pdf' })
      const fileInput = wrapper.find('input[type="file"]')
      
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false,
      })
      
      await fileInput.trigger('change')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.emitted('fileSelected')).toBeFalsy()
      expect(wrapper.find('.bg-red-50').exists()).toBe(true)
      expect(wrapper.text()).toContain('不支持的文件格式')
    })

    it('shows error for file exceeding size limit', async () => {
      const largeContent = new Array(101 * 1024 * 1024).fill('a').join('')
      const file = new File([largeContent], 'large-model.glb', { type: 'model/gltf-binary' })
      const fileInput = wrapper.find('input[type="file"]')
      
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false,
      })
      
      await fileInput.trigger('change')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.emitted('fileSelected')).toBeFalsy()
      expect(wrapper.find('.bg-red-50').exists()).toBe(true)
      expect(wrapper.text()).toContain('文件过大')
    })

    it('accepts files with uppercase extensions', async () => {
      const file = new File(['content'], 'test-model.GLB', { type: 'model/gltf-binary' })
      const fileInput = wrapper.find('input[type="file"]')
      
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false,
      })
      
      await fileInput.trigger('change')
      
      expect(wrapper.emitted('fileSelected')).toBeTruthy()
      expect(wrapper.find('.bg-red-50').exists()).toBe(false)
    })

    it('clears previous error when valid file is selected', async () => {
      const invalidFile = new File(['content'], 'test-file.pdf', { type: 'application/pdf' })
      const fileInput = wrapper.find('input[type="file"]')
      
      Object.defineProperty(fileInput.element, 'files', {
        value: [invalidFile],
        writable: false,
      })
      
      await fileInput.trigger('change')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.bg-red-50').exists()).toBe(true)
      
      const validFile = new File(['content'], 'test-model.glb', { type: 'model/gltf-binary' })
      Object.defineProperty(fileInput.element, 'files', {
        value: [validFile],
        writable: false,
      })
      
      await fileInput.trigger('change')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.bg-red-50').exists()).toBe(false)
    })
  })

  describe('Drag and Drop', () => {
    it('highlights upload area on drag over', async () => {
      const uploadArea = wrapper.find('.border-dashed')
      
      expect(uploadArea.classes()).not.toContain('border-blue-500')
      
      const dragEvent = new Event('dragover', { bubbles: true })
      await uploadArea.element.dispatchEvent(dragEvent)
      await wrapper.vm.$nextTick()
      
      expect(uploadArea.classes()).toContain('border-blue-500')
      expect(uploadArea.classes()).toContain('bg-blue-50')
    })

    it('removes highlight on drag leave', async () => {
      const uploadArea = wrapper.find('.border-dashed')
      
      const dragOverEvent = new Event('dragover', { bubbles: true })
      await uploadArea.element.dispatchEvent(dragOverEvent)
      await wrapper.vm.$nextTick()
      
      expect(uploadArea.classes()).toContain('border-blue-500')
      
      const dragLeaveEvent = new Event('dragleave', { bubbles: true })
      await uploadArea.element.dispatchEvent(dragLeaveEvent)
      await wrapper.vm.$nextTick()
      
      expect(uploadArea.classes()).not.toContain('border-blue-500')
    })

    it('emits fileSelected event on valid file drop', async () => {
      const uploadArea = wrapper.find('.border-dashed')
      const file = new File(['content'], 'test-model.glb', { type: 'model/gltf-binary' })
      
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        dataTransfer: new DataTransfer(),
      })
      
      if (dropEvent.dataTransfer) {
        dropEvent.dataTransfer.items.add(file)
      }
      
      await uploadArea.element.dispatchEvent(dropEvent)
      await wrapper.vm.$nextTick()
      
      expect(wrapper.emitted('fileSelected')).toBeTruthy()
    })

    it('shows error on invalid file drop', async () => {
      const uploadArea = wrapper.find('.border-dashed')
      const file = new File(['content'], 'test-file.pdf', { type: 'application/pdf' })
      
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        dataTransfer: new DataTransfer(),
      })
      
      if (dropEvent.dataTransfer) {
        dropEvent.dataTransfer.items.add(file)
      }
      
      await uploadArea.element.dispatchEvent(dropEvent)
      await wrapper.vm.$nextTick()
      
      expect(wrapper.emitted('fileSelected')).toBeFalsy()
      expect(wrapper.find('.bg-red-50').exists()).toBe(true)
    })

    it('removes highlight after file drop', async () => {
      const uploadArea = wrapper.find('.border-dashed')
      const file = new File(['content'], 'test-model.glb', { type: 'model/gltf-binary' })
      
      const dragOverEvent = new Event('dragover', { bubbles: true })
      await uploadArea.element.dispatchEvent(dragOverEvent)
      await wrapper.vm.$nextTick()
      
      expect(uploadArea.classes()).toContain('border-blue-500')
      
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        dataTransfer: new DataTransfer(),
      })
      
      if (dropEvent.dataTransfer) {
        dropEvent.dataTransfer.items.add(file)
      }
      
      await uploadArea.element.dispatchEvent(dropEvent)
      await wrapper.vm.$nextTick()
      
      expect(uploadArea.classes()).not.toContain('border-blue-500')
    })
  })

  describe('UI States', () => {
    it('applies hover styles to upload area', () => {
      const uploadArea = wrapper.find('.border-dashed')
      expect(uploadArea.classes()).toContain('hover:border-blue-500')
      expect(uploadArea.classes()).toContain('hover:bg-blue-50')
    })

    it('shows cursor pointer on upload area', () => {
      const uploadArea = wrapper.find('.border-dashed')
      expect(uploadArea.classes()).toContain('cursor-pointer')
    })

    it('displays error message with correct styling', async () => {
      const file = new File(['content'], 'test-file.pdf', { type: 'application/pdf' })
      const fileInput = wrapper.find('input[type="file"]')
      
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false,
      })
      
      await fileInput.trigger('change')
      await wrapper.vm.$nextTick()
      
      const errorBox = wrapper.find('.bg-red-50')
      expect(errorBox.exists()).toBe(true)
      expect(errorBox.classes()).toContain('border')
      expect(errorBox.classes()).toContain('border-red-200')
      expect(errorBox.classes()).toContain('rounded-lg')
    })
  })

  describe('Accessibility', () => {
    it('has correct accept attribute on file input', () => {
      const fileInput = wrapper.find('input[type="file"]')
      expect(fileInput.attributes('accept')).toBe('.glb,.gltf,.stl,.obj')
    })

    it('displays supported formats in upload instructions', () => {
      expect(wrapper.text()).toContain('GLB')
      expect(wrapper.text()).toContain('GLTF')
      expect(wrapper.text()).toContain('STL')
      expect(wrapper.text()).toContain('OBJ')
    })
  })

  describe('Edge Cases', () => {
    it('handles file without extension', async () => {
      const file = new File(['content'], 'model', { type: 'model/gltf-binary' })
      const fileInput = wrapper.find('input[type="file"]')
      
      Object.defineProperty(fileInput.element, 'files', {
        value: [file],
        writable: false,
      })
      
      await fileInput.trigger('change')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.emitted('fileSelected')).toBeFalsy()
      expect(wrapper.find('.bg-red-50').exists()).toBe(true)
    })

    it('handles null file selection', async () => {
      const fileInput = wrapper.find('input[type="file"]')
      
      Object.defineProperty(fileInput.element, 'files', {
        value: null,
        writable: false,
      })
      
      await fileInput.trigger('change')
      
      expect(wrapper.emitted('fileSelected')).toBeFalsy()
    })

    it('handles empty file list', async () => {
      const fileInput = wrapper.find('input[type="file"]')
      
      Object.defineProperty(fileInput.element, 'files', {
        value: [],
        writable: false,
      })
      
      await fileInput.trigger('change')
      
      expect(wrapper.emitted('fileSelected')).toBeFalsy()
    })
  })
})
