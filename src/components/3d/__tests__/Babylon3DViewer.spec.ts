import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import Babylon3DViewer from '../Babylon3DViewer.vue'
import * as use3DViewerModule from '../../../composables/use3DViewer'

vi.mock('../../../composables/use3DViewer', () => {
  const mockUse3DViewer = {
    scene: { value: null },
    camera: { value: null },
    engine: { value: null },
    isInitialized: { value: false },
    currentModel: { value: null },
    initViewer: vi.fn(),
    loadModel: vi.fn(),
    exportSTL: vi.fn(),
    exportGLB: vi.fn(),
    dispose: vi.fn(),
  }
  
  return {
    use3DViewer: vi.fn(() => mockUse3DViewer),
  }
})

describe('Babylon3DViewer', () => {
  let wrapper: VueWrapper<InstanceType<typeof Babylon3DViewer>>
  let mockUse3DViewer: ReturnType<typeof use3DViewerModule.use3DViewer>

  beforeEach(() => {
    mockUse3DViewer = {
      scene: { value: null },
      camera: { value: null },
      engine: { value: null },
      isInitialized: { value: false },
      currentModel: { value: null },
      initViewer: vi.fn(),
      loadModel: vi.fn(),
      exportSTL: vi.fn(),
      exportGLB: vi.fn(),
      dispose: vi.fn(),
    }
    
    vi.mocked(use3DViewerModule.use3DViewer).mockReturnValue(mockUse3DViewer)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render canvas element', () => {
      wrapper = mount(Babylon3DViewer)
      
      const canvas = wrapper.find('canvas')
      expect(canvas.exists()).toBe(true)
      expect(canvas.classes()).toContain('viewer-canvas')
    })

    it('should have correct root class', () => {
      wrapper = mount(Babylon3DViewer)
      
      expect(wrapper.classes()).toContain('babylon-3d-viewer')
    })

    it('should not show loading overlay by default', () => {
      wrapper = mount(Babylon3DViewer)
      
      const loadingOverlay = wrapper.find('.loading-overlay')
      expect(loadingOverlay.exists()).toBe(false)
    })

    it('should not show error overlay by default', () => {
      wrapper = mount(Babylon3DViewer)
      
      const errorOverlay = wrapper.find('.error-overlay')
      expect(errorOverlay.exists()).toBe(false)
    })
  })

  describe('Initialization', () => {
    it('should initialize viewer on mount', () => {
      wrapper = mount(Babylon3DViewer)
      
      expect(mockUse3DViewer.initViewer).toHaveBeenCalledOnce()
    })

    it('should emit viewerReady on successful initialization', async () => {
      wrapper = mount(Babylon3DViewer)
      await nextTick()
      
      expect(wrapper.emitted('viewerReady')).toBeTruthy()
      expect(wrapper.emitted('viewerReady')).toHaveLength(1)
    })

    it('should handle initialization error', async () => {
      mockUse3DViewer.initViewer = vi.fn(() => {
        throw new Error('Initialization failed')
      })
      
      wrapper = mount(Babylon3DViewer)
      await nextTick()
      
      const errorOverlay = wrapper.find('.error-overlay')
      expect(errorOverlay.exists()).toBe(true)
      expect(errorOverlay.text()).toContain('Initialization failed')
    })

    it('should emit modelError on initialization failure', async () => {
      mockUse3DViewer.initViewer = vi.fn(() => {
        throw new Error('Initialization failed')
      })
      
      wrapper = mount(Babylon3DViewer)
      await nextTick()
      
      expect(wrapper.emitted('modelError')).toBeTruthy()
      expect(wrapper.emitted('modelError')?.[0]).toEqual(['Initialization failed'])
    })
  })

  describe('Model Loading', () => {
    it('should not auto-load model by default', () => {
      wrapper = mount(Babylon3DViewer, {
        props: {
          modelUrl: 'https://example.com/model.glb',
        },
      })
      
      expect(mockUse3DViewer.loadModel).not.toHaveBeenCalled()
    })

    it('should auto-load model when autoLoad is true', async () => {
      mockUse3DViewer.isInitialized.value = true
      wrapper = mount(Babylon3DViewer, {
        props: {
          modelUrl: 'https://example.com/model.glb',
          autoLoad: true,
        },
      })
      
      await nextTick()
      await nextTick()
      
      expect(mockUse3DViewer.loadModel).toHaveBeenCalledWith('https://example.com/model.glb')
    })

    it('should show loading overlay while loading model', async () => {
      let resolveLoad: () => void
      const loadPromise = new Promise<void>((resolve) => {
        resolveLoad = resolve
      })
      
      mockUse3DViewer.loadModel = vi.fn(() => loadPromise)
      mockUse3DViewer.isInitialized.value = true
      
      wrapper = mount(Babylon3DViewer, {
        props: {
          modelUrl: 'https://example.com/model.glb',
          autoLoad: true,
        },
      })
      
      await nextTick()
      await nextTick()
      
      expect(wrapper.classes()).toContain('is-loading')
      const loadingOverlay = wrapper.find('.loading-overlay')
      expect(loadingOverlay.exists()).toBe(true)
      expect(loadingOverlay.text()).toContain('Loading 3D model')
      
      resolveLoad!()
      await loadPromise
      await nextTick()
    })

    it('should emit modelLoaded on successful load', async () => {
      mockUse3DViewer.loadModel = vi.fn().mockResolvedValue(undefined)
      mockUse3DViewer.isInitialized.value = true
      
      wrapper = mount(Babylon3DViewer, {
        props: {
          modelUrl: 'https://example.com/model.glb',
          autoLoad: true,
        },
      })
      
      await nextTick()
      await nextTick()
      await nextTick()
      
      expect(wrapper.emitted('modelLoaded')).toBeTruthy()
    })

    it('should handle model loading error', async () => {
      mockUse3DViewer.loadModel = vi.fn().mockRejectedValue(new Error('Load failed'))
      mockUse3DViewer.isInitialized.value = true
      
      wrapper = mount(Babylon3DViewer, {
        props: {
          modelUrl: 'https://example.com/model.glb',
          autoLoad: true,
        },
      })
      
      await nextTick()
      await nextTick()
      await nextTick()
      
      const errorOverlay = wrapper.find('.error-overlay')
      expect(errorOverlay.exists()).toBe(true)
      expect(errorOverlay.text()).toContain('Load failed')
    })

    it('should emit modelError on load failure', async () => {
      mockUse3DViewer.loadModel = vi.fn().mockRejectedValue(new Error('Load failed'))
      mockUse3DViewer.isInitialized.value = true
      
      wrapper = mount(Babylon3DViewer, {
        props: {
          modelUrl: 'https://example.com/model.glb',
          autoLoad: true,
        },
      })
      
      await nextTick()
      await nextTick()
      await nextTick()
      
      expect(wrapper.emitted('modelError')).toBeTruthy()
      expect(wrapper.emitted('modelError')?.[0]).toEqual(['Load failed'])
    })

    it('should load new model when modelUrl changes', async () => {
      mockUse3DViewer.isInitialized.value = true
      mockUse3DViewer.loadModel = vi.fn().mockResolvedValue(undefined)
      
      wrapper = mount(Babylon3DViewer, {
        props: {
          modelUrl: 'https://example.com/model1.glb',
        },
      })
      
      await nextTick()
      
      await wrapper.setProps({ modelUrl: 'https://example.com/model2.glb' })
      await nextTick()
      await nextTick()
      
      expect(mockUse3DViewer.loadModel).toHaveBeenCalledWith('https://example.com/model2.glb')
    })

    it('should not load empty modelUrl on change', async () => {
      mockUse3DViewer.isInitialized.value = true
      mockUse3DViewer.loadModel = vi.fn().mockResolvedValue(undefined)
      
      wrapper = mount(Babylon3DViewer, {
        props: {
          modelUrl: 'https://example.com/model.glb',
        },
      })
      
      await nextTick()
      
      await wrapper.setProps({ modelUrl: '' })
      await nextTick()
      
      expect(mockUse3DViewer.loadModel).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should display error message', async () => {
      mockUse3DViewer.initViewer = vi.fn(() => {
        throw new Error('Test error message')
      })
      
      wrapper = mount(Babylon3DViewer)
      await nextTick()
      
      const errorMessage = wrapper.find('.error-message')
      expect(errorMessage.text()).toBe('Test error message')
    })

    it('should clear error when close button is clicked', async () => {
      mockUse3DViewer.initViewer = vi.fn(() => {
        throw new Error('Test error')
      })
      
      wrapper = mount(Babylon3DViewer)
      await nextTick()
      
      let errorOverlay = wrapper.find('.error-overlay')
      expect(errorOverlay.exists()).toBe(true)
      
      const closeButton = wrapper.find('.error-button')
      await closeButton.trigger('click')
      await nextTick()
      
      errorOverlay = wrapper.find('.error-overlay')
      expect(errorOverlay.exists()).toBe(false)
    })
  })

  describe('Export Functions', () => {
    it('should expose exportSTL method', async () => {
      const mockBlob = new Blob(['STL data'], { type: 'application/octet-stream' })
      mockUse3DViewer.exportSTL = vi.fn().mockResolvedValue(mockBlob)
      
      wrapper = mount(Babylon3DViewer)
      
      const result = await wrapper.vm.exportSTL()
      
      expect(mockUse3DViewer.exportSTL).toHaveBeenCalled()
      expect(result).toBe(mockBlob)
    })

    it('should handle exportSTL error', async () => {
      mockUse3DViewer.exportSTL = vi.fn().mockRejectedValue(new Error('Export failed'))
      
      wrapper = mount(Babylon3DViewer)
      await nextTick()
      
      const result = await wrapper.vm.exportSTL()
      
      expect(result).toBeNull()
      const errorOverlay = wrapper.find('.error-overlay')
      expect(errorOverlay.exists()).toBe(true)
      expect(errorOverlay.text()).toContain('Export failed')
    })

    it('should expose exportGLB method', async () => {
      const mockBlob = new Blob(['GLB data'], { type: 'model/gltf-binary' })
      mockUse3DViewer.exportGLB = vi.fn().mockResolvedValue(mockBlob)
      
      wrapper = mount(Babylon3DViewer)
      
      const result = await wrapper.vm.exportGLB()
      
      expect(mockUse3DViewer.exportGLB).toHaveBeenCalled()
      expect(result).toBe(mockBlob)
    })

    it('should handle exportGLB error', async () => {
      mockUse3DViewer.exportGLB = vi.fn().mockRejectedValue(new Error('Export failed'))
      
      wrapper = mount(Babylon3DViewer)
      await nextTick()
      
      const result = await wrapper.vm.exportGLB()
      
      expect(result).toBeNull()
      const errorOverlay = wrapper.find('.error-overlay')
      expect(errorOverlay.exists()).toBe(true)
      expect(errorOverlay.text()).toContain('Export failed')
    })
  })

  describe('Exposed Properties', () => {
    it('should expose scene ref', () => {
      wrapper = mount(Babylon3DViewer)
      
      expect(wrapper.vm.scene).toBe(mockUse3DViewer.scene)
    })

    it('should expose camera ref', () => {
      wrapper = mount(Babylon3DViewer)
      
      expect(wrapper.vm.camera).toBe(mockUse3DViewer.camera)
    })

    it('should expose engine ref', () => {
      wrapper = mount(Babylon3DViewer)
      
      expect(wrapper.vm.engine).toBe(mockUse3DViewer.engine)
    })

    it('should expose isInitialized ref', () => {
      wrapper = mount(Babylon3DViewer)
      
      expect(wrapper.vm.isInitialized).toBe(mockUse3DViewer.isInitialized)
    })

    it('should expose currentModel ref', () => {
      wrapper = mount(Babylon3DViewer)
      
      expect(wrapper.vm.currentModel).toBe(mockUse3DViewer.currentModel)
    })

    it('should expose loadModel method', () => {
      wrapper = mount(Babylon3DViewer)
      
      expect(typeof wrapper.vm.loadModel).toBe('function')
    })

    it('should expose dispose method', () => {
      wrapper = mount(Babylon3DViewer)
      
      expect(wrapper.vm.dispose).toBe(mockUse3DViewer.dispose)
    })
  })
})
