<template>
  <div class="character-animation" :class="[`emotion-${emotion}`, `theme-${character.theme}`]">
    <div class="character-avatar-container">
      <img
        :src="character.avatar || '/avatars/default.jpg'"
        :alt="character.name"
        class="character-avatar"
        :class="{ 'talking': isTalking }"
      />
      <div class="emotion-indicator" :class="`emotion-${emotion}`"></div>
      
      <!-- 表情动画 -->
      <div class="expression-overlay" :class="`expression-${emotion}`">
        <div v-if="emotion === 'happy'" class="emoji">😊</div>
        <div v-else-if="emotion === 'sad'" class="emoji">😢</div>
        <div v-else-if="emotion === 'excited'" class="emoji">🤩</div>
        <div v-else-if="emotion === 'angry'" class="emoji">😠</div>
        <div v-else-if="emotion === 'wise'" class="emoji">🤔</div>
      </div>
      
      <!-- 说话时的波纹效果 -->
      <div v-if="isTalking" class="speech-waves">
        <div class="wave"></div>
        <div class="wave"></div>
        <div class="wave"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Character } from '../../types/character'
import { useChatStore } from '../../stores/chat'

defineProps<{
  character: Character
  emotion: string
}>()

const chatStore = useChatStore()

const isTalking = computed(() => chatStore.isTyping)
</script>

<style scoped>
.character-animation {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.character-avatar-container {
  position: relative;
  width: 80px;
  height: 80px;
}

.character-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.character-avatar.talking {
  transform: scale(1.1);
  border-color: #409EFF;
  box-shadow: 0 0 20px rgba(64, 158, 255, 0.5);
}

.emotion-indicator {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid white;
  transition: all 0.3s ease;
}

.emotion-happy { background: #67C23A; }
.emotion-sad { background: #909399; }
.emotion-excited { background: #E6A23C; }
.emotion-angry { background: #F56C6C; }
.emotion-wise { background: #409EFF; }
.emotion-neutral { background: #C0C4CC; }

.expression-overlay {
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 16px;
  animation: bounce 1s ease-in-out;
}

.emoji {
  font-size: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.speech-waves {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  pointer-events: none;
}

.wave {
  position: absolute;
  border: 2px solid #409EFF;
  border-radius: 50%;
  opacity: 0;
  animation: wave-animation 1.5s ease-out infinite;
}

.wave:nth-child(1) { animation-delay: 0s; }
.wave:nth-child(2) { animation-delay: 0.5s; }
.wave:nth-child(3) { animation-delay: 1s; }

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes wave-animation {
  0% {
    width: 20px;
    height: 20px;
    opacity: 1;
  }
  100% {
    width: 100px;
    height: 100px;
    opacity: 0;
  }
}

/* 主题特效 */
.theme-magic .character-avatar {
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
}

.theme-philosophy .character-avatar {
  filter: sepia(20%);
}

.theme-tech .character-avatar {
  filter: hue-rotate(180deg);
}
</style>