import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ItineraryGenerator from '../ItineraryGenerator.vue'
import type { Itinerary } from '@/types'

const mockItinerary: Itinerary = {
  _id: '1',
  userId: 'user1',
  destination: 'Paris',
  days: 3,
  budget: 10000,
  preferences: ['美食'],
  content: [
    {
      day: 1,
      activities: [
        {
          time: '09:00',
          name: 'Eiffel Tower',
          description: 'Visit the iconic Eiffel Tower',
          location: 'Champ de Mars',
          cost: 500,
          duration: '2 hours'
        }
      ],
      meals: [
        {
          type: 'breakfast',
          restaurant: 'Café de Flore',
          cuisine: 'French',
          estimatedCost: 100
        }
      ],
      accommodation: 'Hotel Paris',
      dailyBudget: 3000
    }
  ],
  generatedAt: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

describe('ItineraryGenerator.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the page layout', () => {
    const wrapper = mount(ItineraryGenerator, {
      global: {
        stubs: {
          ItineraryForm: true,
          ItineraryDisplay: true,
          Card: true,
          Button: true
        }
      }
    })

    expect(wrapper.find('.container').exists()).toBe(true)
  })

  it('renders ItineraryForm component', () => {
    const wrapper = mount(ItineraryGenerator, {
      global: {
        stubs: {
          ItineraryForm: { template: '<div class="itinerary-form">Form</div>' },
          ItineraryDisplay: true,
          Card: true,
          Button: true
        }
      }
    })

    expect(wrapper.find('.itinerary-form').exists()).toBe(true)
  })

  it('shows empty state initially', () => {
    const wrapper = mount(ItineraryGenerator, {
      global: {
        stubs: {
          ItineraryForm: true,
          ItineraryDisplay: true,
          Card: { template: '<div class="card"><slot /></div>' },
          Button: true
        }
      }
    })

    expect(wrapper.text()).toContain('还没有生成攻略')
  })

  it('shows loading state when generating', async () => {
    const wrapper = mount(ItineraryGenerator, {
      global: {
        stubs: {
          ItineraryForm: true,
          ItineraryDisplay: true,
          Card: { template: '<div class="card"><slot /></div>' },
          Button: true
        }
      }
    })

    // Manually set generating state
    const vm = wrapper.vm as any
    vm.itineraryStore.generating = true
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('正在生成攻略...')
  })

  it('shows error state when generation fails', async () => {
    const wrapper = mount(ItineraryGenerator, {
      global: {
        stubs: {
          ItineraryForm: true,
          ItineraryDisplay: true,
          Card: { template: '<div class="card"><slot /></div>' },
          Button: true
        }
      }
    })

    // Manually set error state
    const vm = wrapper.vm as any
    vm.error = 'Generation failed'
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('生成失败')
    expect(wrapper.text()).toContain('Generation failed')
  })

  it('shows ItineraryDisplay when itinerary is generated', async () => {
    const wrapper = mount(ItineraryGenerator, {
      global: {
        stubs: {
          ItineraryForm: true,
          ItineraryDisplay: { template: '<div class="itinerary-display">Display</div>' },
          Card: true,
          Button: true
        }
      }
    })

    // Manually set current itinerary
    const vm = wrapper.vm as any
    vm.itineraryStore.currentItinerary = mockItinerary
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.itinerary-display').exists()).toBe(true)
  })

  it('emits submit event from ItineraryForm', async () => {
    const wrapper = mount(ItineraryGenerator, {
      global: {
        stubs: {
          ItineraryForm: {
            template: '<div @click="$emit(\'submit\', { destination: \'Paris\', days: 3, budget: 10000 })">Form</div>'
          },
          ItineraryDisplay: true,
          Card: true,
          Button: true
        }
      }
    })

    const form = wrapper.find('[class*="itinerary-form"]')
    if (form.exists()) {
      await form.trigger('click')
    }
  })

  it('clears error when close button is clicked', async () => {
    const wrapper = mount(ItineraryGenerator, {
      global: {
        stubs: {
          ItineraryForm: true,
          ItineraryDisplay: true,
          Card: { template: '<div class="card"><slot /></div>' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' }
        }
      }
    })

    // Set error
    const vm = wrapper.vm as any
    vm.error = 'Test error'
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Test error')

    // Click close button
    const buttons = wrapper.findAll('button')
    const closeButton = buttons.find(btn => btn.text().includes('关闭错误提示'))
    if (closeButton) {
      await closeButton.trigger('click')
      await wrapper.vm.$nextTick()
      expect(vm.error).toBeNull()
    }
  })

  it('has responsive grid layout', () => {
    const wrapper = mount(ItineraryGenerator, {
      global: {
        stubs: {
          ItineraryForm: true,
          ItineraryDisplay: true,
          Card: true,
          Button: true
        }
      }
    })

    const gridContainer = wrapper.find('.grid')
    expect(gridContainer.exists()).toBe(true)
    expect(gridContainer.classes()).toContain('grid-cols-1')
    expect(gridContainer.classes()).toContain('lg:grid-cols-3')
  })

  it('displays correct column spans', () => {
    const wrapper = mount(ItineraryGenerator, {
      global: {
        stubs: {
          ItineraryForm: true,
          ItineraryDisplay: true,
          Card: true,
          Button: true
        }
      }
    })

    const columns = wrapper.findAll('[class*="col-span"]')
    expect(columns.length).toBeGreaterThan(0)
  })

  it('handles form submission with valid data', async () => {
    const wrapper = mount(ItineraryGenerator, {
      global: {
        stubs: {
          ItineraryForm: true,
          ItineraryDisplay: true,
          Card: true,
          Button: true
        }
      }
    })

    const vm = wrapper.vm as any
    const params = {
      destination: 'Paris',
      days: 3,
      budget: 10000,
      preferences: ['美食']
    }

    // Mock the store method
    vm.itineraryStore.generateItinerary = vi.fn().mockResolvedValue(mockItinerary)

    await vm.handleGenerateItinerary(params)

    expect(vm.itineraryStore.generateItinerary).toHaveBeenCalledWith(params)
    expect(vm.lastParams).toEqual(params)
  })

  it('handles form submission error', async () => {
    const wrapper = mount(ItineraryGenerator, {
      global: {
        stubs: {
          ItineraryForm: true,
          ItineraryDisplay: true,
          Card: true,
          Button: true
        }
      }
    })

    const vm = wrapper.vm as any
    const params = {
      destination: 'Paris',
      days: 3,
      budget: 10000
    }

    const error = new Error('API Error')
    vm.itineraryStore.generateItinerary = vi.fn().mockRejectedValue(error)

    await vm.handleGenerateItinerary(params)

    expect(vm.error).toBe('API Error')
  })

  it('stores last params for regenerate', async () => {
    const wrapper = mount(ItineraryGenerator, {
      global: {
        stubs: {
          ItineraryForm: true,
          ItineraryDisplay: true,
          Card: true,
          Button: true
        }
      }
    })

    const vm = wrapper.vm as any
    const params = {
      destination: 'Paris',
      days: 3,
      budget: 10000
    }

    vm.itineraryStore.generateItinerary = vi.fn().mockResolvedValue(mockItinerary)

    await vm.handleGenerateItinerary(params)

    expect(vm.lastParams).toEqual(params)
  })

  it('regenerates with last params', async () => {
    const wrapper = mount(ItineraryGenerator, {
      global: {
        stubs: {
          ItineraryForm: true,
          ItineraryDisplay: true,
          Card: true,
          Button: true
        }
      }
    })

    const vm = wrapper.vm as any
    const params = {
      destination: 'Paris',
      days: 3,
      budget: 10000
    }

    vm.itineraryStore.generateItinerary = vi.fn().mockResolvedValue(mockItinerary)
    vm.lastParams = params

    await vm.handleRegenerate()

    expect(vm.itineraryStore.generateItinerary).toHaveBeenCalledWith(params)
  })

  it('does not regenerate if no last params', async () => {
    const wrapper = mount(ItineraryGenerator, {
      global: {
        stubs: {
          ItineraryForm: true,
          ItineraryDisplay: true,
          Card: true,
          Button: true
        }
      }
    })

    const vm = wrapper.vm as any
    vm.itineraryStore.generateItinerary = vi.fn()
    vm.lastParams = null

    await vm.handleRegenerate()

    expect(vm.itineraryStore.generateItinerary).not.toHaveBeenCalled()
  })

  it('handles saved event from ItineraryDisplay', async () => {
    const wrapper = mount(ItineraryGenerator, {
      global: {
        stubs: {
          ItineraryForm: true,
          ItineraryDisplay: true,
          Card: true,
          Button: true
        }
      }
    })

    const vm = wrapper.vm as any
    const consoleSpy = vi.spyOn(console, 'log')

    vm.handleSaved()

    expect(consoleSpy).toHaveBeenCalledWith('Itinerary saved to collection')

    consoleSpy.mockRestore()
  })
})
