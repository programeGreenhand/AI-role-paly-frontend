declare module 'js-audio-recorder' {
  export default class AudioRecorder {
    constructor(config?: {
      sampleBits?: number;
      sampleRate?: number;
      numChannels?: number;
    });
    
    start(): Promise<void>;
    stop(): void;
    pause(): void;
    resume(): void;
    getWAVBlob(): Blob;
    getPCMBlob(): Blob;
    downloadWAV(filename?: string): void;
    clear(): void;
    onprogress?: (duration: number) => void;
  }
}