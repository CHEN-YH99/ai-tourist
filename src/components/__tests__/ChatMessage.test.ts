import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ChatMessage from '../ChatMessage.vue'
import type { Message } from '@/types'

describe('ChatMessage.vue', () => {
  it('renders user message correctly', () => {
    const message: Message = {
      role: 'user',
      content: 'Hello, how are you?',
      timestamp: new Date('2024-01-01T12:00:00')
    }

    const wrapper = mount(ChatMessage, {
      props: { message }
    })

    expect(wrapper.find('.message.user').exists()).toBe(true)
    expect(wrapper.text()).toContain('Hello, how are you?')
    expect(wrapper.find('.avatar').text()).toBe('👤')
  })

  it('renders assistant message correctly', () => {
    const message: Message = {
      role: 'assistant',
      content: 'I am doing well, thank you!',
      timestamp: new Date('2024-01-01T12:01:00')
    }

    const wrapper = mount(ChatMessage, {
      props: { message }
    })

    expect(wrapper.find('.message.assistant').exists()).toBe(true)
    expect(wrapper.text()).toContain('I am doing well, thank you!')
    expect(wrapper.find('.avatar').text()).toBe('🤖')
  })

  it('displays timestamp correctly', () => {
    const message: Message = {
      role: 'user',
      content: 'Test message',
      timestamp: new Date('2024-01-01T14:30:00')
    }

    const wrapper = mount(ChatMessage, {
      props: { message }
    })

    expect(wrapper.find('.timestamp').text()).toBe('14:30')
  })

  it('handles multiline content correctly', () => {
    const message: Message = {
      role: 'assistant',
      content: 'Line 1\nLine 2\nLine 3',
      timestamp: new Date()
    }

    const wrapper = mount(ChatMessage, {
      props: { message }
    })

    expect(wrapper.find('.message-text').text()).toContain('Line 1')
    expect(wrapper.find('.message-text').text()).toContain('Line 2')
    expect(wrapper.find('.message-text').text()).toContain('Line 3')
  })
})
