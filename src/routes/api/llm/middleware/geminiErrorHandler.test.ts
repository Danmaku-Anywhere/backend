import { ApiError } from '@google/genai'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@/test-utils/mockBindings'
import { makeUnitTestRequest } from '@/test-utils/makeUnitTestRequest'
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
})

describe('Gemini errors through the app', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  function stubGemini(status: number) {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response(
          JSON.stringify({ error: { code: status, message: 'upstream' } }),
          { status, headers: { 'Content-Type': 'application/json' } }
        )
      })
    )
  }

  async function extractTitle(input: string) {
    const response = await makeUnitTestRequest(
      new Request('http://example.com/proxy/gemini/extractTitle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })
    )
    return {
      status: response.status,
      body: await response.json<{ message: string; success: boolean }>(),
    }
  }

  it.each([
    [429, 429, 'Rate limit exceeded, please try again later.'],
    [401, 500, 'Failed to extract title'],
    [500, 500, 'Failed to extract title'],
  ])(
    'answers an upstream %i with HTTP %i',
    async (upstream, status, message) => {
      stubGemini(upstream)

      const result = await extractTitle(`<title>upstream ${upstream}</title>`)

      expect(result.status).toBe(status)
      expect(result.body).toEqual({ message, success: false })
    }
  )
})
