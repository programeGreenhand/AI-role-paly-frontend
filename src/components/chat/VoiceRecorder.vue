<template>
  <div class="voice-recorder">
    <!-- 录音按钮 - 改为点击开始/结束录音 -->
    <el-button
      :type="voiceStore.isRecording ? 'danger' : 'primary'"
      @click="toggleRecording"
      circle
      size="large"
      class="record-button"
      :class="{
        'recording': voiceStore.isRecording,
        'processing': voiceStore.isProcessing
      }"
      :disabled="!voiceStore.wsConnected || voiceStore.isProcessing"
    >
      <el-icon v-if="!voiceStore.isRecording && !voiceStore.isProcessing">
        <Microphone />
      </el-icon>
      <el-icon v-else-if="voiceStore.isRecording" class="recording-icon">
        <VideoPause />
      </el-icon>
      <el-icon v-else class="processing-icon">
        <Loading />
      </el-icon>
    </el-button>
    
    <!-- 录音状态指示器 -->
    <div v-if="voiceStore.isRecording" class="recording-indicator">
      <div class="wave-form">
        <div class="wave-bar" v-for="i in 5" :key="i"></div>
      </div>
      <span class="recording-text">点击结束录音</span>
    </div>

    <!-- 处理状态指示器 -->
    <div v-if="voiceStore.isProcessing" class="processing-indicator">
      <div class="spinner"></div>
      <span class="processing-text">处理中...</span>
    </div>

    <!-- 音色选择 -->
    <div v-if="voiceStore.voiceList.length > 0" class="voice-selector">
      <el-select
        v-model="voiceType"
        placeholder="选择音色"
        size="small"
        style="width: 150px"
        :value="voiceType"
        @change="handleVoiceTypeChange"
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
      <span :class="['status-dot', { connected: voiceStore.wsConnected }]"></span>
      <span class="status-text">
        {{ voiceStore.wsConnected ? '服务器连接成功' : '服务器未连接' }}
      </span>
      <el-button 
        v-if="!voiceStore.wsConnected" 
        @click="handleConnect" 
        size="small" 
        type="text"
        class="reconnect-btn"
      >
        重连
      </el-button>
    </div>

    <!-- 错误提示 -->
    <div v-if="voiceStore.error" class="error-message">
      {{ voiceStore.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Microphone, VideoPause, Loading } from '@element-plus/icons-vue'
import { useVoiceStore } from '../../stores/voice'

const voiceStore = useVoiceStore()
const errorMessage = ref('')
const voiceType = ref('')

watch(voiceType, (newValue) => {
  localStorage.setItem('selectedVoiceType', newValue)
  console.log('音色变化!!!',newValue)
})

const emit = defineEmits<{
  voiceInput: [text: string, audioUrl?: string]
  voiceStart: []
  voiceEnd: []
}>()

const toggleRecording = async (): Promise<void> => {
  if (voiceStore.isRecording) {
    // Stop recording
    voiceStore.stopRecording()
    emit('voiceEnd')
    ElMessage.info('录音已停止，正在处理音频...')
  } else {
    // Start recording
    if (!voiceStore.wsConnected) {
      ElMessage.warning('请先连接到服务器')
      return
    }

    if (voiceStore.isProcessing) {
      ElMessage.warning('正在处理上一个请求，请稍候...')
      return
    }

    try {
      await voiceStore.startRecording()
      emit('voiceStart')
      errorMessage.value = ''
      ElMessage.info('录音已开始，请开始说话...')
    } catch (error) {
      // ... error handling remains the same
    }
  }
}

const handleStartRecording = async (): Promise<void> => {
  if (!voiceStore.isRecording) {
    toggleRecording()
  }
}

const handleStopRecording = async (): Promise<void> => {
  if (voiceStore.isRecording) {
    toggleRecording()
  }
}

// 连接 WebSocket
const handleConnect = async (): Promise<void> => {
  if (voiceStore.wsConnected) {
    voiceStore.disconnectWebSocket()
    ElMessage.info('已断开与服务器的连接')
  } else {
    try {
      await voiceStore.connectWebSocket()
      ElMessage.success('已成功连接到语音服务器，可以开始录音对话')
    } catch (error) {
      const errorMsg = `连接服务器失败: ${error instanceof Error ? error.message : '未知错误'}`
      errorMessage.value = errorMsg
      ElMessage.error(errorMsg)
    }
  }
}

// 开始录音
// const handleStartRecording = async (): Promise<void> => {
//   if (!voiceStore.wsConnected) {
//     ElMessage.warning('请先连接到服务器')
//     return
//   }

//   if (voiceStore.isProcessing) {
//     ElMessage.warning('正在处理上一个请求，请稍候...')
//     return
//   }

//   try {
//     await voiceStore.startRecording()
//     emit('voiceStart')
//     errorMessage.value = ''
//     ElMessage.info('录音已开始，请开始说话...')
//   } catch (error) {
//     let errorMsg = '无法访问麦克风'
//     if (error instanceof Error) {
//       switch(error.name) {
//         case 'NotAllowedError':
//           errorMsg = '麦克风访问权限被拒绝，请允许浏览器访问麦克风'
//           break
//         case 'NotFoundError':
//           errorMsg = '未找到麦克风设备'
//           break
//         case 'NotSupportedError':
//           errorMsg = '浏览器不支持录音功能'
//           break
//         default:
//           errorMsg = `录音错误: ${error.message}`
//       }
//     }
//     errorMessage.value = errorMsg
//     ElMessage.error(errorMsg)
//   }
// }

// // 停止录音
// const handleStopRecording = async (): Promise<void> => {
//   if (!voiceStore.isRecording) return

//   voiceStore.stopRecording()
//   emit('voiceEnd')
//   ElMessage.info('录音已停止，正在处理音频...')
// }

// 设置消息处理器
const setupMessageHandlers = () => {
  // 处理语音识别结果 - 只监听用户语音输入
  window.addEventListener('user-voice-input', (event: any) => {
    const { text, audioUrl } = event.detail
    if (text) {
      emit('voiceInput', text, audioUrl)
    }
  })
}

onMounted(async () => {
  try {
    setupMessageHandlers()
    await handleConnect()
    await voiceStore.fetchVoiceList()
  } catch (error) {
    console.error('语音功能初始化失败:', error)
    ElMessage.error('语音功能初始化失败')
  }
})

onUnmounted(() => {
  window.removeEventListener('user-voice-input', () => {})
  voiceStore.disconnectWebSocket()
})
</script>

<style scoped>
/* 样式保持不变 */
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