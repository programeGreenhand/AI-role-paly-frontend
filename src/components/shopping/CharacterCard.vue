<!-- CharacterCard.vue -->
<template>
  <div class="character-card" :class="{ flipped: isFlipped }" >
    <div class="card-inner" >
      <!-- 正面 -->
      <div class="card-front" @click="flipCard" >
        <div class="card-border">
          <div class="card-content">
            <div class="avatar-container">
              <img :src="character.avatar_url" :alt="character.name" class="avatar" /> 
              <div class="status-indicator" :class="{ online: character.is_public }"></div>
            </div>
            <div class="character-info">
              <el-icon size="25" @click.stop="save" :color="isActive?'black':'yellow'"><Star /></el-icon>
              <h3 class="character-name">{{ character.name }}</h3>
              <p class="character-category">{{ character.author }}</p>
              <div class="tags">
                <span v-for="tag in character.skills" :key="tag" class="tag">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 背面 -->
      <div class="card-back">
        <div class="card-border">
          <div class="card-content" >
            <div class="back-header">
              <h3 class="character-name">{{ character.name }}</h3>
              <button @click="flipCard" class="flip-back-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
            </div>
            
            <p class="description">{{ character.description }}</p>
            
            <div class="stats">
              <div v-for="(value, key) in character.stats" :key="key" class="stat-item">
                <span class="stat-label">{{ getStatLabel(key) }}</span>
                <div class="stat-bar">
                  <div class="stat-fill" :style="{ width: value + '%' }"></div>
                </div>
                <span class="stat-value">{{ value }}</span>
              </div>
            </div>
            
            <button @click="startChat" class="chat-button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              开始对话
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Character } from '../../types/character'
import axios from 'axios'
import server from '../../api/session'
const isActive = ref(true)
const count = ref(1)

const props = defineProps<{
  character: Character
}>()

const emit = defineEmits<{
  chat: [character: Character]
}>()

const isFlipped = ref(false)

const save = ()=>{
  const uerId = localStorage.getItem("userId") || 1
  isActive.value = !isActive.value
  count.value++;
  
  //如果为偶数就加入收藏
  if(count.value%2 === 0){
    server.post(`/user/${uerId}/favorites/${props.character.id}`)
  }else{//如果为奇数就取消收藏
    server.delete(`/user/${uerId}/favorites/${props.character.id}`)
  }
  
}

const flipCard = () => {
  isFlipped.value = !isFlipped.value
}

const startChat = () => {
  //开始聊天，这里是新的对话，
  emit('chat', props.character)
}

const getStatLabel = (key: string): string => {
  const labels: Record<string, string> = {
    magic: '魔法',
    courage: '勇气',
    wisdom: '智慧',
    friendship: '友谊'
  }
  return labels[key] || key
}
</script>

<style scoped>
.active{
  color:yellow
}
.character-card {
  width: 280px;
  height: 380px;
  perspective: 1000px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.character-card:hover {
  transform: translateY(-5px);
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.character-card.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.card-back {
  transform: rotateY(180deg);
}

.card-border {
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, #fff 0%, #f8f9fa 100%);
  border-radius: 20px;
  padding: 8px;
  box-shadow: 
    0 12px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 5px rgba(255, 255, 255, 0.8);
  position: relative;
  overflow: hidden;
}

.card-border::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    transparent 30%, 
    rgba(255, 255, 255, 0.1) 50%, 
    transparent 70%);
  border-radius: 20px;
  pointer-events: none;
}

.card-content {
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* 正面样式 */
.avatar-container {
  position: relative;
  margin: 0 auto 20px;
  width: 120px;
  height: 120px;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e3f2fd;
  transition: transform 0.3s ease;
}

.character-card:hover .avatar {
  transform: scale(1.05);
}

.status-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ccc;
  border: 2px solid #fff;
  transition: background-color 0.3s ease;
}

.status-indicator.online {
  background: #4caf50;
}

.character-info {
  text-align: center;
}

.character-name {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.character-category {
  margin: 0 0 15px;
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 500;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}

.tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 背面样式 */
.back-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.flip-back-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.flip-back-btn:hover {
  background: #f0f0f0;
}

.flip-back-btn svg {
  width: 20px;
  height: 20px;
  color: #666;
}

.description {
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 1.5;
  color: #5d6d7e;
  text-align: left;
}

.stats {
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
}

.stat-label {
  width: 40px;
  font-size: 12px;
  color: #666;
  text-align: left;
}

.stat-bar {
  flex: 1;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  border-radius: 3px;
  transition: width 0.6s ease;
}

.stat-value {
  width: 30px;
  font-size: 12px;
  font-weight: 600;
  color: #4caf50;
  text-align: right;
}

.chat-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  margin-top: auto;
}

.chat-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.chat-button svg {
  width: 16px;
  height: 16px;
}

@media (max-width: 768px) {
  .character-card {
    width: 250px;
    height: 340px;
  }
  
  .avatar-container {
    width: 100px;
    height: 100px;
    margin-bottom: 15px;
  }
  
  .character-name {
    font-size: 18px;
  }
  
  .description {
    font-size: 13px;
  }
}
</style>