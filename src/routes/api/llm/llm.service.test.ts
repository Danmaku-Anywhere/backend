import { env } from 'cloudflare:test'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@/test-utils/mockBindings'
import { extractTitleWithGemini } from './llm.service'
import { v2GenerationConfig, v2Prompt } from './prompt'

type GeminiRequestBody = {
  contents: unknown
  systemInstruction: { parts: unknown }
  generationConfig: unknown
}

function geminiResponse(text: string) {
  return new Response(
    JSON.stringify({
      candidates: [
        {
          content: { parts: [{ text }], role: 'model' },
          finishReason: 'STOP',
          index: 0,
        },
      ],
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

describe('extractTitleWithGemini', () => {
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSpy = vi.fn(async () => geminiResponse('{"title":"Bluey"}'))
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function run() {
    return extractTitleWithGemini({
      env,
      input: '<title>Bluey S01 E01</title>',
      systemInstruction: v2Prompt,
      generationConfig: v2GenerationConfig,
    })
  }

  async function sentRequest() {
    const [target, init] = fetchSpy.mock.calls[0]
    const request = new Request(target, init)
    return {
      url: request.url,
      method: request.method,
      headers: request.headers,
      body: await request.json<GeminiRequestBody>(),
    }
  }

  it('posts to the AI Gateway google-ai-studio v1beta generateContent URL', async () => {
    await run()

    const { url, method } = await sentRequest()
    expect(method).toBe('POST')
    expect(url).toBe(
      `https://gateway.ai.cloudflare.com/v1/da-ai-gateway-id/da-ai-gateway-name/google-ai-studio/v1beta/models/${env.GEMINI_MODEL}:generateContent`
    )
  })

  it('sends the api key, prompt, input and generation config', async () => {
    await run()

    const { headers, body } = await sentRequest()
    expect(headers.get('x-goog-api-key')).toBe('gemini-api')
    expect(body.contents).toEqual([
      { role: 'user', parts: [{ text: '<title>Bluey S01 E01</title>' }] },
    ])
    expect(body.systemInstruction.parts).toEqual([{ text: v2Prompt }])
    expect(body.generationConfig).toMatchObject({
      temperature: 0.75,
      responseMimeType: 'application/json',
      responseSchema: { type: 'OBJECT' },
    })
  })

  it('returns the parsed JSON text of the response', async () => {
    await expect(run()).resolves.toEqual({ title: 'Bluey' })
  })

  it('throws when the response is not JSON', async () => {
    fetchSpy.mockImplementation(async () => geminiResponse('not json'))

    await expect(run()).rejects.toThrow(SyntaxError)
  })

  it('throws ApiError carrying the upstream status on a failed response', async () => {
    fetchSpy.mockImplementation(
      async () =>
        new Response(
          JSON.stringify({ error: { code: 429, message: 'quota' } }),
          {
            status: 429,
            headers: { 'Content-Type': 'application/json' },
          }
        )
    )

    await expect(run()).rejects.toMatchObject({
      name: 'ApiError',
      status: 429,
    })
  })
})
