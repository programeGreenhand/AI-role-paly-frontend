<template>
  <div
    class="scene-background"
    :class="scene?.theme"
    :style="backgroundStyle"
  >  
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Scene } from '../../stores/scene'


const props = defineProps<{
  scene?: Scene | null
}>()

const backgroundStyle = computed(() => {
  if (!props.scene?.background) return {}
  
  return {
    backgroundImage: `url(../assets/charactor/sugeladi/background/001.jpg)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }
})


</script>

<style scoped>
.scene-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  transition: all 1s ease;

}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* background: rgba(0, 0, 0, 0.3); */

  backdrop-filter: blur(1px);
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  border-radius: 50%;
  opacity: 0.6;
  animation: float-up linear infinite;
}


@keyframes float-up {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}
</style>