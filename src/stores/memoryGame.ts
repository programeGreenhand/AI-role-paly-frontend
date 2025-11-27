import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 卡片类型定义
interface Card {
  id: number
  icon: string
  color: string
  isFlipped: boolean
  isMatched: boolean
}

// 游戏状态管理
export const useMemoryGameStore = defineStore('memoryGame', () => {
  // 游戏配置
  const totalPairs = ref(8) // 总共有8对卡片，共16张
  
  // 游戏状态
  const cards = ref<Card[]>([])
  const flippedCards = ref<number[]>([])
  const turns = ref(0)
  const matches = ref(0)
  const isChecking = ref(false)
  const isGameOver = ref(false)
  
  // 可用的图标和颜色
  const availableIcons = [
    'Star', 'Heart', 'Diamond', 'Clover', 'Bell', 'Moon', 'Sun', 'Cloud',
    'Music', 'Film', 'Gamepad', 'Book', 'Coffee', 'Gift', 'Fire', 'Snowflake'
  ]
  
  const availableColors = [
    '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399',
    '#722ED1', '#13C2C2', '#EB2F96', '#FAAD14', '#52C41A'
  ]
  
  // 洗牌算法 (Fisher-Yates)
  const shuffleArray = <T>(array: T[]): T[] => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }
  
  // 初始化游戏
  const initGame = () => {
    // 重置游戏状态
    turns.value = 0
    matches.value = 0
    flippedCards.value = []
    isGameOver.value = false
    
    // 创建卡片对
    const cardPairs: Card[] = []
    
    // 随机选择图标和颜色
    const selectedIcons = shuffleArray(availableIcons).slice(0, totalPairs.value)
    
    for (let i = 0; i < totalPairs.value; i++) {
      const icon = selectedIcons[i]
      const color = availableColors[Math.floor(Math.random() * availableColors.length)]
      
      // 创建一对相同的卡片
      cardPairs.push(
        { id: i * 2, icon, color, isFlipped: false, isMatched: false },
        { id: i * 2 + 1, icon, color, isFlipped: false, isMatched: false }
      )
    }
    
    // 洗牌
    cards.value = shuffleArray(cardPairs)
  }
  
  // 翻牌逻辑
  const flipCard = (index: number) => {
    // 如果正在检查匹配或卡片已经匹配，不允许翻牌
    if (isChecking.value || cards.value[index].isMatched || cards.value[index].isFlipped) {
      return
    }
    
    // 如果已经翻了两张牌，不允许再翻
    if (flippedCards.value.length === 2) {
      return
    }
    
    // 翻牌
    cards.value[index].isFlipped = true
    flippedCards.value.push(index)
    
    // 如果翻了两张牌，检查是否匹配
    if (flippedCards.value.length === 2) {
      turns.value++
      checkMatch()
    }
  }
  
  // 检查匹配
  const checkMatch = () => {
    isChecking.value = true
    
    const [index1, index2] = flippedCards.value
    const card1 = cards.value[index1]
    const card2 = cards.value[index2]
    
    // 延迟检查，让玩家看到第二张牌
    setTimeout(() => {
      if (card1.icon === card2.icon) {
        // 匹配成功
        card1.isMatched = true
        card2.isMatched = true
        matches.value++
        
        // 检查游戏是否结束
        if (matches.value === totalPairs.value) {
          isGameOver.value = true
        }
      } else {
        // 匹配失败，翻回卡片
        card1.isFlipped = false
        card2.isFlipped = false
      }
      
      // 重置状态
      flippedCards.value = []
      isChecking.value = false
    }, 1000)
  }
  
  // 重新开始游戏
  const restartGame = () => {
    initGame()
  }
  
  return {
    // 状态
    cards,
    turns,
    matches,
    totalPairs,
    isGameOver,
    
    // 方法
    initGame,
    flipCard,
    restartGame
  }
})