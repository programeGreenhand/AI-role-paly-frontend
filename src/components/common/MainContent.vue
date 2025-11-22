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
    </el-main>

    <!-- 欢迎弹窗 -->
    <el-dialog
      v-model="showWelcomeDialog"
      title="🎉 欢迎使用AI角色对话系统！"
      width="520px"
      :before-close="handleCloseWelcome"
      custom-class="welcome-dialog"
      center
    >
      <div class="welcome-content">
        <p class="welcome-intro">✨ 恭喜你成功登录！让我们开始这段奇妙的AI对话之旅吧！ ✨</p>
        
        <div class="guide-steps">
          <div class="step-item">
            <span class="step-number">1️⃣</span>
            <div class="step-content">
              <strong>点击左侧按钮，打开左侧边栏</strong>
              <p>探索更多功能和设置选项</p>
            </div>
          </div>
          
          <div class="step-item">
            <span class="step-number">2️⃣</span>
            <div class="step-content">
              <strong>进入智能体宇宙，选择角色对话或进入设置自定义角色进行对话</strong>
              <p>🎭 创建你喜欢的角色吧！！它可以是哈利波特可以是路飞，也可以是任何你想象中的角色！</p>
            </div>
          </div>
          
          <div class="step-item">
            <span class="step-number">3️⃣</span>
            <div class="step-content">
              <strong>对话前选择适合的场景和语音风格</strong>
              <p>🎙️ 让对话更加生动有趣！</p>
            </div>
          </div>
          
          <div class="step-item">
            <span class="step-number">4️⃣</span>
            <div class="step-content">
              <strong>可以开始对话啦！！畅所欲言！！！</strong>
              <p>💬 和你的AI伙伴尽情聊天吧！</p>
            </div>
          </div>
        </div>
        
        <p class="welcome-tip">🌟 小贴士：记得使用语音功能，体验更真实的对话感受哦！</p>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="handleCloseWelcome" class="start-button">
            🚀 开始探索！
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '../../stores/character'
import CharacterSelector from '../character/CharacterSelector.vue'
import type { Character } from '../../types/character'

const router = useRouter()
const characterStore = useCharacterStore()

const searchQuery = ref('')
const showWelcomeDialog = ref(false)

// 检查是否已经显示过欢迎弹窗
const checkWelcomeStatus = () => {
  const hasSeenWelcome = localStorage.getItem('hasSeenWelcome')
  if (!hasSeenWelcome) {
    // 延迟显示，确保页面加载完成
    setTimeout(() => {
      showWelcomeDialog.value = true
    }, 800)
  }
}

// 关闭欢迎弹窗并记录状态
const handleCloseWelcome = () => {
  showWelcomeDialog.value = false
  localStorage.setItem('hasSeenWelcome', 'true')
}

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

// 页面加载时检查欢迎弹窗状态
onMounted(() => {
  checkWelcomeStatus()
})
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

/* 欢迎弹窗样式 */
:global(.welcome-dialog) {
  max-width: 520px !important;
  border-radius: 16px !important;
  box-shadow: 0 10px 30px rgba(100, 181, 246, 0.3) !important;
  border: 2px solid #b3e5fc !important;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%) !important;
}

:global(.welcome-dialog .el-dialog__header) {
  background: linear-gradient(90deg, #64b5f6 0%, #4fc3f7 100%) !important;
  border-bottom: 2px solid #b3e5fc !important;
  border-radius: 14px 14px 0 0 !important;
  padding: 15px 20px !important;
  margin: 0 !important;
}

:global(.welcome-dialog .el-dialog__title) {
  color: white !important;
  font-weight: 700 !important;
  font-size: 18px !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
}

:global(.welcome-dialog .el-dialog__body) {
  padding: 25px !important;
  background: white !important;
}

:global(.welcome-dialog .el-dialog__footer) {
  padding: 15px 25px 25px !important;
  text-align: center !important;
  background: white !important;
  border-radius: 0 0 14px 14px !important;
}

.welcome-content {
  color: #455a64;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.welcome-intro {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #64b5f6;
}

.guide-steps {
  margin: 20px 0;
}

.step-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8fdff;
  border-radius: 10px;
  border-left: 4px solid #64b5f6;
}

.step-number {
  font-size: 24px;
  margin-right: 15px;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content strong {
  color: #64b5f6;
  font-weight: 700;
  font-size: 15px;
  display: block;
  margin-bottom: 5px;
}

.step-content p {
  color: #78909c;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.welcome-tip {
  text-align: center;
  font-style: italic;
  color: #78909c;
  font-size: 14px;
  margin-top: 20px;
  padding: 10px;
  background: #f0f8ff;
  border-radius: 8px;
}

.start-button {
  background: linear-gradient(135deg, #64b5f6 0%, #4fc3f7 100%) !important;
  border: none !important;
  border-radius: 25px !important;
  padding: 12px 30px !important;
  font-weight: 600 !important;
  font-size: 16px !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(100, 181, 246, 0.4) !important;
  transition: all 0.3s ease !important;
}

.start-button:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(100, 181, 246, 0.6) !important;
  background: linear-gradient(135deg, #42a5f5 0%, #29b6f6 100%) !important;
}

</style>