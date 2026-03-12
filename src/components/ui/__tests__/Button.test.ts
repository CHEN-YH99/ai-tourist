import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '@/components/ui/Button.vue'

describe('Button Component', () => {
  it('renders button with text', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click me'
      }
    })

    expect(wrapper.text()).toContain('Click me')
  })

  it('applies primary variant by default', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Button'
      }
    })

    expect(wrapper.classes()).toContain('bg-blue-600')
  })

  it('applies secondary variant', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'secondary'
      },
      slots: {
        default: 'Button'
      }
    })

    expect(wrapper.classes()).toContain('bg-gray-200')
  })

  it('applies danger variant', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'danger'
      },
      slots: {
        default: 'Button'
      }
    })

    expect(wrapper.classes()).toContain('bg-red-600')
  })

  it('applies ghost variant', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'ghost'
      },
      slots: {
        default: 'Button'
      }
    })

    expect(wrapper.classes()).toContain('text-gray-700')
  })

  it('applies small size', () => {
    const wrapper = mount(Button, {
      props: {
        size: 'sm'
      },
      slots: {
        default: 'Button'
      }
    })

    expect(wrapper.classes()).toContain('text-sm')
  })

  it('applies medium size by default', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Button'
      }
    })

    expect(wrapper.classes()).toContain('text-base')
  })

  it('applies large size', () => {
    const wrapper = mount(Button, {
      props: {
        size: 'lg'
      },
      slots: {
        default: 'Button'
      }
    })

    expect(wrapper.classes()).toContain('text-lg')
  })

  it('disables button when disabled prop is true', () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true
      },
      slots: {
        default: 'Button'
      }
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('disables button when loading prop is true', () => {
    const wrapper = mount(Button, {
      props: {
        loading: true
      },
      slots: {
        default: 'Button'
      }
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('shows loading spinner when loading', () => {
    const wrapper = mount(Button, {
      props: {
        loading: true
      },
      slots: {
        default: 'Button'
      }
    })

    const spinner = wrapper.find('[class*="animate-spin"]')
    expect(spinner.exists()).toBe(true)
  })

  it('emits click event', async () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Button'
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true
      },
      slots: {
        default: 'Button'
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('sets button type correctly', () => {
    const wrapper = mount(Button, {
      props: {
        type: 'submit'
      },
      slots: {
        default: 'Submit'
      }
    })

    expect(wrapper.attributes('type')).toBe('submit')
  })
})
