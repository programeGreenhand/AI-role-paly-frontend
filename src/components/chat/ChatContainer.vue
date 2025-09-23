<template>
  <div class="chat-container" ref="chatContainerRef">
    <div class="messages-list">
      <TransitionGroup name="chat-bubble" tag="div">
        <MessageBubble
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :character="currentCharacter"
          @play-audio="handlePlayAudio"
        />
      </TransitionGroup>
      
      <TypingIndicator v-if="isTyping" :character="currentCharacter" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { Message } from '../../types/chat'
import type { Character } from '../../types/character'
import MessageBubble from './MessageBubble.vue'
import TypingIndicator from './TypingIndicator.vue'
import { useVoiceStore } from '../../stores/voice'

const props = defineProps<{
  messages: Message[]
  isTyping: boolean
  currentCharacter: Character | null
}>()

const voiceStore = useVoiceStore()
const chatContainerRef = ref<HTMLElement>()

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainerRef.value) {
      chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
    }
  })
}

const handlePlayAudio = async (message: Message) => {
  if (message.audioUrl) {
    message.isPlaying = true
    await voiceStore.playAudio(message.audioUrl)
    message.isPlaying = false
  } else if (message.content && message.sender === 'character') {
    // 使用Web API语音播报 这个使用web api进行播报实际不符合需求，应该是可以选择合适音色进行播报
    
    // @ts-ignore
    voiceStore.speak(message.content)
  }
}

watch(() => props.messages, scrollToBottom, { deep: true })
watch(() => props.isTyping, scrollToBottom)
</script>

<style scoped>
.chat-container {
  height: 100%;
  
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
}

.messages-list {
  overflow: hidden;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chat-bubble-enter-active {
  transition: all 0.3s ease;
}

.chat-bubble-leave-active {
  transition: all 0.3s ease;
}

.chat-bubble-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.chat-bubble-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-container {
    padding: 12px;
  }
  
  .messages-list {
    gap: 12px;
  }
}
</style>