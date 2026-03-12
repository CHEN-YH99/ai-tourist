import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Toast from '@/components/Toast.vue'

describe('Toast Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('renders toast with message', () => {
    const wrapper = mount(Toast, {
      props: {
        message: 'Test message',
        type: 'info'
      }
    })

    expect(wrapper.text()).toContain('Test message')
  })

  it('renders with title', () => {
    const wrapper = mount(Toast, {
      props: {
        message: 'Test message',
        title: 'Test Title',
        type: 'info'
      }
    })

    expect(wrapper.text()).toContain('Test Title')
    expect(wrapper.text()).toContain('Test message')
  })

  it('applies correct styling for success type', () => {
    const wrapper = mount(Toast, {
      props: {
        message: 'Success',
        type: 'success'
      }
    })

    const toast = wrapper.find('[class*="border-green"]')
    expect(toast.exists()).toBe(true)
  })

  it('applies correct styling for error type', () => {
    const wrapper = mount(Toast, {
      props: {
        message: 'Error',
        type: 'error'
      }
    })

    const toast = wrapper.find('[class*="border-red"]')
    expect(toast.exists()).toBe(true)
  })

  it('auto-closes after duration', async () => {
    const wrapper = mount(Toast, {
      props: {
        message: 'Test',
        type: 'info',
        duration: 3000
      }
    })

    expect(wrapper.find('[class*="animate-slide-in"]').exists()).toBe(true)

    vi.advanceTimersByTime(3000)
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.isVisible).toBe(false)
  })

  it('does not auto-close when duration is 0', async () => {
    const wrapper = mount(Toast, {
      props: {
        message: 'Test',
        type: 'info',
        duration: 0
      }
    })

    vi.advanceTimersByTime(10000)
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.isVisible).toBe(true)
  })

  it('closes when close button is clicked', async () => {
    const wrapper = mount(Toast, {
      props: {
        message: 'Test',
        type: 'info'
      }
    })

    const closeButton = wrapper.find('button')
    await closeButton.trigger('click')

    expect(wrapper.vm.isVisible).toBe(false)
  })
})
