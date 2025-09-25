import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ChatWebSocket } from '../api/websocket'
import { voiceAPI } from '../api/voice'
import type { VoiceItem, AudioRecordingConfig } from '../types/voice'
import type { WSMessage, WSResponseMessage, VoiceConfig } from '../types/websocket'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8081/ws/chat'  //8080端口

export const useVoiceStore = defineStore('voice', () => {
  // 状态
  const isRecording = ref(false)
  const isProcessing = ref(false)
  const wsConnected = ref(false)
  const voiceList = ref<VoiceItem[]>([])
  const error = ref<string | null>(null)

  const config = ref<VoiceConfig>({
    voiceType: 'qiniu_zh_female_wwxkjx',
    speed: 1.0,
    enabled: true
  })

  // WebSocket 实例
  let chatWS: ChatWebSocket | null = null
  let mediaRecorder: MediaRecorder | null = null
  let audioChunks: Blob[] = []
  let unsubscribeWS: (() => void) | null = null

  // 计算属性
  const selectedVoice = computed(() => {
    return voiceList.value.find(v => v.voice_type === config.value.voiceType)
  })

  // 初始化 WebSocket
  const connectWebSocket = async () => {
    try {
      if (chatWS?.isConnected()) {
        return
      }

      chatWS = new ChatWebSocket(WS_URL)
      
      // 设置消息监听器
      unsubscribeWS = chatWS.onMessage(handleWSMessage)
      
      await chatWS.connect()
      wsConnected.value = true
      
      console.log('WebSocket connected successfully')
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      wsConnected.value = false
      throw error
    }
  }

  // 处理 WebSocket 消息
  const handleWSMessage = (message: WSMessage) => {
    switch (message.type) {
      case 'response':
        handleResponseMessage(message as WSResponseMessage)
        break
      case 'error':
        handleErrorMessage(message)
        break
      case 'voice_list':
        handleVoiceListMessage(message)
        break
      default:
        console.log('Received unknown message type:', message.type)
    }
  }

  const handleResponseMessage = (message: WSResponseMessage) => {
    isProcessing.value = false
    chat
    // 触发自定义事件，让组件监听
    const event = new CustomEvent('voice-response', {
      detail: {
        text: message.data.text,
        audioUrl: message.data.audioUrl,
        emotion: message.data.emotion
      }
    })
    window.dispatchEvent(event)
  }

  const handleErrorMessage = (message: WSMessage) => {
    isProcessing.value = false
    error.value = message.data.error || 'Unknown error occurred'
    console.error('WebSocket error:', message.data)
  }

  const handleVoiceListMessage = (message: WSMessage) => {
    voiceList.value = message.data.voices || []
  }

  // 断开 WebSocket
  const disconnectWebSocket = () => {
    if (unsubscribeWS) {
      unsubscribeWS()
      unsubscribeWS = null
    }
    
    if (chatWS) {
      chatWS.disconnect()
      chatWS = null
    }
    
    wsConnected.value = false
  }

  // 获取音色列表
  const fetchVoiceList = async () => {
    try {
      const voices = await voiceAPI.getVoiceList()
      voiceList.value = voices
      
      // 如果当前选择的音色不在列表中，选择第一个
      if (voices.length > 0 && !voices.find(v => v.voice_type === config.value.voiceType)) {
        config.value.voiceType = voices[0].voice_type
      }
    } catch (error) {
      console.error('获取音色列表失败:', error)
    }
  }

  // 开始录音
  const startRecording = async () => {
    try {
      if (!wsConnected.value) {
        throw new Error('WebSocket not connected')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })

      mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm'
      })

      audioChunks = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        await processAudioBlob(audioBlob)
        
        // 停止所有音轨
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start(100) // 每100ms收集一次数据
      isRecording.value = true
      error.value = null

    } catch (error) {
      console.error('开始录音失败:', error)
      error.value = error instanceof Error ? error.message : 'Recording failed'
      throw error
    }
  }

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorder && isRecording.value) {
      mediaRecorder.stop()
      isRecording.value = false
    }
  }

  // 处理音频数据
  const processAudioBlob = async (audioBlob: Blob) => {
    try {
      isProcessing.value = true
      
      // 将音频转换为 base64
      const reader = new FileReader()
      reader.readAsDataURL(audioBlob)
      
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64Audio = reader.result.split(',')[1] // 移除 data:audio/... 前缀
          
          // 通过 WebSocket 发送音频数据
          if (chatWS) {
            chatWS.sendAudio(base64Audio, 'wav')
          }
        }
      }
      
      reader.onerror = () => {
        throw new Error('Failed to convert audio to base64')
      }
    } catch (error) {
      console.error('处理音频失败:', error)
      error.value = error instanceof Error ? error.message : 'Audio processing failed'
      isProcessing.value = false
    }
  }

  // 发送文本消息
  const sendTextMessage = (text: string, characterId: string, emotion?: string) => {
    if (!wsConnected.value || !chatWS) {
      throw new Error('WebSocket not connected')
    }

    isProcessing.value = true
    error.value = null
    
    chatWS.sendText(text, characterId, emotion)
  }

  // 播放音频
  const playAudio = (audioUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl)
      
      audio.onended = () => resolve()
      audio.onerror = () => reject(new Error('Audio playback failed'))
      
      audio.play().catch(reject)
    })
  }

  // 更新配置
  const updateConfig = (newConfig: Partial<VoiceConfig>) => {
    config.value = { ...config.value, ...newConfig }
  }

  return {
    // 状态
    isRecording,
    isProcessing,
    wsConnected,
    voiceList,
    error,
    config,
    
    // 计算属性
    selectedVoice,
    
    // 方法
    connectWebSocket,
    disconnectWebSocket,
    fetchVoiceList,
    startRecording,
    stopRecording,
    sendTextMessage,
    playAudio,
    updateConfig
  }
})