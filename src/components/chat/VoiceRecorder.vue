<template>
  <div class="voice-recorder">
    <!-- 录音按钮 -->
    <el-button
      :type="audioStore.state.isRecording ? 'danger' : 'primary'"
      @mousedown="handleStartRecording"
      @mouseup="handleStopRecording"
      @touchstart="handleStartRecording"
      @touchend="handleStopRecording"
      circle
      size="large"
      class="record-button"
      :class="{
        'recording': audioStore.state.isRecording,
        'processing': isProcessing
      }"
      :disabled="!wsStore.isConnected || isProcessing"
    >
      <el-icon v-if="!audioStore.state.isRecording && !isProcessing">
        <Microphone />
      </el-icon>
      <el-icon v-else-if="audioStore.state.isRecording" class="recording-icon">
        <VideoPause />
      </el-icon>
      <el-icon v-else class="processing-icon">
        <Loading />
      </el-icon>
    </el-button>
    
    <!-- 录音状态指示器 -->
    <div v-if="audioStore.state.isRecording" class="recording-indicator">
      <div class="wave-form">
        <div class="wave-bar" v-for="i in 5" :key="i"></div>
      </div>
      <span class="recording-text">松开发送语音</span>
      <span class="duration-text">{{ formatDuration(audioStore.state.recordingDuration) }}</span>
    </div>

    <!-- 处理状态指示器 -->
    <div v-if="isProcessing" class="processing-indicator">
      <div class="spinner"></div>
      <span class="processing-text">处理中...</span>
    </div>

    <!-- 音色选择 -->
    <div v-if="voiceStore.voiceList.length > 0" class="voice-selector">
      <el-select
        v-model="voiceStore.config.voiceType"
        placeholder="选择音色"
        size="small"
        style="width: 150px"
      >
        <el-option
          v-for="voice in voiceStore.voiceList"
          :key="voice.voice_type"
          :label="voice.voice_name"
          :value="voice.voice_type"
        />
      </el-select>
    </div>

    <!-- WebSocket状态 -->
    <div class="ws-status">
      <span :class="['status-dot', { connected: wsStore.isConnected }]"></span>
      <span class="status-text">
        {{ wsStore.connectionStatus.text }}
      </span>
      <el-button 
        v-if="!wsStore.isConnected" 
        @click="handleConnect" 
        size="small" 
        type="text"
        class="reconnect-btn"
      >
        重连
      </el-button>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Microphone, VideoPause, Loading } from '@element-plus/icons-vue'

// 导入 Pinia stores
import { useVoiceStore } from '../../stores/voice'
import { useAudioRecordingStore } from '../../stores/audioRecordingStore'
import { useWebSocketStore } from '../../stores/webSocketStore'
import { useChatMessagesStore } from '../../stores/chatMessagesStore'

const voiceStore = useVoiceStore()
const audioStore = useAudioRecordingStore()
const wsStore = useWebSocketStore()
const chatStore = useChatMessagesStore()

// 本地状态
const isProcessing = ref(false)
const errorMessage = ref('')

// 计算属性
const isConnected = computed(() => wsStore.isConnected)

// 格式化录音时长
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 连接 WebSocket
const handleConnect = async (): Promise<void> => {
  if (wsStore.isConnected) {
    wsStore.disconnect()
    ElMessage.info('已断开与服务器的连接')
  } else {
    try {
      await wsStore.connect()
      ElMessage.success('已成功连接到语音服务器，可以开始录音对话')
    } catch (error) {
      const errorMsg = `连接服务器失败: ${error instanceof Error ? error.message : '未知错误'}`
      errorMessage.value = errorMsg
      ElMessage.error(errorMsg)
    }
  }
}

// 开始录音
const handleStartRecording = async (): Promise<void> => {
  if (!wsStore.isConnected) {
    ElMessage.warning('请先连接到服务器')
    return
  }

  if (isProcessing.value) {
    ElMessage.warning('正在处理上一个请求，请稍候...')
    return
  }

  try {
    await audioStore.startRecording()
    errorMessage.value = ''
    ElMessage.info('录音已开始，请开始说话...')
  } catch (error) {
    let errorMsg = '无法访问麦克风'
    if (error instanceof Error) {
      switch(error.name) {
        case 'NotAllowedError':
          errorMsg = '麦克风访问权限被拒绝，请允许浏览器访问麦克风'
          break
        case 'NotFoundError':
          errorMsg = '未找到麦克风设备'
          break
        case 'NotSupportedError':
          errorMsg = '浏览器不支持录音功能'
          break
        default:
          errorMsg = `录音错误: ${error.message}`
      }
    }
    errorMessage.value = errorMsg
    ElMessage.error(errorMsg)
  }
}

// 停止录音并发送到服务器
const handleStopRecording = async (): Promise<void> => {
  if (!audioStore.state.isRecording) return

  audioStore.stopRecording()
  
  const audioBlob = audioStore.getAudioBlob()
  if (audioBlob && wsStore.isConnected) {
    isProcessing.value = true
    errorMessage.value = ''
    
    try {
      await sendAudioToServer(audioBlob)
      ElMessage.info('录音已停止，正在处理音频...')
    } catch (error) {
      const errorMsg = `发送音频失败: ${error instanceof Error ? error.message : '未知错误'}`
      errorMessage.value = errorMsg
      ElMessage.error(errorMsg)
      isProcessing.value = false
    }
  } else {
    ElMessage.warning('录音数据无效或未连接到服务器')
  }
}

// 发送音频到服务器
const sendAudioToServer = (blob: Blob): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = () => {
      try {
        const base64Data = (reader.result as string).split(',')[1]
        
        wsStore.send({
          type: 'audio',
          data: {
            audioData: base64Data,
            format: 'webm',
          },
          timestamp: Date.now(),
          messageId: wsStore.generateMessageId(),
          audioType: voiceStore.config.voiceType
        })
        
        ElMessage.success('已发送语音消息')
        resolve()
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    
    reader.readAsDataURL(blob)
  })
}

// WebSocket 消息处理
const setupMessageHandlers = () => {
  // 处理语音识别结果
  wsStore.onMessage('processing', (data) => {
    if (data.data.recognizedText) {
      chatStore.addMessage('user', data.data.recognizedText, '语音消息')
    }
  })

  // 处理AI响应
  wsStore.onMessage('response', (data) => {
    if (data.data.text) {
      chatStore.addMessage('character', data.data.text)
      
      // 触发自定义事件
      const event = new CustomEvent('voice-response', {
        detail: {
          text: data.data.text,
          audioUrl: audioStore.getAudioBlob() ? URL.createObjectURL(audioStore.getAudioBlob()!) : undefined
        }
      })
      window.dispatchEvent(event)
      
      // 重置处理状态
      isProcessing.value = false
    }
  })

  // 处理错误消息
  wsStore.onMessage('error', (data) => {
    const errorMsg = data.data?.message || '服务器处理错误'
    errorMessage.value = errorMsg
    isProcessing.value = false
    ElMessage.error(errorMsg)
  })

  // 处理连接状态变化
  wsStore.onMessage('connection_ack', (data) => {
    ElMessage.success('服务器连接确认')
  })
}

// 清理函数
const cleanup = () => {
  audioStore.resetRecording()
  wsStore.disconnect()
  isProcessing.value = false
  errorMessage.value = ''
}

const emit = defineEmits<{
  voiceInput: [text: string, audioUrl?: string]
}>()

let responseHandler: ((event: CustomEvent) => void) | null = null

onMounted(async () => {
  try {
    // 设置消息处理器
    setupMessageHandlers()
    
    // 连接 WebSocket
    await handleConnect()
    
    // 获取语音列表
    await voiceStore.fetchVoiceList()

    // 监听语音响应事件
    responseHandler = (event: CustomEvent) => {
      const { text, audioUrl } = event.detail
      console.log(`语音响应: text=${text}, audioUrl=${audioUrl ? '有' : '无'}`)
      emit('voiceInput', text, audioUrl)
    }
    
    window.addEventListener('voice-response', responseHandler as EventListener)
    
  } catch (error) {
    console.error('语音功能初始化失败:', error)
    ElMessage.error('语音功能初始化失败')
  }
})

onUnmounted(() => {
  // 清理事件监听器
  if (responseHandler) {
    window.removeEventListener('voice-response', responseHandler as EventListener)
  }
  
  // 清理资源
  cleanup()
})

defineProps<{
  disabled?: boolean
}>()
</script>

<style scoped>
.voice-recorder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.record-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  font-size: 24px;
}

.record-button.recording {
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(245, 108, 108, 0.5);
  animation: pulse 1s infinite;
}

.record-button.processing {
  background: #909399;
  border-color: #909399;
}

.record-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.recording-icon {
  animation: spin 2s linear infinite;
}

.processing-icon {
  animation: spin 1s linear infinite;
}

.recording-indicator,
.processing-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.wave-form {
  display: flex;
  gap: 2px;
  align-items: center;
  height: 20px;
}

.wave-bar {
  width: 3px;
  background: #409EFF;
  border-radius: 2px;
  animation: wave-height 0.8s ease-in-out infinite;
}

.wave-bar:nth-child(1) { animation-delay: 0s; }
.wave-bar:nth-child(2) { animation-delay: 0.1s; }
.wave-bar:nth-child(3) { animation-delay: 0.2s; }
.wave-bar:nth-child(4) { animation-delay: 0.3s; }
.wave-bar:nth-child(5) { animation-delay: 0.4s; }

.duration-text {
  font-size: 12px;
  color: #666;
  font-family: monospace;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #409EFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.recording-text,
.processing-text {
  font-size: 12px;
  color: #666;
  text-align: center;
}

.voice-selector {
  margin-top: 8px;
}

.ws-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #999;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #F56C6C;
  transition: background-color 0.3s ease;
}

.status-dot.connected {
  background: #67C23A;
}

.status-text {
  font-size: 11px;
}

.reconnect-btn {
  margin-left: 8px;
  padding: 2px 6px;
}

.error-message {
  color: #F56C6C;
  font-size: 12px;
  text-align: center;
  max-width: 200px;
  word-break: break-word;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(245, 108, 108, 0); }
  100% { box-shadow: 0 0 0 0 rgba(245, 108, 108, 0); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes wave-height {
  0%, 100% { height: 8px; }
  50% { height: 20px; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .voice-recorder {
    padding: 12px;
    gap: 8px;
  }
  
  .record-button {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
  
  .voice-selector :deep(.el-select) {
    width: 120px !important;
  }
}
</style>