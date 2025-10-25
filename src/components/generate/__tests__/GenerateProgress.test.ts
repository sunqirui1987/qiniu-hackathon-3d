import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import GenerateProgress from '../GenerateProgress.vue'

describe('GenerateProgress', () => {
  it('should render idle status', () => {
    const wrapper = mount(GenerateProgress, {
      props: {
        status: 'idle',
        progress: 0
      }
    })

    expect(wrapper.text()).toContain('等待开始')
  })

  it('should render uploading status', () => {
    const wrapper = mount(GenerateProgress, {
      props: {
        status: 'uploading',
        progress: 20
      }
    })

    expect(wrapper.text()).toContain('上传图片中')
    expect(wrapper.text()).toContain('20%')
  })

  it('should render generating status', () => {
    const wrapper = mount(GenerateProgress, {
      props: {
        status: 'generating',
        progress: 50
      }
    })

    expect(wrapper.text()).toContain('生成中')
    expect(wrapper.text()).toContain('50%')
  })

  it('should render completed status', () => {
    const wrapper = mount(GenerateProgress, {
      props: {
        status: 'completed',
        progress: 100
      }
    })

    expect(wrapper.text()).toContain('生成完成')
    expect(wrapper.text()).toContain('100%')
  })

  it('should render error status', () => {
    const wrapper = mount(GenerateProgress, {
      props: {
        status: 'error',
        progress: 0,
        error: 'Network error'
      }
    })

    expect(wrapper.text()).toContain('生成失败')
    expect(wrapper.text()).toContain('Network error')
  })

  it('should show cancel button when generating', () => {
    const onCancel = vi.fn()
    const wrapper = mount(GenerateProgress, {
      props: {
        status: 'generating',
        progress: 50,
        onCancel
      }
    })

    const cancelBtn = wrapper.find('button')
    expect(cancelBtn.text()).toContain('取消生成')
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn()
    const wrapper = mount(GenerateProgress, {
      props: {
        status: 'generating',
        progress: 50,
        onCancel
      }
    })

    const cancelBtn = wrapper.find('button')
    await cancelBtn.trigger('click')

    expect(onCancel).toHaveBeenCalled()
  })

  it('should not show cancel button when completed', () => {
    const wrapper = mount(GenerateProgress, {
      props: {
        status: 'completed',
        progress: 100
      }
    })

    const cancelBtn = wrapper.find('button')
    expect(cancelBtn.exists()).toBe(false)
  })

  it('should show progress bar with correct width', () => {
    const wrapper = mount(GenerateProgress, {
      props: {
        status: 'generating',
        progress: 75
      }
    })

    const progressBar = wrapper.find('.bg-blue-600')
    expect(progressBar.attributes('style')).toContain('width: 75%')
  })

  it('should show different stage text based on progress', () => {
    const wrapper = mount(GenerateProgress, {
      props: {
        status: 'generating',
        progress: 30
      }
    })

    expect(wrapper.text()).toContain('第一阶段: 生成预览模型')
  })

  it('should show second stage text when progress > 50', () => {
    const wrapper = mount(GenerateProgress, {
      props: {
        status: 'generating',
        progress: 70
      }
    })

    expect(wrapper.text()).toContain('第二阶段: 精细化处理')
  })

  it('should show estimated time when provided', () => {
    const wrapper = mount(GenerateProgress, {
      props: {
        status: 'generating',
        progress: 50,
        estimatedTime: '约3分钟'
      }
    })

    expect(wrapper.text()).toContain('预计剩余时间: 约3分钟')
  })

  it('should show task details when provided', () => {
    const wrapper = mount(GenerateProgress, {
      props: {
        status: 'generating',
        progress: 50,
        taskDetails: {
          id: 'task-123',
          type: 'text-to-3d',
          createdAt: new Date('2024-01-01T00:00:00Z')
        }
      }
    })

    expect(wrapper.text()).toContain('task-123')
    expect(wrapper.text()).toContain('文本生成')
  })

  it('should show preview image when provided', () => {
    const wrapper = mount(GenerateProgress, {
      props: {
        status: 'generating',
        progress: 50,
        previewUrl: 'https://example.com/preview.jpg'
      }
    })

    const previewImg = wrapper.find('img[alt="Preview"]')
    expect(previewImg.exists()).toBe(true)
    expect(previewImg.attributes('src')).toBe('https://example.com/preview.jpg')
  })

  it('should apply different progress bar colors based on status', () => {
    const uploadingWrapper = mount(GenerateProgress, {
      props: { status: 'uploading', progress: 20 }
    })
    expect(uploadingWrapper.find('.bg-yellow-500').exists()).toBe(true)

    const generatingWrapper = mount(GenerateProgress, {
      props: { status: 'generating', progress: 50 }
    })
    expect(generatingWrapper.find('.bg-blue-600').exists()).toBe(true)

    const completedWrapper = mount(GenerateProgress, {
      props: { status: 'completed', progress: 100 }
    })
    expect(completedWrapper.find('.bg-green-600').exists()).toBe(true)

    const errorWrapper = mount(GenerateProgress, {
      props: { status: 'error', progress: 0, error: 'Error' }
    })
    expect(errorWrapper.find('.bg-red-600').exists()).toBe(true)
  })

  it('should show success message when completed', () => {
    const wrapper = mount(GenerateProgress, {
      props: {
        status: 'completed',
        progress: 100
      }
    })

    expect(wrapper.text()).toContain('生成完成!')
  })

  it('should show loading spinner when generating', () => {
    const wrapper = mount(GenerateProgress, {
      props: {
        status: 'generating',
        progress: 50
      }
    })

    const spinner = wrapper.find('.animate-spin')
    expect(spinner.exists()).toBe(true)
  })
})
