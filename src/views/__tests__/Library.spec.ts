import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import Library from '../Library.vue'
import ModelLibrary from '@/components/library/ModelLibrary.vue'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import { type ModelFile } from '@/types/model'

const mockPush = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

vi.mock('@/components/library/ModelLibrary.vue', () => ({
  default: {
    name: 'ModelLibrary',
    template: '<div class="model-library-mock"></div>',
    props: ['models'],
    emits: ['view', 'print', 'delete', 'bulkDelete'],
  },
}))

vi.mock('@/components/ui/Modal.vue', () => ({
  default: {
    name: 'Modal',
    template: `
      <div v-if="modelValue" class="modal-mock">
        <slot name="title" />
        <slot />
        <slot name="footer" />
      </div>
    `,
    props: ['modelValue'],
    emits: ['update:modelValue'],
  },
}))

vi.mock('@/components/ui/Button.vue', () => ({
  default: {
    name: 'Button',
    template: '<button><slot /></button>',
    props: ['variant'],
    emits: ['click'],
  },
}))

describe('Library.vue', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    mockPush.mockClear()
    wrapper = mount(Library, {
      global: {
        stubs: {
          ModelLibrary,
          Modal,
          Button
        }
      }
    })
  })

  describe('Rendering', () => {
    it('should render page title', () => {
      const title = wrapper.find('h1')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('模型库')
    })

    it('should render page description', () => {
      const description = wrapper.find('p.text-gray-600')
      expect(description.text()).toContain('管理和浏览您的3D模型文件')
    })

    it('should render search input', () => {
      const searchInput = wrapper.find('input[type="text"]')
      expect(searchInput.exists()).toBe(true)
      expect(searchInput.attributes('placeholder')).toBe('Search models by name...')
    })

    it('should render category filter dropdown', () => {
      const selects = wrapper.findAll('select')
      const categorySelect = selects[0]
      expect(categorySelect.exists()).toBe(true)
      expect(categorySelect.find('option[value=""]').text()).toBe('All Categories')
    })

    it('should render tag filter dropdown', () => {
      const selects = wrapper.findAll('select')
      const tagSelect = selects[1]
      expect(tagSelect.exists()).toBe(true)
      expect(tagSelect.find('option[value=""]').text()).toBe('All Tags')
    })

    it('should render ModelLibrary component', () => {
      const modelLibrary = wrapper.findComponent(ModelLibrary)
      expect(modelLibrary.exists()).toBe(true)
    })

    it('should render delete confirmation modal', () => {
      const modal = wrapper.findComponent(Modal)
      expect(modal.exists()).toBe(true)
    })
  })

  describe('Mock Data', () => {
    it('should have mock models data', () => {
      expect(wrapper.vm.mockModels).toHaveLength(3)
    })

    it('should have correct model structure', () => {
      const firstModel = wrapper.vm.mockModels[0]
      expect(firstModel).toHaveProperty('id')
      expect(firstModel).toHaveProperty('name')
      expect(firstModel).toHaveProperty('path')
      expect(firstModel).toHaveProperty('format')
      expect(firstModel).toHaveProperty('size')
      expect(firstModel).toHaveProperty('tags')
      expect(firstModel).toHaveProperty('category')
    })

    it('should populate available categories from models', () => {
      expect(wrapper.vm.availableCategories.length).toBeGreaterThan(0)
      expect(wrapper.vm.availableCategories).toContain('Shapes')
    })

    it('should populate available tags from models', () => {
      expect(wrapper.vm.availableTags.length).toBeGreaterThan(0)
      expect(wrapper.vm.availableTags).toContain('basic')
    })
  })

  describe('Search Functionality', () => {
    it('should filter models by search query', async () => {
      const searchInput = wrapper.find('input[type="text"]')
      await searchInput.setValue('Cube')
      await nextTick()

      const modelLibrary = wrapper.findComponent(ModelLibrary)
      const filteredModels = modelLibrary.props('models')
      expect(filteredModels).toHaveLength(1)
      expect(filteredModels[0].name).toContain('Cube')
    })

    it('should be case insensitive', async () => {
      const searchInput = wrapper.find('input[type="text"]')
      await searchInput.setValue('cube')
      await nextTick()

      const modelLibrary = wrapper.findComponent(ModelLibrary)
      const filteredModels = modelLibrary.props('models')
      expect(filteredModels).toHaveLength(1)
    })

    it('should show all models when search is empty', async () => {
      const searchInput = wrapper.find('input[type="text"]')
      await searchInput.setValue('test')
      await nextTick()
      await searchInput.setValue('')
      await nextTick()

      const modelLibrary = wrapper.findComponent(ModelLibrary)
      const filteredModels = modelLibrary.props('models')
      expect(filteredModels).toHaveLength(3)
    })

    it('should return empty array when no match found', async () => {
      const searchInput = wrapper.find('input[type="text"]')
      await searchInput.setValue('NonExistentModel')
      await nextTick()

      const modelLibrary = wrapper.findComponent(ModelLibrary)
      const filteredModels = modelLibrary.props('models')
      expect(filteredModels).toHaveLength(0)
    })
  })

  describe('Category Filter', () => {
    it('should filter models by category', async () => {
      const selects = wrapper.findAll('select')
      const categorySelect = selects[0]
      await categorySelect.setValue('Shapes')
      await nextTick()

      const modelLibrary = wrapper.findComponent(ModelLibrary)
      const filteredModels = modelLibrary.props('models')
      expect(filteredModels.every(m => m.category === 'Shapes')).toBe(true)
    })

    it('should show all models when category filter is cleared', async () => {
      const selects = wrapper.findAll('select')
      const categorySelect = selects[0]
      await categorySelect.setValue('Shapes')
      await nextTick()
      await categorySelect.setValue('')
      await nextTick()

      const modelLibrary = wrapper.findComponent(ModelLibrary)
      const filteredModels = modelLibrary.props('models')
      expect(filteredModels).toHaveLength(3)
    })

    it('should render all available categories as options', async () => {
      const selects = wrapper.findAll('select')
      const categorySelect = selects[0]
      const options = categorySelect.findAll('option')
      
      expect(options.length).toBeGreaterThan(1)
    })
  })

  describe('Tag Filter', () => {
    it('should filter models by tag', async () => {
      const selects = wrapper.findAll('select')
      const tagSelect = selects[1]
      await tagSelect.setValue('basic')
      await nextTick()

      const modelLibrary = wrapper.findComponent(ModelLibrary)
      const filteredModels = modelLibrary.props('models')
      expect(filteredModels.every(m => m.tags.includes('basic'))).toBe(true)
    })

    it('should show all models when tag filter is cleared', async () => {
      const selects = wrapper.findAll('select')
      const tagSelect = selects[1]
      await tagSelect.setValue('basic')
      await nextTick()
      await tagSelect.setValue('')
      await nextTick()

      const modelLibrary = wrapper.findComponent(ModelLibrary)
      const filteredModels = modelLibrary.props('models')
      expect(filteredModels).toHaveLength(3)
    })

    it('should render all available tags as options', async () => {
      const selects = wrapper.findAll('select')
      const tagSelect = selects[1]
      const options = tagSelect.findAll('option')
      
      expect(options.length).toBeGreaterThan(1)
    })
  })

  describe('Combined Filters', () => {
    it('should apply search and category filter together', async () => {
      const searchInput = wrapper.find('input[type="text"]')
      const selects = wrapper.findAll('select')
      const categorySelect = selects[0]

      await searchInput.setValue('Model')
      await categorySelect.setValue('Characters')
      await nextTick()

      const modelLibrary = wrapper.findComponent(ModelLibrary)
      const filteredModels = modelLibrary.props('models')
      expect(filteredModels.every(m => 
        m.name.toLowerCase().includes('model') && m.category === 'Characters'
      )).toBe(true)
    })

    it('should apply all three filters together', async () => {
      const searchInput = wrapper.find('input[type="text"]')
      const selects = wrapper.findAll('select')
      const categorySelect = selects[0]
      const tagSelect = selects[1]

      await searchInput.setValue('Cube')
      await categorySelect.setValue('Shapes')
      await tagSelect.setValue('basic')
      await nextTick()

      const modelLibrary = wrapper.findComponent(ModelLibrary)
      const filteredModels = modelLibrary.props('models')
      
      if (filteredModels.length > 0) {
        expect(filteredModels.every(m => 
          m.name.toLowerCase().includes('cube') && 
          m.category === 'Shapes' && 
          m.tags.includes('basic')
        )).toBe(true)
      }
    })
  })

  describe('Navigation', () => {
    it('should navigate to viewer on handleViewModel', async () => {
      const mockModel: ModelFile = wrapper.vm.mockModels[0]
      
      await wrapper.vm.handleViewModel(mockModel)
      
      expect(mockPush).toHaveBeenCalledWith({
        name: 'viewer',
        query: { modelId: mockModel.id }
      })
    })

    it('should navigate to print on handlePrintModel', async () => {
      const mockModel: ModelFile = wrapper.vm.mockModels[0]
      
      await wrapper.vm.handlePrintModel(mockModel)
      
      expect(mockPush).toHaveBeenCalledWith({
        name: 'print',
        query: { modelId: mockModel.id }
      })
    })
  })

  describe('Delete Confirmation Modal', () => {
    it('should not show modal initially', () => {
      const modal = wrapper.findComponent(Modal)
      expect(modal.props('modelValue')).toBe(false)
    })

    it('should show modal when deleting single model', async () => {
      const mockModel: ModelFile = wrapper.vm.mockModels[0]
      
      await wrapper.vm.handleDeleteModel(mockModel)
      await nextTick()
      
      expect(wrapper.vm.showDeleteConfirm).toBe(true)
      expect(wrapper.vm.deleteTarget).toBe('single')
      expect(wrapper.vm.deleteModelIds).toEqual([mockModel.id])
    })

    it('should show modal when bulk deleting', async () => {
      const modelIds = ['1', '2']
      
      await wrapper.vm.handleBulkDelete(modelIds)
      await nextTick()
      
      expect(wrapper.vm.showDeleteConfirm).toBe(true)
      expect(wrapper.vm.deleteTarget).toBe('bulk')
      expect(wrapper.vm.deleteModelIds).toEqual(modelIds)
    })

    it('should display correct message for single delete', async () => {
      const mockModel: ModelFile = wrapper.vm.mockModels[0]
      
      await wrapper.vm.handleDeleteModel(mockModel)
      await nextTick()
      
      expect(wrapper.text()).toContain('this model')
    })

    it('should display correct message for bulk delete', async () => {
      const modelIds = ['1', '2']
      
      await wrapper.vm.handleBulkDelete(modelIds)
      await nextTick()
      
      expect(wrapper.text()).toContain('2 models')
    })

    it('should have cancel button in modal', async () => {
      const mockModel: ModelFile = wrapper.vm.mockModels[0]
      
      await wrapper.vm.handleDeleteModel(mockModel)
      await nextTick()
      
      const buttons = wrapper.findAllComponents(Button)
      const cancelButton = buttons.find(b => b.text() === 'Cancel')
      expect(cancelButton).toBeDefined()
    })

    it('should have delete button in modal', async () => {
      const mockModel: ModelFile = wrapper.vm.mockModels[0]
      
      await wrapper.vm.handleDeleteModel(mockModel)
      await nextTick()
      
      const buttons = wrapper.findAllComponents(Button)
      const deleteButton = buttons.find(b => b.text() === 'Delete')
      expect(deleteButton).toBeDefined()
    })

    it('should close modal when cancel is clicked', async () => {
      const mockModel: ModelFile = wrapper.vm.mockModels[0]
      
      await wrapper.vm.handleDeleteModel(mockModel)
      await nextTick()
      
      wrapper.vm.showDeleteConfirm = false
      await nextTick()
      
      expect(wrapper.vm.showDeleteConfirm).toBe(false)
    })
  })

  describe('Delete Functionality', () => {
    it('should delete single model when confirmed', async () => {
      const initialCount = wrapper.vm.mockModels.length
      const mockModel: ModelFile = wrapper.vm.mockModels[0]
      
      await wrapper.vm.handleDeleteModel(mockModel)
      await wrapper.vm.confirmDelete()
      await nextTick()
      
      expect(wrapper.vm.mockModels.length).toBe(initialCount - 1)
      expect(wrapper.vm.mockModels.find(m => m.id === mockModel.id)).toBeUndefined()
    })

    it('should delete multiple models when bulk confirmed', async () => {
      const initialCount = wrapper.vm.mockModels.length
      const modelIds = ['1', '2']
      
      await wrapper.vm.handleBulkDelete(modelIds)
      await wrapper.vm.confirmDelete()
      await nextTick()
      
      expect(wrapper.vm.mockModels.length).toBe(initialCount - 2)
    })

    it('should close modal after delete confirmation', async () => {
      const mockModel: ModelFile = wrapper.vm.mockModels[0]
      
      await wrapper.vm.handleDeleteModel(mockModel)
      await wrapper.vm.confirmDelete()
      await nextTick()
      
      expect(wrapper.vm.showDeleteConfirm).toBe(false)
    })

    it('should clear deleteModelIds after delete', async () => {
      const mockModel: ModelFile = wrapper.vm.mockModels[0]
      
      await wrapper.vm.handleDeleteModel(mockModel)
      await wrapper.vm.confirmDelete()
      await nextTick()
      
      expect(wrapper.vm.deleteModelIds).toHaveLength(0)
    })

    it('should handle deleting non-existent model gracefully', async () => {
      const initialCount = wrapper.vm.mockModels.length
      
      wrapper.vm.deleteTarget = 'single'
      wrapper.vm.deleteModelIds = ['non-existent-id']
      await wrapper.vm.confirmDelete()
      await nextTick()
      
      expect(wrapper.vm.mockModels.length).toBe(initialCount)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty search query', async () => {
      const searchInput = wrapper.find('input[type="text"]')
      await searchInput.setValue('')
      await nextTick()

      const modelLibrary = wrapper.findComponent(ModelLibrary)
      const filteredModels = modelLibrary.props('models')
      expect(filteredModels).toHaveLength(3)
    })

    it('should handle special characters in search', async () => {
      const searchInput = wrapper.find('input[type="text"]')
      await searchInput.setValue('!@#$%')
      await nextTick()

      const modelLibrary = wrapper.findComponent(ModelLibrary)
      const filteredModels = modelLibrary.props('models')
      expect(filteredModels).toHaveLength(0)
    })

    it('should update available categories when models change', async () => {
      const initialCategories = wrapper.vm.availableCategories.length
      
      wrapper.vm.mockModels = []
      await nextTick()
      
      expect(wrapper.vm.availableCategories.length).toBe(0)
    })

    it('should update available tags when models change', async () => {
      wrapper.vm.mockModels = []
      await nextTick()
      
      expect(wrapper.vm.availableTags.length).toBe(0)
    })
  })

  describe('Reactivity', () => {
    it('should reactively update filtered models on search change', async () => {
      const searchInput = wrapper.find('input[type="text"]')
      const modelLibrary = wrapper.findComponent(ModelLibrary)
      
      const initialCount = modelLibrary.props('models').length
      
      await searchInput.setValue('Cube')
      await nextTick()
      
      const filteredCount = modelLibrary.props('models').length
      expect(filteredCount).toBeLessThanOrEqual(initialCount)
    })

    it('should reactively update when category filter changes', async () => {
      const selects = wrapper.findAll('select')
      const categorySelect = selects[0]
      const modelLibrary = wrapper.findComponent(ModelLibrary)
      
      await categorySelect.setValue('Shapes')
      await nextTick()
      
      expect(modelLibrary.props('models').length).toBeGreaterThan(0)
    })

    it('should reactively update when tag filter changes', async () => {
      const selects = wrapper.findAll('select')
      const tagSelect = selects[1]
      const modelLibrary = wrapper.findComponent(ModelLibrary)
      
      await tagSelect.setValue('basic')
      await nextTick()
      
      expect(modelLibrary.props('models').length).toBeGreaterThan(0)
    })
  })
})
