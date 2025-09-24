// stores/audioRecordingStore.ts
import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import type { AppState } from '../types';

export const useAudioRecordingStore = defineStore('audioRecording', () => {
  const state = reactive<Pick<AppState, 'isRecording' | 'audioBlob' | 'recordingDuration'>>({
    isRecording: false,
    audioBlob: null,
    recordingDuration: 0
  });

  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];
  let durationInterval: number | null = null;
  let mediaStream: MediaStream | null = null;

  const startRecording = async (): Promise<void> => {
    if (state.isRecording) return;

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000,
          channelCount: 1,
          sampleSize: 16,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      audioChunks = [];
      mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'audio/webm; codecs=opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        state.audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        state.isRecording = false;
        
        if (durationInterval) {
          clearInterval(durationInterval);
          durationInterval = null;
        }
        
        if (mediaStream) {
          mediaStream.getTracks().forEach(track => track.stop());
          mediaStream = null;
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('录音错误:', event);
        stopRecording();
      };

      mediaRecorder.start(1000);
      state.isRecording = true;
      state.recordingDuration = 0;

      durationInterval = window.setInterval(() => {
        state.recordingDuration++;
      }, 1000);

    } catch (error) {
      console.error('录音启动失败:', error);
      throw error;
    }
  };

  const stopRecording = (): void => {
    if (mediaRecorder && state.isRecording) {
      mediaRecorder.stop();
      mediaRecorder = null;
    }
  };

  const getAudioBlob = (): Blob | null => {
    return state.audioBlob;
  };

  const downloadAudio = (): void => {
    if (state.audioBlob) {
      const url = URL.createObjectURL(state.audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording_${new Date().toISOString().replace(/:/g, '-')}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const resetRecording = (): void => {
    stopRecording();
    state.isRecording = false;
    state.audioBlob = null;
    state.recordingDuration = 0;
    
    if (durationInterval) {
      clearInterval(durationInterval);
      durationInterval = null;
    }
    
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
  };

  return {
    state,
    startRecording,
    stopRecording,
    getAudioBlob,
    downloadAudio,
    resetRecording
  };
});