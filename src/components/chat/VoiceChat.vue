<template>
  <div class="voice-chat-container">
    <!-- 头部设置 -->
    <div class="chat-header">
      <h2>语音对话助手</h2>
      <div class="voice-selector">
        <label>选择音色:</label>
        <select v-model="voiceStore.selectedVoice">
          <option 
            v-for="voice in voiceStore.voiceList" 
            :key="voice.voice_type"
            :value="voice.voice_type"
          >
            {{ voice.voice_name }}
          </option>
        </select>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="messages-container" ref="messagesContainer">
      <div 
        v-for="message in voiceStore.messages" 
        :key="message.id"
        :class="['message', message.type]"
      >
        <div class="message-content">
          <p>{{ message.text }}</p>
          <div class="message-meta">
            <span class="timestamp">
              {{ formatTime(message.timestamp) }}
            </span>
            <button 
              v-if="message.audioUrl"
              @click="playMessage(message)"
              class="play-btn"
              :disabled="message.isPlaying"
            >
              {{ message.isPlaying ? '播放中...' : '播放' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 录音控制 -->
    <div class="recording-controls">
      <button 
        @click="toggleRecording"
        :class="['record-btn', { recording: voiceStore.isRecording }]"
        :disabled="voiceStore.isProcessing"
      >
        <span class="record-icon"></span>
        <span class="record-text">
          {{ voiceStore.isRecording ? '停止录音' : '开始录音' }}
        </span>
      </button>
      
      <div v-if="voiceStore.isProcessing" class="processing-indicator">
        <div class="spinner"></div>
        <span>处理中...</span>
      </div>
    </div>

    <!-- WebSocket 状态 -->
    <div class="ws-status">
      <span :class="['status-dot', { connected: voiceStore.wsConnected }]"></span>
      {{ voiceStore.wsConnected ? '已连接' : '未连接' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick, ref } from 'vue'
import { useVoiceStore } from '@/stores/voiceStore'
import type { Message } from '@/stores/voiceStore'

const voiceStore = useVoiceStore()
const messagesContainer = ref<HTMLElement>()

onMounted(async () => {
  await voiceStore.fetchVoiceList()
  voiceStore.connectWebSocket()
})

const toggleRecording = () => {
  if (voiceStore.isRecording) {
    voiceStore.stopRecording()
  } else {
    voiceStore.startRecording()
  }
}

const playMessage = async (message: Message) => {
  if (message.audioUrl) {
    message.isPlaying = true
    await voiceStore.playAudio(message.audioUrl)
    message.isPlaying = false
  }
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

// 自动滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 监听消息变化，自动滚动
voiceStore.$subscribe(() => {
  scrollToBottom()
})
</script>

<style scoped>
.voice-chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f5f5;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.voice-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.voice-selector select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: white;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.message {
  margin-bottom: 20px;
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message.user .message-content {
  background: #007bff;
  color: white;
  border-radius: 18px 18px 6px 18px;
}

.message.assistant .message-content {
  background: #e9ecef;
  color: #333;
  border-radius: 18px 18px 18px 6px;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  word-wrap: break-word;
}

.message-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.7;
}

.play-btn {
  padding: 4px 8px;
  border: none;
  background: rgba(255,255,255,0.3);
  color: inherit;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.play-btn:hover {
  background: rgba(255,255,255,0.5);
}

.play-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.recording-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.record-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 30px;
  border: none;
  border-radius: 50px;
  background: #28a745;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.record-btn:hover {
  background: #218838;
  transform: translateY(-2px);
}

.record-btn.recording {
  background: #dc3545;
  animation: pulse 1.5s infinite;
}

.record-btn.recording:hover {
  background: #c82333;
}

.record-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.record-icon {
  width: 12px;
  height: 12px;
  background: currentColor;
  border-radius: 50%;
}

.processing-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
  font-size: 14px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.ws-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  font-size: 14px;
  color: #666;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dc3545;
}

.status-dot.connected {
  background: #28a745;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .voice-chat-container {
    padding: 10px;
  }
  
  .chat-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .record-btn {
    padding: 12px 24px;
    font-size: 14px;
  }
}
</style>