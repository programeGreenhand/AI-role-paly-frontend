<template>
  <el-card
    class="character-card"
    :class="{ 'character-card--selected': selected }"
    @click="handleSelect"
    shadow="hover"
  >
    <div class="character-avatar">
      <img :src=getroleImage(character.id) :alt="character.name" />
       <!-- <img src='../../' :alt="character.name" /> -->
      <div class="character-status" :class="`status-${character.emotionalTendency?.default || 'neutral'}`"></div>
    </div>
    
    <div class="character-info">
      <h3 class="character-name">{{ character.name }}</h3>
      <p class="character-description">{{ character.description }}</p>
      
      <div class="character-personality">
        <el-tag
          v-for="trait in character.personality?.slice(0, 3)"
          :key="trait"
          size="small"
          class="personality-tag"
        >
          {{ trait }}
        </el-tag>
      </div>
      
      <div class="character-skills">
        <small>技能：{{ character.skills?.map(s => s.name).join('、') }}</small>
      </div>
    </div>
    
    <div class="character-actions">
      <el-button type="primary" size="small">
        开始对话
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import type { Character } from '../../types/character'


const getroleImage = (id:string) => {
  const url =  new URL(`../../assets/charactor/${id}/role/avatar.jpg`, import.meta.url).href;

  return url
};

defineProps<{
  character: Character
  selected?: boolean
}>()

const emit = defineEmits<{
  select: []
}>()

const handleSelect = () => {
  emit('select')
}
</script>

<style scoped>
.character-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.character-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.character-card--selected {
  border: 2px solid #409EFF;
  transform: translateY(-3px);
}

.character-avatar {
  position: relative;
  text-align: center;
  margin-bottom: 15px;
}

.character-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.character-status {
  position: absolute;
  right: 25%;
  bottom: 5px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #fff;
}

.status-happy { background: #67C23A; }
.status-calm { background: #409EFF; }
.status-wise { background: #E6A23C; }
.status-determined { background: #F56C6C; }
.status-neutral { background: #909399; }

.character-name {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.character-description {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.character-personality {
  margin-bottom: 10px;
}

.personality-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.character-skills {
  margin-bottom: 15px;
  color: #888;
  font-size: 0.8rem;
}

.character-actions {
  text-align: center;
}
</style>