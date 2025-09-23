// stores/voiceStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { voiceApi } from '@/api/model'

export interface VoiceItem {
  voice_name: string
  voice_type: string
  url: string
  category: string
  updatetime: number
}

export interface Message {
  id: string
  type: 'user' | 'assistant'
  text: string
  audioUrl?: string
  timestamp: number
  isPlaying?: boolean
}

export const useVoiceStore = defineStore('voice', () => {
  // 状态
  const isRecording = ref(false)
  const isProcessing = ref(false)
  const messages = ref<Message[]>([])
  const voiceList = ref<VoiceItem[]>([])
  const selectedVoice = ref('qiniu_zh_female_wwxkjx')
  const wsConnected = ref(false)
  
  let mediaRecorder: MediaRecorder | null = null
  let audioChunks: Blob[] = []
  let websocket: WebSocket | null = null

  // 获取音色列表
  const fetchVoiceList = async () => {
    try {
      const response = await voiceApi.getVoiceList()
      voiceList.value = response.data || []
    } catch (error) {
      console.error('获取音色列表失败:', error)
    }
  }

  // 开始录音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
        } 
      })
      
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      audioChunks = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        await processAudio(audioBlob)
        
        // 停止所有音轨
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      isRecording.value = true
    } catch (error) {
      console.error('开始录音失败:', error)
    }
  }

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorder && isRecording.value) {
      mediaRecorder.stop()
      isRecording.value = false
    }
  }

  // 处理音频
  const processAudio = async (audioBlob: Blob) => {
    try {
      isProcessing.value = true
      
      // 1. 上传音频
      const uploadResponse = await voiceApi.uploadAudio(audioBlob)
      const audioUrl = uploadResponse.data.url
      
      // 2. 语音转文字
      const asrResponse = await voiceApi.speechToText(audioUrl)
      const userText = asrResponse.data.text
      
      // 添加用户消息
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        text: userText,
        timestamp: Date.now()
      }
      messages.value.push(userMessage)
      
      // 3. LLM 对话
      const chatResponse = await voiceApi.chatWithLLM(userText)
      const assistantText = chatResponse.data.content
      
      // 4. 文字转语音
      const ttsResponse = await voiceApi.textToSpeech(assistantText, selectedVoice.value)
      const assistantAudioUrl = ttsResponse.data.audioUrl
      
      // 添加助手消息
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        text: assistantText,
        audioUrl: assistantAudioUrl,
        timestamp: Date.now()
      }
      messages.value.push(assistantMessage)
      
      // 自动播放助手回复
      await playAudio(assistantAudioUrl)
      
    } catch (error) {
      console.error('处理音频失败:', error)
    } finally {
      isProcessing.value = false
    }
  }

  // 播放音频
  const playAudio = async (audioUrl: string) => {
    return new Promise<void>((resolve) => {
      const audio = new Audio(audioUrl)
      audio.onended = () => resolve()
      audio.onerror = () => resolve()
      audio.play()
    })
  }

  // 连接 WebSocket（用于实时通信）
  const connectWebSocket = () => {
    const wsUrl = `ws://localhost:8080/ws/voice`
    websocket = new WebSocket(wsUrl)
    
    websocket.onopen = () => {
      wsConnected.value = true
      console.log('WebSocket 连接成功')
    }
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      // 处理实时消息
      console.log('收到 WebSocket 消息:', data)
    }
    
    websocket.onclose = () => {
      wsConnected.value = false
      console.log('WebSocket 连接关闭')
    }
    
    websocket.onerror = (error) => {
      console.error('WebSocket 错误:', error)
    }
  }

  // 断开 WebSocket
  const disconnectWebSocket = () => {
    if (websocket) {
      websocket.close()
      websocket = null
    }
  }

  return {
    // 状态
    isRecording,
    isProcessing,
    messages,
    voiceList,
    selectedVoice,
    wsConnected,
    
    // 方法
    fetchVoiceList,
    startRecording,
    stopRecording,
    playAudio,
    connectWebSocket,
    disconnectWebSocket,
  }
})