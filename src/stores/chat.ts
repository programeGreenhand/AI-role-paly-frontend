import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Message, ChatSession } from '../types/chat'
import { chatAPI } from '../utils/api'

export const useChatStore = defineStore('chat', () => {
  const currentSession = ref<ChatSession | null>(null)
  const sessions = ref<ChatSession[]>([])
  const isTyping = ref(false)
  const currentEmotion = ref('neutral')

  const createSession = (characterId: string) => {
    const session: ChatSession = {
      id: `session-${Date.now()}`,
      characterId,
      messages: [],
      context: [],
      emotion: 'neutral',
      timestamp: Date.now()
    }
    currentSession.value = session
    sessions.value.push(session)
    return session
  }

  const addMessage = async (content: string, type: 'text' | 'voice' = 'text') => {
    if (!currentSession.value) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      type,
      sender: 'user',
      timestamp: Date.now()
    }

    currentSession.value.messages.push(userMessage)
    isTyping.value = true

    try {
      const response = await chatAPI.sendMessage({
        message: content,
        characterId: currentSession.value.characterId,
        context: currentSession.value.context,
        emotion: currentEmotion.value
      })

      const characterMessage: Message = {
        id: `msg-${Date.now()}-char`,
        content: response.data.message,
        type: 'text',
        sender: 'character',
        timestamp: Date.now(),
        emotion: response.data.emotion
      }

      currentSession.value.messages.push(characterMessage)
      currentSession.value.context.push(content, response.data.message)
      currentEmotion.value = response.data.emotion
      
      // 限制上下文长度
      if (currentSession.value.context.length > 10) {
        currentSession.value.context = currentSession.value.context.slice(-10)
      }
    } catch (error) {
      console.error('发送消息失败:', error)
    } finally {
      isTyping.value = false
    }
  }

  const clearSession = () => {
    if (currentSession.value) {
      currentSession.value.messages = []
      currentSession.value.context = []
      currentEmotion.value = 'neutral'
    }
  }

  return {
    currentSession,
    sessions,
    isTyping,
    currentEmotion,
    createSession,
    addMessage,
    clearSession
  }
})