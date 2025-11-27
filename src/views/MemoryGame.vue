<template>
  <div class="memory-game-container">
    <div class="game-header">
      <h1>记忆翻牌游戏</h1>
      <div class="game-stats">
        <div class="stat-item">
          <span class="stat-label">回合数:</span>
          <span class="stat-value">{{ gameStore.turns }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">匹配数:</span>
          <span class="stat-value">{{ gameStore.matches }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">剩余:</span>
          <span class="stat-value">{{ gameStore.totalPairs - gameStore.matches }}</span>
        </div>
      </div>
      <div class="game-controls">
        <el-button @click="restartGame" type="primary" size="large">
          重新开始
        </el-button>
        <el-button @click="goBack" type="default" size="large">
          返回首页
        </el-button>
      </div>
    </div>

    <div class="game-board">
      <div 
        v-for="(card, index) in gameStore.cards" 
        :key="index"
        class="card"
        :class="{
          'flipped': card.isFlipped,
          'matched': card.isMatched
        }"
        @click="flipCard(index)"
      >
        <div class="card-inner">
          <div class="card-front">
            <el-icon size="40" color="#409EFF"><QuestionFilled /></el-icon>
          </div>
          <div class="card-back">
            <el-icon size="40" :color="card.color">{{ card.icon }}</el-icon>
          </div>
        </div>
      </div>
    </div>

    <div v-if="gameStore.isGameOver" class="game-over-modal">
      <div class="modal-content">
        <h2>游戏结束!</h2>
        <p class="final-score">
          您用了 <span class="highlight">{{ gameStore.turns }}</span> 回合完成游戏
        </p>
        <div class="modal-controls">
          <el-button @click="restartGame" type="primary" size="large">
            再玩一次
          </el-button>
          <el-button @click="goBack" type="default" size="large">
            返回首页
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMemoryGameStore } from '../stores/memoryGame'
import { QuestionFilled } from '@element-plus/icons-vue'

const router = useRouter()
const gameStore = useMemoryGameStore()

const flipCard = (index: number) => {
  gameStore.flipCard(index)
}

const restartGame = () => {
  gameStore.initGame()
}

const goBack = () => {
  router.push('/hall')
}

onMounted(() => {
  gameStore.initGame()
})
</script>

<style scoped>
.memory-game-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.game-header {
  text-align: center;
  margin-bottom: 30px;
  color: white;
}

.game-header h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.game-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px 30px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
}

.game-controls {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.game-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 20px;
  max-width: 600px;
  margin: 0 auto;
  perspective: 1000px;
}

.card {
  width: 120px;
  height: 120px;
  cursor: pointer;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.card.flipped {
  transform: rotateY(180deg);
}

.card.matched {
  transform: rotateY(180deg);
  opacity: 0.8;
}

.card-inner {
  position: absolute;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
}

.card-front {
  background: linear-gradient(45deg, #409EFF, #667eea);
  color: white;
}

.card-back {
  background: white;
  color: #333;
  transform: rotateY(180deg);
}

.game-over-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
}

.modal-content h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 2rem;
}

.final-score {
  font-size: 1.2rem;
  margin-bottom: 30px;
  color: #666;
}

.highlight {
  color: #409EFF;
  font-weight: bold;
  font-size: 1.5rem;
}

.modal-controls {
  display: flex;
  gap: 15px;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .game-board {
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 15px;
    max-width: 400px;
  }
  
  .card {
    width: 80px;
    height: 80px;
  }
  
  .card-front,
  .card-back {
    font-size: 1.5rem;
  }
  
  .game-header h1 {
    font-size: 2rem;
  }
  
  .game-stats {
    gap: 20px;
    padding: 10px 20px;
  }
}

@media (max-width: 480px) {
  .game-board {
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 10px;
    max-width: 320px;
  }
  
  .card {
    width: 65px;
    height: 65px;
  }
  
  .card-front,
  .card-back {
    font-size: 1.2rem;
  }
  
  .game-header h1 {
    font-size: 1.5rem;
  }
  
  .game-stats {
    gap: 15px;
    padding: 8px 15px;
  }
  
  .stat-value {
    font-size: 1.2rem;
  }
}
</style>