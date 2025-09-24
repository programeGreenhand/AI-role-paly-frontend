<template>
  <div v-if="message" class="message-bubble" :class="[`message-${message.sender}`, `emotion-${message.emotion}`]">
    <div v-if="message.sender === 'character'" class="character-avatar">
      <img v-if="character && character.id" :src="getCharacterImage(character.id)" :alt="character?.name" />  
    </div>
    
    <div class="message-content">
      <div class="message-text">{{ message.content }}</div>
      
      <div class="message-meta">
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        <span v-if="message.emotion" class="message-emotion">{{ getEmotionText(message.emotion) }}</span>
        
        <!-- 音频播放按钮 - 只对AI回复显示 -->
        <el-button
          v-if="message.sender === 'character' && message.audioUrl"
          @click="handlePlayAudio"
          :loading="isPlaying"
          type="text"
          size="small"
          class="play-button"
        >
          <el-icon>
            <VideoPlay v-if="!isPlaying" />
            <Loading v-else />
          </el-icon>
          {{ isPlaying ? '播放中' : '播放语音' }}
        </el-button>

        <!-- 语音消息标识 -->
        <el-tag v-if="message.audioLabel" size="small" type="info">
          <el-icon><Microphone /></el-icon>
          {{ message.audioLabel }}
        </el-tag>
      </div>
    </div>
    
    <div v-if="message.sender === 'user'" class="user-avatar">
      <el-icon size="24"><User /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Message } from '../../types/chat'
import type { Character } from '../../types/character'
import { VideoPlay, Loading, Microphone, User } from '@element-plus/icons-vue'
import { useVoiceStore } from '../../stores/voice'

const voiceStore = useVoiceStore()
const isPlaying = ref(false)

const props = defineProps<{
  message: Message | null
  character: Character | null
}>()

const emit = defineEmits<{
  playAudio: [message: Message]
}>()

const getCharacterImage = (id: string) => {
  return new URL(`../../assets/charactor/${id}/role/index.jpg`, import.meta.url).href;
}

const formatTime = (timestamp: number | Date) => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getEmotionText = (emotion: string) => {
  const emotionMap: Record<string, string> = {
    happy: '😊',
    sad: '😢',
    excited: '🤩',
    angry: '😠',
    wise: '🤔',
    neutral: '😐',
    surprised: '😲',
    confused: '😕'
  }
  return emotionMap[emotion] || '😐'
}

const handlePlayAudio = async () => {
  if (!props.message || !props.message.audioUrl) return
  
  try {
    isPlaying.value = true
    await voiceStore.playAudio(props.message.audioUrl)
  } catch (error) {
    console.error('播放音频失败:', error)
    ElMessage.error('播放音频失败')
  } finally {
    isPlaying.value = false
  }
}
</script>

<style scoped>
.message-bubble {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 15px;
  animation: slideIn 0.3s ease-out;
}

.message-user {
  flex-direction: row-reverse;
}

.character-avatar,
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.character-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar {
  background: linear-gradient(135deg, #409EFF, #3A7BD5);
  color: white;
}

.message-content {
  max-width: 70%;
  min-width: 120px;
}

.message-text {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.message-character .message-text {
  background: rgba(255, 255, 255, 0.95);
  color: #333;
  border-bottom-left-radius: 6px;
}

.message-user .message-text {
  background: linear-gradient(135deg, #409EFF, #3A7BD5);
  color: white;
  border-bottom-right-radius: 6px;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
}

.message-user .message-meta {
  justify-content: flex-end;
  color: rgba(255, 255, 255, 0.8);
}

.message-time {
  font-size: 11px;
}

.message-emotion {
  font-size: 14px;
}

.play-button {
  padding: 2px 6px;
  font-size: 11px;
  height: auto;
  margin-left: 4px;
}

/* 情绪色彩 */
.emotion-happy .message-text {
  border-left: 4px solid #67C23A;
}

.emotion-sad .message-text {
  border-left: 4px solid #909399;
}

.emotion-excited .message-text {
  border-left: 4px solid #E6A23C;
}

.emotion-angry .message-text {
  border-left: 4px solid #F56C6C;
}

.emotion-wise .message-text {
  border-left: 4px solid #409EFF;
}

.emotion-surprised .message-text {
  border-left: 4px solid #AB47BC;
}

.emotion-confused .message-text {
  border-left: 4px solid #FF7043;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }
  
  .character-avatar,
  .user-avatar {
    width: 32px;
    height: 32px;
  }
  
  .message-text {
    padding: 10px 14px;
    font-size: 13px;
  }
  
  .message-meta {
    font-size: 11px;
    gap: 6px;
  }
}
</style>