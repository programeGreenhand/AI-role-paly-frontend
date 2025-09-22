// import type { VoiceRequest, APIResponse } from '../types/api'
import type { VoiceRequest} from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

class VoiceAPI {
  async textToSpeech(request: VoiceRequest): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/voice/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        
        return new Promise((resolve, reject) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl)
            resolve()
          }
          audio.onerror = reject
          audio.play()
        })
      }
    } catch (error) {
      console.error('TTS请求失败:', error)
      throw error
    }
  }
}

export const voiceAPI = new VoiceAPI()

// 语音识别相关类型声明
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}