<template>
  <div class="voice-recorder">
    <!-- 录音按钮 -->
    <el-button
      :type="voiceStore.isRecording ? 'danger' : 'primary'"
      :disabled="disabled || voiceStore.isProcessing || !voiceStore.wsConnected"
      @mousedown="startRecording"
      @mouseup="stopRecording"
      @mouseleave="stopRecording"
      @touchstart="startRecording"
      @touchend="stopRecording"
      circle
      size="large"
      class="record-button"
      :class="{
        'recording': voiceStore.isRecording,
        'processing': voiceStore.isProcessing
      }"
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
      <span class="recording-text">松开发送语音</span>
    </div>

    <!-- 处理状态指示器 -->
    <div v-if="voiceStore.isProcessing" class="processing-indicator">
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
      <span :class="['status-dot', { connected: voiceStore.wsConnected }]"></span>
      <span class="status-text">
        {{ voiceStore.wsConnected ? '已连接' : '未连接' }}
      </span>
    </div>

    <!-- 错误提示 -->
    <div v-if="voiceStore.error" class="error-message">
      {{ voiceStore.error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useVoiceStore } from '../../stores/voice'
import { ElMessage } from 'element-plus'
import { Microphone, VideoPause, Loading } from '@element-plus/icons-vue'

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  voiceInput: [text: string, audioUrl?: string]
}>()

const voiceStore = useVoiceStore()

let responseHandler: ((event: CustomEvent) => void) | null = null

onMounted(async () => {
  try {
    await voiceStore.fetchVoiceList()
    await voiceStore.connectWebSocket()
    
    // 监听语音响应
    responseHandler = (event: CustomEvent) => {
      const { text, audioUrl } = event.detail
      emit('voiceInput', text, audioUrl)
    }
    
    window.addEventListener('voice-response', responseHandler as EventListener)
    
  } catch (error) {
    console.error('语音功能初始化失败:', error)
    ElMessage.error('语音功能初始化失败')
  }
})

onUnmounted(() => {
  if (responseHandler) {
    window.removeEventListener('voice-response', responseHandler as EventListener)
  }
  voiceStore.disconnectWebSocket()
})

const startRecording = async (event: Event) => {
  event.preventDefault()
  
  if (!voiceStore.config.enabled || !voiceStore.wsConnected) {
    ElMessage.warning('语音功能未启用或未连接')
    return
  }
  
  try {
    await voiceStore.startRecording()
    ElMessage.info('录音中...')
  } catch (error) {
    console.error('录音启动失败:', error)
    ElMessage.error('录音启动失败: ' + (error as Error).message)
  }
}

const stopRecording = async (event?: Event) => {
  event?.preventDefault()
  
  if (!voiceStore.isRecording) return
  
  try {
    voiceStore.stopRecording()
    ElMessage.info('正在处理音频...')
  } catch (error) {
    console.error('语音处理失败:', error)
    ElMessage.error('语音处理失败: ' + (error as Error).message)
  }
}
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

.recorder-mode {
  margin-bottom: 8px;
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