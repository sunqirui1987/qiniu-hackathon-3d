import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import Viewer from '../Viewer.vue'
import Babylon3DViewer from '@/components/3d/Babylon3DViewer.vue'
import ModelControls from '@/components/3d/ModelControls.vue'
import PropertyPanel from '@/components/3d/PropertyPanel.vue'
import FileImport from '@/components/3d/FileImport.vue'
import ExportPanel from '@/components/3d/ExportPanel.vue'

vi.mock('@/components/3d/Babylon3DViewer.vue', () => ({
  default: {
    name: 'Babylon3DViewer',
    template: '<div class="babylon-viewer-mock"></div>',
    props: ['modelUrl', 'autoLoad'],
    emits: ['loaded', 'error', 'viewerReady', 'modelLoaded', 'modelError'],
    methods: {
      loadModel: vi.fn(),
      exportSTL: vi.fn(() => new Blob(['stl content'], { type: 'application/octet-stream' })),
      exportGLB: vi.fn(() => Promise.resolve(new Blob(['glb content'], { type: 'model/gltf-binary' }))),
      resetCamera: vi.fn(),
      setZoom: vi.fn(),
      rotateModel: vi.fn(),
    },
  },
}))

vi.mock('@/components/3d/ModelControls.vue', () => ({
  default: {
    name: 'ModelControls',
    template: '<div class="model-controls-mock"></div>',
    emits: ['zoom', 'rotate', 'reset', 'toggleGrid', 'toggleAxis'],
  },
}))

vi.mock('@/components/3d/PropertyPanel.vue', () => ({
  default: {
    name: 'PropertyPanel',
    template: '<div class="property-panel-mock"></div>',
    props: ['modelInfo'],
  },
}))

vi.mock('@/components/3d/FileImport.vue', () => ({
  default: {
    name: 'FileImport',
    template: '<div class="file-import-mock"></div>',
    emits: ['fileSelected'],
  },
}))

vi.mock('@/components/3d/ExportPanel.vue', () => ({
  default: {
    name: 'ExportPanel',
    template: '<div class="export-panel-mock"></div>',
    props: ['hasModel'],
    emits: ['export'],
  },
}))

describe('Viewer.vue', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mount(Viewer, {
      global: {
        stubs: {
          Babylon3DViewer,
          ModelControls,
          PropertyPanel,
          FileImport,
          ExportPanel,
        },
      },
    })
  })

  describe('Rendering', () => {
    it('renders page title and description', () => {
      expect(wrapper.find('h1').text()).toBe('3D查看器')
      expect(wrapper.find('p').text()).toContain('查看、编辑和导出3D模型')
    })

    it('renders all child components', () => {
      expect(wrapper.findComponent(Babylon3DViewer).exists()).toBe(true)
      expect(wrapper.findComponent(ModelControls).exists()).toBe(true)
      expect(wrapper.findComponent(PropertyPanel).exists()).toBe(true)
      expect(wrapper.findComponent(FileImport).exists()).toBe(true)
      expect(wrapper.findComponent(ExportPanel).exists()).toBe(true)
    })

    it('renders fullscreen toggle button', () => {
      const fullscreenButton = wrapper.find('button[class*="absolute top-4 right-4"]')
      expect(fullscreenButton.exists()).toBe(true)
    })
  })

  describe('Fullscreen Mode', () => {
    it('toggles fullscreen mode when button is clicked', async () => {
      const fullscreenButton = wrapper.find('button[class*="absolute top-4 right-4"]')
      
      expect(wrapper.find('.fixed.inset-0.z-50').exists()).toBe(false)
      
      await fullscreenButton.trigger('click')
      
      expect(wrapper.find('.fixed.inset-0.z-50').exists()).toBe(true)
    })

    it('hides sidebar components in fullscreen mode', async () => {
      const fullscreenButton = wrapper.find('button[class*="absolute top-4 right-4"]')
      
      expect(wrapper.findComponent(ModelControls).exists()).toBe(true)
      expect(wrapper.findComponent(PropertyPanel).exists()).toBe(true)
      expect(wrapper.findComponent(FileImport).exists()).toBe(true)
      expect(wrapper.findComponent(ExportPanel).exists()).toBe(true)
      
      await fullscreenButton.trigger('click')
      
      expect(wrapper.find('.col-span-12.lg\\:col-span-4').exists()).toBe(false)
    })

    it('hides page title in fullscreen mode', async () => {
      const fullscreenButton = wrapper.find('button[class*="absolute top-4 right-4"]')
      
      expect(wrapper.find('h1').exists()).toBe(true)
      
      await fullscreenButton.trigger('click')
      
      expect(wrapper.find('h1').exists()).toBe(false)
    })

    it('shows correct icon for fullscreen state', async () => {
      const fullscreenButton = wrapper.find('button[class*="absolute top-4 right-4"]')
      
      const expandIcon = fullscreenButton.findAll('svg')[0]
      expect(expandIcon.exists()).toBe(true)
      
      await fullscreenButton.trigger('click')
      
      const closeIcon = fullscreenButton.findAll('svg')[1]
      expect(closeIcon.exists()).toBe(true)
    })
  })

  describe('File Import', () => {
    it('handles file selection correctly', async () => {
      const fileImport = wrapper.findComponent(FileImport)
      const mockFile = new File(['content'], 'test-model.glb', { type: 'model/gltf-binary' })
      
      const viewerComponent = wrapper.findComponent(Babylon3DViewer)
      const loadModelSpy = vi.spyOn(viewerComponent.vm as unknown as Record<string, unknown>, 'loadModel')
      
      await fileImport.vm.$emit('fileSelected', mockFile)
      await wrapper.vm.$nextTick()
      
      expect(loadModelSpy).toHaveBeenCalled()
    })

    it('shows success notification after successful load', async () => {
      const fileImport = wrapper.findComponent(FileImport)
      const mockFile = new File(['content'], 'test-model.glb', { type: 'model/gltf-binary' })
      
      await fileImport.vm.$emit('fileSelected', mockFile)
      await wrapper.vm.$nextTick()
      
      setTimeout(() => {
        expect(wrapper.find('.border-green-500').exists()).toBe(true)
        expect(wrapper.text()).toContain('加载成功')
      }, 100)
    })

    it('shows error notification on load failure', async () => {
      const viewerComponent = wrapper.findComponent(Babylon3DViewer)
      
      await viewerComponent.vm.$emit('error', '加载失败: 无效的文件格式')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.border-red-500').exists()).toBe(true)
      expect(wrapper.text()).toContain('加载错误')
    })
  })

  describe('Model Controls', () => {
    it('handles zoom in event', async () => {
      const modelControls = wrapper.findComponent(ModelControls)
      const viewerComponent = wrapper.findComponent(Babylon3DViewer)
      const setZoomSpy = vi.spyOn(viewerComponent.vm as unknown as Record<string, unknown>, 'setZoom')
      
      await modelControls.vm.$emit('zoom', -0.1)
      await wrapper.vm.$nextTick()
      
      expect(setZoomSpy).toHaveBeenCalledWith(-0.1)
    })

    it('handles zoom out event', async () => {
      const modelControls = wrapper.findComponent(ModelControls)
      const viewerComponent = wrapper.findComponent(Babylon3DViewer)
      const setZoomSpy = vi.spyOn(viewerComponent.vm as unknown as Record<string, unknown>, 'setZoom')
      
      await modelControls.vm.$emit('zoom', 0.1)
      await wrapper.vm.$nextTick()
      
      expect(setZoomSpy).toHaveBeenCalledWith(0.1)
    })

    it('handles rotate up event', async () => {
      const modelControls = wrapper.findComponent(ModelControls)
      const viewerComponent = wrapper.findComponent(Babylon3DViewer)
      const rotateModelSpy = vi.spyOn(viewerComponent.vm as unknown as Record<string, unknown>, 'rotateModel')
      
      await modelControls.vm.$emit('rotate', 'up')
      await wrapper.vm.$nextTick()
      
      expect(rotateModelSpy).toHaveBeenCalledWith(0, -0.1)
    })

    it('handles rotate down event', async () => {
      const modelControls = wrapper.findComponent(ModelControls)
      const viewerComponent = wrapper.findComponent(Babylon3DViewer)
      const rotateModelSpy = vi.spyOn(viewerComponent.vm as unknown as Record<string, unknown>, 'rotateModel')
      
      await modelControls.vm.$emit('rotate', 'down')
      await wrapper.vm.$nextTick()
      
      expect(rotateModelSpy).toHaveBeenCalledWith(0, 0.1)
    })

    it('handles rotate left event', async () => {
      const modelControls = wrapper.findComponent(ModelControls)
      const viewerComponent = wrapper.findComponent(Babylon3DViewer)
      const rotateModelSpy = vi.spyOn(viewerComponent.vm as unknown as Record<string, unknown>, 'rotateModel')
      
      await modelControls.vm.$emit('rotate', 'left')
      await wrapper.vm.$nextTick()
      
      expect(rotateModelSpy).toHaveBeenCalledWith(-0.1, 0)
    })

    it('handles rotate right event', async () => {
      const modelControls = wrapper.findComponent(ModelControls)
      const viewerComponent = wrapper.findComponent(Babylon3DViewer)
      const rotateModelSpy = vi.spyOn(viewerComponent.vm as unknown as Record<string, unknown>, 'rotateModel')
      
      await modelControls.vm.$emit('rotate', 'right')
      await wrapper.vm.$nextTick()
      
      expect(rotateModelSpy).toHaveBeenCalledWith(0.1, 0)
    })

    it('handles reset camera event', async () => {
      const modelControls = wrapper.findComponent(ModelControls)
      const viewerComponent = wrapper.findComponent(Babylon3DViewer)
      const resetCameraSpy = vi.spyOn(viewerComponent.vm as unknown as Record<string, unknown>, 'resetCamera')
      
      await modelControls.vm.$emit('reset')
      await wrapper.vm.$nextTick()
      
      expect(resetCameraSpy).toHaveBeenCalled()
    })
  })

  describe('Model Info', () => {
    it('updates model info when model is loaded', async () => {
      const mockModelInfo = {
        vertices: 1000,
        faces: 500,
        materials: 2,
        boundingBox: {
          size: { x: 10, y: 20, z: 30 },
          center: { x: 0, y: 0, z: 0 },
        },
      }
      
      const viewerComponent = wrapper.findComponent(Babylon3DViewer)
      await viewerComponent.vm.$emit('loaded', mockModelInfo)
      await wrapper.vm.$nextTick()
      
      const propertyPanel = wrapper.findComponent(PropertyPanel)
      expect(propertyPanel.props('modelInfo')).toEqual(mockModelInfo)
    })

    it('passes null model info initially', () => {
      const propertyPanel = wrapper.findComponent(PropertyPanel)
      expect(propertyPanel.props('modelInfo')).toBeNull()
    })
  })

  describe('Export Functionality', () => {
    beforeEach(() => {
      global.URL.createObjectURL = vi.fn(() => 'mock-url')
      global.URL.revokeObjectURL = vi.fn()
    })

    it('exports model as STL when requested', async () => {
      const mockModelInfo = {
        vertices: 1000,
        faces: 500,
        materials: 2,
        boundingBox: {
          size: { x: 10, y: 20, z: 30 },
          center: { x: 0, y: 0, z: 0 },
        },
      }
      
      const viewerComponent = wrapper.findComponent(Babylon3DViewer)
      await viewerComponent.vm.$emit('loaded', mockModelInfo)
      await wrapper.vm.$nextTick()
      
      const exportPanel = wrapper.findComponent(ExportPanel)
      const exportSTLSpy = vi.spyOn(viewerComponent.vm as unknown as Record<string, unknown>, 'exportSTL')
      
      await exportPanel.vm.$emit('export', 'stl', 'test-model')
      await wrapper.vm.$nextTick()
      
      expect(exportSTLSpy).toHaveBeenCalled()
    })

    it('exports model as GLB when requested', async () => {
      const mockModelInfo = {
        vertices: 1000,
        faces: 500,
        materials: 2,
        boundingBox: {
          size: { x: 10, y: 20, z: 30 },
          center: { x: 0, y: 0, z: 0 },
        },
      }
      
      const viewerComponent = wrapper.findComponent(Babylon3DViewer)
      await viewerComponent.vm.$emit('loaded', mockModelInfo)
      await wrapper.vm.$nextTick()
      
      const exportPanel = wrapper.findComponent(ExportPanel)
      const exportGLBSpy = vi.spyOn(viewerComponent.vm as unknown as Record<string, unknown>, 'exportGLB')
      
      await exportPanel.vm.$emit('export', 'glb', 'test-model')
      await wrapper.vm.$nextTick()
      
      expect(exportGLBSpy).toHaveBeenCalled()
    })

    it('shows error notification for unsupported format', async () => {
      const mockModelInfo = {
        vertices: 1000,
        faces: 500,
        materials: 2,
        boundingBox: {
          size: { x: 10, y: 20, z: 30 },
          center: { x: 0, y: 0, z: 0 },
        },
      }
      
      const viewerComponent = wrapper.findComponent(Babylon3DViewer)
      await viewerComponent.vm.$emit('loaded', mockModelInfo)
      await wrapper.vm.$nextTick()
      
      const exportPanel = wrapper.findComponent(ExportPanel)
      await exportPanel.vm.$emit('export', 'fbx', 'test-model')
      await wrapper.vm.$nextTick()
      
      setTimeout(() => {
        expect(wrapper.find('.border-red-500').exists()).toBe(true)
        expect(wrapper.text()).toContain('暂不支持')
      }, 100)
    })

    it('shows success notification after successful export', async () => {
      const mockModelInfo = {
        vertices: 1000,
        faces: 500,
        materials: 2,
        boundingBox: {
          size: { x: 10, y: 20, z: 30 },
          center: { x: 0, y: 0, z: 0 },
        },
      }
      
      const viewerComponent = wrapper.findComponent(Babylon3DViewer)
      await viewerComponent.vm.$emit('loaded', mockModelInfo)
      await wrapper.vm.$nextTick()
      
      const exportPanel = wrapper.findComponent(ExportPanel)
      await exportPanel.vm.$emit('export', 'stl', 'test-model')
      await wrapper.vm.$nextTick()
      
      setTimeout(() => {
        expect(wrapper.find('.border-green-500').exists()).toBe(true)
        expect(wrapper.text()).toContain('导出成功')
      }, 100)
    })
  })

  describe('Notifications', () => {
    it('displays notification with correct styling', async () => {
      const viewerComponent = wrapper.findComponent(Babylon3DViewer)
      await viewerComponent.vm.$emit('error', 'Test error message')
      await wrapper.vm.$nextTick()
      
      const notification = wrapper.find('.fixed.bottom-6.right-6')
      expect(notification.exists()).toBe(true)
      expect(notification.classes()).toContain('border-red-500')
    })

    it('can close notification', async () => {
      const viewerComponent = wrapper.findComponent(Babylon3DViewer)
      await viewerComponent.vm.$emit('error', 'Test error message')
      await wrapper.vm.$nextTick()
      
      const closeButton = wrapper.find('.fixed.bottom-6.right-6 button')
      expect(closeButton.exists()).toBe(true)
      
      await closeButton.trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.fixed.bottom-6.right-6').exists()).toBe(false)
    })

    it('auto-closes notification after 5 seconds', async () => {
      vi.useFakeTimers()
      
      const viewerComponent = wrapper.findComponent(Babylon3DViewer)
      await viewerComponent.vm.$emit('error', 'Test error message')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.fixed.bottom-6.right-6').exists()).toBe(true)
      
      vi.advanceTimersByTime(5000)
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.fixed.bottom-6.right-6').exists()).toBe(false)
      
      vi.useRealTimers()
    })
  })

  describe('Component Integration', () => {
    it('passes correct props to Babylon3DViewer', () => {
      const viewerComponent = wrapper.findComponent(Babylon3DViewer)
      expect(viewerComponent.props('modelUrl')).toBe('')
      expect(viewerComponent.props('autoLoad')).toBe(false)
    })

    it('passes correct props to PropertyPanel', async () => {
      const propertyPanel = wrapper.findComponent(PropertyPanel)
      expect(propertyPanel.props('modelInfo')).toBeNull()
      
      const mockModelInfo = {
        vertices: 1000,
        faces: 500,
        materials: 2,
        boundingBox: {
          size: { x: 10, y: 20, z: 30 },
          center: { x: 0, y: 0, z: 0 },
        },
      }
      
      const viewerComponent = wrapper.findComponent(Babylon3DViewer)
      await viewerComponent.vm.$emit('loaded', mockModelInfo)
      await wrapper.vm.$nextTick()
      
      expect(propertyPanel.props('modelInfo')).toEqual(mockModelInfo)
    })

    it('passes correct props to ExportPanel', async () => {
      const exportPanel = wrapper.findComponent(ExportPanel)
      expect(exportPanel.props('hasModel')).toBe(false)
      
      const mockModelInfo = {
        vertices: 1000,
        faces: 500,
        materials: 2,
        boundingBox: {
          size: { x: 10, y: 20, z: 30 },
          center: { x: 0, y: 0, z: 0 },
        },
      }
      
      const viewerComponent = wrapper.findComponent(Babylon3DViewer)
      await viewerComponent.vm.$emit('loaded', mockModelInfo)
      await wrapper.vm.$nextTick()
      
      expect(exportPanel.props('hasModel')).toBe(true)
    })
  })
})
