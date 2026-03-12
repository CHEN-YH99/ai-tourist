import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ItineraryForm from '../ItineraryForm.vue'

describe('ItineraryForm.vue', () => {
  it('renders form with all required fields', () => {
    const wrapper = mount(ItineraryForm)

    expect(wrapper.find('label').text()).toContain('目的地')
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('renders destination input field', () => {
    const wrapper = mount(ItineraryForm)
    const destinationInput = wrapper.find('input[placeholder="例如：巴黎、东京、纽约"]')

    expect(destinationInput.exists()).toBe(true)
  })

  it('renders days input field with correct constraints', () => {
    const wrapper = mount(ItineraryForm)
    const daysInput = wrapper.find('input[type="number"][min="1"][max="30"]')

    expect(daysInput.exists()).toBe(true)
  })

  it('renders budget input field', () => {
    const wrapper = mount(ItineraryForm)
    const budgetInput = wrapper.find('input[type="number"][min="0"]')

    expect(budgetInput.exists()).toBe(true)
  })

  it('renders preference checkboxes', () => {
    const wrapper = mount(ItineraryForm)
    const checkboxes = wrapper.findAll('input[type="checkbox"]')

    expect(checkboxes.length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('美食')
    expect(wrapper.text()).toContain('文化')
    expect(wrapper.text()).toContain('冒险')
  })

  it('renders submit button', () => {
    const wrapper = mount(ItineraryForm)
    const submitButton = wrapper.find('button[type="submit"]')

    expect(submitButton.exists()).toBe(true)
    expect(submitButton.text()).toContain('生成攻略')
  })

  it('validates empty destination field', async () => {
    const wrapper = mount(ItineraryForm)
    const form = wrapper.find('form')

    await form.trigger('submit')

    expect(wrapper.text()).toContain('请输入目的地')
  })

  it('validates destination minimum length', async () => {
    const wrapper = mount(ItineraryForm)
    const destinationInput = wrapper.find('input[placeholder="例如：巴黎、东京、纽约"]')

    await destinationInput.setValue('a')
    await destinationInput.trigger('blur')

    expect(wrapper.text()).toContain('目的地至少需要2个字符')
  })

  it('validates days field is required', async () => {
    const wrapper = mount(ItineraryForm)
    const form = wrapper.find('form')

    // Set destination and budget to valid values
    const destinationInput = wrapper.find('input[placeholder="例如：巴黎、东京、纽约"]')
    await destinationInput.setValue('Paris')

    // Clear days field
    const daysInput = wrapper.find('input[type="number"][min="1"][max="30"]')
    await daysInput.setValue('')
    await daysInput.trigger('blur')

    expect(wrapper.text()).toContain('请输入旅行天数')
  })

  it('validates days field range', async () => {
    const wrapper = mount(ItineraryForm)
    const daysInput = wrapper.find('input[type="number"][min="1"][max="30"]')

    await daysInput.setValue('31')
    await daysInput.trigger('blur')

    expect(wrapper.text()).toContain('旅行天数必须在1-30天之间')
  })

  it('validates days field must be integer', async () => {
    const wrapper = mount(ItineraryForm)
    const daysInput = wrapper.find('input[type="number"][min="1"][max="30"]')

    await daysInput.setValue('3.5')
    await daysInput.trigger('blur')

    expect(wrapper.text()).toContain('旅行天数必须是整数')
  })

  it('validates budget field is required', async () => {
    const wrapper = mount(ItineraryForm)
    const form = wrapper.find('form')

    // Set destination and days to valid values
    const destinationInput = wrapper.find('input[placeholder="例如：巴黎、东京、纽约"]')
    await destinationInput.setValue('Paris')

    // Clear budget field
    const budgetInput = wrapper.find('input[type="number"][min="0"]')
    await budgetInput.setValue('')
    await budgetInput.trigger('blur')

    expect(wrapper.text()).toContain('请输入预算')
  })

  it('validates budget cannot be negative', async () => {
    const wrapper = mount(ItineraryForm)
    const budgetInput = wrapper.find('input[type="number"][min="0"]')

    await budgetInput.setValue('-100')
    await budgetInput.trigger('blur')

    expect(wrapper.text()).toContain('预算不能为负数')
  })

  it('allows valid form submission', async () => {
    const wrapper = mount(ItineraryForm)

    const destinationInput = wrapper.find('input[placeholder="例如：巴黎、东京、纽约"]')
    await destinationInput.setValue('Paris')

    const daysInput = wrapper.find('input[type="number"][min="1"][max="30"]')
    await daysInput.setValue('5')

    const budgetInput = wrapper.find('input[type="number"][min="0"]')
    await budgetInput.setValue('10000')

    const form = wrapper.find('form')
    await form.trigger('submit')

    expect(wrapper.emitted('submit')).toBeTruthy()
    const emittedData = wrapper.emitted('submit')?.[0]?.[0]
    expect(emittedData).toEqual({
      destination: 'Paris',
      days: 5,
      budget: 10000,
      preferences: undefined
    })
  })

  it('includes selected preferences in submission', async () => {
    const wrapper = mount(ItineraryForm)

    const destinationInput = wrapper.find('input[placeholder="例如：巴黎、东京、纽约"]')
    await destinationInput.setValue('Paris')

    const daysInput = wrapper.find('input[type="number"][min="1"][max="30"]')
    await daysInput.setValue('5')

    const budgetInput = wrapper.find('input[type="number"][min="0"]')
    await budgetInput.setValue('10000')

    // Select preferences
    const checkboxes = wrapper.findAll('input[type="checkbox"]')
    await checkboxes[0].setValue(true) // 美食
    await checkboxes[1].setValue(true) // 文化

    const form = wrapper.find('form')
    await form.trigger('submit')

    const emittedData = wrapper.emitted('submit')?.[0]?.[0]
    expect(emittedData?.preferences).toContain('美食')
    expect(emittedData?.preferences).toContain('文化')
  })

  it('shows loading state when loading prop is true', async () => {
    const wrapper = mount(ItineraryForm, {
      props: { loading: true }
    })

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.text()).toContain('生成中...')
  })

  it('trims whitespace from destination', async () => {
    const wrapper = mount(ItineraryForm)

    const destinationInput = wrapper.find('input[placeholder="例如：巴黎、东京、纽约"]')
    await destinationInput.setValue('  Paris  ')

    const daysInput = wrapper.find('input[type="number"][min="1"][max="30"]')
    await daysInput.setValue('5')

    const budgetInput = wrapper.find('input[type="number"][min="0"]')
    await budgetInput.setValue('10000')

    const form = wrapper.find('form')
    await form.trigger('submit')

    const emittedData = wrapper.emitted('submit')?.[0]?.[0]
    expect(emittedData?.destination).toBe('Paris')
  })

  it('has default values for days and budget', () => {
    const wrapper = mount(ItineraryForm)

    const daysInput = wrapper.find('input[type="number"][min="1"][max="30"]') as any
    const budgetInput = wrapper.find('input[type="number"][min="0"]') as any

    expect(daysInput.element.value).toBe('3')
    expect(budgetInput.element.value).toBe('5000')
  })
})
