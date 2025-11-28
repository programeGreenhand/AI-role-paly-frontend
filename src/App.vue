<template>
  <div id="app" :class="['app-container', currentTheme]">
    <router-view />
    <GlobalTour />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted} from 'vue'
import { useCharacterStore } from './stores/character'
import { useThemeStore } from './stores/theme'
import GlobalTour from './components/common/GlobalTour.vue'


const characterStore = useCharacterStore()
const themeStore = useThemeStore()


const currentTheme = computed(() => {
  return characterStore.currentCharacter?.theme || 'default'
})

onMounted(()=>{
  localStorage.setItem('islogin','true')
  themeStore.initTheme()
})


</script>

<style>
.app-container {
  min-height: 100vh;
  transition: all 0.5s ease;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}
</style>