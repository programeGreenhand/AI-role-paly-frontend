import type { APIResponse, ChatRequest, EmotionAnalysisResponse } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080/api'

class ChatAPI {
  async sendMessage(request: ChatRequest): Promise<APIResponse<{
    message: string
    emotion: string
    confidence: number
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API请求失败:', error)
      return {
        success: false,
        error: '网络请求失败'
      }
    }
  }

  async analyzeEmotion(text: string): Promise<APIResponse<EmotionAnalysisResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/emotion/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('情绪分析失败:', error)
      return {
        success: false,
        error: '情绪分析失败'
      }
    }
  }
}

export const chatAPI = new ChatAPI()