import { type GenerateContentConfig, GoogleGenAI } from '@google/genai'

type ExtractTitleParams = {
  env: Env
  input: string
  systemInstruction: string
  generationConfig: GenerateContentConfig
}

export async function extractTitleWithGemini({
  env,
  input,
  systemInstruction,
  generationConfig,
}: ExtractTitleParams) {
  const GEMINI_API_KEY = await env.DANMAKU_GEMINI_API_KEY.get()
  const DA_AI_GATEWAY_NAME = await env.DA_AI_GATEWAY_NAME.get()
  const DA_AI_GATEWAY_ID = await env.DA_AI_GATEWAY_ID.get()

  const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
    httpOptions: {
      baseUrl: `https://gateway.ai.cloudflare.com/v1/${DA_AI_GATEWAY_ID}/${DA_AI_GATEWAY_NAME}/google-ai-studio`,
      apiVersion: 'v1beta',
    },
  })

  const response = await ai.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: input,
    config: { ...generationConfig, systemInstruction },
  })

  return JSON.parse(response.text ?? '')
}
