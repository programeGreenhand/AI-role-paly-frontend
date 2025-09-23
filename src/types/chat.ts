export interface Message {
  id: string
  content: string
  type: 'text' | 'voice'
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