import type { VoiceItem } from '../types/voice'

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080/api'

export class VoiceAPI {
  async getVoiceList(): Promise<VoiceItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/voice/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.data || []
    } catch (error) {
      console.error('获取音色列表失败:', error)
      throw error
    }
  }
}

export const voiceAPI = new VoiceAPI()