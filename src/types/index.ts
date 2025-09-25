export interface Message {
  id: string;
  sender: 'user' | 'character';
  content: string;
  timestamp: Date;
  audioLabel?: string;
}

export interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp: number;
  messageId: string;
  audioType?:string
}

export interface AppState {
  isRecording: boolean;
  isConnected: boolean;
  audioBlob: Blob | null;
  recordingDuration: number;
  messageCount: number;
}

export interface ConnectionStatus {
  status: 'connected' | 'disconnected' | 'connecting';
  text: string;
}