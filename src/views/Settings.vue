<template>
  <div class="settings-view">
    <el-container>
      <el-header class="settings-header">
        <h1>设置</h1>
        <el-button @click="goHome" icon="house">返回首页</el-button>
      </el-header>

      <el-main class="settings-main">
        <el-tabs v-model="activeTab" class="settings-tabs">
          <el-tab-pane label="语音设置" name="voice">
            <el-card class="settings-card">
              <h3>语音配置</h3>
              
              <el-form :model="voiceConfig" label-width="120px">
                <el-form-item label="启用语音">
                  <el-switch v-model="voiceConfig.enabled" />
                </el-form-item>
                
                <el-form-item label="语言">
                  <el-select v-model="voiceConfig.language">
                    <el-option label="中文" value="zh-CN" />
                    <el-option label="English" value="en-US" />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="语速">
                  <el-slider
                    v-model="voiceConfig.speed"
                    :min="0.5"
                    :max="2"
                    :step="0.1"
                    show-input
                  />
                </el-form-item>
                
                <el-form-item label="音调">
                  <el-slider
                    v-model="voiceConfig.pitch"
                    :min="0.5"
                    :max="2"
                    :step="0.1"
                    show-input
                  />
                </el-form-item>
              </el-form>
            </el-card>
          </el-tab-pane>

          <el-tab-pane label="角色定制" name="character">
            <el-card class="settings-card">
              <h3>创建自定义角色</h3>
              <CharacterCustomizer @create="handleCreateCharacter" />
            </el-card>
          </el-tab-pane>

          <el-tab-pane label="应用设置" name="app">
            <el-card class="settings-card">
              <h3>应用配置</h3>
              
              <el-form label-width="120px">
                <el-form-item label="主题模式">
                  <el-radio-group v-model="themeMode">
                    <el-radio label="light-blue">light-blue</el-radio>
                    <el-radio label="light-purple">light-purple</el-radio>
                    <el-radio label="light-green">light-green</el-radio>
                  </el-radio-group>
                </el-form-item>
                
                <el-form-item label="消息历史">
                  <el-button @click="clearAllHistory" type="danger">
                    清空所有对话历史
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref,watch } from 'vue'
import { useRouter } from 'vue-router'
import { useVoiceStore } from '../stores/voice'
import { useCharacterStore } from '../stores/character'
import { useChatStore } from '../stores/chat'
import CharacterCustomizer from '../components/character/CharacterCustomizer.vue'
import type { CustomCharacter } from '../types/character'
import { ElMessage,ElMessageBox } from 'element-plus'
import { useThemeStore } from '../stores/theme'

const router = useRouter()
const voiceStore = useVoiceStore()
const characterStore = useCharacterStore()
const chatStore = useChatStore()
const themeStore = useThemeStore()
const activeTab = ref('voice')
const themeMode = ref('light-blue')

watch(themeMode, (newMode) => {
  themeStore.setWhatColor(newMode);
  console.log('Theme mode changed to:', newMode);
}, { immediate: true });

const voiceConfig = ref({ ...voiceStore.config })

// 监听语音配置变化
watch(voiceConfig, (newConfig) => {
  voiceStore.updateConfig(newConfig)
}, { deep: true })

const handleCreateCharacter = (character: CustomCharacter) => {
  characterStore.addCustomCharacter(character)
  ElMessage.success('自定义角色创建成功！')
}

const clearAllHistory = () => {
  ElMessageBox.confirm('确定要清空所有对话历史吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 清空所有会话
    chatStore.sessions.forEach(session => {
      session.messages = []
      session.context = []
    })
    ElMessage.success('对话历史已清空')
  })
}

const goHome = () => {
  router.push('/hall')
}
</script>

<style scoped>
.settings-view {
  min-height: 100vh;
  
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.settings-header h1 {
  margin: 0;
  font-size: 2rem;
}

.settings-main {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.1);
}

.settings-tabs {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 20px;
}

.settings-card {
  border: none;
  box-shadow: none;
}

.settings-card h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 1.3rem;
}
</style>