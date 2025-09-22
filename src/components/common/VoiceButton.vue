<template>
  <el-button
    :size="size"
    :type="isPlaying ? 'danger' : 'primary'"
    :loading="isPlaying"
    @click="togglePlay"
    circle
    class="voice-button"
  >
    <el-icon v-if="!isPlaying"><VideoPlay /></el-icon>
    <el-icon v-else><VideoPause /></el-icon>
  </el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useVoiceStore } from '../../stores/voice'

const props = defineProps<{
  text: string
  voice?: string
  size?: 'small' | 'default' | 'large'
}>()

const voiceStore = useVoiceStore()
const isPlaying = ref(false)

const togglePlay = async () => {
  if (isPlaying.value) return
  
  try {
    isPlaying.value = true
    await voiceStore.speak(props.text, props.voice!)
  } catch (error) {
    console.error('语音播放失败:', error)
  } finally {
    isPlaying.value = false
  }
}
</script>

<style scoped>
.voice-button {
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.voice-button:hover {
  opacity: 1;
}
</style>