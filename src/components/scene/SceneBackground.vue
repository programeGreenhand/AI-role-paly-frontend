<template>
  <div
    class="scene-background"
    :class="scene?.theme"
    :style="backgroundStyle"
  >
    <div class="background-overlay"></div>
    <!-- <div class="floating-elements">
      <div
        v-for="i in elementCount"
        :key="i"
        class="floating-element"
        :style="getElementStyle(i)"
      ></div>
    </div> -->
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
    backgroundImage: `url(${props.scene.background})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }
})

const elementCount = computed(() => {
  switch (props.scene?.theme) {
    case 'magic': return 20
    case 'philosophy': return 10
    case 'tech': return 15
    default: return 8
  }
})

// // @ts-ignore
// const getElementStyle = (index: number) => {
//   const randomDelay = Math.random() * 5
//   const randomDuration = 10 + Math.random() * 20
//   const randomLeft = Math.random() * 100
//   const randomSize = 4 + Math.random() * 8
  
//   return {
//     left: `${randomLeft}%`,
//     animationDelay: `${randomDelay}s`,
//     animationDuration: `${randomDuration}s`,
//     width: `${randomSize}px`,
//     height: `${randomSize}px`
//   }
// }
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

/* 魔法主题 */
.magic .floating-element {
  background: radial-gradient(circle, #667eea, #764ba2);
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
}

.magic {
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.3), 
    rgba(118, 75, 162, 0.3)
  );
}

/* 哲学主题 */
.philosophy .floating-element {
  background: radial-gradient(circle, #f093fb, #f5576c);
}

.philosophy {
  background: linear-gradient(135deg, 
    rgba(240, 147, 251, 0.2), 
    rgba(245, 87, 108, 0.2)
  );
}

/* 科技主题 */
.tech .floating-element {
  background: linear-gradient(45deg, #00d4ff, #090979);
  border-radius: 2px;
}

.tech {
  background: linear-gradient(135deg, 
    rgba(0, 212, 255, 0.2), 
    rgba(9, 9, 121, 0.2)
  );
}

/* @keyframes float-up {
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
} */
</style>