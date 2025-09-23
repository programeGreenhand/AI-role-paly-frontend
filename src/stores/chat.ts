import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Message, ChatSession } from '../types/chat'

export const useChatStore = defineStore('chat', () => {
  const currentSession = ref<ChatSession | null>(null)
  const sessions = ref<ChatSession[]>([])
  const isTyping = ref(false)
  const currentEmotion = ref('neutral')

  const messages = computed(() => currentSession.value?.messages || [])

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

  const addUserMessage = (content: string, type: 'text' | 'voice' = 'text', audioUrl?: string) => {
    if (!currentSession.value) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      type,
      sender: 'user',
      timestamp: Date.now(),
      audioUrl
    }

    currentSession.value.messages.push(userMessage)
    return userMessage
  }

  const addCharacterMessage = (content: string, emotion?: string, audioUrl?: string) => {
    if (!currentSession.value) return

    const characterMessage: Message = {
      id: `msg-${Date.now()}-char`,
      content,
      type: 'text',
      sender: 'character',
      timestamp: Date.now(),
      emotion,
      voiceUrl: audioUrl
    }

    currentSession.value.messages.push(characterMessage)
    currentSession.value.context.push(content)
    currentEmotion.value = emotion || 'neutral'
    
    // 限制上下文长度
    if (currentSession.value.context.length > 10) {
      currentSession.value.context = currentSession.value.context.slice(-10)
    }

    return characterMessage
  }

  const setTyping = (typing: boolean) => {
    isTyping.value = typing
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
    messages,
    createSession,
    addUserMessage,
    addCharacterMessage,
    setTyping,
    clearSession
  }
})