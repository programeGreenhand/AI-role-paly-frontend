export interface Message {
  id: string
  session_id: string          
  sender: 'user' | 'character'
  content: string
  message_type: 'text' | 'voice'  
  emotion?: string
  voice_url?: string          
  audio_url?: string          
  original_text?: string      
  voice_type?: string         
  created_at: string          
  
  // 前端状态字段（不存储在后端）
  isPlaying?: boolean
  timestamp?: number          
}

export interface ChatSession {
  id: string
  user_id: string             
  character_id: string        
  scene_id: string | null     
  title: string               
  context_summary: string     
  current_emotion: string     
  message_count: number       
  last_message_at: string     
  created_at: string          
  updated_at: string          
  status: 'active' | 'archived' | 'deleted'  
  
  // 关联查询字段
  character_name?: string     
  character_avatar?: string   
  character_voice_type?: string 
  system_prompt?: string      
  scene_name?: string         
  scene_background?: string   
  scene_image_url?: string    
}

export interface VoiceConfig {
  enabled: boolean
  language: string
  speed: number
  pitch: number
}

// 保持兼容性
export interface MessageLegacy {
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


// 保持兼容性
export interface ChatSessionLegacy {
  id: string
  userId: string
  characterId: string
  messages: Message[]
  context: string[]
  emotion: string
  create_at: Date
  timestamp: number
}

export interface VoiceConfig {
  enabled: boolean
  language: string
  speed: number
  pitch: number
}