// stores/chatStore.ts
import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import type { Message, ChatSession } from '../types/chat';
import type { Character } from '../types/character';

export const useChatStore = defineStore('chat', () => {
  // 状态
  const messages = ref<Message[]>([]);
  const isTyping = ref(false);
  const currentSession = ref<ChatSession | null>(null);
  const currentEmotion = ref('neutral');
  
  // 添加用户消息
  const addUserMessage = (content: string, audioLabel?: string, audioUrl?: string): void => {
    const message: Message = {
      id: generateMessageId(),
      sender: 'user',
      content,
      timestamp: new Date(),
      audioLabel: audioLabel || null,
      audioUrl: audioUrl || null
    };
    
    messages.value.push(message);
  };

  // 添加角色消息
  const addCharacterMessage = (content: string, emotion?: string, audioUrl?: string): void => {
    const message: Message = {
      id: generateMessageId(),
      sender: 'character',
      content,
      timestamp: new Date(),
      emotion: emotion || 'neutral',
      audioUrl: audioUrl || null
    };
    
    messages.value.push(message);
    currentEmotion.value = emotion || 'neutral';
  };

  // 设置输入状态
  const setTyping = (typing: boolean): void => {
    isTyping.value = typing;
  };

  // 创建会话
  const createSession = (characterId: string): void => {
    currentSession.value = {
      id: generateSessionId(),
      characterId,
      startTime: new Date(),
      messages: []
    };
    messages.value = [];
    currentEmotion.value = 'neutral';
  };

  // 清空会话
  const clearSession = (): void => {
    messages.value = [];
    currentSession.value = null;
    isTyping.value = false;
    currentEmotion.value = 'neutral';
  };

  // 生成消息ID
  const generateMessageId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // 生成会话ID
  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // 获取最后一条消息
  const getLastMessage = (): Message | null => {
    return messages.value.length > 0 ? messages.value[messages.value.length - 1] : null;
  };

  // 按发送者筛选消息
  const getMessagesBySender = (sender: Message['sender']): Message[] => {
    return messages.value.filter(msg => msg.sender === sender);
  };

  // 更新消息音频状态
  const updateMessageAudioState = (messageId: string, isPlaying: boolean): void => {
    const message = messages.value.find(msg => msg.id === messageId);
    if (message) {
      message.isPlaying = isPlaying;
    }
  };

  return {
    // 状态
    messages,
    isTyping,
    currentSession,
    currentEmotion,
    
    // 方法
    addUserMessage,
    addCharacterMessage,
    setTyping,
    createSession,
    clearSession,
    getLastMessage,
    getMessagesBySender,
    updateMessageAudioState
  };
});