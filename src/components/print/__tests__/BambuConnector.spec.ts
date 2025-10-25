import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { ref, computed } from 'vue'
import BambuConnector from '../BambuConnector.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'

const mockConnected = ref(false)
const mockPrinters = ref<string[]>([])
const mockError = ref<string | null>(null)
const mockIsChecking = ref(false)

vi.mock('@/composables/useBambuConnect', () => ({
  useBambuConnect: () => {
    const hasPrinters = computed(() => mockPrinters.value.length > 0)
    const hasError = computed(() => mockError.value !== null)
    
    return {
      connected: mockConnected,
      printers: mockPrinters,
      error: mockError,
      isChecking: mockIsChecking,
      hasPrinters,
      hasError,
      checkBambuConnect: vi.fn().mockResolvedValue(true),
    }
  },
}))

describe('BambuConnector', () => {
  let wrapper: VueWrapper<InstanceType<typeof BambuConnector>>

  beforeEach(() => {
    mockConnected.value = false
    mockPrinters.value = []
    mockError.value = null
    mockIsChecking.value = false
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component Rendering', () => {
    it('should render the component', () => {
      wrapper = mount(BambuConnector, {
        global: {
          components: {
            Card,
            Button,
          },
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should render connection status indicator', () => {
      wrapper = mount(BambuConnector, {
        global: {
          components: {
            Card,
            Button,
          },
        },
      })

      const statusIndicator = wrapper.find('.w-3.h-3.rounded-full')
      expect(statusIndicator.exists()).toBe(true)
    })

    it('should render check connection button', () => {
      wrapper = mount(BambuConnector, {
        global: {
          components: {
            Card,
            Button,
          },
        },
      })

      const button = wrapper.findComponent(Button)
      expect(button.exists()).toBe(true)
      expect(button.text()).toContain('Check Connection')
    })
  })

  describe('Connection Status Display', () => {
    it('should show disconnected status initially', () => {
      wrapper = mount(BambuConnector, {
        global: {
          components: {
            Card,
            Button,
          },
        },
      })

      expect(wrapper.text()).toContain('Disconnected')
      const statusIndicator = wrapper.find('.w-3.h-3.rounded-full')
      expect(statusIndicator.classes()).toContain('bg-red-500')
    })
  })

  describe('Print Settings Form', () => {
    beforeEach(() => {
      mockConnected.value = true
      mockPrinters.value = ['Bambu Lab X1 Carbon']
    })

    it('should render material select', () => {
      wrapper = mount(BambuConnector, {
        global: {
          components: {
            Card,
            Button,
          },
        },
      })

      const materialSelect = wrapper.find('#material')
      expect(materialSelect.exists()).toBe(true)
    })

    it('should render layer height input', () => {
      wrapper = mount(BambuConnector, {
        global: {
          components: {
            Card,
            Button,
          },
        },
      })

      const layerHeightInput = wrapper.find('#layerHeight')
      expect(layerHeightInput.exists()).toBe(true)
    })

    it('should render infill density input', () => {
      wrapper = mount(BambuConnector, {
        global: {
          components: {
            Card,
            Button,
          },
        },
      })

      const infillDensityInput = wrapper.find('#infillDensity')
      expect(infillDensityInput.exists()).toBe(true)
    })

    it('should render supports checkbox', () => {
      wrapper = mount(BambuConnector, {
        global: {
          components: {
            Card,
            Button,
          },
        },
      })

      const supportsCheckbox = wrapper.find('#supports')
      expect(supportsCheckbox.exists()).toBe(true)
    })

    it('should render temperature input', () => {
      wrapper = mount(BambuConnector, {
        global: {
          components: {
            Card,
            Button,
          },
        },
      })

      const temperatureInput = wrapper.find('#temperature')
      expect(temperatureInput.exists()).toBe(true)
    })
  })

  describe('Material Options', () => {
    beforeEach(() => {
      mockConnected.value = true
      mockPrinters.value = ['Bambu Lab X1 Carbon']
    })

    it('should have PLA option', () => {
      wrapper = mount(BambuConnector, {
        global: {
          components: {
            Card,
            Button,
          },
        },
      })

      const materialSelect = wrapper.find('#material')
      const options = materialSelect.findAll('option')
      const plaOption = options.find((option) => option.text() === 'PLA')
      expect(plaOption).toBeTruthy()
    })

    it('should have ABS option', () => {
      wrapper = mount(BambuConnector, {
        global: {
          components: {
            Card,
            Button,
          },
        },
      })

      const materialSelect = wrapper.find('#material')
      const options = materialSelect.findAll('option')
      const absOption = options.find((option) => option.text() === 'ABS')
      expect(absOption).toBeTruthy()
    })

    it('should have PETG option', () => {
      wrapper = mount(BambuConnector, {
        global: {
          components: {
            Card,
            Button,
          },
        },
      })

      const materialSelect = wrapper.find('#material')
      const options = materialSelect.findAll('option')
      const petgOption = options.find((option) => option.text() === 'PETG')
      expect(petgOption).toBeTruthy()
    })

    it('should have TPU option', () => {
      wrapper = mount(BambuConnector, {
        global: {
          components: {
            Card,
            Button,
          },
        },
      })

      const materialSelect = wrapper.find('#material')
      const options = materialSelect.findAll('option')
      const tpuOption = options.find((option) => option.text() === 'TPU')
      expect(tpuOption).toBeTruthy()
    })
  })

  describe('Input Validation', () => {
    beforeEach(() => {
      mockConnected.value = true
      mockPrinters.value = ['Bambu Lab X1 Carbon']
      
      wrapper = mount(BambuConnector, {
        global: {
          components: {
            Card,
            Button,
          },
        },
      })
    })

    it('should have correct min/max for layer height', () => {
      const layerHeightInput = wrapper.find('#layerHeight')
      expect(layerHeightInput.attributes('min')).toBe('0.1')
      expect(layerHeightInput.attributes('max')).toBe('0.4')
      expect(layerHeightInput.attributes('step')).toBe('0.01')
    })

    it('should have correct min/max for infill density', () => {
      const infillDensityInput = wrapper.find('#infillDensity')
      expect(infillDensityInput.attributes('min')).toBe('0')
      expect(infillDensityInput.attributes('max')).toBe('100')
      expect(infillDensityInput.attributes('step')).toBe('5')
    })

    it('should have correct min/max for temperature', () => {
      const temperatureInput = wrapper.find('#temperature')
      expect(temperatureInput.attributes('min')).toBe('180')
      expect(temperatureInput.attributes('max')).toBe('280')
      expect(temperatureInput.attributes('step')).toBe('5')
    })
  })
})
