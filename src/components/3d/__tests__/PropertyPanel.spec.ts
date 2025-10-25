import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import PropertyPanel from '../PropertyPanel.vue'
import type { ModelInfo } from '@/composables/use3DViewer'
import { Vector3 } from '@babylonjs/core'

describe('PropertyPanel', () => {
  let wrapper: VueWrapper<InstanceType<typeof PropertyPanel>>
  let mockModelInfo: ModelInfo

  beforeEach(() => {
    mockModelInfo = {
      vertices: 12543,
      faces: 8362,
      materials: 2,
      boundingBox: {
        min: new Vector3(-5, -3, -4),
        max: new Vector3(5, 3, 4),
        size: new Vector3(10, 6, 8),
        center: new Vector3(0, 0, 0),
      },
    }
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component Rendering', () => {
    it('should render panel title', () => {
      wrapper = mount(PropertyPanel, {
        props: {
          modelInfo: mockModelInfo,
        },
      })
      
      const title = wrapper.find('h3')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('模型属性')
    })

    it('should show empty state when no model info provided', () => {
      wrapper = mount(PropertyPanel, {
        props: {
          modelInfo: null,
        },
      })
      
      const emptyState = wrapper.find('.text-center')
      expect(emptyState.exists()).toBe(true)
      expect(emptyState.text()).toContain('暂无模型信息')
    })

    it('should render all sections when model info is provided', () => {
      wrapper = mount(PropertyPanel, {
        props: {
          modelInfo: mockModelInfo,
        },
      })
      
      const sections = wrapper.findAll('h4')
      expect(sections.length).toBeGreaterThanOrEqual(3)
      expect(sections[0].text()).toBe('基本信息')
      expect(sections[1].text()).toBe('尺寸信息')
      expect(sections[2].text()).toBe('中心点坐标')
    })
  })

  describe('Basic Information Display', () => {
    beforeEach(() => {
      wrapper = mount(PropertyPanel, {
        props: {
          modelInfo: mockModelInfo,
        },
      })
    })

    it('should display formatted vertex count', () => {
      const text = wrapper.text()
      expect(text).toContain('12,543')
    })

    it('should display formatted face count', () => {
      const text = wrapper.text()
      expect(text).toContain('8,362')
    })

    it('should display material count', () => {
      const text = wrapper.text()
      expect(text).toContain('2')
    })

    it('should display model complexity based on face count', () => {
      const text = wrapper.text()
      expect(text).toContain('低')
    })

    it('should display correct complexity for medium models', async () => {
      const mediumModelInfo = {
        ...mockModelInfo,
        faces: 50000,
      }
      
      await wrapper.setProps({ modelInfo: mediumModelInfo })
      await nextTick()
      
      const text = wrapper.text()
      expect(text).toContain('中')
    })

    it('should display correct complexity for high models', async () => {
      const highModelInfo = {
        ...mockModelInfo,
        faces: 250000,
      }
      
      await wrapper.setProps({ modelInfo: highModelInfo })
      await nextTick()
      
      const text = wrapper.text()
      expect(text).toContain('高')
    })

    it('should display correct complexity for very high models', async () => {
      const veryHighModelInfo = {
        ...mockModelInfo,
        faces: 750000,
      }
      
      await wrapper.setProps({ modelInfo: veryHighModelInfo })
      await nextTick()
      
      const text = wrapper.text()
      expect(text).toContain('极高')
    })

    it('should apply correct color class for low complexity', () => {
      const complexityElement = wrapper.findAll('.text-green-600')
      expect(complexityElement.length).toBeGreaterThan(0)
    })
  })

  describe('Size Information Display', () => {
    beforeEach(() => {
      wrapper = mount(PropertyPanel, {
        props: {
          modelInfo: mockModelInfo,
        },
      })
    })

    it('should display width (X dimension)', () => {
      const text = wrapper.text()
      expect(text).toContain('宽度 (X)')
      expect(text).toContain('10.00 单位')
    })

    it('should display height (Y dimension)', () => {
      const text = wrapper.text()
      expect(text).toContain('高度 (Y)')
      expect(text).toContain('6.00 单位')
    })

    it('should display depth (Z dimension)', () => {
      const text = wrapper.text()
      expect(text).toContain('深度 (Z)')
      expect(text).toContain('8.00 单位')
    })

    it('should calculate and display volume', () => {
      const text = wrapper.text()
      expect(text).toContain('体积')
      expect(text).toContain('480.00 单位³')
    })

    it('should format dimensions with 2 decimal places', async () => {
      const irregularModelInfo = {
        ...mockModelInfo,
        boundingBox: {
          ...mockModelInfo.boundingBox,
          size: new Vector3(12.345, 6.789, 8.123),
        },
      }
      
      await wrapper.setProps({ modelInfo: irregularModelInfo })
      await nextTick()
      
      const text = wrapper.text()
      expect(text).toContain('12.35 单位')
      expect(text).toContain('6.79 单位')
      expect(text).toContain('8.12 单位')
    })
  })

  describe('Center Point Coordinates Display', () => {
    beforeEach(() => {
      wrapper = mount(PropertyPanel, {
        props: {
          modelInfo: mockModelInfo,
        },
      })
    })

    it('should display X coordinate', () => {
      const text = wrapper.text()
      expect(text).toContain('X')
      expect(text).toContain('0.00')
    })

    it('should display Y coordinate', () => {
      const text = wrapper.text()
      expect(text).toContain('Y')
      expect(text).toContain('0.00')
    })

    it('should display Z coordinate', () => {
      const text = wrapper.text()
      expect(text).toContain('Z')
      expect(text).toContain('0.00')
    })

    it('should format coordinates with 2 decimal places', async () => {
      const offsetModelInfo = {
        ...mockModelInfo,
        boundingBox: {
          ...mockModelInfo.boundingBox,
          center: new Vector3(1.234, -2.567, 3.891),
        },
      }
      
      await wrapper.setProps({ modelInfo: offsetModelInfo })
      await nextTick()
      
      const text = wrapper.text()
      expect(text).toContain('1.23')
      expect(text).toContain('-2.57')
      expect(text).toContain('3.89')
    })

    it('should use correct color coding for coordinates', () => {
      const xCoord = wrapper.findAll('.bg-red-50')
      const yCoord = wrapper.findAll('.bg-green-50')
      const zCoord = wrapper.findAll('.bg-blue-50')
      
      expect(xCoord.length).toBeGreaterThan(0)
      expect(yCoord.length).toBeGreaterThan(0)
      expect(zCoord.length).toBeGreaterThan(0)
    })
  })

  describe('Printability Suggestions', () => {
    it('should suggest small printer for models under 100 units', () => {
      wrapper = mount(PropertyPanel, {
        props: {
          modelInfo: mockModelInfo,
        },
      })
      
      const text = wrapper.text()
      expect(text).toContain('适合小型打印机')
    })

    it('should suggest medium printer for models 100-200 units', async () => {
      const mediumModelInfo = {
        ...mockModelInfo,
        boundingBox: {
          ...mockModelInfo.boundingBox,
          size: new Vector3(150, 80, 100),
        },
      }
      
      wrapper = mount(PropertyPanel, {
        props: {
          modelInfo: mediumModelInfo,
        },
      })
      await nextTick()
      
      const text = wrapper.text()
      expect(text).toContain('适合中型打印机')
    })

    it('should suggest large printer for models 200-300 units', async () => {
      const largeModelInfo = {
        ...mockModelInfo,
        boundingBox: {
          ...mockModelInfo.boundingBox,
          size: new Vector3(250, 150, 200),
        },
      }
      
      wrapper = mount(PropertyPanel, {
        props: {
          modelInfo: largeModelInfo,
        },
      })
      await nextTick()
      
      const text = wrapper.text()
      expect(text).toContain('需要大型打印机')
    })

    it('should suggest splitting for models over 300 units', async () => {
      const extraLargeModelInfo = {
        ...mockModelInfo,
        boundingBox: {
          ...mockModelInfo.boundingBox,
          size: new Vector3(350, 250, 300),
        },
      }
      
      wrapper = mount(PropertyPanel, {
        props: {
          modelInfo: extraLargeModelInfo,
        },
      })
      await nextTick()
      
      const text = wrapper.text()
      expect(text).toContain('可能需要分块打印')
    })

    it('should apply correct badge styling for small printer', () => {
      wrapper = mount(PropertyPanel, {
        props: {
          modelInfo: mockModelInfo,
        },
      })
      
      const badges = wrapper.findAll('.bg-green-100')
      expect(badges.length).toBeGreaterThan(0)
    })

    it('should apply correct badge styling for large printer', async () => {
      const largeModelInfo = {
        ...mockModelInfo,
        boundingBox: {
          ...mockModelInfo.boundingBox,
          size: new Vector3(250, 150, 200),
        },
      }
      
      wrapper = mount(PropertyPanel, {
        props: {
          modelInfo: largeModelInfo,
        },
      })
      await nextTick()
      
      const badges = wrapper.findAll('.bg-orange-100')
      expect(badges.length).toBeGreaterThan(0)
    })
  })

  describe('Number Formatting', () => {
    it('should format large numbers with comma separators', () => {
      const largeModelInfo = {
        ...mockModelInfo,
        vertices: 1234567,
        faces: 987654,
      }
      
      wrapper = mount(PropertyPanel, {
        props: {
          modelInfo: largeModelInfo,
        },
      })
      
      const text = wrapper.text()
      expect(text).toContain('1,234,567')
      expect(text).toContain('987,654')
    })

    it('should handle zero values correctly', () => {
      const zeroModelInfo = {
        ...mockModelInfo,
        boundingBox: {
          ...mockModelInfo.boundingBox,
          center: new Vector3(0, 0, 0),
        },
      }
      
      wrapper = mount(PropertyPanel, {
        props: {
          modelInfo: zeroModelInfo,
        },
      })
      
      const text = wrapper.text()
      expect(text).toContain('0.00')
    })

    it('should handle negative coordinates', () => {
      const negativeModelInfo = {
        ...mockModelInfo,
        boundingBox: {
          ...mockModelInfo.boundingBox,
          center: new Vector3(-10, -20, -30),
        },
      }
      
      wrapper = mount(PropertyPanel, {
        props: {
          modelInfo: negativeModelInfo,
        },
      })
      
      const text = wrapper.text()
      expect(text).toContain('-10.00')
      expect(text).toContain('-20.00')
      expect(text).toContain('-30.00')
    })
  })

  describe('Reactive Updates', () => {
    it('should update display when modelInfo prop changes', async () => {
      wrapper = mount(PropertyPanel, {
        props: {
          modelInfo: mockModelInfo,
        },
      })
      
      let text = wrapper.text()
      expect(text).toContain('12,543')
      
      const newModelInfo = {
        ...mockModelInfo,
        vertices: 50000,
      }
      
      await wrapper.setProps({ modelInfo: newModelInfo })
      await nextTick()
      
      text = wrapper.text()
      expect(text).toContain('50,000')
    })

    it('should show empty state when modelInfo is set to null', async () => {
      wrapper = mount(PropertyPanel, {
        props: {
          modelInfo: mockModelInfo,
        },
      })
      
      await wrapper.setProps({ modelInfo: null })
      await nextTick()
      
      const emptyState = wrapper.find('.text-center')
      expect(emptyState.exists()).toBe(true)
      expect(emptyState.text()).toContain('暂无模型信息')
    })

    it('should recalculate volume when size changes', async () => {
      wrapper = mount(PropertyPanel, {
        props: {
          modelInfo: mockModelInfo,
        },
      })
      
      let text = wrapper.text()
      expect(text).toContain('480.00 单位³')
      
      const newModelInfo = {
        ...mockModelInfo,
        boundingBox: {
          ...mockModelInfo.boundingBox,
          size: new Vector3(20, 10, 5),
        },
      }
      
      await wrapper.setProps({ modelInfo: newModelInfo })
      await nextTick()
      
      text = wrapper.text()
      expect(text).toContain('1000.00 单位³')
    })
  })

  describe('Styling and Classes', () => {
    beforeEach(() => {
      wrapper = mount(PropertyPanel, {
        props: {
          modelInfo: mockModelInfo,
        },
      })
    })

    it('should have proper container styling', () => {
      expect(wrapper.classes()).toContain('bg-white')
      expect(wrapper.classes()).toContain('rounded-lg')
      expect(wrapper.classes()).toContain('shadow-md')
    })

    it('should use grid layout for statistics', () => {
      const grids = wrapper.findAll('.grid-cols-2')
      expect(grids.length).toBeGreaterThan(0)
    })

    it('should use grid layout for coordinates', () => {
      const grids = wrapper.findAll('.grid-cols-3')
      expect(grids.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very small models', () => {
      const tinyModelInfo = {
        ...mockModelInfo,
        vertices: 8,
        faces: 6,
        materials: 1,
        boundingBox: {
          ...mockModelInfo.boundingBox,
          size: new Vector3(0.1, 0.1, 0.1),
        },
      }
      
      wrapper = mount(PropertyPanel, {
        props: {
          modelInfo: tinyModelInfo,
        },
      })
      
      const text = wrapper.text()
      expect(text).toContain('8')
      expect(text).toContain('6')
      expect(text).toContain('0.10 单位')
    })

    it('should handle very large models', () => {
      const hugeModelInfo = {
        ...mockModelInfo,
        vertices: 10000000,
        faces: 5000000,
        materials: 50,
        boundingBox: {
          ...mockModelInfo.boundingBox,
          size: new Vector3(1000, 800, 600),
        },
      }
      
      wrapper = mount(PropertyPanel, {
        props: {
          modelInfo: hugeModelInfo,
        },
      })
      
      const text = wrapper.text()
      expect(text).toContain('10,000,000')
      expect(text).toContain('5,000,000')
      expect(text).toContain('极高')
    })

    it('should handle models with no materials', () => {
      const noMaterialModel = {
        ...mockModelInfo,
        materials: 0,
      }
      
      wrapper = mount(PropertyPanel, {
        props: {
          modelInfo: noMaterialModel,
        },
      })
      
      const text = wrapper.text()
      expect(text).toContain('0')
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      wrapper = mount(PropertyPanel, {
        props: {
          modelInfo: mockModelInfo,
        },
      })
    })

    it('should have descriptive labels for all metrics', () => {
      const text = wrapper.text()
      expect(text).toContain('顶点数')
      expect(text).toContain('三角面数')
      expect(text).toContain('材质数')
      expect(text).toContain('复杂度')
      expect(text).toContain('体积')
    })

    it('should have section headers', () => {
      const headers = wrapper.findAll('h4')
      expect(headers.length).toBeGreaterThanOrEqual(3)
    })

    it('should include print suggestions label', () => {
      const text = wrapper.text()
      expect(text).toContain('打印建议')
    })
  })
})
