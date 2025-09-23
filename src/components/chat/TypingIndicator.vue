<template>
  <div class="typing-indicator">
    <div class="character-avatar">
      <img :src="character?.avatar || '/avatars/default.jpg'" :alt="character?.name" />
    </div>
    
    <div class="typing-content">
      <div class="typing-bubble">
        <div class="typing-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
      <div class="typing-text">{{ character?.name || 'AI助手' }} 正在思考...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Character } from '../../types/character'

defineProps<{
  character: Character | null
}>()
</script>

<style scoped>
.typing-indicator {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 15px;
  animation: fadeIn 0.3s ease;
}

.character-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.character-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.typing-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.typing-bubble {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 18px;
  border-bottom-left-radius: 6px;
  padding: 12px 16px;
  min-width: 60px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.typing-dots {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #409EFF;
  animation: typing 1.4s infinite;
}

.dot:nth-child(1) { animation-delay: 0s; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

.typing-text {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  padding-left: 8px;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .character-avatar {
    width: 32px;
    height: 32px;
  }
  
  .typing-bubble {
    padding: 10px 14px;
  }
  
  .typing-text {
    font-size: 11px;
  }
}
</style>