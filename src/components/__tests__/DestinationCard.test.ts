import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DestinationCard from '../DestinationCard.vue'
import type { Destination } from '@/types'

const mockDestination: Destination = {
  _id: '1',
  name: 'Paris',
  nameEn: 'Paris',
  region: '欧洲',
  country: 'France',
  type: ['文化', '美食'],
  description: 'The City of Light, known for its art, culture, and cuisine.',
  images: ['https://example.com/paris.jpg'],
  attractions: [
    {
      name: 'Eiffel Tower',
      description: 'Iconic iron lattice tower',
      image: 'https://example.com/eiffel.jpg',
      ticketPrice: 500,
      openingHours: '09:00-00:45'
    }
  ],
  bestTimeToVisit: 'April to June, September to October',
  averageBudget: {
    min: 5000,
    max: 15000,
    currency: 'CNY'
  },
  climate: 'Temperate oceanic',
  transportation: 'Metro, Bus, Taxi',
  tips: ['Learn basic French', 'Book tickets in advance'],
  popularity: 95,
  createdAt: new Date(),
  updatedAt: new Date()
}

describe('DestinationCard.vue', () => {
  it('renders destination card with basic information', () => {
    const wrapper = mount(DestinationCard, {
      props: {
        destination: mockDestination
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' }
        }
      }
    })

    expect(wrapper.text()).toContain('Paris')
    expect(wrapper.text()).toContain('欧洲')
    expect(wrapper.text()).toContain('France')
    expect(wrapper.text()).toContain('The City of Light')
  })

  it('displays destination types', () => {
    const wrapper = mount(DestinationCard, {
      props: {
        destination: mockDestination
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' }
        }
      }
    })

    expect(wrapper.text()).toContain('文化')
    expect(wrapper.text()).toContain('美食')
  })

  it('displays popularity score', () => {
    const wrapper = mount(DestinationCard, {
      props: {
        destination: mockDestination
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' }
        }
      }
    })

    expect(wrapper.text()).toContain('95')
  })

  it('displays budget range', () => {
    const wrapper = mount(DestinationCard, {
      props: {
        destination: mockDestination
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' }
        }
      }
    })

    expect(wrapper.text()).toContain('5,000')
    expect(wrapper.text()).toContain('15,000')
  })

  it('emits click event when card is clicked', async () => {
    const wrapper = mount(DestinationCard, {
      props: {
        destination: mockDestination
      },
      global: {
        stubs: {
          Card: { template: '<div @click="$emit(\'click\')"><slot /></div>' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' }
        }
      }
    })

    await wrapper.find('div').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')?.[0]).toEqual([mockDestination])
  })

  it('handles destination with no images', () => {
    const destinationNoImages = {
      ...mockDestination,
      images: []
    }

    const wrapper = mount(DestinationCard, {
      props: {
        destination: destinationNoImages
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' }
        }
      }
    })

    expect(wrapper.text()).toContain('Paris')
  })

  it('handles destination with multiple types', () => {
    const destinationMultipleTypes = {
      ...mockDestination,
      type: ['文化', '美食', '购物', '自然']
    }

    const wrapper = mount(DestinationCard, {
      props: {
        destination: destinationMultipleTypes
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' }
        }
      }
    })

    expect(wrapper.text()).toContain('文化')
    expect(wrapper.text()).toContain('美食')
    expect(wrapper.text()).toContain('+2')
  })

  it('displays view details button', () => {
    const wrapper = mount(DestinationCard, {
      props: {
        destination: mockDestination
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' }
        }
      }
    })

    expect(wrapper.text()).toContain('查看详情')
  })
})
