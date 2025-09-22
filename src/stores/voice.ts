import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { VoiceConfig } from '../types/chat'
import { voiceAPI } from '../utils/voice'

export const useVoiceStore = defineStore('voice', () => {
  const config = ref<VoiceConfig>({
    enabled: true,
    language: 'zh-CN',
    speed: 1.0,
    pitch: 1.0
  })

  const isRecording = ref(false)
  const isPlaying = ref(false)
  //如何解决ts在SpeechRecognition上报错的问题
  //@ts-ignore
  const recognition = ref<SpeechRecognition | null>(null)

  const initSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognition.value = new SpeechRecognition()
      recognition.value.continuous = false
      recognition.value.interimResults = false
      recognition.value.lang = config.value.language
    }
  }

  const startRecording = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!recognition.value) {
        initSpeechRecognition()
      }

      if (!recognition.value) {
        reject(new Error('语音识别不支持'))
        return
      }

      isRecording.value = true

      recognition.value.onresult = (event:any) => {
        const transcript = event.results[0][0].transcript
        isRecording.value = false
        resolve(transcript)
      }

      recognition.value.onerror = (event:any) => {
        isRecording.value = false
        reject(new Error(`语音识别错误: ${event.error}`))
      }

      recognition.value.onend = () => {
        isRecording.value = false
      }

      recognition.value.start()
    })
  }

  const stopRecording = () => {
    if (recognition.value) {
      recognition.value.stop()
    }
    isRecording.value = false
  }

  const speak = async (text: string, voice?: string) => {
    if (!config.value.enabled) return

    try {
      isPlaying.value = true
      await voiceAPI.textToSpeech({
        text,
        voice: voice || 'default',
        speed: config.value.speed,
        pitch: config.value.pitch
      })
    } catch (error) {
      console.error('语音播放失败:', error)
    } finally {
      isPlaying.value = false
    }
  }

  const updateConfig = (newConfig: Partial<VoiceConfig>) => {
    config.value = { ...config.value, ...newConfig }
  }

  return {
    config,
    isRecording,
    isPlaying,
    startRecording,
    stopRecording,
    speak,
    updateConfig
  }
})