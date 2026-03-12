import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DestinationDetail from '../DestinationDetail.vue'
import type { Destination } from '@/types'

const mockDestination: Destination = {
  _id: '1',
  name: 'Tokyo',
  nameEn: 'Tokyo',
  region: '亚洲',
  country: 'Japan',
  type: ['现代', '文化', '美食'],
  description: 'Tokyo is the capital of Japan and a major economic center.',
  images: [
    'https://example.com/tokyo1.jpg',
    'https://example.com/tokyo2.jpg',
    'https://example.com/tokyo3.jpg'
  ],
  attractions: [
    {
      name: 'Senso-ji Temple',
      description: 'Ancient Buddhist temple',
      image: 'https://example.com/sensoji.jpg',
      ticketPrice: 0,
      openingHours: '06:00-17:00'
    },
    {
      name: 'Tokyo Tower',
      description: 'Iconic red tower with observation deck',
      image: 'https://example.com/tower.jpg',
      ticketPrice: 900,
      openingHours: '09:00-23:00'
    }
  ],
  bestTimeToVisit: 'March to May, September to November',
  averageBudget: {
    min: 8000,
    max: 20000,
    currency: 'CNY'
  },
  climate: 'Humid subtropical',
  transportation: 'Train, Metro, Bus, Taxi',
  tips: [
    'Get a Suica card for easy transportation',
    'Learn basic Japanese phrases',
    'Try local street food',
    'Visit temples early to avoid crowds'
  ],
  popularity: 92,
  createdAt: new Date(),
  updatedAt: new Date()
}

describe('DestinationDetail.vue', () => {
  it('renders destination detail with null destination', () => {
    const wrapper = mount(DestinationDetail, {
      props: {
        destination: null
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' }
        }
      }
    })

    expect(wrapper.text()).toBe('')
  })

  it('displays destination name and basic info', () => {
    const wrapper = mount(DestinationDetail, {
      props: {
        destination: mockDestination
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' }
        }
      }
    })

    expect(wrapper.text()).toContain('Tokyo')
    expect(wrapper.text()).toContain('亚洲')
    expect(wrapper.text()).toContain('Japan')
  })

  it('displays destination types', () => {
    const wrapper = mount(DestinationDetail, {
      props: {
        destination: mockDestination
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' }
        }
      }
    })

    expect(wrapper.text()).toContain('现代')
    expect(wrapper.text()).toContain('文化')
    expect(wrapper.text()).toContain('美食')
  })

  it('displays popularity score', () => {
    const wrapper = mount(DestinationDetail, {
      props: {
        destination: mockDestination
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' }
        }
      }
    })

    expect(wrapper.text()).toContain('92')
  })

  it('displays budget information', () => {
    const wrapper = mount(DestinationDetail, {
      props: {
        destination: mockDestination
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' }
        }
      }
    })

    expect(wrapper.text()).toContain('8,000')
    expect(wrapper.text()).toContain('20,000')
    expect(wrapper.text()).toContain('平均预算')
  })

  it('displays best time to visit', () => {
    const wrapper = mount(DestinationDetail, {
      props: {
        destination: mockDestination
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' }
        }
      }
    })

    expect(wrapper.text()).toContain('March to May, September to November')
    expect(wrapper.text()).toContain('最佳旅行时间')
  })

  it('displays climate information', () => {
    const wrapper = mount(DestinationDetail, {
      props: {
        destination: mockDestination
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' }
        }
      }
    })

    expect(wrapper.text()).toContain('Humid subtropical')
    expect(wrapper.text()).toContain('气候')
  })

  it('displays transportation information', () => {
    const wrapper = mount(DestinationDetail, {
      props: {
        destination: mockDestination
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' }
        }
      }
    })

    expect(wrapper.text()).toContain('Train, Metro, Bus, Taxi')
    expect(wrapper.text()).toContain('交通')
  })

  it('displays attractions list', () => {
    const wrapper = mount(DestinationDetail, {
      props: {
        destination: mockDestination
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' }
        }
      }
    })

    expect(wrapper.text()).toContain('Senso-ji Temple')
    expect(wrapper.text()).toContain('Ancient Buddhist temple')
    expect(wrapper.text()).toContain('Tokyo Tower')
    expect(wrapper.text()).toContain('热门景点')
  })

  it('displays attraction ticket prices', () => {
    const wrapper = mount(DestinationDetail, {
      props: {
        destination: mockDestination
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' }
        }
      }
    })

    expect(wrapper.text()).toContain('900')
  })

  it('displays attraction opening hours', () => {
    const wrapper = mount(DestinationDetail, {
      props: {
        destination: mockDestination
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' }
        }
      }
    })

    expect(wrapper.text()).toContain('06:00-17:00')
    expect(wrapper.text()).toContain('09:00-23:00')
  })

  it('displays travel tips', () => {
    const wrapper = mount(DestinationDetail, {
      props: {
        destination: mockDestination
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' }
        }
      }
    })

    expect(wrapper.text()).toContain('Get a Suica card for easy transportation')
    expect(wrapper.text()).toContain('Learn basic Japanese phrases')
    expect(wrapper.text()).toContain('Try local street food')
    expect(wrapper.text()).toContain('旅行贴士')
  })

  it('displays multiple images gallery', () => {
    const wrapper = mount(DestinationDetail, {
      props: {
        destination: mockDestination
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' }
        }
      }
    })

    expect(wrapper.text()).toContain('更多图片')
  })

  it('handles destination without climate info', () => {
    const destinationNoClimate = {
      ...mockDestination,
      climate: undefined
    }

    const wrapper = mount(DestinationDetail, {
      props: {
        destination: destinationNoClimate
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' }
        }
      }
    })

    expect(wrapper.text()).toContain('Tokyo')
  })

  it('handles destination without transportation info', () => {
    const destinationNoTransport = {
      ...mockDestination,
      transportation: undefined
    }

    const wrapper = mount(DestinationDetail, {
      props: {
        destination: destinationNoTransport
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' }
        }
      }
    })

    expect(wrapper.text()).toContain('Tokyo')
  })

  it('handles destination with no attractions', () => {
    const destinationNoAttractions = {
      ...mockDestination,
      attractions: []
    }

    const wrapper = mount(DestinationDetail, {
      props: {
        destination: destinationNoAttractions
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' }
        }
      }
    })

    expect(wrapper.text()).toContain('Tokyo')
    expect(wrapper.text()).not.toContain('热门景点')
  })

  it('handles destination with no tips', () => {
    const destinationNoTips = {
      ...mockDestination,
      tips: []
    }

    const wrapper = mount(DestinationDetail, {
      props: {
        destination: destinationNoTips
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' }
        }
      }
    })

    expect(wrapper.text()).toContain('Tokyo')
    expect(wrapper.text()).not.toContain('旅行贴士')
  })

  it('handles destination with single image', () => {
    const destinationSingleImage = {
      ...mockDestination,
      images: ['https://example.com/tokyo1.jpg']
    }

    const wrapper = mount(DestinationDetail, {
      props: {
        destination: destinationSingleImage
      },
      global: {
        stubs: {
          Card: { template: '<div><slot /></div>' }
        }
      }
    })

    expect(wrapper.text()).toContain('Tokyo')
    expect(wrapper.text()).not.toContain('更多图片')
  })
})
