import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Message, ChatSession } from '../types/chat';
import axios from 'axios';

export const useChatStore = defineStore('chat', () => {
  // 状态
  const messages = ref<Message[]>([]);
  const isTyping = ref(false);
  const currentSession = ref<ChatSession | null>(null);   //开始时候Session是空的 进入历史会话前会被赋值，历史会话结束设为null 进入新的会话不赋值，直接传null
  const currentEmotion = ref('neutral');
  
  // API 基础 URL
  const API_BASE = 'http://localhost:8081/api';

  const server = axios.create({
    baseURL:API_BASE,
    timeout:30000
})

server.interceptors.request.use(
    config=>{
    // 可以在这里添加token等认证信息
    const token = localStorage.getItem('token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },

    //@ts-ignore
    error=>{
        Promise.reject()
    }
)

server.interceptors.response.use(
    response=>{
        if(response.status === 200){
            return response.data
        }
    },
    
    _error=>{
        Promise.reject()
    }
)


  // 创建会话
  const createSession = async (userId: string, characterId: string, sceneId?: string, title?: string): Promise<ChatSession> => {
    try {
      console.log(`=== 创建新对话会话 ===`);
      console.log(`用户ID: ${userId}, 智能体ID: ${characterId}, 场景ID: ${sceneId}`);

      const response = await server.post(`/user/${userId}/sessions`, {
        characterId:characterId,
        sceneId: sceneId || "0a6d74a4-5687-477b-b2bc-57b08642e5a2",
        title: title || `与${characterId}的对话`
      });  //与什么对话的标题在这里
      console.log('返回session id :',response.data)

      if (response.success && response.data) {
        const session = response.data.session;
        currentSession.value = session;
        
        // 清空当前消息
        messages.value = [];
        currentEmotion.value = session.current_emotion || 'neutral';
        
        console.log('✓ 会话创建成功:', session.id);
        return session;
      } else {
        throw new Error(response.data.error || '创建会话失败');
      }
    } catch (error) {
      console.error('× 创建会话失败:', error);
      throw error;
    }
  };

  // 获取会话详情
  const getSession = async (sessionId: string): Promise<ChatSession | null> => {
    try {
      const response = await server.get(`/sessions/${sessionId}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('获取会话失败:', error);
      return null;
    }
  };

  // 加载会话消息
  const loadSessionMessages = async (sessionId: string): Promise<Message[]> => {
    try {
      const response = await server.get(`/sessions/${sessionId}/messages`);
      
      if (response.success && response.data) {
        messages.value = response.data;
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('加载会话消息失败:', error);
      return [];
    }
  };

  // 保存消息到后端
  const saveMessage = async (message: Omit<Message, 'id' | 'created_at'>): Promise<Message | null> => {
    try {
      if (!JSON.parse(localStorage.getItem('sessionId')).id) {
        console.error('当前会话ID不存在');
        return null;
      }

      const response = await server.post(`/sessions/${JSON.parse(localStorage.getItem('sessionId')).id}/messages`, {
        sender: message.sender,
        content: message.content,
        message_type: message.message_type,
        emotion: message.emotion,
        voice_url: message.voice_url,
        audio_url: message.audio_url,
        original_text: message.original_text,
        voice_type: message.voice_type
      });

      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('保存消息失败:', error);
      return null;
    }
  };

  // 添加用户消息
  const addUserMessage = async (content: string, audioLabel?: string, audioUrl?: string): Promise<void> => {
    const tempMessage: Message = {
      id: generateTempId(),
      session_id: currentSession.value?.id || '',
      sender: 'user',
      content,
      message_type: audioUrl ? 'voice' : 'text',
      original_text: audioLabel,
      audio_url: audioUrl,
      created_at: new Date().toISOString(),
      timestamp: Date.now()
    };
    
    // 立即添加到本地消息列表
    messages.value.push(tempMessage);
    
    // 保存到后端
    try {
      const savedMessage = await saveMessage(tempMessage);
      if (savedMessage) {
        // 更新本地消息的ID
        const index = messages.value.findIndex(msg => msg.id === tempMessage.id);
        if (index !== -1) {
          messages.value[index] = savedMessage;
        }
      }
    } catch (error) {
      console.error('保存用户消息失败:', error);
    }
  };

  // 添加角色消息
  const addCharacterMessage = async (content: string, emotion?: string, audioUrl?: string): Promise<void> => {
    const tempMessage: Message = {
      id: generateTempId(),
      session_id: currentSession.value?.id || '',
      sender: 'character',
      content,
      message_type: audioUrl ? 'voice' : 'text',
      emotion: emotion || 'neutral',
      audio_url: audioUrl,
      created_at: new Date().toISOString(),
      timestamp: Date.now()
    };
    
    // 立即添加到本地消息列表
    messages.value.push(tempMessage);
    currentEmotion.value = emotion || 'neutral';
    
    // 保存到后端
    try {
      const savedMessage = await saveMessage(tempMessage);
      if (savedMessage) {
        // 更新本地消息的ID
        const index = messages.value.findIndex(msg => msg.id === tempMessage.id);
        if (index !== -1) {
          messages.value[index] = savedMessage;
        }
      }
    } catch (error) {
      console.error('保存角色消息失败:', error);
    }
  };

  // 设置输入状态
  const setTyping = (typing: boolean): void => {
    console.log(typing ? '打字中' : '输出完毕');
    isTyping.value = typing;
  };

  // 清空会话
  const clearSession = (): void => {
    messages.value = [];
    currentSession.value = null;
    isTyping.value = false;
    currentEmotion.value = 'neutral';
  };

  // 生成临时ID
  const generateTempId = (): string => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
    createSession,
    getSession,
    loadSessionMessages,
    addUserMessage,
    addCharacterMessage,
    setTyping,
    clearSession,
    getLastMessage,
    getMessagesBySender,
    updateMessageAudioState
  };
});