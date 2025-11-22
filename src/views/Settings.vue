<template>
  <div class="settings-view">
    <el-container>
      <el-header class="settings-header">
      
        <el-button @click="goHome" icon="house">返回首页</el-button>
      </el-header>

      <el-main class="settings-main">
        <el-tabs v-model="activeTab" class="settings-tabs">
          <el-tab-pane label="语音设置" name="voice">
            <el-card class="settings-card">
              <h3>语音配置</h3>
              
              <el-form-item label="音色">
                   <el-select v-model="voiceConfig.voice_type">
                      <el-option 
                          v-for="item in lists" 
                          :key="item.voice_type"
                          :label="item.voice_name" 
                          :value="item.voice_type"
                      >
                          <div style="display: flex; justify-content: space-between; align-items: center;">
                              <span>{{ item.voice_name }}</span>
                              <audio 
                                  :src="item.url" 
                                  controls
                                  style="height: 30px; width: 150px;"
                                  @click.stop
                              ></audio>
                          </div>
                      </el-option>
                  </el-select>
              </el-form-item>
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
                
                <!-- <el-form-item label="添加场景">
                  <el-form :model="self_scene">
                    <el-form-item label="场景名">
                      <el-input v-model="self_scene.name" placeholder="场景名"></el-input>
                    </el-form-item>
                    <el-form-item label="描述">
                      <el-input v-model="self_scene.description" placeholder="描述"></el-input>
                    </el-form-item>
                    <el-form-item label="背景描述">
                      <el-input v-model="self_scene.background_prompt" placeholder="背景描述"></el-input>
                    </el-form-item>
                    <el-form-item label="背景图">
                      <el-upload action="">
                        <el-button type=""></el-button>
                      </el-upload>
                    </el-form-item>
                    <el-form-item label="风格">
                      <el-input v-model="self_scene.category" placeholder="风格"></el-input>
                    </el-form-item>
                  </el-form>
                </el-form-item> -->
              </el-form>
            </el-card>
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref,watch,reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useVoiceStore } from '../stores/voice'
import { useCharacterStore } from '../stores/character'
import { useChatStore } from '../stores/chat'
import CharacterCustomizer from '../components/character/CharacterCustomizer.vue'
import type { CustomCharacter } from '../types/character'
import { ElMessage,ElMessageBox } from 'element-plus'
import { useThemeStore } from '../stores/theme'
import { voiceAPI } from '../api/voice'
import type { VoiceItem } from '../types/voice'
import type { Scene } from '../stores/scene'
import axios from 'axios'
import server from '../api/session'
const router = useRouter()
const voiceStore = useVoiceStore()
const characterStore = useCharacterStore()
const chatStore = useChatStore()
const themeStore = useThemeStore()
const activeTab = ref('voice')
const themeMode = ref('light-blue')
const lists = ref<VoiceItem[]>([])
const self_scene = reactive<Scene>(null)

watch(themeMode, (newMode) => {
  themeStore.setWhatColor(newMode);
 
}, { immediate: true });




const handleCreateCharacter = (character: CustomCharacter) => {
  characterStore.addCustomCharacter(character) //此处只是存储在前端本地
  //推送角色信息：POST /api/user/:userId/characters - 创建自建智能体
  const userId = localStorage.getItem('userId');
  const res = server.post(`/user/${userId}/characters`, character)
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


const voiceConfig = ref<VoiceItem>({} as VoiceItem); // 不再初始化为 undefined，提供一个空对象（根据你的 VoiceItem 类型调整）

// 监听语音配置变化 (如果需要) //这一出使用到了/stores/voice.ts --- api/websocket
watch(voiceConfig, (newConfig) => {
  voiceStore.updateConfig(newConfig);
  // 保存到localStorage
  localStorage.setItem('voiceConfig', JSON.stringify(newConfig));
}, { deep: true });


onMounted(async ()=>{
  const data = await voiceAPI.getVoiceList();
  lists.value = data;
  
  // 设置默认选中项：例如选中数组中的第一项
  if (lists.value.length > 0 && !voiceConfig.value.voice_type) {
    voiceConfig.value = { ...lists.value[0] }; // 或者 voiceConfig.value.voice_type = lists.value[0].voice_type;
  }
 
})
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