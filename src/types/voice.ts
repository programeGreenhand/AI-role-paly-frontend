export interface VoiceItem {
  voice_name: string
  voice_type: string
  url: string
  category: string
  updatetime: number
}

export interface AudioRecordingConfig {
  sampleRate: number
  channels: number
  bitsPerSample: number
}