import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useVoiceStore = defineStore('voice', () => {
  const isRecording = ref(false)
  const isSupported = ref(false)
  const transcript = ref('')
  const error = ref<string | null>(null)
  const config = ref({
    enabled: true,
    lang: 'zh-CN',
    continuous: false,
    interimResults: true
  })

  // @ts-ignore: 处理浏览器前缀
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  let recognition: any = null

  const initializeRecognition = () => {
    if (!SpeechRecognition) {
      throw new Error('您的浏览器不支持语音识别功能')
    }

    recognition = new SpeechRecognition()
    recognition.continuous = config.value.continuous
    recognition.interimResults = config.value.interimResults
    recognition.lang = config.value.lang

    recognition.onresult = (event: any) => {
      const results = event.results
      transcript.value = results[results.length - 1][0].transcript
    }

    recognition.onerror = (event: any) => {
      error.value = event.error
      stopRecording()
      throw new Error(`语音识别错误: ${event.error}`)
    }

    recognition.onend = () => {
      isRecording.value = false
    }

    isSupported.value = true
  }

  const startRecording = async (): Promise<void> => {
    if (!isSupported.value) {
      initializeRecognition()
    }

    if (isRecording.value) {
      return
    }

    transcript.value = ''
    error.value = null

    try {
      recognition.start()
      isRecording.value = true
    } catch (err) {
      isRecording.value = false
      throw new Error('无法启动录音，请检查麦克风权限')
    }
  }

  const stopRecording = async (): Promise<string> => {
    return new Promise((resolve) => {
      if (!isRecording.value || !recognition) {
        resolve('')
        return
      }

      recognition.onend = () => {
        isRecording.value = false
        resolve(transcript.value)
      }

      recognition.stop()
    })
  }

  const checkPermission = async (): Promise<boolean> => {
    try {
      // @ts-ignore: 处理浏览器前缀
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        return false
      }

      // 尝试创建实例来触发权限请求
      const testRecognition = new SpeechRecognition()
      testRecognition.lang = 'zh-CN'
      
      return new Promise((resolve) => {
        testRecognition.onstart = () => {
          resolve(true)
          testRecognition.stop()
        }
        
        testRecognition.onerror = (event: any) => {
          if (event.error === 'not-allowed') {
            resolve(false)
          } else {
            resolve(true)
          }
          testRecognition.stop()
        }

        setTimeout(() => {
          testRecognition.start()
        }, 100)
      })
    } catch (error) {
      console.error('检查权限失败:', error)
      return false
    }
  }

  return {
    isRecording,
    isSupported,
    transcript,
    error,
    config,
    startRecording,
    stopRecording,
    checkPermission
  }
})