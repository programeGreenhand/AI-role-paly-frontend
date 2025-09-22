<template>
  <div class="loading-animation" :class="type">
    <div v-if="type === 'dots'" class="dots-loader">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
    
    <div v-else-if="type === 'spinner'" class="spinner-loader">
      <div class="spinner"></div>
    </div>
    
    <div v-else-if="type === 'pulse'" class="pulse-loader">
      <div class="pulse"></div>
    </div>
    
    <div v-else class="wave-loader">
      <div class="wave"></div>
      <div class="wave"></div>
      <div class="wave"></div>
      <div class="wave"></div>
    </div>
    
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  type?: 'dots' | 'spinner' | 'pulse' | 'wave'
  text?: string
}>()
</script>

<style scoped>
.loading-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 20px;
}

.loading-text {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

/* Dots loader */
.dots-loader {
  display: flex;
  gap: 8px;
}

.dots-loader .dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #409EFF;
  animation: dots-bounce 1.4s infinite;
}

.dots-loader .dot:nth-child(1) { animation-delay: 0s; }
.dots-loader .dot:nth-child(2) { animation-delay: 0.2s; }
.dots-loader .dot:nth-child(3) { animation-delay: 0.4s; }

/* Spinner loader */
.spinner-loader {
  width: 40px;
  height: 40px;
}

.spinner {
  width: 100%;
  height: 100%;
  border: 4px solid rgba(64, 158, 255, 0.2);
  border-top: 4px solid #409EFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Pulse loader */
.pulse-loader {
  width: 40px;
  height: 40px;
}

.pulse {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #409EFF;
  animation: pulse-scale 1.5s ease-in-out infinite;
}

/* Wave loader */
.wave-loader {
  display: flex;
  gap: 4px;
  align-items: center;
}

.wave {
  width: 6px;
  height: 30px;
  background: #409EFF;
  border-radius: 3px;
  animation: wave-height 1.2s ease-in-out infinite;
}

.wave:nth-child(1) { animation-delay: 0s; }
.wave:nth-child(2) { animation-delay: 0.2s; }
.wave:nth-child(3) { animation-delay: 0.4s; }
.wave:nth-child(4) { animation-delay: 0.6s; }

@keyframes dots-bounce {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1.2); opacity: 1; }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse-scale {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes wave-height {
  0%, 40%, 100% { transform: scaleY(0.4); }
  20% { transform: scaleY(1); }
}
</style>