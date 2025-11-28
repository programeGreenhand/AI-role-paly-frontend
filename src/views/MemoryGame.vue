<template>
  <div class="memory-game-container">
    <el-header class="game-header">
      <el-button type="primary" @click="goBack" class="back-button">
        <el-icon><ArrowLeft /></el-icon>
        返回主页
      </el-button>
      <h1 class="game-title">记忆卡片挑战</h1>
      <div class="game-stats">
        <span class="stat">时间: {{ formatTime }}</span>
        <span class="stat">步数: {{ moves }}</span>
        <span class="stat">匹配: {{ matchedPairs }}/{{ totalPairs }}</span>
      </div>
    </el-header>

    <el-main class="game-main">
      <div class="game-controls">
        <el-button 
          type="success" 
          @click="startGame" 
          :disabled="gameStarted && !gameOver"
        >
          {{ gameStarted && !gameOver ? '游戏中...' : '开始游戏' }}
        </el-button>
        <el-button type="warning" @click="resetGame">重置游戏</el-button>
      </div>

      <div class="cards-grid" :class="`grid-${gridSize}`">
        <div 
          v-for="(card, index) in cards" 
          :key="index"
          class="memory-card"
          :class="{ 
            'flipped': card.flipped, 
            'matched': card.matched,
            'disabled': card.matched || (flippedCards.length === 2 && !card.flipped)
          }"
          @click="flipCard(index)"
        >
          <div class="card-inner">
            <div class="card-front">
              <div class="card-pattern"></div>
              <div class="card-number">{{ index + 1 }}</div>
            </div>
            <div class="card-back">
              <div class="character-avatar">
                <img :src="card.character.avatar_url" :alt="card.character.name" />
              </div>
              <div class="character-name">{{ card.character.name }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="gameOver" class="game-over">
        <div class="victory-message">
          <el-icon size="80" color="#67C23A"><SuccessFilled /></el-icon>
          <h2>恭喜你完成了游戏！</h2>
          <p>用时: {{ formatTime }} | 步数: {{ moves }}</p>
          <el-button type="primary" size="large" @click="startGame">再玩一次</el-button>
        </div>
      </div>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '../stores/character'
import { ArrowLeft, SuccessFilled } from '@element-plus/icons-vue'

const router = useRouter()
const characterStore = useCharacterStore()

interface MemoryCard {
  character: any
  flipped: boolean
  matched: boolean
  id: number
}

const cards = ref<MemoryCard[]>([])
const flippedCards = ref<number[]>([])
const matchedPairs = ref(0)
const moves = ref(0)
const gameStarted = ref(false)
const gameOver = ref(false)
const startTime = ref(0)
const currentTime = ref(0)

const gridSize = computed(() => {
  const totalCards = cards.value.length
  if (totalCards <= 8) return 4
  if (totalCards <= 12) return 6
  return 8
})

const totalPairs = computed(() => cards.value.length / 2)

const formatTime = computed(() => {
  const seconds = Math.floor(currentTime.value / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
})

const goBack = () => {
  router.push('/hall')
}

const startGame = async () => {
  await characterStore.loadCharactersFromDatabase()
  
  const availableCharacters = characterStore.allCharacters.slice(0, 6)
  if (availableCharacters.length < 3) {
    console.warn('角色数量不足，无法开始游戏')
    return
  }

  const gameCharacters = [...availableCharacters, ...availableCharacters]
  cards.value = gameCharacters
    .map((character, index) => ({
      character,
      flipped: false,
      matched: false,
      id: index
    }))
    .sort(() => Math.random() - 0.5)

  flippedCards.value = []
  matchedPairs.value = 0
  moves.value = 0
  gameStarted.value = true
  gameOver.value = false
  startTime.value = Date.now()
  currentTime.value = 0

  // 启动计时器
  const timer = setInterval(() => {
    if (gameStarted.value && !gameOver.value) {
      currentTime.value = Date.now() - startTime.value
    } else {
      clearInterval(timer)
    }
  }, 1000)
}

const resetGame = () => {
  cards.value.forEach(card => {
    card.flipped = false
    card.matched = false
  })
  flippedCards.value = []
  matchedPairs.value = 0
  moves.value = 0
  gameStarted.value = false
  gameOver.value = false
  currentTime.value = 0
}

const flipCard = (index: number) => {
  const card = cards.value[index]
  
  if (!gameStarted.value || gameOver.value || card.matched || card.flipped || flippedCards.value.length === 2) {
    return
  }

  card.flipped = true
  flippedCards.value.push(index)

  if (flippedCards.value.length === 2) {
    moves.value++
    checkForMatch()
  }
}

const checkForMatch = () => {
  const [firstIndex, secondIndex] = flippedCards.value
  const firstCard = cards.value[firstIndex]
  const secondCard = cards.value[secondIndex]

  if (firstCard.character.id === secondCard.character.id) {
    firstCard.matched = true
    secondCard.matched = true
    matchedPairs.value++
    
    if (matchedPairs.value === totalPairs.value) {
      gameOver.value = true
      gameStarted.value = false
    }
    
    flippedCards.value = []
  } else {
    setTimeout(() => {
      firstCard.flipped = false
      secondCard.flipped = false
      flippedCards.value = []
    }, 1000)
  }
}

onMounted(() => {
  startGame()
})
</script>

<style scoped>
.memory-game-container {
  min-height: 100vh;
  background: white;
  padding: 20px;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  color: black;
}

.back-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.game-title {
  margin: 0 auto;
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.game-stats {
  display: flex;
  gap: 20px;
}

.stat {
  font-size: 1.1rem;
  font-weight: bold;
}

.game-main {
  max-width: 1200px;
  margin: 0 auto;
}

.game-controls {
  text-align: center;
  margin-bottom: 30px;
}

.cards-grid {
  display: grid;
  gap: 15px;
  justify-content: center;
  margin: 0 auto;
}

.grid-4 {
  grid-template-columns: repeat(4, 1fr);
  max-width: 500px;
}

.grid-6 {
  grid-template-columns: repeat(6, 1fr);
  max-width: 750px;
}

.grid-8 {
  grid-template-columns: repeat(8, 1fr);
  max-width: 1000px;
}

.memory-card {
  aspect-ratio: 3/4;
  cursor: pointer;
  perspective: 1000px;
}

.memory-card.disabled {
  cursor: not-allowed;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.memory-card.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.card-front {
  background: linear-gradient(45deg, #409EFF, #67C23A);
  color: white;
}

.card-pattern {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  margin-bottom: 10px;
}

.card-number {
  font-size: 1.5rem;
  font-weight: bold;
}

.card-back {
  background: white;
  transform: rotateY(180deg);
}

.character-avatar img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
}

.character-name {
  font-weight: bold;
  color: black;
  text-align: center;
  font-size: 0.9rem;
}

.memory-card.matched .card-back {
  background: linear-gradient(45deg, #67C23A, #E6A23C);
  color: black;
}

.memory-card.matched .character-name {
  color: black;
}

.game-over {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.victory-message {
  background: white;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.victory-message h2 {
  margin: 20px 0 10px;
  color: #333;
}

.victory-message p {
  color: #666;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .cards-grid {
    gap: 10px;
  }
  
  .grid-4 {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .grid-6 {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .grid-8 {
    grid-template-columns: repeat(5, 1fr);
  }
  
  .game-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .game-stats {
    justify-content: center;
  }
}
</style>