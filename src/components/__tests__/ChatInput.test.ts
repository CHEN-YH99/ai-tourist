import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatInput from '../ChatInput.vue'

describe('ChatInput.vue', () => {
  it('renders input and send button', () => {
    const wrapper = mount(ChatInput)

    expect(wrapper.find('.message-input').exists()).toBe(true)
    expect(wrapper.find('.send-button').exists()).toBe(true)
    expect(wrapper.find('.send-button').text()).toBe('发送')
  })

  it('emits send event when button is clicked', async () => {
    const wrapper = mount(ChatInput)
    const input = wrapper.find('.message-input')

    await input.setValue('Hello world')
    await wrapper.find('.send-button').trigger('click')

    expect(wrapper.emitted('send')).toBeTruthy()
    expect(wrapper.emitted('send')?.[0]).toEqual(['Hello world'])
  })

  it('emits send event when Enter key is pressed', async () => {
    const wrapper = mount(ChatInput)
    const input = wrapper.find('.message-input')

    await input.setValue('Test message')
    await input.trigger('keyup.enter')

    expect(wrapper.emitted('send')).toBeTruthy()
    expect(wrapper.emitted('send')?.[0]).toEqual(['Test message'])
  })

  it('clears input after sending', async () => {
    const wrapper = mount(ChatInput)
    const input = wrapper.find('.message-input') as any

    await input.setValue('Message')
    await wrapper.find('.send-button').trigger('click')

    expect(input.element.value).toBe('')
  })

  it('disables send button when input is empty', async () => {
    const wrapper = mount(ChatInput)

    expect(wrapper.find('.send-button').attributes('disabled')).toBeDefined()

    await wrapper.find('.message-input').setValue('Text')
    expect(wrapper.find('.send-button').attributes('disabled')).toBeUndefined()

    await wrapper.find('.message-input').setValue('')
    expect(wrapper.find('.send-button').attributes('disabled')).toBeDefined()
  })

  it('disables input and button when sending prop is true', async () => {
    const wrapper = mount(ChatInput, {
      props: { sending: true }
    })

    expect(wrapper.find('.message-input').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.send-button').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.send-button').text()).toBe('发送中...')
  })

  it('disables input and button when disabled prop is true', async () => {
    const wrapper = mount(ChatInput, {
      props: { disabled: true }
    })

    expect(wrapper.find('.message-input').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.send-button').attributes('disabled')).toBeDefined()
  })

  it('uses custom placeholder', () => {
    const customPlaceholder = 'Ask me anything...'
    const wrapper = mount(ChatInput, {
      props: { placeholder: customPlaceholder }
    })

    expect(wrapper.find('.message-input').attributes('placeholder')).toBe(customPlaceholder)
  })

  it('does not emit send event for whitespace-only input', async () => {
    const wrapper = mount(ChatInput)
    const input = wrapper.find('.message-input')

    await input.setValue('   ')
    await wrapper.find('.send-button').trigger('click')

    expect(wrapper.emitted('send')).toBeFalsy()
  })
})
