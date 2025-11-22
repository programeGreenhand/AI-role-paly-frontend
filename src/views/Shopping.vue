<!-- CharacterStore.vue -->
<template>
  <div class="character-store">
    <!-- 搜索区域 -->
    <div class="search-section">
      <SearchBar @search="handleSearch" />
    </div>

    <!-- 卡片展示区域 -->
    <div class="cards-container" ref="containerRef">
      <!-- 桌面端：网格布局 -->
      <div v-if="!isMobile" class="desktop-grid">
        <CharacterCard
          v-for="character in filteredCharacters"
          :key="character.id"
          
          :character="character"
          @chat="handleChat"
        />
      </div>

      <!-- 移动端：横向滚动 -->
      <div v-else class="mobile-scroll">
        <CharacterCard
          v-for="character in filteredCharacters"
          :key="character.id"
          :character="character"
          @chat="handleChat"
          class="mobile-card"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CharacterCard from '../components/shopping/CharacterCard.vue'
import SearchBar from '../components/shopping/SearchBar.vue'
import type { Character } from '../types/character'
import { getShoppingList } from '../api/shopping'
import { useCharacterStore } from '../stores/character'
import axios from 'axios'
import { useRouter } from 'vue-router'

// 响应式数据
const searchQuery = ref('')
const isMobile = ref(false)
const containerRef = ref<HTMLElement>()
const characters = ref<Character[]>([])
const characterStore = useCharacterStore()
const router = useRouter()



// 计算属性 - 过滤后的角色列表
const filteredCharacters = computed(() => {
  if (!searchQuery.value) {
    return characters.value
  }
  return characters.value.filter(character => 
    character.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    character.category.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    character.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

// 方法
const handleSearch = (query: string) => {
  searchQuery.value = query
}

const handleChat = (character: Character) => {
  console.log('开始与角色聊天:', character.name)
  // 这里实现跳转到聊天页面的逻辑
  characterStore.setCurrentCharacter(character);
  console.log(character.id)
  router.push(`/chat`)

}

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 生命周期
onMounted(async () => {
  checkMobile()
  try {
    const baseUrl = import.meta.env.VITE_BASE_URL || '/api'
    const response = await axios.get(`${baseUrl}/characters/public`)
    characters.value = response.data.data
  } catch (error) {
    console.error('获取角色数据失败:', error)
  }
  
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.character-store {
  width: 100%;
  min-height: 100vh;
  
}

.search-section {
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.cards-container {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(100vh - 100px);
}

.desktop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  justify-items: center;
}

.mobile-scroll {
  display: flex;
  overflow-x: auto;
  gap: 15px;
  padding-bottom: 20px;
  scroll-snap-type: x mandatory;
}

.mobile-scroll::-webkit-scrollbar {
  height: 8px;
}

.mobile-scroll::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.mobile-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.mobile-card {
  flex-shrink: 0;
  scroll-snap-align: start;
}

@media (max-width: 768px) {
  .search-section {
    padding: 15px;
  }
  
  .cards-container {
    padding: 15px;
    max-height: calc(100vh - 90px);
  }
  
  .desktop-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
  }
}
</style>