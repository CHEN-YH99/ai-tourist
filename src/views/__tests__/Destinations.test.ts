import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Destinations from '../Destinations.vue'

describe('Destinations.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders destinations page with title', () => {
    const wrapper = mount(Destinations, {
      global: {
        stubs: {
          DestinationCard: { template: '<div class="destination-card"><slot /></div>' },
          DestinationDetail: { template: '<div><slot /></div>' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' }
        },
        mocks: {
          $router: {
            push: vi.fn()
          }
        }
      }
    })

    expect(wrapper.text()).toContain('旅游目的地')
    expect(wrapper.text()).toContain('探索世界各地的精彩目的地')
  })

  it('displays filter options', () => {
    const wrapper = mount(Destinations, {
      global: {
        stubs: {
          DestinationCard: { template: '<div><slot /></div>' },
          DestinationDetail: { template: '<div><slot /></div>' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' }
        },
        mocks: {
          $router: {
            push: vi.fn()
          }
        }
      }
    })

    expect(wrapper.text()).toContain('地区')
    expect(wrapper.text()).toContain('类型')
    expect(wrapper.text()).toContain('排序')
  })

  it('displays region filter options', () => {
    const wrapper = mount(Destinations, {
      global: {
        stubs: {
          DestinationCard: { template: '<div><slot /></div>' },
          DestinationDetail: { template: '<div><slot /></div>' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' }
        },
        mocks: {
          $router: {
            push: vi.fn()
          }
        }
      }
    })

    const regionSelect = wrapper.findAll('select')[0]
    expect(regionSelect.html()).toContain('亚洲')
    expect(regionSelect.html()).toContain('欧洲')
    expect(regionSelect.html()).toContain('美洲')
  })

  it('displays type filter options', () => {
    const wrapper = mount(Destinations, {
      global: {
        stubs: {
          DestinationCard: { template: '<div><slot /></div>' },
          DestinationDetail: { template: '<div><slot /></div>' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' }
        },
        mocks: {
          $router: {
            push: vi.fn()
          }
        }
      }
    })

    const typeSelect = wrapper.findAll('select')[1]
    expect(typeSelect.html()).toContain('海滨')
    expect(typeSelect.html()).toContain('文化')
    expect(typeSelect.html()).toContain('冒险')
  })

  it('displays sort options', () => {
    const wrapper = mount(Destinations, {
      global: {
        stubs: {
          DestinationCard: { template: '<div><slot /></div>' },
          DestinationDetail: { template: '<div><slot /></div>' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' }
        },
        mocks: {
          $router: {
            push: vi.fn()
          }
        }
      }
    })

    const sortSelect = wrapper.findAll('select')[2]
    expect(sortSelect.html()).toContain('热度排序')
    expect(sortSelect.html()).toContain('名称排序')
    expect(sortSelect.html()).toContain('预算排序')
  })

  it('displays reset filters button', () => {
    const wrapper = mount(Destinations, {
      global: {
        stubs: {
          DestinationCard: { template: '<div><slot /></div>' },
          DestinationDetail: { template: '<div><slot /></div>' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' }
        },
        mocks: {
          $router: {
            push: vi.fn()
          }
        }
      }
    })

    expect(wrapper.text()).toContain('重置筛选')
  })

  it('displays empty state when no destinations', () => {
    const wrapper = mount(Destinations, {
      global: {
        stubs: {
          DestinationCard: { template: '<div><slot /></div>' },
          DestinationDetail: { template: '<div><slot /></div>' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' }
        },
        mocks: {
          $router: {
            push: vi.fn()
          }
        }
      }
    })

    expect(wrapper.text()).toContain('未找到目的地')
  })

  it('has modal structure for destination detail', () => {
    const wrapper = mount(Destinations, {
      global: {
        stubs: {
          DestinationCard: { template: '<div><slot /></div>' },
          DestinationDetail: { template: '<div><slot /></div>' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' }
        },
        mocks: {
          $router: {
            push: vi.fn()
          }
        }
      }
    })

    expect(wrapper.html()).toContain('fixed')
    expect(wrapper.html()).toContain('bg-black')
  })

  it('displays modal header with close button', () => {
    const wrapper = mount(Destinations, {
      global: {
        stubs: {
          DestinationCard: { template: '<div><slot /></div>' },
          DestinationDetail: { template: '<div><slot /></div>' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' }
        },
        mocks: {
          $router: {
            push: vi.fn()
          }
        }
      }
    })

    expect(wrapper.html()).toContain('关闭')
    expect(wrapper.html()).toContain('生成攻略')
  })

  it('has generate itinerary button in modal footer', () => {
    const wrapper = mount(Destinations, {
      global: {
        stubs: {
          DestinationCard: { template: '<div><slot /></div>' },
          DestinationDetail: { template: '<div><slot /></div>' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' }
        },
        mocks: {
          $router: {
            push: vi.fn()
          }
        }
      }
    })

    expect(wrapper.text()).toContain('生成攻略')
  })

  it('initializes with default sort by popularity', () => {
    const wrapper = mount(Destinations, {
      global: {
        stubs: {
          DestinationCard: { template: '<div><slot /></div>' },
          DestinationDetail: { template: '<div><slot /></div>' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' }
        },
        mocks: {
          $router: {
            push: vi.fn()
          }
        }
      }
    })

    const sortSelect = wrapper.findAll('select')[2]
    expect(sortSelect.element.value).toBe('popularity')
  })

  it('has responsive grid layout', () => {
    const wrapper = mount(Destinations, {
      global: {
        stubs: {
          DestinationCard: { template: '<div><slot /></div>' },
          DestinationDetail: { template: '<div><slot /></div>' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' }
        },
        mocks: {
          $router: {
            push: vi.fn()
          }
        }
      }
    })

    const gridDiv = wrapper.find('[class*="grid"]')
    expect(gridDiv.html()).toContain('grid-cols-1')
    expect(gridDiv.html()).toContain('md:grid-cols-2')
    expect(gridDiv.html()).toContain('lg:grid-cols-3')
  })
})
