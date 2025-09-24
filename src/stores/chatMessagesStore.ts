// stores/chatMessagesStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Message } from '../types';

export const useChatMessagesStore = defineStore('chatMessages', () => {
  const messages = ref<Message[]>([]);
  const messageCount = ref(0);

  const addMessage = (sender: Message['sender'], content: string, audioLabel?: string): void => {
    const message: Message = {
      id: generateMessageId(),
      sender,
      content,
      timestamp: new Date(),
      audioLabel
    };
    
    messages.value.push(message);
    messageCount.value++;
  };

  const generateMessageId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const clearMessages = (): void => {
    messages.value = [];
    messageCount.value = 0;
  };

  const getLastMessage = (): Message | null => {
    return messages.value.length > 0 ? messages.value[messages.value.length - 1] : null;
  };

  const getMessagesBySender = (sender: Message['sender']): Message[] => {
    return messages.value.filter(msg => msg.sender === sender);
  };

  return {
    messages,
    messageCount,
    addMessage,
    clearMessages,
    getLastMessage,
    getMessagesBySender
  };
});