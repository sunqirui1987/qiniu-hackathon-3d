import { describe, it, expect, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import ModelCard from '../ModelCard.vue'
import { type ModelFile } from '@/types/model'

describe('ModelCard', () => {
  let wrapper: VueWrapper<InstanceType<typeof ModelCard>>
  let mockModel: ModelFile

  beforeEach(() => {
    mockModel = {
      id: '1',
      name: 'Test Model',
      path: '/models/test.glb',
      format: 'glb',
      size: 1024 * 512,
      createdAt: new Date('2025-10-20'),
      updatedAt: new Date('2025-10-20'),
      thumbnail: 'https://example.com/thumbnail.jpg',
      tags: ['basic', 'geometry', 'test'],
      category: 'Shapes',
      metadata: {
        faces: 12,
        vertices: 8
      }
    }

    wrapper = mount(ModelCard, {
      props: {
        model: mockModel
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component Rendering', () => {
    it('should render the model card container', () => {
      expect(wrapper.find('.bg-white.rounded-lg.shadow-md').exists()).toBe(true)
    })

    it('should render model name', () => {
      const title = wrapper.find('h3')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('Test Model')
    })

    it('should render model format badge', () => {
      const formatBadge = wrapper.find('.absolute.top-2.right-2')
      expect(formatBadge.exists()).toBe(true)
      expect(formatBadge.text()).toBe('GLB')
    })

    it('should render thumbnail when provided', () => {
      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('https://example.com/thumbnail.jpg')
      expect(img.attributes('alt')).toBe('Test Model')
    })

    it('should render fallback icon when no thumbnail', async () => {
      const modelWithoutThumbnail = { ...mockModel, thumbnail: undefined }
      await wrapper.setProps({ model: modelWithoutThumbnail })
      await nextTick()

      const svg = wrapper.find('svg')
      expect(svg.exists()).toBe(true)
    })

    it('should render file size', () => {
      const sizeText = wrapper.text()
      expect(sizeText).toContain('512.0 KB')
    })

    it('should render faces count', () => {
      const facesText = wrapper.text()
      expect(facesText).toContain('Faces: 12')
    })

    it('should render tags (maximum 3)', () => {
      const tags = wrapper.findAll('.text-xs.bg-gray-100')
      expect(tags).toHaveLength(3)
      expect(tags[0].text()).toBe('basic')
      expect(tags[1].text()).toBe('geometry')
      expect(tags[2].text()).toBe('test')
    })

    it('should render action buttons', () => {
      const buttons = wrapper.findAll('button')
      expect(buttons).toHaveLength(3)
    })
  })

  describe('Event Emissions', () => {
    it('should emit view event when View button clicked', async () => {
      const buttons = wrapper.findAll('button')
      const viewButton = buttons[0]

      await viewButton.trigger('click')
      await nextTick()

      expect(wrapper.emitted('view')).toBeTruthy()
      expect(wrapper.emitted('view')?.[0]).toEqual([mockModel])
    })

    it('should emit view event when thumbnail clicked', async () => {
      const thumbnail = wrapper.find('.relative.h-48')

      await thumbnail.trigger('click')
      await nextTick()

      expect(wrapper.emitted('view')).toBeTruthy()
      expect(wrapper.emitted('view')?.[0]).toEqual([mockModel])
    })

    it('should emit print event when Print button clicked', async () => {
      const buttons = wrapper.findAll('button')
      const printButton = buttons[1]

      await printButton.trigger('click')
      await nextTick()

      expect(wrapper.emitted('print')).toBeTruthy()
      expect(wrapper.emitted('print')?.[0]).toEqual([mockModel])
    })

    it('should emit delete event when Delete button clicked', async () => {
      const buttons = wrapper.findAll('button')
      const deleteButton = buttons[2]

      await deleteButton.trigger('click')
      await nextTick()

      expect(wrapper.emitted('delete')).toBeTruthy()
      expect(wrapper.emitted('delete')?.[0]).toEqual([mockModel])
    })
  })

  describe('Format Functions', () => {
    it('should format file size in bytes correctly', async () => {
      const modelWithSmallSize = { ...mockModel, size: 512 }
      await wrapper.setProps({ model: modelWithSmallSize })

      expect(wrapper.text()).toContain('512 B')
    })

    it('should format file size in KB correctly', async () => {
      const modelWithKBSize = { ...mockModel, size: 1024 * 10 }
      await wrapper.setProps({ model: modelWithKBSize })

      expect(wrapper.text()).toContain('10.0 KB')
    })

    it('should format file size in MB correctly', async () => {
      const modelWithMBSize = { ...mockModel, size: 1024 * 1024 * 5 }
      await wrapper.setProps({ model: modelWithMBSize })

      expect(wrapper.text()).toContain('5.0 MB')
    })

    it('should format numbers with locale formatting', async () => {
      const modelWithLargeFaces = { 
        ...mockModel, 
        metadata: { faces: 123456, vertices: 8 } 
      }
      await wrapper.setProps({ model: modelWithLargeFaces })

      expect(wrapper.text()).toContain('123,456')
    })
  })

  describe('Edge Cases', () => {
    it('should handle model without size', async () => {
      const modelWithoutSize = { ...mockModel, size: undefined } as any
      await wrapper.setProps({ model: modelWithoutSize })
      await nextTick()

      expect(wrapper.find('.text-sm.text-gray-500').exists()).toBe(true)
    })

    it('should handle model without metadata', async () => {
      const modelWithoutMetadata = { ...mockModel, metadata: undefined }
      await wrapper.setProps({ model: modelWithoutMetadata })
      await nextTick()

      expect(wrapper.text()).not.toContain('Faces:')
    })

    it('should handle model without tags', async () => {
      const modelWithoutTags = { ...mockModel, tags: [] }
      await wrapper.setProps({ model: modelWithoutTags })
      await nextTick()

      const tags = wrapper.findAll('.text-xs.bg-gray-100')
      expect(tags).toHaveLength(0)
    })
  })

  describe('Styling', () => {
    it('should have hover effect on card', () => {
      expect(wrapper.classes()).toContain('hover:shadow-lg')
    })

    it('should have truncate class on model name', () => {
      const title = wrapper.find('h3')
      expect(title.classes()).toContain('truncate')
    })

    it('should have title attribute on model name', () => {
      const title = wrapper.find('h3')
      expect(title.attributes('title')).toBe('Test Model')
    })
  })
})
