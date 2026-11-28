import { ApiError } from '@google/genai'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { toHttpException } from './geminiErrorHandler'

describe('toHttpException', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each([
    [429, 429, 'Rate limit exceeded, please try again later.'],
    [400, 500, 'Failed to extract title'],
    [401, 500, 'Failed to extract title'],
    [403, 500, 'Failed to extract title'],
    [500, 500, 'Failed to extract title'],
  ])('maps ApiError %i to HTTP %i', (upstream, status, message) => {
    const result = toHttpException(
      new ApiError({ message: 'boom', status: upstream })
    )

    expect(result.status).toBe(status)
    expect(result.message).toBe(message)
  })

  it('maps a generic Error to 500 with its message', () => {
    const result = toHttpException(new Error('bad json'))

    expect(result.status).toBe(500)
    expect(result.message).toBe('bad json')
  })

  it('maps a non-Error throw to 500 with the default message', () => {
    const result = toHttpException('oops')

    expect(result.status).toBe(500)
    expect(result.message).toBe('Failed to extract title')
  })
})
