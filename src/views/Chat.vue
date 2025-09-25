<template>
  <div class="chat-view" :class="currentTheme" :style="background">
    <!-- 优雅的浮动头部 -->
    <div class="floating-header"  ref="floatingHeader" >
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
          :messages="chatStore.messages"
          :is-typing="chatStore.isTyping"
          :current-character="currentCharacter"
        />
      </div>
    </div>

    <!-- 底部输入面板 -->
    <div class="input-panel">
      <div class="input-container">
        <div class="unified-input-area">
          <VoiceRecorder 
            :disabled="false"
            @voice-input="handleVoiceInput"
          />
          
          <div class="message-composer">
            <el-input
              v-model="inputMessage"
              placeholder="说点什么..."
              @keyup.enter="sendMessage"
              :disabled="chatStore.isTyping"
              class="composer-input"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 3 }"
              resize="none"
            />
            <el-button
              @click="sendMessage"
              :disabled="!inputMessage.trim() || chatStore.isTyping"
              type="primary"
              :loading="chatStore.isTyping"
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
import { ElMessage } from 'element-plus'

// 导入 Pinia stores
import { useCharacterStore } from '../stores/character'
import { useChatStore } from '../stores/chat'
import { useSceneStore } from '../stores/scene'
import { useVoiceStore } from '../stores/voice'
import { useWebSocketStore } from '../stores/webSocketStore'
import { useChatMessagesStore } from '../stores/chatMessagesStore'

// 导入组件
import ChatContainer from '../components/chat/ChatContainer.vue'
import CharacterAnimation from '../components/character/CharacterAnimation.vue'
import SceneSelector from '../components/scene/SceneSelector.vue'
import VoiceRecorder from '../components/chat/VoiceRecorder.vue'
import type { Scene } from '../stores/scene'


const route = useRoute()
const router = useRouter()

// 使用 Pinia stores
const characterStore = useCharacterStore()
const chatStore = useChatStore()
const sceneStore = useSceneStore()
const voiceStore = useVoiceStore()
const wsStore = useWebSocketStore()
const chatMessagesStore = useChatMessagesStore()

// 本地状态
const inputMessage = ref('')
const isProcessing = ref(false)

// 计算属性
const currentCharacter = computed(() => characterStore.currentCharacter)
const currentScene = computed(() => sceneStore.currentScene)
const currentTheme = computed(() => currentCharacter.value?.theme || 'default')
const currentEmotion = computed(() => chatStore.currentEmotion)

// 动态背景图片
const getBackgroundImage = () => {
  if (!currentScene.value?.characterIds[0] || !currentScene.value?.background) {
    return ''
  }
  return new URL(
    `../assets/charactor/${currentScene.value.characterIds[0]}/background/${currentScene.value.background}.jpg`, 
    import.meta.url
  ).href
}

const background = computed(() => ({
  backgroundImage: `url(${getBackgroundImage()})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
}))

// Base64转Blob的辅助函数
const base64ToBlob = (base64Data: string, contentType: string = ''): Blob => {
  const byteCharacters = atob(base64Data)
  const byteArrays = []
  
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512)
    
    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }
  
  return new Blob(byteArrays, { type: contentType })
}

// WebSocket 消息处理
const setupMessageHandlers = () => {
  // 处理语音识别结果（用户说的话）
  wsStore.onMessage('processing', (data) => {
    if (data.data.recognizedText) {
      // 添加用户消息，但不包含音频（因为这是用户说的话）
      chatStore.addUserMessage(data.data.recognizedText, '语音消息')
    }
  })

  // 处理AI响应（AI的回答，包含音频）
  wsStore.onMessage('response', (data) => {
    if (data.data.text) {
      // 从响应中获取音频数据
      const audioData = data.data.audioData // 假设服务器返回base64编码的音频数据
      let audioUrl = null
      
      if (audioData) {
        // 将base64数据转换为Blob URL
        try {
          const audioBlob = base64ToBlob(audioData, 'audio/webm')
          audioUrl = URL.createObjectURL(audioBlob)
        } catch (error) {
          console.error('音频数据转换失败:', error)
        }
      }
      
      // 添加AI回复消息，包含音频URL
      //这里已经得到了AI的响应回复信息1了！！！！！ 
      chatStore.addCharacterMessage(data.data.text, data.data.emotion, audioUrl)
      //标记2
      // 触发自定义事件，传递AI回复的文本和音频
      const event = new CustomEvent('voice-response', {
        detail: {
          text: data.data.text,
          audioUrl: audioUrl
        }
      })
      window.dispatchEvent(event)
      
      // 重置处理状态
      isProcessing.value = false
      chatStore.setTyping(false)
    }
  })

  // 处理错误消息
  wsStore.onMessage('error', (data) => {
    const errorMsg = data.data?.message || '服务器处理错误'
    ElMessage.error(errorMsg)
    isProcessing.value = false
    chatStore.setTyping(false)
  })

  // 处理连接状态变化
  wsStore.onMessage('connection_ack', (data) => {
    ElMessage.success('服务器连接确认')
  })
}

// 处理语音输入（AI的回复） 标记1
const handleVoiceInput = (text: string, audioUrl?: string) => {
  console.log('收到AI语音回复:')
  console.log('AI回复文本:', text)
  console.log('AI回复音频:', audioUrl ? '有' : '无')
  
  if (!text.trim() || !currentCharacter.value) return
  
  try {
    // 添加角色回复消息到聊天记录
    // chatStore.addCharacterMessage(text, currentEmotion.value, audioUrl)
    //此处
    // 如果有回复的语音，自动播放
    if (audioUrl && voiceStore.config.enabled) {
      setTimeout(async () => {
        try {
          await voiceStore.playAudio(audioUrl)
        } catch (error) {
          console.error('播放AI回复音频失败:', error)
        }
      }, 500)
    }
  } catch (error) {
    console.error('处理AI语音回复失败:', error)
    ElMessage.error('处理AI语音回复失败，请重试')
  }
}

// 发送文本消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || !currentCharacter.value) return
  
  try {
    chatStore.setTyping(true)
    
    // 添加用户消息
    chatStore.addUserMessage(inputMessage.value)
    
    // 通过 WebSocket 发送文本消息
    if (wsStore.isConnected) {
      wsStore.send({
        type: 'text',
        data: {
          text: inputMessage.value,
          characterId: currentCharacter.value.id,
          emotion: currentEmotion.value
        },
        timestamp: Date.now(),
        messageId: wsStore.generateMessageId()
      })
      
      // 等待AI回复
      await waitForAIResponse()
    } else {
      // 如果没有WebSocket连接，模拟AI回复
      setTimeout(() => {
        chatStore.addCharacterMessage(`这是对"${inputMessage.value}"的模拟回复`)
        chatStore.setTyping(false)
      }, 1000)
    }
    
    inputMessage.value = ''
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败，请重试')
    chatStore.setTyping(false)
  }
}

// 等待AI回复
const waitForAIResponse = (): Promise<void> => {
  return new Promise((resolve) => {
    const checkResponse = () => {
      if (!chatStore.isTyping) {
        resolve()
      } else {
        setTimeout(checkResponse, 100)
      }
    }
    checkResponse()
  })
}

// 场景变更处理
const handleSceneChange = (scene: Scene) => {
  sceneStore.setScene(scene)
  ElMessage.success(`已切换到场景: ${scene.name}`)
}

// 清空聊天
const clearChat = () => {
  chatStore.clearSession()
  chatMessagesStore.clearMessages()
  ElMessage.success('对话已清空')
}

// 返回首页
const goHome = () => {
  router.push('/hall')
}

// 初始化函数
const initialize = async () => {
  const characterId = route.params.characterId as string
  if (characterId) {
    const character = characterStore.getCharacterById(characterId)
    if (character) {
      characterStore.setCurrentCharacter(character)
      chatStore.createSession(characterId)
      
      // 设置默认场景
      const scenes = sceneStore.getScenesForCharacter(characterId)
      if (scenes.length > 0) {
        sceneStore.setScene(scenes[0]!)
      }
    } else {
      router.push('/')
      return
    }
  }

  // 设置WebSocket消息处理器
  setupMessageHandlers()

  // 连接WebSocket（可选，根据需要连接）
  // try {
  //   await wsStore.connect()
  //   ElMessage.success('已连接到聊天服务器')
  // } catch (error) {
  //   console.warn('WebSocket连接失败，将使用模拟模式:', error)
  // }

  // 初始化语音功能
  try {
    await voiceStore.fetchVoiceList()
  } catch (error) {
    console.error('语音列表获取失败:', error)
  }
}

onMounted(() => {
  initialize()
})

onUnmounted(() => {
  // 清理资源
  wsStore.disconnect()
  chatStore.setTyping(false)
})
</script>

<style scoped>
.chat-view {
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-gap: 0;
  position: relative;
  overflow: hidden;
  transition: all 2s linear;
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
  margin: 0 15vh;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.chat-window {
  flex: 1;
  margin: 0 20vw;
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
  grid-template-columns: repeat(2, 1fr);
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