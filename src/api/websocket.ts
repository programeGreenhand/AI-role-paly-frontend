// import type { WSMessage, WSAudioMessage, WSTextMessage, VoiceConfig } from '../types/websocket'
import type { WSMessage, WSAudioMessage, WSTextMessage,  } from '../types/websocket'
import { useChatStore } from '../stores/chat'
export class ChatWebSocket {
  private ws: WebSocket | null = null
  private wsUrl: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private messageHandlers: Map<string, (message: WSMessage) => void> = new Map()
  private isConnecting = false

  constructor(wsUrl: string) {
    this.wsUrl = wsUrl
    
  }

  

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'))
        return
      }

      this.isConnecting = true
      this.ws = new WebSocket(this.wsUrl)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.isConnecting = false
        this.reconnectAttempts = 0
        resolve()
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason)
        this.isConnecting = false
        this.handleReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.isConnecting = false
        reject(error)
      }
    })
  }

  private handleMessage(message: WSMessage) {
    // 广播给所有监听器
    this.messageHandlers.forEach(handler => handler(message))
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error)
        })
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }

  onMessage(handler: (message: WSMessage) => void): () => void {
    const id = Math.random().toString(36)
    this.messageHandlers.set(id, handler)
    const chatStore = useChatStore()
    // 返回取消监听的函数
    return () => {
      this.messageHandlers.delete(id)
    }
  }

  sendAudio(audioData: string, format: string = 'wav',sessionId:string): void {
    if (!this.isConnected()) {
      throw new Error('WebSocket not connected')
    }

    const message: WSAudioMessage = {
      type: 'audio',
      data: { audioData, format,sessionId },
      timestamp: Date.now(),
      messageId: this.generateMessageId()
    }

    this.ws!.send(JSON.stringify(message))
  }

  sendText(text: string, characterId: string, emotion?: string,sessionId:string): void {
    if (!this.isConnected()) {
      throw new Error('WebSocket not connected')
    }

    const message: WSTextMessage = {
      type: 'text',
      data: { text, characterId, emotion, sessionId},
      timestamp: Date.now(),
      messageId: this.generateMessageId(),

    }

    this.ws!.send(JSON.stringify(message))
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.messageHandlers.clear()
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}