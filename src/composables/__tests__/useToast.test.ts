import { describe, it, expect, beforeEach } from 'vitest'
import { useToast } from '@/composables/useToast'

describe('useToast Composable', () => {
  beforeEach(() => {
    // Reset toasts before each test
    const { clearAll } = useToast()
    clearAll()
  })

  it('adds a toast with default options', () => {
    const { addToast, toasts } = useToast()

    addToast('Test message')

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0].message).toBe('Test message')
    expect(toasts.value[0].type).toBe('info')
  })

  it('adds a success toast with correct duration', () => {
    const { success, toasts } = useToast()

    success('Success message', 'Success')

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0].type).toBe('success')
    expect(toasts.value[0].message).toBe('Success message')
    expect(toasts.value[0].title).toBe('Success')
    expect(toasts.value[0].duration).toBe(3000)
  })

  it('adds an error toast with longer duration', () => {
    const { error, toasts } = useToast()

    error('Error message', 'Error')

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0].type).toBe('error')
    expect(toasts.value[0].duration).toBe(5000)
  })

  it('adds a warning toast with correct duration', () => {
    const { warning, toasts } = useToast()

    warning('Warning message')

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0].type).toBe('warning')
    expect(toasts.value[0].duration).toBe(4000)
  })

  it('adds an info toast with correct duration', () => {
    const { info, toasts } = useToast()

    info('Info message')

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0].type).toBe('info')
    expect(toasts.value[0].duration).toBe(3000)
  })

  it('removes a toast by id', () => {
    const { addToast, removeToast, toasts } = useToast()

    const id = addToast('Test message')
    expect(toasts.value).toHaveLength(1)

    removeToast(id)
    expect(toasts.value).toHaveLength(0)
  })

  it('handles multiple toasts', () => {
    const { success, error, warning, toasts } = useToast()

    success('Success')
    error('Error')
    warning('Warning')

    expect(toasts.value).toHaveLength(3)
    expect(toasts.value[0].type).toBe('success')
    expect(toasts.value[1].type).toBe('error')
    expect(toasts.value[2].type).toBe('warning')
  })

  it('returns unique ids for each toast', () => {
    const { addToast, toasts } = useToast()

    const id1 = addToast('Message 1')
    const id2 = addToast('Message 2')
    const id3 = addToast('Message 3')

    expect(id1).not.toBe(id2)
    expect(id2).not.toBe(id3)
    expect(toasts.value.map((t) => t.id)).toEqual([id1, id2, id3])
  })

  it('respects custom duration', () => {
    const { addToast, toasts } = useToast()

    addToast('Test', { duration: 10000 })

    expect(toasts.value[0].duration).toBe(10000)
  })

  it('clears all toasts', () => {
    const { success, error, warning, toasts, clearAll } = useToast()

    success('Success')
    error('Error')
    warning('Warning')

    expect(toasts.value).toHaveLength(3)

    clearAll()

    expect(toasts.value).toHaveLength(0)
  })

  it('supports custom title for all toast types', () => {
    const { success, error, warning, info, toasts } = useToast()

    success('Success message', 'Success Title')
    error('Error message', 'Error Title')
    warning('Warning message', 'Warning Title')
    info('Info message', 'Info Title')

    expect(toasts.value[0].title).toBe('Success Title')
    expect(toasts.value[1].title).toBe('Error Title')
    expect(toasts.value[2].title).toBe('Warning Title')
    expect(toasts.value[3].title).toBe('Info Title')
  })
})
