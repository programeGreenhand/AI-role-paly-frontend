<template>
  <div class="chat-view" :class="currentTheme" :style="{ backgroundImage: `url(${backgroundImageUrl})` }">
    <!-- 优雅的浮动头部 -->
     
    <div class="floating-header" ref="floatingHeader">
      <div class="character-showcase">
        <div class="character-avatar-container">
          <CharacterAnimation
            v-if="currentCharacter"
            :character="currentCharacter"
            :emotion="currentEmotion"
            @change="handleSceneChange"
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
            :disabled="!wsConnected || chatStore.isTyping"
            @voice-input="handleVoiceInput"
            @voice-start="handleVoiceStart"
            @voice-end="handleVoiceEnd"
          />
          
          <div class="message-composer">
            <el-input
              v-model="inputMessage"
              placeholder="说点什么..."
              @keyup.enter="sendMessage"
              :disabled="chatStore.isTyping || !wsConnected"
              class="composer-input"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 3 }"
              resize="none"
            />
            <el-button
              @click="sendMessage"
              :disabled="!inputMessage.trim() || chatStore.isTyping || !wsConnected"
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
import { loadRouteLocation, useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// 导入 Pinia stores
import { useCharacterStore } from '../stores/character'
import { useChatStore } from '../stores/chat'
import { useSceneStore } from '../stores/scene'
import { useVoiceStore } from '../stores/voice'
import { AuthStore } from '../stores/user'
// 导入组件
import ChatContainer from '../components/chat/ChatContainer.vue'
import CharacterAnimation from '../components/character/CharacterAnimation.vue'
import SceneSelector from '../components/scene/SceneSelector.vue'
import VoiceRecorder from '../components/chat/VoiceRecorder.vue'
import type { Scene } from '../stores/scene'

const route = useRoute()
const router = useRouter()
const auth = AuthStore()
// 使用 Pinia stores
const characterStore = useCharacterStore()
const chatStore = useChatStore()
const sceneStore = useSceneStore()
const voiceStore = useVoiceStore()

// 本地状态
const inputMessage = ref('')
const wsConnected = ref(false)

// 计算属性
const currentCharacter = computed(() => characterStore.currentCharacter)
const currentScene = computed(() => sceneStore.currentScene)
const currentTheme = computed(() => currentCharacter.value?.theme || 'default')
const currentEmotion = computed(() => chatStore.currentEmotion)
const backgroundImageUrl = ref('http://onepiece-spiderman.oss-cn-shenzhen.aliyuncs.com/scene/gudaishuyuan.jpg')

// 动态背景图片
const handleSceneChange = (scene:any) => {
  console.log(scene)
  sceneStore.setScene(scene)
  if (scene) {
    backgroundImageUrl.value = scene
  }
  ElMessage.success(`已切换到场景: ${scene.name}`)
}

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
  // 处理语音识别结果和AI响应
  window.addEventListener('voice-response', handleVoiceResponse)
  
  // 监听WebSocket连接状态
  if (voiceStore.wsConnected) {
    wsConnected.value = true
  }
}

// 处理AI语音回复事件
const handleVoiceResponse = (event: CustomEvent) => {
  const { text, audioUrl, emotion,audioData } = event.detail
  
  console.log('收到AI回复:', { text, audioUrl, emotion })
  
  if (text) {
    // 添加AI回复消息
    chatStore.addCharacterMessage(text, emotion || 'neutral', audioData)
    
    // 如果有音频且启用了语音播放，自动播放
    if (audioData && voiceStore.config.enabled) {
      setTimeout(async () => {
        try {
          await voiceStore.playAudio(audioData)
        } catch (error) {
          console.error('播放AI回复音频失败:', error)
        }
      }, 500)
    }
    
    // 停止输入状态
    chatStore.setTyping(false)
  }
}

// 处理用户语音输入（录音结束后的识别文本）
const handleVoiceInput = async (recognizedText: string, audioUrl?: string) => {
  console.log('用户语音输入:', { recognizedText, audioUrl })
  
  if (!recognizedText.trim() || !currentCharacter.value || !chatStore.currentSession) {
    return
  }
  
  try {
    // 添加用户语音消息
    await chatStore.addUserMessage(recognizedText, '语音消息', audioUrl)
    
    // 发送消息到AI处理
    await sendToAI(recognizedText)
  } catch (error) {
    console.error('处理语音输入失败:', error)
    ElMessage.error('处理语音输入失败，请重试')
    chatStore.setTyping(false)
  }
}

// 处理录音开始
const handleVoiceStart = () => {
  console.log('开始录音')
}

// 处理录音结束
const handleVoiceEnd = () => {
  console.log('录音结束，等待处理...')
  chatStore.setTyping(true)
}

// 发送文本消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || !currentCharacter.value || !chatStore.currentSession) {
    return
  }
  
  const messageText = inputMessage.value.trim()
  inputMessage.value = '' // 立即清空输入框
  
  try {
    // 添加用户消息
    await chatStore.addUserMessage(messageText)
    
    // 发送消息到AI处理
    await sendToAI(messageText)
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败，请重试')
    chatStore.setTyping(false)
  }
}

// 发送消息到AI处理
const sendToAI = async (text: string) => {
  if (!voiceStore.wsConnected) {
    ElMessage.error('WebSocket未连接，无法发送消息')
    return
  }
  
  chatStore.setTyping(true)
  console.log("当前会话iD为：",chatStore.currentSession)
  try {
    // 通过语音store的WebSocket发送文本消息
    voiceStore.sendTextMessage(
      text,
      currentCharacter.value!.id,
      currentEmotion.value,
    )
  } catch (error) {
    console.error('发送AI消息失败:', error)
    ElMessage.error('发送消息失败，请重试')
    chatStore.setTyping(false)
  }
}

// 场景变更处理
// const handleSceneChange = (scene: Scene) => {
//   sceneStore.setScene(scene)
//   ElMessage.success(`已切换到场景: ${scene.name}`)
// }

// 清空聊天
const clearChat = () => {
  chatStore.clearSession()
  ElMessage.success('对话已清空')
}

// 返回首页
const goHome = () => {
  router.push('/hall')
}

// 初始化函数
const initialize = async () => {
  const userId = localStorage.getItem('userId')
  console.log(`Chat界面获取到userId ${userId}`)
  const characterId = characterStore.currentCharacter?.id || route.params.characterId as string 
  console.log(`Chat界面获取到userId ${characterId}`)
  if (!characterId) {
    ElMessage.error('未指定角色')
    router.push('/hall')
    return
  }
  
  try {
    // 确保角色数据存在
    let character = characterStore.currentCharacter
    if (!character || character.id !== characterId) {
      character = characterStore.getCharacterById(characterId)
      if (!character) {
        ElMessage.error('角色不存在')
        router.push('/hall')
        return
      }
    }
    
    // 创建对话会话
    // const session = await chatStore.createSession(userId, characterId)
    // console.log('会话创建成功:', session)
    //进入聊天页面，得先判断，currentSession当前会话ID是否为null，如果为null说明是新会话，不为bull就是就对话
    if(chatStore.currentSession === null){
      //获得后端返回的sessionID
      const sessionId = await chatStore.createSession(userId, characterId)
      //sessionId保存在前端，每次发送信息进行携带
      chatStore.currentSession.id = sessionId.id;
      console.log('会话创建成功: 获得SessionId值为', chatStore.currentSession.id)
      localStorage.setItem('sessionId',JSON.stringify(sessionId))
    }else{
      const item = localStorage.getItem('sessionId')
      console.log('这是旧对话: 获得SessionId值为', chatStore.currentSession.id || JSON.parse(item).id )
    }
    
    // 设置默认场景
    const scenes = sceneStore.getScenesForCharacter(characterId)
    if (scenes.length > 0) {
      sceneStore.setScene(scenes[0])
    }
    
    // 连接WebSocket
    await voiceStore.connectWebSocket()
    wsConnected.value = voiceStore.wsConnected
    
    // 设置消息处理器
    setupMessageHandlers()
    
    // 初始化语音功能
    await voiceStore.fetchVoiceList()
    
    ElMessage.success('对话初始化成功')
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('初始化失败，请重试')
  }
}

onMounted(() => {
  initialize()
})

onUnmounted(() => {
  // 清理资源

  window.removeEventListener('voice-response', handleVoiceResponse)
  voiceStore.disconnectWebSocket()
  chatStore.setTyping(false)
  chatStore.clearSession()
  //聊天结束将sessionId制空：

})
</script>

<style scoped>
/* 样式保持不变 */
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