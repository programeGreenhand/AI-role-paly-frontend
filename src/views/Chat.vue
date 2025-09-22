<template>
  <div class="chat-view" :class="currentTheme">
    <SceneBackground :scene="currentScene" />
    <el-header class="chat-header">
        <div class="character-info">
          <CharacterAnimation
            v-if="currentCharacter"
            :character="currentCharacter"
            :emotion="currentEmotion"
          />
          <div class="character-details">
            <h2>{{ currentCharacter?.name }}</h2>
            <p>{{ currentCharacter?.description }}</p>
          </div>
        </div>
        
        <div class="header-actions">
          <SceneSelector
            v-if="currentCharacter"
            :character-id="currentCharacter.id"
            @change="handleSceneChange"
          />
          <el-button @click="clearChat" type="danger" :icon="Delete">
            清空对话
          </el-button>
          <el-button @click="goHome" :icon="House">
            返回首页
          </el-button>
        </div>
      </el-header>
    <el-container class="chat-container">
      

      <el-main class="chat-main">
        <el-card shadow="always"  style="height: 90%;" 
        :body-style="{
        height: '100%',
        boxSizing: 'border-box',
        padding: '0',
        overflow: 'hidden'
      }">
          <ChatContainer
          :messages="messages"
          :is-typing="isTyping"
          :current-character="currentCharacter"
        />
        </el-card>
      </el-main>

      <el-footer class="chat-footer">
        <div class="input-section">
          <VoiceRecorder
            @voice-input="handleVoiceInput"
            :disabled="isTyping"
          />
          
          <el-input
            v-model="inputMessage"
            placeholder="输入消息..."
            @keyup.enter="sendMessage"
            :disabled="isTyping"
            size="large"
            class="message-input"
          >
            <template #append>
              <el-button
                @click="sendMessage"
                :disabled="!inputMessage.trim() || isTyping"
                type="primary"
                
              >
                发送
              </el-button>
            </template>
          </el-input>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCharacterStore } from '../stores/character'
import { useChatStore } from '../stores/chat'
import { useSceneStore } from '../stores/scene'
import ChatContainer from '../components/chat/ChatContainer.vue'
import CharacterAnimation from '../components/character/CharacterAnimation.vue'
import SceneBackground from '../components/scene/SceneBackground.vue'
import SceneSelector from '../components/scene/SceneSelector.vue'
import VoiceRecorder from '../components/chat/VoiceRecorder.vue'
import type { Scene } from '../stores/scene'

const route = useRoute()
const router = useRouter()
const characterStore = useCharacterStore()
const chatStore = useChatStore()
const sceneStore = useSceneStore()

const inputMessage = ref('')

const currentCharacter = computed(() => characterStore.currentCharacter)
const currentScene = computed(() => sceneStore.currentScene)
const currentTheme = computed(() => currentCharacter.value?.theme || 'default')
const messages = computed(() => chatStore.currentSession?.messages || [])
const isTyping = computed(() => chatStore.isTyping)
const currentEmotion = computed(() => chatStore.currentEmotion)

onMounted(() => {
  const characterId = route.params.characterId as string
  if (characterId) {
    const character = characterStore.getCharacterById(characterId)
    if (character) {
      characterStore.setCurrentCharacter(character)
      chatStore.createSession(characterId)
      
      // 设置默认场景
      const scenes = sceneStore.getScenesForCharacter(characterId)
      if (scenes.length > 0) {
        sceneStore.setScene(scenes[0])
      }
    } else {
      router.push('/')
    }
  }
})

const sendMessage = async () => {
  if (!inputMessage.value.trim()) return
  
  await chatStore.addMessage(inputMessage.value)
  inputMessage.value = ''
}

const handleVoiceInput = async (text: string) => {
  if (text.trim()) {
    await chatStore.addMessage(text, 'voice')
  }
}

const handleSceneChange = (scene: Scene) => {
  sceneStore.setScene(scene)
}

const clearChat = () => {
  chatStore.clearSession()
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.chat-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.5s ease;
}

.chat-container {
  margin: 0 auto;
  height: 100%;
  position: relative;
  z-index: 1;
}

.chat-header {
  height: 13vh;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.character-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.character-details h2 {
  margin: 0;
  color: white;
  font-size: 1.5rem;
}

.character-details p {
  margin: 5px 0 0;
  color: rgba(255, 255, 255, 0.8);
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.chat-main {
  margin-top: 50px;
  width: 50vw;
  height: 60vh;
  flex: 1;
  padding: 0;
  /* border-radius: 8px; */
  overflow: hidden;
}

:deep(.el-card__body){
  height: 100px;
}

.chat-footer {

  
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.input-section {
  display: flex;
  gap: 15px;
  align-items: end;
  max-width: 800px;
  margin: 0 auto;
}

.message-input {
  flex: 1;
}
</style>