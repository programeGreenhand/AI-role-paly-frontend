<template>
  <div class="chat-container" ref="chatContainerRef">
    <div class="messages-list">
      <TransitionGroup name="chat-bubble" tag="div">
        <MessageBubble
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :character="currentCharacter"
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

const props = defineProps<{
  messages: Message[]
  isTyping: boolean
  currentCharacter: Character | null
}>()

const chatContainerRef = ref<HTMLElement>()

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainerRef.value) {
      chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
    }
  })
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
</style>