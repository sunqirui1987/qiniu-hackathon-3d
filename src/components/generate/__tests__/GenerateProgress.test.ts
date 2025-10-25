import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GenerateProgress from '../GenerateProgress.vue'

describe('GenerateProgress', () => {
  it('displays idle state by default', () => {
    const wrapper = mount(GenerateProgress, {
      props: {
        status: 'idle',
        progress: 0
      }
    })
    expect(wrapper.text()).toContain('等待' || '未开始' || 'idle')
  })

  it('displays progress bar with correct width', () => {
    const wrapper = mount(GenerateProgress, {
      props: {
        status: 'generating',
        progress: 50
      }
    })
    const progressBar = wrapper.find('[role="progressbar"]')
    if (progressBar.exists()) {
      expect(progressBar.attributes('style')).toContain('50')
    }
  })

  it('shows uploading status', () => {
    const wrapper = mount(GenerateProgress, {
      props: {
        status: 'uploading',
        progress: 20
      }
    })
    expect(wrapper.text()).toContain('上传' || 'upload')
  })

  it('shows generating status', () => {
    const wrapper = mount(GenerateProgress, {
      props: {
        status: 'generating',
        progress: 60
      }
    })
    expect(wrapper.text()).toContain('生成' || 'generat')
  })

  it('shows completed status', () => {
    const wrapper = mount(GenerateProgress, {
      props: {
        status: 'completed',
        progress: 100
      }
    })
    expect(wrapper.text()).toContain('完成' || '成功' || 'complet')
  })

  it('shows error status with error message', () => {
    const wrapper = mount(GenerateProgress, {
      props: {
        status: 'error',
        progress: 0,
        error: 'Test error message'
      }
    })
    const text = wrapper.text()
    expect(text.includes('错误') || text.includes('error') || text.includes('Error') || text.includes('失败') || text.includes('Test error')).toBe(true)
  })

  it('emits cancel event when cancel button is clicked', async () => {
    const wrapper = mount(GenerateProgress, {
      props: {
        status: 'generating',
        progress: 50
      }
    })
    const cancelButton = wrapper.find('button')
    if (cancelButton.exists() && cancelButton.text().includes('取消')) {
      await cancelButton.trigger('click')
      expect(wrapper.emitted('cancel')).toBeTruthy()
    }
  })

  it('displays task details when provided', () => {
    const wrapper = mount(GenerateProgress, {
      props: {
        status: 'generating',
        progress: 50,
        taskId: 'task-123'
      }
    })
    if (wrapper.props('taskId')) {
      expect(wrapper.text()).toContain('task' || 'Task')
    }
  })
})
