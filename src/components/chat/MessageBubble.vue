<template>
  <div class="message-bubble" :class="[`message-${message.sender}`, `emotion-${message.emotion}`]">
    <div v-if="message.sender === 'character'" class="character-avatar">
      <img :src="character?.avatar || '/avatars/default.jpg'" :alt="character?.name" />
    </div>
    
    <div class="message-content">
      <div class="message-text">{{ message.content }}</div>
      
      <div class="message-meta">
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        <span v-if="message.emotion" class="message-emotion">{{ getEmotionText(message.emotion) }}</span>
        
        <VoiceButton
          v-if="message.type === 'text' && message.sender === 'character'"
          :text="message.content"
          :voice="character?.voice"
          size="small"
        />
      </div>
    </div>
    
    <div v-if="message.sender === 'user'" class="user-avatar">
      <el-icon size="24"><User /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Message } from '../../types/chat'
import type { Character } from '../../types/character'
import VoiceButton from '../common/VoiceButton.vue'

defineProps<{
  message: Message
  character: Character | null
}>()

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
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
    neutral: '😐'
  }
  return emotionMap[emotion] || '😐'
}
</script>

<style scoped>
.message-bubble {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 15px;
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
}

.character-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar {
  background: #409EFF;
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
}

.message-character .message-text {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  border-bottom-left-radius: 6px;
}

.message-user .message-text {
  background: #409EFF;
  color: white;
  border-bottom-right-radius: 6px;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.message-user .message-meta {
  justify-content: flex-end;
}

.message-time {
  font-size: 11px;
}

.message-emotion {
  font-size: 14px;
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
</style>