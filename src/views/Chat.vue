<template>
  <div class="chat-view" :class="currentTheme" :style="{ backgroundImage: `url(${backgroundImageUrl})` }">
    <!-- 移动端可收缩的浮动头部 -->
    <div 
      class="floating-header" 
      :class="{ 'collapsed': isMobile && headerCollapsed }"
      ref="floatingHeader"
    >
      <!-- 移动端收缩/展开按钮 -->
      <div v-if="isMobile" class="mobile-header-toggle" @click="toggleHeader">
        <el-icon :class="{ 'rotated': !headerCollapsed }">
          <ArrowDown />
        </el-icon>
      </div>
      
      <div class="header-content" :class="{ 'hidden': isMobile && headerCollapsed }">
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
    </div>

    <!-- 主聊天区域 -->
    <div class="main-chat-area" :class="{ 'expanded': isMobile && headerCollapsed }">
      <div class="chat-window">
        <ChatContainer
          :messages="chatStore.messages"
          :is-typing="chatStore.isTyping"
          :current-character="currentCharacter"
        />
      </div>
    </div>

    <!-- 快速回复模板 -->
    <div v-if="showQuickReplies && inputMessage.trim() === ''" class="quick-replies-section">
      <div class="quick-replies-label">快速回复</div>
      <div class="quick-replies-grid">
        <el-button 
          v-for="(reply, index) in quickReplies"
          :key="index"
          @click="useQuickReply(reply)"
          :disabled="chatStore.isTyping || !wsConnected"
          type="default"
          class="quick-reply-btn"
          size="small"
        >
          {{ reply }}
        </el-button>
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
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { loadRouteLocation, useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

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
const headerCollapsed = ref(false)
const isMobile = ref(false)
const showQuickReplies = ref(true)

// 快速回复模板
const quickReplies = ref([
  '你好鸭🦆',
  '能再说一遍吗',
  '你是笨蛋吗',
  '我需要你陪我聊一会',
  '给点你的看法吧',
  '你的回复让我很开心',
])

// 响应式检测
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    headerCollapsed.value = false
  }
}

// 切换头部显示状态
const toggleHeader = () => {
  headerCollapsed.value = !headerCollapsed.value
}

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

// 语音响应处理（避免重复）
let isProcessingVoiceResponse = false

// WebSocket 消息处理
const setupMessageHandlers = () => {
  // 移除可能存在的旧监听器
  window.removeEventListener('voice-response', handleVoiceResponse)
  
  // 添加新的监听器
  window.addEventListener('voice-response', handleVoiceResponse)
  
  // 监听WebSocket连接状态
  if (voiceStore.wsConnected) {
    wsConnected.value = true
  }
}

// 处理AI语音回复事件（防止重复处理）
const handleVoiceResponse = async (event: CustomEvent) => {
  // 防止重复处理同一个响应
  if (isProcessingVoiceResponse) {
    console.log('正在处理语音响应，跳过重复处理')
    return
  }
  
  isProcessingVoiceResponse = true
  
  try {
    const { text, audioUrl, emotion, audioData } = event.detail
    
    console.log('收到AI回复:', { text, audioUrl, emotion })
    
    if (text) {
      // 添加AI回复消息
      await chatStore.addCharacterMessage(text, emotion || 'neutral', audioData)
      
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
  } catch (error) {
    console.error('处理语音响应失败:', error)
  } finally {
    // 延迟重置标志，避免快速重复
    setTimeout(() => {
      isProcessingVoiceResponse = false
    }, 1000)
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

// 使用快速回复
const useQuickReply = async (reply: string) => {
  inputMessage.value = reply
  await nextTick()
  showQuickReplies.value = false
  await sendMessage()
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
  console.log(`Chat界面获取到characterId ${characterId}`)
  
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
    
    // 处理会话逻辑
    if(chatStore.currentSession === null){
      const sessionId = await chatStore.createSession(userId, characterId)
      chatStore.currentSession.id = sessionId.id
      console.log('会话创建成功: 获得SessionId值为', chatStore.currentSession.id)
      localStorage.setItem('sessionId',JSON.stringify(sessionId))
    } else {
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
  // 检测移动端
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  // 移动端默认收缩头部
  if (isMobile.value) {
    headerCollapsed.value = true
  }
  
  initialize()
})

// 监听输入框变化，控制快速回复显示
watch(() => inputMessage.value, (newVal) => {
  if (newVal.trim() === '') {
    showQuickReplies.value = true
  } else {
    showQuickReplies.value = false
  }
})

onUnmounted(() => {
  // 清理资源
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('voice-response', handleVoiceResponse)
  voiceStore.disconnectWebSocket()
  chatStore.setTyping(false)
  chatStore.clearSession()
  isProcessingVoiceResponse = false
})
</script>

<style scoped>
/* 基础响应式样式 */
.chat-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transition: all 2s linear;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* 浮动头部设计 - 响应式 */
.floating-header {
  position: relative;
  z-index: 10;
  margin: 1rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.floating-header.collapsed {
  padding: 0.5rem;
}

.floating-header:not(.collapsed) {
  padding: 1.25rem;
}

.mobile-header-toggle {
  display: none;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.mobile-header-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

.mobile-header-toggle .el-icon {
  font-size: 1.25rem;
  color: #333;
  transition: transform 0.3s ease;
}

.mobile-header-toggle .el-icon.rotated {
  transform: rotate(180deg);
}

.header-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.header-content.hidden {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  margin: 0;
  padding: 0;
}

.character-showcase {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  min-width: 0;
  flex: 1;
  min-width: min-content;
}

.character-avatar-container {
  flex-shrink: 0;
  width: 3.75rem;
  height: 3.75rem;
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
  margin: 0 0 0.375rem 0;
  color: black;
  font-size: clamp(1.25rem, 4vw, 1.5rem);
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  line-height: 1.2;
}

.character-desc {
  margin: 0;
  color: black;
  font-size: clamp(0.8rem, 3vw, 0.9rem);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.action-group {
  display: flex;
  gap: 0.5rem;
}

/* 主聊天区域 - 响应式 */
.main-chat-area {
  flex: 1;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin: 0 1rem;
  width: auto;
  transition: all 0.3s ease;
}

.main-chat-area.expanded {
  margin-top: 0;
}

.chat-window {
  flex: 1;
  margin: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

/* 底部输入面板 - 响应式 */
.input-panel {
  position: relative;
  z-index: 10;
  margin: 1rem;
}

.input-container {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.unified-input-area {
  padding: 1.25rem;
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.message-composer {
  flex: 1;
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
}

.composer-input {
  flex: 1;
}

.composer-input :deep(.el-textarea__inner) {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  font-size: clamp(0.875rem, 3vw, 1rem);
  line-height: 1.5;
  transition: all 0.3s ease;
  min-height: 2.75rem;
}

.composer-input :deep(.el-textarea__inner):focus {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(103, 126, 234, 0.5);
  box-shadow: 0 0 0 2px rgba(103, 126, 234, 0.1);
}

.send-button {
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
}

/* 移动端特殊样式 */
@media (max-width: 768px) {
  .chat-view {
    height: 100vh;
    height: 100dvh;
  }
  
  .mobile-header-toggle {
    display: flex;
  }
  
  .floating-header {
    margin: 0.5rem;
  }
  
  .floating-header.collapsed {
    padding: 0.75rem;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .character-showcase {
    justify-content: center;
    width: 100%;
  }
  
  .header-controls {
    justify-content: center;
    width: 100%;
  }
  
  .main-chat-area {
    margin: 0.5rem;
  }
  
  .main-chat-area.expanded {
    margin: 0.25rem 0.5rem 0.5rem 0.5rem;
  }
  
  .unified-input-area {
    padding: 1rem;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .message-composer {
    width: 100%;
  }
  
  .character-desc {
    -webkit-line-clamp: 1;
  }
}

/* 其他响应式样式保持不变 */
@media (max-width: 480px) {
  .floating-header,
  .main-chat-area,
  .input-panel {
    margin: 0.5rem;
  }
  
  .floating-header.collapsed {
    margin: 0.25rem 0.5rem;
  }
  
  .main-chat-area.expanded {
    margin: 0.25rem 0.5rem 0.5rem 0.5rem;
  }
}

/* 主题适配和其他样式保持不变 */
.chat-view.anime {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
}

.chat-view.tech {
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
}

.chat-view.fantasy {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

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

.composer-input :deep(.el-textarea__inner) {
  font-size: 16px;
}

@supports (padding: max(0px)) {
  .chat-view {
    padding-left: max(0.5rem, env(safe-area-inset-left));
    padding-right: max(0.5rem, env(safe-area-inset-right));
    padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
  }
}

/* 暗色主题支持 */
html[data-theme='dark'] .chat-view {
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
}

html[data-theme='dark'] .floating-header {
  background: rgba(22, 33, 62, 0.4);
  border-color: rgba(107, 182, 214, 0.2);
}

html[data-theme='dark'] .character-name {
  color: #e8e8e8;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

html[data-theme='dark'] .character-desc {
  color: #b8b8b8;
}

html[data-theme='dark'] .mobile-header-toggle .el-icon {
  color: #b8b8b8;
}

html[data-theme='dark'] .input-container {
  background: rgba(22, 33, 62, 0.5);
  border-color: rgba(107, 182, 214, 0.2);
}

html[data-theme='dark'] .composer-input :deep(.el-textarea__inner) {
  background-color: #0f0f23;
  color: #e8e8e8;
  border-color: rgba(107, 182, 214, 0.3);
}

html[data-theme='dark'] .composer-input :deep(.el-textarea__inner::placeholder) {
  color: #666666;
}

html[data-theme='dark'] .send-button {
  background-color: #4A90E2;
  border-color: #4A90E2;
}

html[data-theme='dark'] .send-button:hover {
  background-color: #5B9FD8;
  border-color: #5B9FD8;
}

/* 快速回复样式 */
.quick-replies-section {
  position: relative;
  z-index: 5;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  max-height: 150px;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
  margin: 0 1rem;
  border-radius: 0 0 1.25rem 1.25rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.quick-replies-label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.quick-replies-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.quick-reply-btn {
  padding: 0.4rem 0.8rem !important;
  font-size: 12px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(135, 206, 235, 0.2), rgba(74, 144, 226, 0.2));
  border: 1px solid rgba(74, 144, 226, 0.3) !important;
  color: #333 !important;
  white-space: nowrap;
  transition: all 0.2s ease;
  cursor: pointer;
  flex-shrink: 0;
}

.quick-reply-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(135, 206, 235, 0.4), rgba(74, 144, 226, 0.4)) !important;
  border-color: rgba(74, 144, 226, 0.6) !important;
  transform: translateY(-2px);
}

.quick-reply-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

html[data-theme='dark'] .quick-replies-section {
  background: rgba(22, 33, 62, 0.3);
  border-top-color: rgba(107, 182, 214, 0.2);
}

html[data-theme='dark'] .quick-replies-label {
  color: rgba(232, 232, 232, 0.6);
}

html[data-theme='dark'] .quick-reply-btn {
  background: linear-gradient(135deg, rgba(91, 159, 216, 0.2), rgba(58, 124, 165, 0.2));
  border-color: rgba(107, 182, 214, 0.3) !important;
  color: #b8b8b8 !important;
}

html[data-theme='dark'] .quick-reply-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(91, 159, 216, 0.4), rgba(58, 124, 165, 0.4)) !important;
  border-color: rgba(107, 182, 214, 0.6) !important;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .quick-replies-section {
    padding: 0.75rem;
    max-height: 120px;
  }

  .quick-reply-btn {
    padding: 0.3rem 0.6rem !important;
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .quick-replies-section {
    padding: 0.5rem;
    max-height: 100px;
  }

  .quick-reply-btn {
    padding: 0.25rem 0.5rem !important;
    font-size: 10px;
  }
}
</style>