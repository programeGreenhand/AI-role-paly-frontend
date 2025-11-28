<template>
    <div class="home-container">
    <el-header class="header">
      <h1 class="title">AI角色对话</h1>
    </el-header>
    
    <el-main class="main-content">
      <div class="search-section">
        <el-input
          v-model="searchQuery"
          placeholder="搜索角色名称..."
          size="large"
          class="search-input"
        />
      </div>

      <div class="characters-section">
        <CharacterSelector
          :characters="filteredCharacters"
          @select="handleCharacterSelect"
        />
      </div>

      <div class="features-section">
        <h2>功能特色</h2>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="8" :lg="8">
            <el-card class="feature-card">
              <el-icon size="40" color="#409EFF"><ChatDotSquare /></el-icon>
              <h3>智能对话</h3>
              <p>与AI角色进行自然流畅的对话交流</p>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="24" :md="8" :lg="8">
            <el-card class="feature-card">
              <el-icon size="40" color="#67C23A"><Microphone /></el-icon>
              <h3>语音交互</h3>
              <p>支持语音输入和语音回复，沉浸式体验</p>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="24" :md="8" :lg="8">
            <el-card class="feature-card">
              <el-icon size="65" color="#E6A23C"><Setting /></el-icon>
              <h3>个性定制</h3>
              <p>自定义角色个性和对话风格</p>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div class="game-section">
        <h2>趣味小游戏</h2>
        <el-card class="game-card">
          <div class="game-content">
            <el-icon size="60" color="#F56C6C" @click="goToMemoryGame"><VideoPlay /></el-icon>
            <h3>记忆卡片挑战</h3>
            <p>测试你的记忆力，匹配相同的角色卡片！</p>
            <el-button 
              type="primary" 
              size="large" 
              class="game-button"
              @click="goToMemoryGame"
            >
              开始游戏
            </el-button>
          </div>
        </el-card>
      </div>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '../../stores/character'
import CharacterSelector from '../character/CharacterSelector.vue'
import type { Character } from '../../types/character'
import { VideoPlay } from '@element-plus/icons-vue'

const router = useRouter()
const characterStore = useCharacterStore()

const searchQuery = ref('')

// 组件挂载时加载角色数据
onMounted(async () => {
  await characterStore.loadCharactersFromDatabase()
})

const filteredCharacters = computed(() => {
  if (!searchQuery.value) {
    return characterStore.allCharacters
  }
  return characterStore.allCharacters.filter(character =>
    character.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    character.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})



const handleCharacterSelect = (character: Character) => {
  characterStore.setCurrentCharacter(character)
  router.push(`/chat`)
}

const goToMemoryGame = () => {
  router.push('/memory-game')
}


</script>

<style lang="css" scoped>
.home-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  text-align: center;
  padding: 40px 0;
  color: black;
}

.title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.main-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.search-section {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-top: 40px;
  margin-bottom: 40px;
}

.search-input {
  max-width: 500px;
  margin: 0 auto;
}

.characters-section,
.features-section {
  margin-bottom: 40px;
}

.characters-section h2,
.features-section h2 {
  color: black;
  text-align: center;
  margin-bottom: 20px;
  font-size: 2rem;
}

.feature-card {
  text-align: center;
  padding: 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h3 {
  margin: 15px 0 10px;
  color: black;
}

.feature-card p {
  color: black;
  line-height: 1.6;
}

.game-section {
  margin-bottom: 40px;
}

.game-section h2 {
  color: black;
  text-align: center;
  margin-bottom: 20px;
  font-size: 2rem;
}

.game-card {
  max-width: 400px;
  margin: 0 auto;
  border-radius: 16px;
  background: white;
  color: black;
  text-align: center;
  padding: 30px;
}

.game-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.game-content h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.game-content p {
  margin: 0;
  font-size: 1rem;
  opacity: 0.9;
}

.game-button {
  margin-top: 10px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  font-weight: bold;
  transition: all 0.3s ease;
}

.game-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

/* 书签样式历史按钮 */
.bookmark-history-btn {
  position: fixed;
  top: 50vh;
  left: 0;
  transform: translateY(-50%);
  z-index: 1000;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
}

.bookmark-history-btn:hover {
  transform: translateY(-50%) scale(1.1);
}

.bookmark-shape {
  width: 40px;
  height: 120px;
  background: linear-gradient(45deg, #e67e22, #f39c12);
  border-radius: 0 8px 8px 0;
  position: relative;
  box-shadow: 3px 3px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.bookmark-shape::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-top: 15px solid #d35400;
}

.bookmark-history-btn:hover .bookmark-shape {
  background: linear-gradient(45deg, #f39c12, #e67e22);
  box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.3);
}

.bookmark-label {
  margin-top: 10px;
  color: #e67e22;
  font-weight: bold;
  font-size: 14px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

/* 历史记录列表样式 */
.history-list {
  padding: 10px;
}

.character-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.character-item:hover {
  background-color: #f5f5f5;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transform: translateX(5px);
}

.character-info {
  margin-left: 12px;
}

.character-name {
  font-weight: bold;
  color: #333;
}

</style>