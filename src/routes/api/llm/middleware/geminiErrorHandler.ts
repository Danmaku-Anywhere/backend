import { ApiError } from '@google/genai'
import { HTTPException } from 'hono/http-exception'
import { factory } from '@/factory'

export function toHttpException(error: unknown) {
  if (error instanceof ApiError) {
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
  if (error instanceof Error) {
    return new HTTPException(500, { message: error.message })
  }
  return new HTTPException(500, { message: 'Failed to extract title' })
}

export function useGeminiErrorHandler() {
  return factory.createMiddleware(async (c, next) => {
    try {
      await next()
    } catch (error) {
      throw toHttpException(error)
    }
  })
}
