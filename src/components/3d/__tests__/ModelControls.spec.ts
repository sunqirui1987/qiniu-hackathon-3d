import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import ModelControls from '../ModelControls.vue'

describe('ModelControls', () => {
  let wrapper: VueWrapper<InstanceType<typeof ModelControls>>

  beforeEach(() => {
    wrapper = mount(ModelControls)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render control panel title', () => {
      const title = wrapper.find('h3')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('控制面板')
    })

    it('should render zoom controls', () => {
      const zoomButtons = wrapper.findAll('button').filter(btn => 
        btn.text().includes('放大') || btn.text().includes('缩小')
      )
      expect(zoomButtons).toHaveLength(2)
    })

    it('should render rotate controls', () => {
      const rotateButtons = wrapper.findAll('button').filter(btn => {
        const parent = btn.element.parentElement
        return parent?.previousElementSibling?.textContent?.includes('旋转控制')
      })
      expect(rotateButtons.length).toBeGreaterThanOrEqual(5)
    })

    it('should render reset button', () => {
      const resetButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('重置视图')
      )
      expect(resetButton).toBeDefined()
    })

    it('should not show advanced options by default', () => {
      const toggleButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('展开高级选项')
      )
      expect(toggleButton).toBeDefined()
    })
  })

  describe('Zoom Controls', () => {
    it('should emit zoom event with negative delta on zoom in', async () => {
      const zoomInButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('放大')
      )
      
      await zoomInButton?.trigger('click')
      await nextTick()
      
      expect(wrapper.emitted('zoom')).toBeTruthy()
      expect(wrapper.emitted('zoom')?.[0]).toEqual([-0.1])
    })

    it('should emit zoom event with positive delta on zoom out', async () => {
      const zoomOutButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('缩小')
      )
      
      await zoomOutButton?.trigger('click')
      await nextTick()
      
      expect(wrapper.emitted('zoom')).toBeTruthy()
      expect(wrapper.emitted('zoom')?.[0]).toEqual([0.1])
    })

    it('should emit multiple zoom events when clicked multiple times', async () => {
      const zoomInButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('放大')
      )
      
      await zoomInButton?.trigger('click')
      await zoomInButton?.trigger('click')
      await zoomInButton?.trigger('click')
      await nextTick()
      
      expect(wrapper.emitted('zoom')).toHaveLength(3)
    })
  })

  describe('Rotate Controls', () => {
    it('should emit rotate event with up direction', async () => {
      const buttons = wrapper.findAll('button')
      const upButton = buttons.find(btn => {
        const svg = btn.find('svg')
        const path = svg?.find('path')
        return path?.attributes('d')?.includes('M5 15l7-7 7 7')
      })
      
      await upButton?.trigger('click')
      await nextTick()
      
      expect(wrapper.emitted('rotate')).toBeTruthy()
      expect(wrapper.emitted('rotate')?.[0]).toEqual(['up'])
    })

    it('should emit rotate event with down direction', async () => {
      const buttons = wrapper.findAll('button')
      const downButton = buttons.find(btn => {
        try {
          const svg = btn.find('svg')
          if (!svg.exists()) return false
          const path = svg.find('path')
          if (!path.exists()) return false
          return path.attributes('d')?.includes('M19 9l-7 7-7-7')
        } catch {
          return false
        }
      })
      
      await downButton?.trigger('click')
      await nextTick()
      
      expect(wrapper.emitted('rotate')).toBeTruthy()
      expect(wrapper.emitted('rotate')?.[0]).toEqual(['down'])
    })

    it('should emit rotate event with left direction', async () => {
      const buttons = wrapper.findAll('button')
      const leftButton = buttons.find(btn => {
        const svg = btn.find('svg')
        const path = svg?.find('path')
        return path?.attributes('d')?.includes('M15 19l-7-7 7-7')
      })
      
      await leftButton?.trigger('click')
      await nextTick()
      
      expect(wrapper.emitted('rotate')).toBeTruthy()
      expect(wrapper.emitted('rotate')?.[0]).toEqual(['left'])
    })

    it('should emit rotate event with right direction', async () => {
      const buttons = wrapper.findAll('button')
      const rightButton = buttons.find(btn => {
        try {
          const svg = btn.find('svg')
          if (!svg.exists()) return false
          const path = svg.find('path')
          if (!path.exists()) return false
          return path.attributes('d')?.includes('M9 5l7 7-7 7')
        } catch {
          return false
        }
      })
      
      await rightButton?.trigger('click')
      await nextTick()
      
      expect(wrapper.emitted('rotate')).toBeTruthy()
      expect(wrapper.emitted('rotate')?.[0]).toEqual(['right'])
    })

    it('should emit rotate event with center direction', async () => {
      const centerButton = wrapper.findAll('button').find(btn => 
        btn.text() === '中'
      )
      
      await centerButton?.trigger('click')
      await nextTick()
      
      expect(wrapper.emitted('rotate')).toBeTruthy()
      expect(wrapper.emitted('rotate')?.[0]).toEqual(['center'])
    })
  })

  describe('Reset Control', () => {
    it('should emit reset event when reset button clicked', async () => {
      const resetButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('重置视图')
      )
      
      await resetButton?.trigger('click')
      await nextTick()
      
      expect(wrapper.emitted('reset')).toBeTruthy()
      expect(wrapper.emitted('reset')).toHaveLength(1)
    })

    it('should emit reset event multiple times when clicked repeatedly', async () => {
      const resetButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('重置视图')
      )
      
      await resetButton?.trigger('click')
      await resetButton?.trigger('click')
      await nextTick()
      
      expect(wrapper.emitted('reset')).toHaveLength(2)
    })
  })

  describe('Advanced Options', () => {
    it('should toggle advanced options visibility when toggle button clicked', async () => {
      const toggleButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('展开高级选项')
      )
      
      await toggleButton?.trigger('click')
      await nextTick()
      
      const advancedSection = wrapper.find('h4')
      expect(advancedSection.text()).toBe('高级选项')
      
      const newToggleButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('收起高级选项')
      )
      expect(newToggleButton).toBeDefined()
    })

    it('should show grid toggle in advanced options', async () => {
      const toggleButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('展开高级选项')
      )
      
      await toggleButton?.trigger('click')
      await nextTick()
      
      const gridLabel = wrapper.findAll('label').find(label => 
        label.text().includes('显示网格')
      )
      expect(gridLabel).toBeDefined()
    })

    it('should show axis toggle in advanced options', async () => {
      const toggleButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('展开高级选项')
      )
      
      await toggleButton?.trigger('click')
      await nextTick()
      
      const axisLabel = wrapper.findAll('label').find(label => 
        label.text().includes('显示坐标轴')
      )
      expect(axisLabel).toBeDefined()
    })

    it('should emit toggleGrid event when grid checkbox changed', async () => {
      const toggleButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('展开高级选项')
      )
      
      await toggleButton?.trigger('click')
      await nextTick()
      
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      const gridCheckbox = checkboxes[0]
      
      await gridCheckbox.setValue(true)
      await nextTick()
      
      expect(wrapper.emitted('toggleGrid')).toBeTruthy()
      expect(wrapper.emitted('toggleGrid')?.[0]).toEqual([true])
    })

    it('should emit toggleAxis event when axis checkbox changed', async () => {
      const toggleButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('展开高级选项')
      )
      
      await toggleButton?.trigger('click')
      await nextTick()
      
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      const axisCheckbox = checkboxes[1]
      
      await axisCheckbox.setValue(true)
      await nextTick()
      
      expect(wrapper.emitted('toggleAxis')).toBeTruthy()
      expect(wrapper.emitted('toggleAxis')?.[0]).toEqual([true])
    })

    it('should emit toggleGrid with false when unchecking', async () => {
      const toggleButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('展开高级选项')
      )
      
      await toggleButton?.trigger('click')
      await nextTick()
      
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      const gridCheckbox = checkboxes[0]
      
      await gridCheckbox.setValue(true)
      await nextTick()
      await gridCheckbox.setValue(false)
      await nextTick()
      
      expect(wrapper.emitted('toggleGrid')).toHaveLength(2)
      expect(wrapper.emitted('toggleGrid')?.[1]).toEqual([false])
    })
  })

  describe('Styling and Classes', () => {
    it('should have proper styling classes on zoom buttons', () => {
      const zoomButtons = wrapper.findAll('button').filter(btn => 
        btn.text().includes('放大') || btn.text().includes('缩小')
      )
      
      zoomButtons.forEach(button => {
        expect(button.classes()).toContain('bg-blue-500')
        expect(button.classes()).toContain('hover:bg-blue-600')
      })
    })

    it('should have proper styling on reset button', () => {
      const resetButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('重置视图')
      )
      
      expect(resetButton?.classes()).toContain('bg-gray-600')
      expect(resetButton?.classes()).toContain('hover:bg-gray-700')
    })

    it('should rotate toggle button icon when advanced options are shown', async () => {
      const toggleButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('展开高级选项')
      )
      
      await toggleButton?.trigger('click')
      await nextTick()
      
      const svg = toggleButton?.find('svg')
      expect(svg?.classes()).toContain('rotate-180')
    })
  })

  describe('Accessibility', () => {
    it('should have proper button labels', () => {
      const zoomInButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('放大')
      )
      const zoomOutButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('缩小')
      )
      const resetButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('重置视图')
      )
      
      expect(zoomInButton?.text()).toBeTruthy()
      expect(zoomOutButton?.text()).toBeTruthy()
      expect(resetButton?.text()).toBeTruthy()
    })

    it('should have labels for advanced options checkboxes', async () => {
      const toggleButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('展开高级选项')
      )
      
      await toggleButton?.trigger('click')
      await nextTick()
      
      const labels = wrapper.findAll('label')
      const gridLabel = labels.find(label => label.text().includes('显示网格'))
      const axisLabel = labels.find(label => label.text().includes('显示坐标轴'))
      
      expect(gridLabel).toBeDefined()
      expect(axisLabel).toBeDefined()
    })
  })

  describe('Event Emission Order', () => {
    it('should emit events in correct order for multiple actions', async () => {
      const zoomInButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('放大')
      )
      const resetButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('重置视图')
      )
      
      await zoomInButton?.trigger('click')
      await resetButton?.trigger('click')
      await zoomInButton?.trigger('click')
      await nextTick()
      
      expect(wrapper.emitted('zoom')).toHaveLength(2)
      expect(wrapper.emitted('reset')).toHaveLength(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid button clicks', async () => {
      const zoomInButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('放大')
      )
      
      for (let i = 0; i < 10; i++) {
        await zoomInButton?.trigger('click')
      }
      await nextTick()
      
      expect(wrapper.emitted('zoom')).toHaveLength(10)
    })

    it('should handle toggling advanced options rapidly', async () => {
      const toggleButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('高级选项')
      )
      
      await toggleButton?.trigger('click')
      await toggleButton?.trigger('click')
      await toggleButton?.trigger('click')
      await nextTick()
      
      const advancedSection = wrapper.find('h4')
      expect(advancedSection.text()).toBe('高级选项')
    })
  })
})
