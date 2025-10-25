import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import ExportPanel from '../ExportPanel.vue'

describe('ExportPanel.vue', () => {
  let wrapper: VueWrapper

  describe('Without Model', () => {
    beforeEach(() => {
      wrapper = mount(ExportPanel, {
        props: {
          hasModel: false,
        },
      })
    })

    it('renders the component title', () => {
      expect(wrapper.find('h3').text()).toBe('导出模型')
    })

    it('shows placeholder message when no model is loaded', () => {
      expect(wrapper.find('.text-center.py-8').exists()).toBe(true)
      expect(wrapper.text()).toContain('请先加载模型')
    })

    it('shows warning icon when no model is loaded', () => {
      const icon = wrapper.find('svg')
      expect(icon.exists()).toBe(true)
    })

    it('does not show export controls when no model is loaded', () => {
      expect(wrapper.find('input[type="text"]').exists()).toBe(false)
      expect(wrapper.find('button').exists()).toBe(false)
    })
  })

  describe('With Model', () => {
    beforeEach(() => {
      wrapper = mount(ExportPanel, {
        props: {
          hasModel: true,
        },
      })
    })

    describe('Rendering', () => {
      it('shows export controls when model is loaded', () => {
        expect(wrapper.find('input[type="text"]').exists()).toBe(true)
        expect(wrapper.find('button').exists()).toBe(true)
      })

      it('renders file name input with default value', () => {
        const fileNameInput = wrapper.find('input[type="text"]')
        expect(fileNameInput.exists()).toBe(true)
        expect((fileNameInput.element as HTMLInputElement).value).toBe('model')
      })

      it('renders all export format options', () => {
        const formatButtons = wrapper.findAll('button[class*="border-2"]')
        expect(formatButtons.length).toBe(4)
        
        const formats = formatButtons.map(btn => btn.text())
        expect(formats).toContain('STL')
        expect(formats).toContain('GLB')
        expect(formats).toContain('OBJ')
        expect(formats).toContain('GLTF')
      })

      it('shows format descriptions', () => {
        expect(wrapper.text()).toContain('用于3D打印')
        expect(wrapper.text()).toContain('通用3D格式')
        expect(wrapper.text()).toContain('传统3D格式')
        expect(wrapper.text()).toContain('Web 3D格式')
      })

      it('renders export button with correct initial text', () => {
        const exportButton = wrapper.find('button[class*="bg-blue-600"]')
        expect(exportButton.exists()).toBe(true)
        expect(exportButton.text()).toContain('导出模型')
      })

      it('shows export icon on button', () => {
        const exportButton = wrapper.find('button[class*="bg-blue-600"]')
        const icon = exportButton.find('svg')
        expect(icon.exists()).toBe(true)
      })
    })

    describe('File Name Input', () => {
      it('allows user to change file name', async () => {
        const fileNameInput = wrapper.find('input[type="text"]')
        await fileNameInput.setValue('my-custom-model')
        
        expect((fileNameInput.element as HTMLInputElement).value).toBe('my-custom-model')
      })

      it('has correct placeholder', () => {
        const fileNameInput = wrapper.find('input[type="text"]')
        expect(fileNameInput.attributes('placeholder')).toBe('model')
      })

      it('trims whitespace from file name before export', async () => {
        const fileNameInput = wrapper.find('input[type="text"]')
        await fileNameInput.setValue('  model-with-spaces  ')
        
        const exportButton = wrapper.find('button[class*="bg-blue-600"]')
        await exportButton.trigger('click')
        
        expect(wrapper.emitted('export')?.[0]).toEqual(['stl', 'model-with-spaces'])
      })
    })

    describe('Format Selection', () => {
      it('selects STL format by default', () => {
        const formatButtons = wrapper.findAll('button[class*="border-2"]')
        const stlButton = formatButtons.find(btn => btn.text().includes('STL'))
        
        expect(stlButton?.classes()).toContain('border-blue-500')
        expect(stlButton?.classes()).toContain('bg-blue-50')
      })

      it('allows selecting GLB format', async () => {
        const formatButtons = wrapper.findAll('button[class*="border-2"]')
        const glbButton = formatButtons.find(btn => btn.text().includes('GLB'))
        
        await glbButton?.trigger('click')
        await wrapper.vm.$nextTick()
        
        expect(glbButton?.classes()).toContain('border-blue-500')
        expect(glbButton?.classes()).toContain('bg-blue-50')
      })

      it('allows selecting OBJ format', async () => {
        const formatButtons = wrapper.findAll('button[class*="border-2"]')
        const objButton = formatButtons.find(btn => btn.text().includes('OBJ'))
        
        await objButton?.trigger('click')
        await wrapper.vm.$nextTick()
        
        expect(objButton?.classes()).toContain('border-blue-500')
        expect(objButton?.classes()).toContain('bg-blue-50')
      })

      it('allows selecting GLTF format', async () => {
        const formatButtons = wrapper.findAll('button[class*="border-2"]')
        const gltfButton = formatButtons.find(btn => btn.text().includes('GLTF'))
        
        await gltfButton?.trigger('click')
        await wrapper.vm.$nextTick()
        
        expect(gltfButton?.classes()).toContain('border-blue-500')
        expect(gltfButton?.classes()).toContain('bg-blue-50')
      })

      it('changes selected format when clicking different formats', async () => {
        const formatButtons = wrapper.findAll('button[class*="border-2"]')
        const stlButton = formatButtons.find(btn => btn.text().includes('STL'))
        const glbButton = formatButtons.find(btn => btn.text().includes('GLB'))
        
        expect(stlButton?.classes()).toContain('border-blue-500')
        
        await glbButton?.trigger('click')
        await wrapper.vm.$nextTick()
        
        expect(stlButton?.classes()).not.toContain('border-blue-500')
        expect(glbButton?.classes()).toContain('border-blue-500')
      })
    })

    describe('Export Functionality', () => {
      it('emits export event with STL format when export button is clicked', async () => {
        const fileNameInput = wrapper.find('input[type="text"]')
        await fileNameInput.setValue('test-model')
        
        const exportButton = wrapper.find('button[class*="bg-blue-600"]')
        await exportButton.trigger('click')
        
        expect(wrapper.emitted('export')).toBeTruthy()
        expect(wrapper.emitted('export')?.[0]).toEqual(['stl', 'test-model'])
      })

      it('emits export event with GLB format when GLB is selected', async () => {
        const formatButtons = wrapper.findAll('button[class*="border-2"]')
        const glbButton = formatButtons.find(btn => btn.text().includes('GLB'))
        await glbButton?.trigger('click')
        
        const fileNameInput = wrapper.find('input[type="text"]')
        await fileNameInput.setValue('test-model')
        
        const exportButton = wrapper.find('button[class*="bg-blue-600"]')
        await exportButton.trigger('click')
        
        expect(wrapper.emitted('export')?.[0]).toEqual(['glb', 'test-model'])
      })

      it('emits export event with OBJ format when OBJ is selected', async () => {
        const formatButtons = wrapper.findAll('button[class*="border-2"]')
        const objButton = formatButtons.find(btn => btn.text().includes('OBJ'))
        await objButton?.trigger('click')
        
        const fileNameInput = wrapper.find('input[type="text"]')
        await fileNameInput.setValue('test-model')
        
        const exportButton = wrapper.find('button[class*="bg-blue-600"]')
        await exportButton.trigger('click')
        
        expect(wrapper.emitted('export')?.[0]).toEqual(['obj', 'test-model'])
      })

      it('emits export event with GLTF format when GLTF is selected', async () => {
        const formatButtons = wrapper.findAll('button[class*="border-2"]')
        const gltfButton = formatButtons.find(btn => btn.text().includes('GLTF'))
        await gltfButton?.trigger('click')
        
        const fileNameInput = wrapper.find('input[type="text"]')
        await fileNameInput.setValue('test-model')
        
        const exportButton = wrapper.find('button[class*="bg-blue-600"]')
        await exportButton.trigger('click')
        
        expect(wrapper.emitted('export')?.[0]).toEqual(['gltf', 'test-model'])
      })

      it('shows error when file name is empty', async () => {
        const fileNameInput = wrapper.find('input[type="text"]')
        await fileNameInput.setValue('')
        
        const exportButton = wrapper.find('button[class*="bg-blue-600"]')
        await exportButton.trigger('click')
        
        expect(wrapper.emitted('export')).toBeFalsy()
        expect(wrapper.find('.bg-red-50').exists()).toBe(true)
        expect(wrapper.text()).toContain('请输入文件名')
      })

      it('shows error when file name is only whitespace', async () => {
        const fileNameInput = wrapper.find('input[type="text"]')
        await fileNameInput.setValue('   ')
        
        const exportButton = wrapper.find('button[class*="bg-blue-600"]')
        await exportButton.trigger('click')
        
        expect(wrapper.emitted('export')).toBeFalsy()
        expect(wrapper.find('.bg-red-50').exists()).toBe(true)
        expect(wrapper.text()).toContain('请输入文件名')
      })
    })

    describe('Export States', () => {
      it('shows loading state during export', async () => {
        vi.useFakeTimers()
        
        const exportButton = wrapper.find('button[class*="bg-blue-600"]')
        await exportButton.trigger('click')
        
        expect(exportButton.text()).toContain('导出中...')
        expect(exportButton.find('.animate-spin').exists()).toBe(true)
        
        vi.useRealTimers()
      })

      it('disables export button during export', async () => {
        vi.useFakeTimers()
        
        const exportButton = wrapper.find('button[class*="bg-blue-600"]')
        await exportButton.trigger('click')
        
        expect(exportButton.attributes('disabled')).toBeDefined()
        
        vi.useRealTimers()
      })

      it('shows success message after successful export', async () => {
        vi.useFakeTimers()
        
        const exportButton = wrapper.find('button[class*="bg-blue-600"]')
        await exportButton.trigger('click')
        await wrapper.vm.$nextTick()
        
        expect(wrapper.find('.bg-green-50').exists()).toBe(true)
        expect(wrapper.text()).toContain('模型已成功导出')
        
        vi.useRealTimers()
      })

      it('hides success message after 3 seconds', async () => {
        vi.useFakeTimers()
        
        const exportButton = wrapper.find('button[class*="bg-blue-600"]')
        await exportButton.trigger('click')
        await wrapper.vm.$nextTick()
        
        expect(wrapper.find('.bg-green-50').exists()).toBe(true)
        
        vi.advanceTimersByTime(3000)
        await wrapper.vm.$nextTick()
        
        expect(wrapper.find('.bg-green-50').exists()).toBe(false)
        
        vi.useRealTimers()
      })

      it('clears error message before new export', async () => {
        const fileNameInput = wrapper.find('input[type="text"]')
        await fileNameInput.setValue('')
        
        const exportButton = wrapper.find('button[class*="bg-blue-600"]')
        await exportButton.trigger('click')
        await wrapper.vm.$nextTick()
        
        expect(wrapper.find('.bg-red-50').exists()).toBe(true)
        
        await fileNameInput.setValue('valid-name')
        await exportButton.trigger('click')
        await wrapper.vm.$nextTick()
        
        expect(wrapper.find('.bg-red-50').exists()).toBe(false)
      })
    })

    describe('UI States', () => {
      it('applies correct styling to selected format button', async () => {
        const formatButtons = wrapper.findAll('button[class*="border-2"]')
        const stlButton = formatButtons.find(btn => btn.text().includes('STL'))
        
        expect(stlButton?.classes()).toContain('border-blue-500')
        expect(stlButton?.classes()).toContain('bg-blue-50')
        expect(stlButton?.classes()).toContain('text-blue-700')
      })

      it('applies correct styling to unselected format buttons', async () => {
        const formatButtons = wrapper.findAll('button[class*="border-2"]')
        const glbButton = formatButtons.find(btn => btn.text().includes('GLB'))
        
        expect(glbButton?.classes()).toContain('border-gray-200')
        expect(glbButton?.classes()).toContain('text-gray-700')
        expect(glbButton?.classes()).not.toContain('border-blue-500')
      })

      it('shows hover effect on format buttons', () => {
        const formatButtons = wrapper.findAll('button[class*="border-2"]')
        const glbButton = formatButtons.find(btn => btn.text().includes('GLB'))
        
        expect(glbButton?.classes()).toContain('hover:border-gray-300')
      })

      it('shows hover effect on export button', () => {
        const exportButton = wrapper.find('button[class*="bg-blue-600"]')
        expect(exportButton.classes()).toContain('hover:bg-blue-700')
      })
    })

    describe('Error Display', () => {
      it('displays error message with correct styling', async () => {
        const fileNameInput = wrapper.find('input[type="text"]')
        await fileNameInput.setValue('')
        
        const exportButton = wrapper.find('button[class*="bg-blue-600"]')
        await exportButton.trigger('click')
        await wrapper.vm.$nextTick()
        
        const errorBox = wrapper.find('.bg-red-50')
        expect(errorBox.exists()).toBe(true)
        expect(errorBox.classes()).toContain('border')
        expect(errorBox.classes()).toContain('border-red-200')
        expect(errorBox.classes()).toContain('rounded-lg')
      })

      it('displays success message with correct styling', async () => {
        vi.useFakeTimers()
        
        const exportButton = wrapper.find('button[class*="bg-blue-600"]')
        await exportButton.trigger('click')
        await wrapper.vm.$nextTick()
        
        const successBox = wrapper.find('.bg-green-50')
        expect(successBox.exists()).toBe(true)
        expect(successBox.classes()).toContain('border')
        expect(successBox.classes()).toContain('border-green-200')
        expect(successBox.classes()).toContain('rounded-lg')
        
        vi.useRealTimers()
      })
    })

    describe('Accessibility', () => {
      it('has label for file name input', () => {
        const label = wrapper.find('label')
        expect(label.exists()).toBe(true)
        expect(label.text()).toBe('文件名')
      })

      it('has label for export format section', () => {
        const labels = wrapper.findAll('label')
        const formatLabel = labels.find(label => label.text() === '导出格式')
        expect(formatLabel).toBeDefined()
      })

      it('file name input has proper focus styles', () => {
        const fileNameInput = wrapper.find('input[type="text"]')
        expect(fileNameInput.classes()).toContain('focus:ring-2')
        expect(fileNameInput.classes()).toContain('focus:ring-blue-500')
      })
    })

    describe('Edge Cases', () => {
      it('handles multiple rapid export clicks gracefully', async () => {
        const exportButton = wrapper.find('button[class*="bg-blue-600"]')
        
        await exportButton.trigger('click')
        await exportButton.trigger('click')
        await exportButton.trigger('click')
        
        expect(wrapper.emitted('export')?.length).toBe(1)
      })

      it('maintains selected format after error', async () => {
        const formatButtons = wrapper.findAll('button[class*="border-2"]')
        const glbButton = formatButtons.find(btn => btn.text().includes('GLB'))
        await glbButton?.trigger('click')
        
        const fileNameInput = wrapper.find('input[type="text"]')
        await fileNameInput.setValue('')
        
        const exportButton = wrapper.find('button[class*="bg-blue-600"]')
        await exportButton.trigger('click')
        await wrapper.vm.$nextTick()
        
        expect(glbButton?.classes()).toContain('border-blue-500')
      })

      it('maintains file name after failed export', async () => {
        const fileNameInput = wrapper.find('input[type="text"]')
        await fileNameInput.setValue('test-model')
        await fileNameInput.setValue('')
        
        const exportButton = wrapper.find('button[class*="bg-blue-600"]')
        await exportButton.trigger('click')
        await wrapper.vm.$nextTick()
        
        await fileNameInput.setValue('test-model')
        expect((fileNameInput.element as HTMLInputElement).value).toBe('test-model')
      })
    })
  })

  describe('Props Reactivity', () => {
    it('updates display when hasModel prop changes', async () => {
      wrapper = mount(ExportPanel, {
        props: {
          hasModel: false,
        },
      })
      
      expect(wrapper.text()).toContain('请先加载模型')
      expect(wrapper.find('input[type="text"]').exists()).toBe(false)
      
      await wrapper.setProps({ hasModel: true })
      
      expect(wrapper.text()).not.toContain('请先加载模型')
      expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    })
  })
})
