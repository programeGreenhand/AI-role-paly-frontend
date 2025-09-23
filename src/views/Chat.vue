<template>
  <div class="chat-view" :class="currentTheme">
    <SceneBackground :scene="currentScene" />
    
    <!-- 优雅的浮动头部 -->
    <div class="floating-header">
      <div class="character-showcase">
        <div class="character-avatar-container">
          <CharacterAnimation
            v-if="currentCharacter"
            :character="currentCharacter"
            :emotion="currentEmotion"
          />
        </div>
        <div class="character-meta">
          <h2 class="character-name">{{ currentCharacter?.name }}</h2>
          <p class="character-desc">{{ currentCharacter?.description }}</p>
        </div>
      </div>
      
      <div class="header-controls">
        <SceneSelector
          v-if="currentCharacter"
          :character-id="currentCharacter.id"
          @change="handleSceneChange"
          class="scene-control"
        />
        <div class="action-group">
          <el-button @click="clearChat" type="danger" icon="delete" size="small" circle />
          <el-button @click="goHome" icon="house" size="small" circle />
        </div>
      </div>
    </div>

    <!-- 主聊天区域 -->
    <div class="main-chat-area" style="width: 80vw;margin-left: 10vw;">
      <div class="chat-window">
        <ChatContainer
          :messages="messages"
          :is-typing="isTyping"
          :current-character="currentCharacter"
        />
      </div>
    </div>

    <!-- 底部输入面板 -->
    <div class="input-panel">
      <div class="input-container">
        <div class="unified-input-area">
          <VoiceRecorder
            @voice-input="handleVoiceInput"
            :disabled="isTyping"
            class="voice-trigger"
          />
          
          <div class="message-composer">
            <el-input
              v-model="inputMessage"
              placeholder="说点什么..."
              @keyup.enter="sendMessage"
              :disabled="isTyping"
              class="composer-input"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 3 }"
              resize="none"
            />
            <el-button
              @click="sendMessage"
              :disabled="!inputMessage.trim() || isTyping"
              type="primary"
              :loading="isTyping"
              class="send-button"
              icon="Position"
              circle
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCharacterStore } from '../stores/character'
import { useChatStore } from '../stores/chat'
import { useSceneStore } from '../stores/scene'
import { useVoiceStore } from '../stores/voice'
import ChatContainer from '../components/chat/ChatContainer.vue'
import CharacterAnimation from '../components/character/CharacterAnimation.vue'
import SceneBackground from '../components/scene/SceneBackground.vue'
import SceneSelector from '../components/scene/SceneSelector.vue'
import VoiceRecorder from '../components/chat/VoiceRecorder.vue'
import type { Scene } from '../stores/scene'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const characterStore = useCharacterStore()
const chatStore = useChatStore()
const sceneStore = useSceneStore()
const voiceStore = useVoiceStore()

const inputMessage = ref('')

const currentCharacter = computed(() => characterStore.currentCharacter)
const currentScene = computed(() => sceneStore.currentScene)
const currentTheme = computed(() => currentCharacter.value?.theme || 'default')
const messages = computed(() => chatStore.messages)
const isTyping = computed(() => chatStore.isTyping)
const currentEmotion = computed(() => chatStore.currentEmotion)

onMounted(async () => {
  const characterId = route.params.characterId as string
  if (characterId) {
    const character = characterStore.getCharacterById(characterId)
    if (character) {
      //@ts-ignore  
      characterStore.setCurrentCharacter(character)
      chatStore.createSession(characterId)
      
      // 设置默认场景
      const scenes = sceneStore.getScenesForCharacter(characterId)
      if (scenes.length > 0) {
        sceneStore.setScene(scenes[0]!)
      }
    } else {
      router.push('/')
    }
  }

  // 初始化语音功能
  try {
    await voiceStore.fetchVoiceList()
    await voiceStore.connectWebSocket()
  } catch (error) {
    console.error('语音功能初始化失败:', error)
  }
})

onUnmounted(() => {
  voiceStore.disconnectWebSocket()
})

const sendMessage = async () => {
  if (!inputMessage.value.trim() || !currentCharacter.value) return
  
  try {
    chatStore.setTyping(true)
    
    // 添加用户消息
    chatStore.addUserMessage(inputMessage.value)
    
    // 通过 WebSocket 发送文本消息
    voiceStore.sendTextMessage(
      inputMessage.value, 
      currentCharacter.value.id, 
      currentEmotion.value
    )
    
    inputMessage.value = ''
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败，请重试')
    chatStore.setTyping(false)
  }
}

const handleVoiceInput = async (text: string, audioUrl?: string) => {
  if (!text.trim() || !currentCharacter.value) return
  
  try {
    // 添加用户语音消息
    chatStore.addUserMessage(text, 'voice', audioUrl)
    
    // 如果有回复的语音，自动播放
    if (audioUrl && voiceStore.config.enabled) {
      setTimeout(async () => {
        try {
          await voiceStore.playAudio(audioUrl)
        } catch (error) {
          console.error('播放音频失败:', error)
        }
      }, 500)
    }
  } catch (error) {
    console.error('处理语音输入失败:', error)
    ElMessage.error('处理语音输入失败，请重试')
  }
}

// 监听 WebSocket 响应
const handleWSResponse = (event: CustomEvent) => {
  const { text, audioUrl, emotion } = event.detail
  
  // 添加角色回复消息
  chatStore.addCharacterMessage(text, emotion, audioUrl)
  chatStore.setTyping(false)
  
  // 如果启用了语音且有音频 URL，自动播放
  if (voiceStore.config.enabled && audioUrl) {
    setTimeout(async () => {
      try {
        await voiceStore.playAudio(audioUrl)
      } catch (error) {
        console.error('播放回复音频失败:', error)
      }
    }, 500)
  }
}

onMounted(() => {
  window.addEventListener('voice-response', handleWSResponse as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('voice-response', handleWSResponse as EventListener)
})

const handleSceneChange = (scene: Scene) => {
  sceneStore.setScene(scene)
}

const clearChat = () => {
  chatStore.clearSession()
  ElMessage.success('对话已清空')
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.chat-view {
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-gap: 0;
  position: relative;
  
  overflow: hidden;
}

/* 浮动头部设计 */
.floating-header {
  position: relative;
  z-index: 10;
  margin: 20px;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.character-showcase {
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 0;
  flex: 1;
}

.character-avatar-container {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.character-meta {
  min-width: 0;
  flex: 1;
}

.character-name {
  margin: 0 0 6px 0;
  color: black;
  font-size: 1.5rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.character-desc {
  margin: 0;
  color: black;
  font-size: 0.9rem;
  line-height: 1.4;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.action-group {
  display: flex;
  gap: 8px;
}

/* 主聊天区域 */
.main-chat-area {
  margin: 0 20px;
  
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.chat-window {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

/* 底部输入面板 */
.input-panel {
  position: relative;
  z-index: 10;
  margin: 20px;
}

.input-container {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.unified-input-area {
  padding: 20px 24px;
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.voice-trigger {
  flex-shrink: 0;
}

.message-composer {
  flex: 1;
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.composer-input {
  flex: 1;
}

.composer-input :deep(.el-textarea__inner) {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.5;
  transition: all 0.3s ease;
}

.composer-input :deep(.el-textarea__inner):focus {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(103, 126, 234, 0.5);
  box-shadow: 0 0 0 2px rgba(103, 126, 234, 0.1);
}

.send-button {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
}

/* 配置面板 */
.config-panel {
  border: none;
  background: transparent;
}

.config-panel :deep(.el-collapse-item) {
  border: none;
  background: transparent;
}

.config-panel :deep(.el-collapse-item__header) {
  height: 48px;
  line-height: 48px;
  background: transparent;
  border: none;
  color: black;
  padding: 0 24px;
  font-size: 14px;
}

.config-panel :deep(.el-collapse-item__content) {
  padding: 0 24px 20px 24px;
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.config-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-grid {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.config-row {
  display: grid;
  /* 修改为单行排列 因为我有两行，但是想要两行不换行放在同一行，所以希望你能做到*/
  grid-template-columns: repeat(2, 1fr);
  /* 空间是不是太小了，元素堆在一起了 */
  grid-auto-rows: minmax(100px, auto);
  gap: 20px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-item label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .floating-header,
  .main-chat-area,
  .input-panel {
    margin: 16px;
  }
}

@media (max-width: 768px) {
  .floating-header {
    flex-direction: column;
    gap: 16px;
    padding: 16px 20px;
    margin: 12px;
  }
  
  .character-showcase {
    justify-content: center;
    text-align: center;
  }
  
  .header-controls {
    justify-content: center;
  }
  
  .main-chat-area,
  .input-panel {
    margin: 12px;
  }
  
  .unified-input-area {
    padding: 16px 20px;
  }
  
  .config-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .floating-header,
  .main-chat-area,
  .input-panel {
    margin: 8px;
  }
  
  .floating-header,
  .input-container {
    border-radius: 16px;
  }
  
  .chat-window {
    border-radius: 16px;
  }
  
  .character-showcase {
    gap: 12px;
  }
  
  .character-name {
    font-size: 1.25rem;
  }
  
  .unified-input-area {
    padding: 12px 16px;
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .message-composer {
    align-items: stretch;
  }
  
  .send-button {
    align-self: flex-end;
  }
}

/* 主题适配 */
.chat-view.anime {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
}

.chat-view.tech {
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
}

.chat-view.fantasy {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 微妙的动画效果 */
.floating-header,
.chat-window,
.input-container {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.floating-header:hover,
.input-container:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}
</style>