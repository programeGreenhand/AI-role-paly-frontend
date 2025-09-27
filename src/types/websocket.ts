// WebSocket 消息类型
export interface WSMessage {
  type: 'audio' | 'text' | 'response' | 'error' | 'voice_list'
  data: any
  timestamp: number
  messageId?: string
}

// 语音消息
export interface WSAudioMessage extends WSMessage {
  type: 'audio'
  data: {
    audioData: string // base64 encoded audio
    format: string // 'wav', 'mp3', etc.
    sessionId?:string
  }
}

// 文本消息
export interface WSTextMessage extends WSMessage {
  type: 'text'
  data: {
    text: string
    characterId: string
    emotion?: string
    sessionId?:string
  }
}

// 响应消息
export interface WSResponseMessage extends WSMessage {
  type: 'response'
  data: {
    text: string
    audioUrl?: string
    emotion?: string
  }
}

// 语音配置
export interface VoiceConfig {
  voiceType: string
  speed: number
  enabled: boolean
}