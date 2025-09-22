<template>
  <div class="home-container">
    <!-- <div class="titles"> -->
      <el-header class="header">
        <h1 class="title">AI角色聊天</h1>
        <el-button type="primary" size="small" icon="setting" @click="goToSettings">设置</el-button>
      </el-header>
      
    <!-- </div> -->
    <el-main class="main-content">
      
      <div class="search-section">
        <el-input
          v-model="searchQuery"
          placeholder="搜索角色名称..."
          size="large"
          class="search-input"
        >
          
        </el-input>
      </div>

      
      <div class="characters-section">
      <!-- @vue-ignore -->
        <CharacterSelector
          
          :characters="filteredCharacters"
          @select="handleCharacterSelect"
        />
      </div>

      <div class="features-section">
        <h2>功能特色</h2>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card class="feature-card">
              <el-icon size="40" color="#409EFF"><ChatDotSquare /></el-icon>
              <h3>智能对话</h3>
              <p>与AI角色进行自然流畅的对话交流</p>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="feature-card">
              <el-icon size="40" color="#67C23A"><Microphone /></el-icon>
              <h3>语音交互</h3>
              <p>支持语音输入和语音回复，沉浸式体验</p>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="feature-card">
              <el-icon size="40" color="#E6A23C"><Setting /></el-icon>
              <h3>个性定制</h3>
              <p>自定义角色个性和对话风格</p>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '../stores/character'
import CharacterSelector from '../components/character/CharacterSelector.vue'
import type { Character } from '../types/character'

const router = useRouter()
const characterStore = useCharacterStore()

const searchQuery = ref('')

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
  router.push(`/chat/${character.id}`)
}

const goToSettings = () => {
  router.push('/settings')
}
</script>

<style scoped>
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

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
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
</style>