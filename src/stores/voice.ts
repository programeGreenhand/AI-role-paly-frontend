import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ChatWebSocket } from '../api/websocket'
import { voiceAPI } from '../api/voice'
import type { VoiceItem, AudioRecordingConfig } from '../types/voice'
import type { WSMessage, WSResponseMessage, VoiceConfig } from '../types/websocket'

const WS_URL = 'ws://localhost:8081/ws/chat'

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
    console.log('收到WebSocket消息:', message)
    
    switch (message.type) {
      case 'processing':
        handleProcessingMessage(message)
        break
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

  const handleProcessingMessage = (message: WSMessage) => {
    console.log('处理识别消息:', message.data)
    
    if (message.data.recognizedText) {
      // 语音识别完成，触发用户输入事件
      const event = new CustomEvent('user-voice-input', {
        detail: {
          text: message.data.recognizedText,
          audioUrl: message.data.audioUrl
        }
      })
      window.dispatchEvent(event)
      isProcessing.value = false // 识别完成后停止处理状态
    }
  }

  const handleResponseMessage = async (message: WSResponseMessage) => {
  console.log('处理AI回复消息:', message.data)
  
  isProcessing.value = false
  
  // 触发AI回复事件
  const event = new CustomEvent('voice-response', {
    detail: {
      text: message.data.text,
      audioUrl: message.data.audioUrl,
      emotion: message.data.emotion
    }
  })
  window.dispatchEvent(event)

   if (message.data.audioData) {
      try {
        await playAudio(message.data.audioData)
        console.log('音频播放完成')
      } catch (error) {
        console.error('音频播放失败:', error)
        error.value = '音频播放失败: ' + (error instanceof Error ? error.message : '未知错误')
      }
    }
  
}

  const handleErrorMessage = (message: WSMessage) => {
    isProcessing.value = false
    isRecording.value = false
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
      
      if (voices.length > 0 && !voices.find(v => v.voice_type === config.value.voiceType)) {
        config.value.voiceType = voices[0].voice_type
      }
    } catch (error) {
      console.error('获取音色列表失败:', error)
    }
  }

  // 开始录音 - 修复音频格式问题
  const startRecording = async () => {
    try {
      if (!wsConnected.value) {
        throw new Error('WebSocket not connected')
      }

      // 获取高质量音频流
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,    // 标准采样率
          channelCount: 1,      // 单声道
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      // 优化录音格式选择
      let mimeType = 'audio/wav'
      if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav'
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus'
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm'
      }

      console.log('使用录音格式:', mimeType)

      mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      })

      audioChunks = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
          console.log('录音数据块大小:', event.data.size)
        }
      }

      mediaRecorder.onstop = async () => {
        console.log('录音停止，处理音频数据...')
        const audioBlob = new Blob(audioChunks, { type: mimeType })
        console.log('音频Blob大小:', audioBlob.size, '类型:', audioBlob.type)
        
        await processAudioBlob(audioBlob, mimeType)
        
        // 停止所有音轨
        stream.getTracks().forEach(track => track.stop())
      }

      // 每100ms收集一次数据
      mediaRecorder.start()
      isRecording.value = true
      error.value = null

      console.log('录音开始成功')

    } catch (error) {
      console.error('开始录音失败:', error)
      error.value = error instanceof Error ? error.message : 'Recording failed'
      throw error
    }
  }

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorder && isRecording.value) {
      console.log('停止录音...')
      mediaRecorder.stop()
      isRecording.value = false
      isProcessing.value = true
    }
  }

  // 处理音频数据 - 修复格式转换问题
  const processAudioBlob = async (audioBlob: Blob, mimeType: string) => {
    try {
      console.log('开始处理音频数据, Blob大小:', audioBlob.size)
      
      // 验证音频数据
      if (audioBlob.size < 1000) { // 小于1KB认为是无效录音
        throw new Error('录音数据过小，请重新录音')
      }

      // 将音频转换为 base64
      const reader = new FileReader()
      
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64Audio = reader.result.split(',')[1]
          console.log('Base64音频长度:', base64Audio.length)
          
          // 确定发送格式
          let format = 'wav'
          if (mimeType.includes('webm')) {
            format = 'webm'
          } else if (mimeType.includes('wav')) {
            format = 'wav'
          }
          
          console.log('发送音频格式:', format)
          
          // 通过 WebSocket 发送音频数据
          if (chatWS) {
            chatWS.sendAudio(base64Audio, format)
          }
        }
      }
      
      reader.onerror = () => {
        throw new Error('Failed to convert audio to base64')
      }
      
      reader.readAsDataURL(audioBlob)
      
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
  // 播放音频 - 支持 base64 和 URL
// 播放音频 - 增强版本，处理各种格式
const playAudio = (base64Data) => {
  try {
    // 检查是否为完整的 Data URL
    let pureBase64 = base64Data;
    if (base64Data.includes(',')) {
      pureBase64 = base64Data.split(',')[1];
    }

    // 验证 Base64 格式（正则去除非字母数字字符）
    const sanitized = pureBase64.replace(/[^A-Za-z0-9+/=]/g, '');
    if (sanitized.length % 4 !== 0) {
      throw new Error("Base64 字符串长度无效");
    }

    // 解码并播放
    const byteCharacters = atob(sanitized);
    const byteArrays = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([byteArrays], { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    audio.play().catch(e => console.error("播放失败:", e));
  } catch (error) {
    console.error("Base64 解码失败:", error);
    // 显示用户友好的错误提示
  }
};

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