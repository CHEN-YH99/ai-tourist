import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

describe('SkeletonLoader Component', () => {
  it('renders card skeleton by default', () => {
    const wrapper = mount(SkeletonLoader)

    const skeletons = wrapper.findAll('[class*="animate-pulse"]')
    expect(skeletons).toHaveLength(3) // default count is 3
  })

  it('renders correct number of skeletons', () => {
    const wrapper = mount(SkeletonLoader, {
      props: {
        count: 5
      }
    })

    const skeletons = wrapper.findAll('[class*="animate-pulse"]')
    expect(skeletons).toHaveLength(5)
  })

  it('renders card type skeleton', () => {
    const wrapper = mount(SkeletonLoader, {
      props: {
        type: 'card',
        count: 1
      }
    })

    const cardSkeleton = wrapper.find('[class*="h-64"]')
    expect(cardSkeleton.exists()).toBe(true)
  })

  it('renders text type skeleton', () => {
    const wrapper = mount(SkeletonLoader, {
      props: {
        type: 'text',
        count: 1
      }
    })

    const textSkeletons = wrapper.findAll('[class*="h-4"]')
    expect(textSkeletons.length).toBeGreaterThan(0)
  })

  it('renders list-item type skeleton', () => {
    const wrapper = mount(SkeletonLoader, {
      props: {
        type: 'list-item',
        count: 1
      }
    })

    const avatar = wrapper.find('[class*="h-12"]')
    expect(avatar.exists()).toBe(true)
  })

  it('renders table-row type skeleton', () => {
    const wrapper = mount(SkeletonLoader, {
      props: {
        type: 'table-row',
        count: 1
      }
    })

    const rows = wrapper.findAll('[class*="flex"]')
    expect(rows.length).toBeGreaterThan(0)
  })

  it('applies pulse animation', () => {
    const wrapper = mount(SkeletonLoader, {
      props: {
        count: 1
      }
    })

    const skeleton = wrapper.find('[class*="animate-pulse"]')
    expect(skeleton.classes()).toContain('animate-pulse')
  })
})
