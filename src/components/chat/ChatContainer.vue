<template>
  <div class="chat-container" ref="chatContainerRef">
    <div class="messages-list">
      <TransitionGroup name="chat-bubble" tag="div">
        <MessageBubble
          v-for="message in validMessages"
          :key="getMessageKey(message)"
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
import { ref, watch, nextTick, computed, onMounted } from 'vue'
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

// 过滤掉无效的消息
const validMessages = computed(() => {
  console.log("当前消息数量为::",props.messages.length)
  if (!props.messages || !Array.isArray(props.messages)) {
    return []
  }
  
  return props.messages
    .filter(message => message && typeof message === 'object' && message.sender)
    .sort((a, b) => {
      try {
        //@ts-ignore
        const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime()
        //@ts-ignore
        const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime()
        return timeA - timeB
      } catch (error) {
        console.warn('消息时间戳解析错误:', error)
        return 0
      }
    })
})

// 安全的消息键生成函数
const getMessageKey = (message: Message) => {
  if (message.id) {
    return message.id
  }
  
  // 如果没有ID，生成一个基于内容和时间的键
  const content = message.content || ''
  const timestamp = message.timestamp || new Date()
  return `msg_${content.substring(0, 10)}_${timestamp}`
}

// 改进的滚动到底部函数
const scrollToBottom = (force = false) => {
  nextTick(() => {
    if (chatContainerRef.value) {
      const container = chatContainerRef.value
      const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100
      
      // 如果用户在底部附近或强制滚动，则滚动到底部
      if (isNearBottom || force) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        })
      }
    }
  })
}

// 强制滚动到底部（用于新消息）
const forceScrollToBottom = () => {
  scrollToBottom(true)
}

const handlePlayAudio = async (message: Message) => {
  if (!message) return
  
  try {
    if (message.audioUrl) {
      // 标记消息为播放状态
      message.isPlaying = true
      
      try {
        await voiceStore.playAudio(message.audioUrl)
      } catch (error) {
        console.error('播放音频失败:', error)
      } finally {
        message.isPlaying = false
      }
    } else if (message.content && message.sender === 'character') {
      // 使用语音合成 API 播报文本
      try {
        // @ts-ignore - 假设 voiceStore 有 speak 方法
        if (voiceStore.speak) {
          await voiceStore.speak(message.content)
        } else {
          speakWithWebAPI(message.content)
        }
      } catch (error) {
        console.error('语音合成失败:', error)
        speakWithWebAPI(message.content)
      }
    }
  } catch (error) {
    console.error('处理音频播放时发生错误:', error)
  }
}

// 使用 Web Speech API 进行语音播报
const speakWithWebAPI = (text: string) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    
    // 设置语音参数
    utterance.rate = 0.8
    utterance.pitch = 1
    utterance.volume = 1
    
    // 尝试选择中文语音
    const voices = speechSynthesis.getVoices()
    const chineseVoice = voices.find(voice => 
      voice.lang.includes('zh') || voice.lang.includes('CN')
    )
    if (chineseVoice) {
      utterance.voice = chineseVoice
    }
    
    speechSynthesis.speak(utterance)
  } else {
    console.warn('浏览器不支持语音合成 API')
  }
}

// 监听消息变化，自动滚动到底部
watch(() => props.messages, (newMessages, oldMessages) => {
  if (newMessages && oldMessages && newMessages.length !== oldMessages.length) {
    // 新消息时强制滚动到底部
    setTimeout(() => {
      forceScrollToBottom()
    }, 100)
  }
}, { deep: true })

// 监听输入状态变化
watch(() => props.isTyping, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    // 开始输入时滚动到底部
    setTimeout(() => {
      forceScrollToBottom()
    }, 100)
  } else if (oldVal && !newVal) {
    // 停止输入时滚动到底部
    setTimeout(() => {
      forceScrollToBottom()
    }, 200)
  }
})

// 组件挂载时滚动到底部
onMounted(() => {
  nextTick(() => {
    forceScrollToBottom()
  })
})

// 暴露滚动方法给父组件
defineExpose({
  scrollToBottom: forceScrollToBottom
})
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
  min-height: 100%;
  overflow: hidden;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* 消息动画效果 */
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

/* 自定义滚动条 */
.chat-container::-webkit-scrollbar {
  width: 6px;
}

.chat-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.chat-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.chat-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
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

@media (max-width: 480px) {
  .chat-container {
    padding: 8px;
  }
  
  .messages-list {
    gap: 10px;
  }
}
</style>