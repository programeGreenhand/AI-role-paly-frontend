<template>
  <div id="app" :class="['app-container', currentTheme]">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted} from 'vue'
import { useCharacterStore } from './stores/character'


const characterStore = useCharacterStore()


const currentTheme = computed(() => {
  return characterStore.currentCharacter?.theme || 'default'
})

onMounted(()=>{
  localStorage.setItem('islogin','true')
})


</script>

<style>
.app-container {
  min-height: 100vh;
  transition: all 0.5s ease;
}
</style>