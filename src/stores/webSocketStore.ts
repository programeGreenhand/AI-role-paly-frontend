// stores/webSocketStore.ts
import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import type { WebSocketMessage, ConnectionStatus } from '../types';

export const useWebSocketStore = defineStore('webSocket', () => {
  const isConnected = ref(false);
  const connectionStatus = reactive<ConnectionStatus>({
    status: 'disconnected',
    text: '等待连接服务器...'
  });
  
  let websocket: WebSocket | null = null;
  const messageHandlers = new Map<string, (data: any) => void>();

  const connect = async (url: string = 'ws://129.204.241.238/ws/chat'): Promise<void> => {
    if (isConnected.value) {
      disconnect();
      return;
    }

    updateStatus('connecting', '连接服务器中...');
    
    try {
      websocket = new WebSocket(url);
      
      websocket.onopen = (event) => {
        isConnected.value = true;
        updateStatus('connected', '服务器连接成功');
        
        // 发送连接确认消息
        send({
          type: 'connection_ack',
          timestamp: Date.now(),
          messageId: generateMessageId()
        });
      };
      
      websocket.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          const handler = messageHandlers.get(data.type);
          if (handler) {
            handler(data);
          }
        } catch (error) {
          console.error('消息解析错误:', error);
        }
      };
      
      websocket.onerror = (error) => {
        console.error('WebSocket 连接错误:', error);
        disconnect();
      };
      
      websocket.onclose = (event) => {
        console.log('WebSocket 连接关闭:', event.code, event.reason);
        disconnect();
      };
      
    } catch (error) {
      console.error('连接失败:', error);
      disconnect();
    }
  };

  const disconnect = (): void => {
    if (websocket) {
      websocket.close();
      websocket = null;
    }
    isConnected.value = false;
    updateStatus('disconnected', '服务器未连接');
    messageHandlers.clear();
  };

  const send = (message: WebSocketMessage): boolean => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify(message));
      return true;
    }
    return false;
  };

  const onMessage = (type: string, handler: (data: any) => void): void => {
    messageHandlers.set(type, handler);
  };

  const removeMessageHandler = (type: string): void => {
    messageHandlers.delete(type);
  };

  const updateStatus = (status: ConnectionStatus['status'], text: string): void => {
    connectionStatus.status = status;
    connectionStatus.text = text;
  };

  const generateMessageId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // 自动断开连接当store被卸载时
  const $onDestroy = () => {
    disconnect();
  };

  return {
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    send,
    onMessage,
    removeMessageHandler,
    generateMessageId
  };
});