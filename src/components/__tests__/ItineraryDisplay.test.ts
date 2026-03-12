import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ItineraryDisplay from '../ItineraryDisplay.vue'
import type { Itinerary } from '@/types'

const mockItinerary: Itinerary = {
  _id: '1',
  userId: 'user1',
  destination: 'Paris',
  days: 3,
  budget: 10000,
  preferences: ['美食', '文化'],
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
    },
    {
      day: 2,
      activities: [
        {
          time: '10:00',
          name: 'Louvre Museum',
          description: 'Explore the world-famous art museum',
          location: 'Rue de Rivoli',
          cost: 300,
          duration: '3 hours'
        }
      ],
      meals: [
        {
          type: 'lunch',
          restaurant: 'Le Comptoir',
          cuisine: 'French',
          estimatedCost: 150
        }
      ],
      accommodation: 'Hotel Paris',
      dailyBudget: 3500
    },
    {
      day: 3,
      activities: [
        {
          time: '14:00',
          name: 'Arc de Triomphe',
          description: 'Visit the famous monument',
          location: 'Place Charles de Gaulle',
          cost: 200,
          duration: '1.5 hours'
        }
      ],
      meals: [
        {
          type: 'dinner',
          restaurant: 'Restaurant Jules',
          cuisine: 'French',
          estimatedCost: 200
        }
      ],
      accommodation: 'Hotel Paris',
      dailyBudget: 3500
    }
  ],
  generatedAt: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

describe('ItineraryDisplay.vue', () => {
  it('renders nothing when itinerary is null', () => {
    const wrapper = mount(ItineraryDisplay, {
      props: { itinerary: null }
    })

    expect(wrapper.text()).toBe('')
  })

  it('displays destination name', () => {
    const wrapper = mount(ItineraryDisplay, {
      props: { itinerary: mockItinerary }
    })

    expect(wrapper.text()).toContain('Paris')
  })

  it('displays days and budget information', () => {
    const wrapper = mount(ItineraryDisplay, {
      props: { itinerary: mockItinerary }
    })

    expect(wrapper.text()).toContain('3天行程')
    expect(wrapper.text()).toContain('¥10,000')
  })

  it('displays preferences as tags', () => {
    const wrapper = mount(ItineraryDisplay, {
      props: { itinerary: mockItinerary }
    })

    expect(wrapper.text()).toContain('美食')
    expect(wrapper.text()).toContain('文化')
  })

  it('displays budget summary', () => {
    const wrapper = mount(ItineraryDisplay, {
      props: { itinerary: mockItinerary }
    })

    expect(wrapper.text()).toContain('总预算')
    expect(wrapper.text()).toContain('平均每天')
    expect(wrapper.text()).toContain('已分配')
  })

  it('calculates total allocated budget correctly', () => {
    const wrapper = mount(ItineraryDisplay, {
      props: { itinerary: mockItinerary }
    })

    // Total should be 3000 + 3500 + 3500 = 10000
    expect(wrapper.text()).toContain('¥10,000')
  })

  it('displays all day plans', () => {
    const wrapper = mount(ItineraryDisplay, {
      props: { itinerary: mockItinerary }
    })

    expect(wrapper.text()).toContain('第1天')
    expect(wrapper.text()).toContain('第2天')
    expect(wrapper.text()).toContain('第3天')
  })

  it('displays activities for each day', () => {
    const wrapper = mount(ItineraryDisplay, {
      props: { itinerary: mockItinerary }
    })

    expect(wrapper.text()).toContain('Eiffel Tower')
    expect(wrapper.text()).toContain('Louvre Museum')
    expect(wrapper.text()).toContain('Arc de Triomphe')
  })

  it('displays activity details', () => {
    const wrapper = mount(ItineraryDisplay, {
      props: { itinerary: mockItinerary }
    })

    expect(wrapper.text()).toContain('09:00')
    expect(wrapper.text()).toContain('Champ de Mars')
    expect(wrapper.text()).toContain('2 hours')
    expect(wrapper.text()).toContain('¥500')
  })

  it('displays meals for each day', () => {
    const wrapper = mount(ItineraryDisplay, {
      props: { itinerary: mockItinerary }
    })

    expect(wrapper.text()).toContain('早餐')
    expect(wrapper.text()).toContain('午餐')
    expect(wrapper.text()).toContain('晚餐')
  })

  it('displays meal details', () => {
    const wrapper = mount(ItineraryDisplay, {
      props: { itinerary: mockItinerary }
    })

    expect(wrapper.text()).toContain('Café de Flore')
    expect(wrapper.text()).toContain('French菜系')
  })

  it('displays accommodation information', () => {
    const wrapper = mount(ItineraryDisplay, {
      props: { itinerary: mockItinerary }
    })

    expect(wrapper.text()).toContain('住宿')
    expect(wrapper.text()).toContain('Hotel Paris')
  })

  it('renders save collection button', () => {
    const wrapper = mount(ItineraryDisplay, {
      props: { itinerary: mockItinerary }
    })

    const saveButton = wrapper.find('button')
    expect(saveButton.exists()).toBe(true)
    expect(saveButton.text()).toContain('收藏')
  })

  it('renders download button', () => {
    const wrapper = mount(ItineraryDisplay, {
      props: { itinerary: mockItinerary }
    })

    const buttons = wrapper.findAll('button')
    const downloadButton = buttons.find(btn => btn.text().includes('下载攻略'))
    expect(downloadButton).toBeDefined()
  })

  it('renders regenerate button', () => {
    const wrapper = mount(ItineraryDisplay, {
      props: { itinerary: mockItinerary }
    })

    const buttons = wrapper.findAll('button')
    const regenerateButton = buttons.find(btn => btn.text().includes('重新生成'))
    expect(regenerateButton).toBeDefined()
  })

  it('emits regenerate event when regenerate button is clicked', async () => {
    const wrapper = mount(ItineraryDisplay, {
      props: { itinerary: mockItinerary }
    })

    const buttons = wrapper.findAll('button')
    const regenerateButton = buttons.find(btn => btn.text().includes('重新生成'))
    await regenerateButton?.trigger('click')

    expect(wrapper.emitted('regenerate')).toBeTruthy()
  })

  it('handles download button click', async () => {
    const wrapper = mount(ItineraryDisplay, {
      props: { itinerary: mockItinerary }
    })

    // Mock document methods
    const createElementSpy = vi.spyOn(document, 'createElement')
    const appendChildSpy = vi.spyOn(document.body, 'appendChild')
    const removeChildSpy = vi.spyOn(document.body, 'removeChild')

    const buttons = wrapper.findAll('button')
    const downloadButton = buttons.find(btn => btn.text().includes('下载攻略'))
    await downloadButton?.trigger('click')

    expect(createElementSpy).toHaveBeenCalledWith('a')

    createElementSpy.mockRestore()
    appendChildSpy.mockRestore()
    removeChildSpy.mockRestore()
  })

  it('displays daily budget for each day', () => {
    const wrapper = mount(ItineraryDisplay, {
      props: { itinerary: mockItinerary }
    })

    expect(wrapper.text()).toContain('¥3,000')
    expect(wrapper.text()).toContain('¥3,500')
  })

  it('handles itinerary without preferences', () => {
    const itineraryWithoutPrefs = {
      ...mockItinerary,
      preferences: []
    }

    const wrapper = mount(ItineraryDisplay, {
      props: { itinerary: itineraryWithoutPrefs }
    })

    expect(wrapper.text()).toContain('Paris')
    expect(wrapper.text()).toContain('3天行程')
  })

  it('handles itinerary without accommodation', () => {
    const itineraryWithoutAccommodation = {
      ...mockItinerary,
      content: [
        {
          ...mockItinerary.content[0],
          accommodation: undefined
        }
      ]
    }

    const wrapper = mount(ItineraryDisplay, {
      props: { itinerary: itineraryWithoutAccommodation }
    })

    expect(wrapper.text()).toContain('Paris')
    // Should not crash and should render other content
    expect(wrapper.text()).toContain('Eiffel Tower')
  })

  it('translates meal types correctly', () => {
    const wrapper = mount(ItineraryDisplay, {
      props: { itinerary: mockItinerary }
    })

    expect(wrapper.text()).toContain('早餐')
    expect(wrapper.text()).not.toContain('breakfast')
    expect(wrapper.text()).toContain('午餐')
    expect(wrapper.text()).not.toContain('lunch')
    expect(wrapper.text()).toContain('晚餐')
    expect(wrapper.text()).not.toContain('dinner')
  })
})
