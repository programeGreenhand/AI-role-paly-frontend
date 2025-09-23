// api/index.ts
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// 语音相关接口
export const voiceApi = {
  // 上传音频文件
  uploadAudio: (audioBlob: Blob) => {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'audio.wav')
    return api.post('/api/voice/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // 获取音色列表
  getVoiceList: () => {
    return api.get('/api/voice/list')
  },

  // 语音转文字
  speechToText: (audioUrl: string) => {
    return api.post('/api/voice/asr', { audioUrl })
  },

  // 文字转语音
  textToSpeech: (text: string, voiceType: string = 'qiniu_zh_female_wwxkjx') => {
    return api.post('/api/voice/tts', { text, voiceType })
  },

  // LLM 对话
  chatWithLLM: (message: string) => {
    return api.post('/api/chat/completion', { message })
  },
}

// WebSocket 连接
export const createWebSocket = (url: string) => {
  return new WebSocket(url)
}

export default api