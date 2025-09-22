<template>
  <div class="voice-recorder">
    <el-button
      :type="isRecording ? 'danger' : 'primary'"
      :disabled="disabled"
      @mousedown="startRecording"
      @mouseup="stopRecording"
      @mouseleave="stopRecording"
      @touchstart="startRecording"
      @touchend="stopRecording"
      circle
      size="large"
      class="record-button"
      :class="{ 'recording': isRecording }"
    >
      <el-icon v-if="!isRecording"><Microphone /></el-icon>
      <el-icon v-else class="recording-icon"><VideoPause /></el-icon>
    </el-button>
    
    <div v-if="isRecording" class="recording-indicator">
      <div class="wave-form">
        <div class="wave-bar" v-for="i in 5" :key="i"></div>
      </div>
      <span class="recording-text">松开发送语音</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useVoiceStore } from '../../stores/voice'
import { ElMessage } from 'element-plus'

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  voiceInput: [text: string]
}>()

const voiceStore = useVoiceStore()
const isRecording = ref(false)

const startRecording = async () => {
  if (!voiceStore.config.enabled) {
    ElMessage.warning('语音功能未启用')
    return
  }
  
  try {
    isRecording.value = true
    await voiceStore.startRecording()
  } catch (error) {
    isRecording.value = false
    ElMessage.error('录音启动失败: ' + (error as Error).message)
  }
}

const stopRecording = async () => {
  if (!isRecording.value) return
  
  try {
    const text = await voiceStore.startRecording()
    isRecording.value = false
    
    if (text.trim()) {
      emit('voiceInput', text)
      ElMessage.success('语音识别成功')
    } else {
      ElMessage.warning('未识别到语音内容')
    }
  } catch (error) {
    isRecording.value = false
    ElMessage.error('语音识别失败: ' + (error as Error).message)
  }
}
</script>

<style scoped>
.voice-recorder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.record-button {
  
  border-radius: 50%;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.record-button.recording {
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(245, 108, 108, 0.5);
  animation: pulse 1s infinite;
}

.recording-icon {
  animation: spin 2s linear infinite;
}

.recording-indicator {
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

.recording-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
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
</style>