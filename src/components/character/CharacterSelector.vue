<template>
  <div class="character-selector">
    <div class="characters-grid">
      <CharacterCard
        v-for="character in characters"
        :key="character.id"
        :character="character"
        @select="$emit('select', character)"
        class="character-item animate__animated animate__fadeInUp"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Character } from '../../types/character'
import CharacterCard from './CharacterCard.vue'

defineProps<{
  characters: Character[]
}>()

defineEmits<{
  select: [character: Character]
}>()
</script>

<style scoped>
.characters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.character-item {
  animation-delay: calc(var(--i) * 0.1s);
}
</style>