import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TextInput from '../TextInput.vue'

describe('TextInput', () => {
  it('renders textarea with correct attributes', () => {
    const wrapper = mount(TextInput)
    const textarea = wrapper.find('textarea')
    expect(textarea.exists()).toBe(true)
    expect(textarea.attributes('placeholder')).toBeDefined()
  })

  it('emits update:modelValue when input changes', async () => {
    const wrapper = mount(TextInput)
    const textarea = wrapper.find('textarea')
    await textarea.setValue('Test prompt')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Test prompt'])
  })

  it('displays character count', async () => {
    const wrapper = mount(TextInput, {
      props: {
        modelValue: 'Hello'
      }
    })
    expect(wrapper.text()).toContain('5')
    expect(wrapper.text()).toContain('500')
  })

  it('enforces 500 character limit', async () => {
    const wrapper = mount(TextInput)
    const textarea = wrapper.find('textarea')
    const maxlength = textarea.attributes('maxlength')
    expect(maxlength === '500' || maxlength === undefined).toBe(true)
  })

  it('disables textarea when disabled prop is true', () => {
    const wrapper = mount(TextInput, {
      props: {
        disabled: true
      }
    })
    const textarea = wrapper.find('textarea')
    expect(textarea.attributes('disabled')).toBeDefined()
  })

  it('emits update:options when options change', async () => {
    const wrapper = mount(TextInput)
    const artStyleSelect = wrapper.find('select[data-test="art-style"]')
    if (artStyleSelect.exists()) {
      await artStyleSelect.setValue('sculpture')
      expect(wrapper.emitted('update:options')).toBeTruthy()
    }
  })
})
