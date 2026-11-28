import { ApiError } from '@google/genai'
import { HTTPException } from 'hono/http-exception'
import { factory } from '@/factory'

export function toHttpException(error: ApiError) {
  console.error('Error from Google Gen AI:')
  console.error(error.message)
  if (error.status === 429) {
    console.error('Rate limit exceeded')
    return new HTTPException(429, {
      message: 'Rate limit exceeded, please try again later.',
    })
  }
  return new HTTPException(500, { message: 'Failed to extract title' })
}

export function useGeminiErrorHandler() {
  return factory.createMiddleware(async (c, next) => {
    await next()
    // Hono hands a handler's error to app.onError before it gets back here,
    // so a try/catch around next() never sees it. Remap the response instead.
    if (c.error instanceof ApiError) {
      throw toHttpException(c.error)
    }
  })
}
