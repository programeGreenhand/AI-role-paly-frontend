export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface ChatRequest {
  message: string
  characterId: string
  context: string[]
  emotion?: string
}

export interface VoiceRequest {
  text: string
  voice: string
  speed?: number
  pitch?: number
}

export interface EmotionAnalysisResponse {
  emotion: string
  confidence: number
  emotions: Record<string, number>
}