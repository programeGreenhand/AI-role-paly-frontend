export interface Message {
  id: string
  content: string
  type: 'text' | 'voice'   //多了一个这个，也就是文本类型的响应结果还是音频结果
  sender: 'user' | 'character'
  timestamp: number
  emotion?: string
  voiceUrl?: string
  audioUrl?: string
  isPlaying?: boolean
}

export interface ChatSession {
  id: string
  characterId: string
  messages: Message[]
  context: string[]
  emotion: string
  timestamp: number
}

export interface VoiceConfig {
  enabled: boolean
  language: string
  speed: number
  pitch: number
}