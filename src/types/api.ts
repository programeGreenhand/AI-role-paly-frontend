
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

export interface VoiceRequest {
  text: string
  voiceType?: string
}

export interface APIResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface UploadResponse {
  url: string
}

export interface ASRResponse {
  text: string
}

export interface TTSResponse {
  audioUrl: string
}

export interface ChatResponse {
  content: string
  emotion?: string
}