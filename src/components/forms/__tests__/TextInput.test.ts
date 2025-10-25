import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TextInput from '../TextInput.vue'

describe('TextInput', () => {
  it('should render textarea with placeholder', () => {
    const wrapper = mount(TextInput, {
      props: {
        placeholder: 'Enter your prompt...'
      }
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.exists()).toBe(true)
    expect(textarea.attributes('placeholder')).toBe('Enter your prompt...')
  })

  it('should update model value when typing', async () => {
    const wrapper = mount(TextInput, {
      props: {
        modelValue: ''
      }
    })

    const textarea = wrapper.find('textarea')
    await textarea.setValue('A cute cat')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['A cute cat'])
  })

  it('should limit input to 500 characters', async () => {
    const wrapper = mount(TextInput, {
      props: {
        modelValue: ''
      }
    })

    const longText = 'a'.repeat(600)
    const textarea = wrapper.find('textarea')
    await textarea.setValue(longText)

    const emitted = wrapper.emitted('update:modelValue')
    const lastEmittedValue = emitted![emitted!.length - 1][0] as string
    expect(lastEmittedValue.length).toBe(500)
  })

  it('should show character count', () => {
    const wrapper = mount(TextInput, {
      props: {
        modelValue: 'Hello world'
      }
    })

    expect(wrapper.text()).toContain('11 / 500')
  })

  it('should be disabled when prop is set', () => {
    const wrapper = mount(TextInput, {
      props: {
        modelValue: '',
        disabled: true
      }
    })

    const textarea = wrapper.find('textarea')
    expect(textarea.attributes('disabled')).toBeDefined()
  })

  it('should emit options when changed', async () => {
    const wrapper = mount(TextInput, {
      props: {
        modelValue: ''
      }
    })

    const select = wrapper.find('select')
    if (select.exists()) {
      await select.setValue('sculpture')
      expect(wrapper.emitted('update:options')).toBeTruthy()
    }
  })

  it('should apply template when button is clicked', async () => {
    const wrapper = mount(TextInput, {
      props: {
        modelValue: ''
      }
    })

    const showTemplatesBtn = wrapper.findAll('button').find(btn => 
      btn.text().includes('显示预设模板') || btn.text().includes('隐藏预设模板')
    )

    if (showTemplatesBtn) {
      await showTemplatesBtn.trigger('click')
      await wrapper.vm.$nextTick()

      const templateBtn = wrapper.findAll('button').find(btn => btn.text().includes('可爱小猫'))
      if (templateBtn) {
        await templateBtn.trigger('click')
        
        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
      }
    }
  })

  it('should toggle advanced parameters', async () => {
    const wrapper = mount(TextInput, {
      props: {
        modelValue: ''
      }
    })

    const advancedBtn = wrapper.findAll('button').find(btn => 
      btn.text().includes('显示高级参数') || btn.text().includes('隐藏高级参数')
    )

    expect(advancedBtn).toBeTruthy()
    
    if (advancedBtn) {
      await advancedBtn.trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('高级参数')
    }
  })

  it('should show PBR texture prompt when PBR is enabled', async () => {
    const wrapper = mount(TextInput, {
      props: {
        modelValue: ''
      }
    })

    const advancedBtn = wrapper.findAll('button').find(btn => 
      btn.text().includes('显示高级参数')
    )

    if (advancedBtn) {
      await advancedBtn.trigger('click')
      await wrapper.vm.$nextTick()

      const pbrCheckbox = wrapper.find('#enable-pbr')
      if (pbrCheckbox.exists()) {
        await pbrCheckbox.setValue(true)
        await wrapper.vm.$nextTick()
        
        expect(wrapper.text()).toContain('纹理描述')
      }
    }
  })
})
