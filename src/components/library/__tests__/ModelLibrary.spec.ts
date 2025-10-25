import { describe, it, expect, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import ModelLibrary from '../ModelLibrary.vue'
import { type ModelFile } from '@/types/model'

describe('ModelLibrary', () => {
  let wrapper: VueWrapper<InstanceType<typeof ModelLibrary>>
  let mockModels: ModelFile[]

  beforeEach(() => {
    mockModels = [
      {
        id: '1',
        name: 'Alpha Model',
        path: '/models/alpha.glb',
        format: 'glb',
        size: 1024 * 512,
        createdAt: new Date('2025-10-20'),
        updatedAt: new Date('2025-10-20'),
        thumbnail: '',
        tags: ['basic'],
        category: 'Shapes',
        metadata: { faces: 12, vertices: 8 }
      },
      {
        id: '2',
        name: 'Zeta Model',
        path: '/models/zeta.glb',
        format: 'glb',
        size: 1024 * 1024 * 5,
        createdAt: new Date('2025-10-22'),
        updatedAt: new Date('2025-10-22'),
        thumbnail: '',
        tags: ['advanced'],
        category: 'Characters',
        metadata: { faces: 5000, vertices: 3000 }
      },
      {
        id: '3',
        name: 'Beta Model',
        path: '/models/beta.stl',
        format: 'stl',
        size: 1024 * 256,
        createdAt: new Date('2025-10-24'),
        updatedAt: new Date('2025-10-24'),
        thumbnail: '',
        tags: ['test'],
        category: 'Architecture',
        metadata: { faces: 8000, vertices: 4500 }
      }
    ]

    wrapper = mount(ModelLibrary, {
      props: {
        models: mockModels
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component Rendering', () => {
    it('should render the library title', () => {
      const title = wrapper.find('h2')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('Model Library')
    })

    it('should render model count', () => {
      const countText = wrapper.find('p.text-gray-600')
      expect(countText.text()).toBe('3 models')
    })

    it('should render model count with singular form', async () => {
      await wrapper.setProps({ models: [mockModels[0]] })
      await nextTick()

      const countText = wrapper.find('p.text-gray-600')
      expect(countText.text()).toBe('1 model')
    })

    it('should render sort dropdown', () => {
      const select = wrapper.find('select')
      expect(select.exists()).toBe(true)
    })

    it('should render all sort options', () => {
      const options = wrapper.findAll('option')
      expect(options).toHaveLength(6)
      expect(options[0].text()).toBe('Newest First')
    })

    it('should render responsive grid', () => {
      const grid = wrapper.find('.grid')
      expect(grid.classes()).toContain('grid-cols-1')
      expect(grid.classes()).toContain('xl:grid-cols-4')
    })
  })

  describe('Empty State', () => {
    it('should render empty state when no models', async () => {
      await wrapper.setProps({ models: [] })
      await nextTick()

      const emptyState = wrapper.find('.text-center.py-16')
      expect(emptyState.exists()).toBe(true)
    })

    it('should show empty state message', async () => {
      await wrapper.setProps({ models: [] })
      await nextTick()

      expect(wrapper.text()).toContain('No Models Yet')
    })
  })

  describe('Sorting Functionality', () => {
    it('should sort by date descending by default', () => {
      const models = wrapper.vm.filteredModels
      expect(models[0].id).toBe('3')
      expect(models[1].id).toBe('2')
      expect(models[2].id).toBe('1')
    })

    it('should sort by date ascending', async () => {
      const select = wrapper.find('select')
      await select.setValue('date-asc')
      await nextTick()

      const models = wrapper.vm.filteredModels
      expect(models[0].id).toBe('1')
      expect(models[1].id).toBe('2')
      expect(models[2].id).toBe('3')
    })

    it('should sort by name ascending', async () => {
      const select = wrapper.find('select')
      await select.setValue('name-asc')
      await nextTick()

      const models = wrapper.vm.filteredModels
      expect(models[0].name).toBe('Alpha Model')
      expect(models[1].name).toBe('Beta Model')
      expect(models[2].name).toBe('Zeta Model')
    })

    it('should sort by name descending', async () => {
      const select = wrapper.find('select')
      await select.setValue('name-desc')
      await nextTick()

      const models = wrapper.vm.filteredModels
      expect(models[0].name).toBe('Zeta Model')
    })

    it('should sort by size descending', async () => {
      const select = wrapper.find('select')
      await select.setValue('size-desc')
      await nextTick()

      const models = wrapper.vm.filteredModels
      expect(models[0].id).toBe('2')
    })

    it('should sort by size ascending', async () => {
      const select = wrapper.find('select')
      await select.setValue('size-asc')
      await nextTick()

      const models = wrapper.vm.filteredModels
      expect(models[0].id).toBe('3')
    })
  })

  describe('Selection Functionality', () => {
    it('should render select all checkbox when enableSelection is true', () => {
      const selectAllCheckbox = wrapper.find('#select-all')
      expect(selectAllCheckbox.exists()).toBe(true)
    })

    it('should not render select all checkbox when enableSelection is false', async () => {
      await wrapper.setProps({ enableSelection: false })
      await nextTick()

      const selectAllCheckbox = wrapper.find('#select-all')
      expect(selectAllCheckbox.exists()).toBe(false)
    })

    it('should select all models when select all checkbox is checked', async () => {
      const selectAllCheckbox = wrapper.find('#select-all')
      await selectAllCheckbox.setValue(true)
      await nextTick()

      expect(wrapper.vm.selectedModels).toHaveLength(3)
    })

    it('should deselect all models when select all checkbox is unchecked', async () => {
      const selectAllCheckbox = wrapper.find('#select-all')
      await selectAllCheckbox.setValue(true)
      await nextTick()
      await selectAllCheckbox.setValue(false)
      await nextTick()

      expect(wrapper.vm.selectedModels).toHaveLength(0)
    })

    it('should show delete button when models are selected', async () => {
      const selectAllCheckbox = wrapper.find('#select-all')
      await selectAllCheckbox.setValue(true)
      await nextTick()

      const deleteButtonText = wrapper.text()
      expect(deleteButtonText).toContain('Delete Selected')
    })
  })

  describe('Bulk Delete Functionality', () => {
    it('should emit bulkDelete event when delete button clicked', async () => {
      wrapper.vm.selectedModels = ['1', '2']
      await wrapper.vm.handleBulkDelete()

      expect(wrapper.emitted('bulkDelete')).toBeTruthy()
      expect(wrapper.emitted('bulkDelete')?.[0]).toEqual([['1', '2']])
    })

    it('should clear selection after bulk delete', async () => {
      wrapper.vm.selectedModels = ['1', '2']
      wrapper.vm.selectAll = true
      await wrapper.vm.handleBulkDelete()

      expect(wrapper.vm.selectedModels).toHaveLength(0)
      expect(wrapper.vm.selectAll).toBe(false)
    })

    it('should not emit bulkDelete when no models selected', async () => {
      wrapper.vm.selectedModels = []
      await wrapper.vm.handleBulkDelete()

      expect(wrapper.emitted('bulkDelete')).toBeFalsy()
    })
  })

  describe('Reactivity', () => {
    it('should update model count when models prop changes', async () => {
      await wrapper.setProps({ models: [mockModels[0]] })
      await nextTick()

      const countText = wrapper.find('p.text-gray-600')
      expect(countText.text()).toBe('1 model')
    })

    it('should clear selection when models change', async () => {
      wrapper.vm.selectedModels = ['1', '2']
      wrapper.vm.selectAll = true

      await wrapper.setProps({ models: [mockModels[0]] })
      await nextTick()

      expect(wrapper.vm.selectedModels).toHaveLength(0)
      expect(wrapper.vm.selectAll).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle models without size in sorting', async () => {
      const modelsWithoutSize = [
        { ...mockModels[0], size: undefined } as any,
        { ...mockModels[1], size: undefined } as any,
      ]
      await wrapper.setProps({ models: modelsWithoutSize })
      await nextTick()

      const select = wrapper.find('select')
      await select.setValue('size-desc')
      await nextTick()

      expect(wrapper.vm.filteredModels).toHaveLength(2)
    })
  })
})
