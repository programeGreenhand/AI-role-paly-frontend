<template>
  <div class="character-customizer">
    <el-form :model="customCharacter" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="customCharacter.name" placeholder="输入角色名称" />
      </el-form-item>
      
      <el-form-item label="角色描述" prop="description">
        <el-input 
          v-model="customCharacter.description" 
          type="textarea" 
          :rows="3"
          placeholder="输入角色描述" 
        />
      </el-form-item>
      
      <el-form-item label="头像URL" prop="avatar_url">
        <el-input v-model="customCharacter.avatar_url" placeholder="输入角色头像URL" />
      </el-form-item>
      
      <el-form-item label="角色背景" prop="background">
        <el-input 
          v-model="customCharacter.background" 
          type="textarea" 
          :rows="3"
          placeholder="输入角色背景故事" 
        />
      </el-form-item>
      
      <el-form-item label="性格特征" prop="personality">
        <div class="personality-tags">
          <el-tag 
            v-for="(trait, index) in customCharacter.personality" 
            :key="index" 
            closable 
            @close="removeTrait(trait)"
          >
            {{ trait }}
          </el-tag>
          <el-input
            v-if="showTraitInput"
            ref="traitInputRef"
            v-model="newTrait"
            size="small"
            @keyup.enter="addTrait"
            @blur="addTrait"
            class="trait-input"
            placeholder="输入性格特征"
          />
          <el-button v-else size="small" @click="showAddTrait">+ 添加特征</el-button>
        </div>
      </el-form-item>
      
      <el-form-item label="性格特征" prop="personality">
        <el-input 
          v-model="customCharacter.personality" 
          type="textarea" 
          :rows="2"
          placeholder="输入角色性格特征（如：温柔、幽默、理性等）" 
        />
      </el-form-item>
      
      <el-form-item label="角色背景" prop="background">
        <el-input 
          v-model="customCharacter.background" 
          type="textarea" 
          :rows="3"
          placeholder="输入角色背景故事" 
        />
      </el-form-item>
      
      <el-form-item label="语音类型">
        <el-select v-model="customCharacter.voice_type" placeholder="选择语音类型">
          <el-option label="温和" value="gentle" />
          <el-option label="活泼" value="energetic" />
          <el-option label="沉稳" value="calm" />
          <el-option label="严肃" value="serious" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="主题风格">
        <el-select v-model="customCharacter.theme" placeholder="选择主题">
          <el-option label="魔法" value="magic" />
          <el-option label="哲学" value="philosophy" />
          <el-option label="科技" value="tech" />
          <el-option label="自然" value="nature" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="技能设置">
        <el-input 
          v-model="customCharacter.skills" 
          type="textarea" 
          :rows="2"
          placeholder="输入角色技能，用逗号分隔（如：编程,写作,绘画）" 
        />
      </el-form-item>
      
      <el-form-item label="情感倾向">
        <el-input 
          v-model="customCharacter.emotional_tendency" 
          type="textarea" 
          :rows="2"
          placeholder="输入角色情感倾向（如：乐观、悲观、中性等）" 
        />
      </el-form-item>
      
      <el-form-item label="系统提示词">
        <el-input 
          v-model="customCharacter.system_prompt" 
          type="textarea" 
          :rows="3"
          placeholder="输入系统提示词（可选，默认为角色背景）" 
        />
      </el-form-item>
      
      <el-form-item label="是否公开">
        <el-switch v-model="customCharacter.is_public" />
        <span style="margin-left: 8px;">{{ customCharacter.is_public ? '公开' : '私有' }}</span>
      </el-form-item>
      
      <el-form-item label="作者">
        <el-input v-model="customCharacter.author" placeholder="输入作者名称（可选）" />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="createCharacter">创建角色</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { AuthStore } from '../../stores/user'
import { useCharacterStore } from '../../stores/character'

const emit = defineEmits<{
  create: [character: any]
}>()

const formRef = ref()

// 初始化store
const userStore = AuthStore()
const characterStore = useCharacterStore()

// 根据后端API字段定义角色数据
const customCharacter = reactive({
  name: '',
  description: '',
  avatar_url: '',
  personality: '',
  background: '',
  voice_type: '',
  theme: '',
  skills: '',
  emotional_tendency: '',
  system_prompt: '',
  is_custom: true,
  is_public: false,
  author: '',
  created_by: ''
})

const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
}

const createCharacter = async () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      try {
        // 准备角色数据，确保与后端API字段完全匹配
        const characterData = {
          name: customCharacter.name,
          description: customCharacter.description,
          avatar_url: customCharacter.avatar_url || null,
          personality: customCharacter.personality || null,
          background: customCharacter.background || null,
          voice_type: customCharacter.voice_type || null,
          theme: customCharacter.theme || null,
          skills: customCharacter.skills ? customCharacter.skills.split(',').map(skill => skill.trim()) : [],
          emotional_tendency: customCharacter.emotional_tendency || {},
          system_prompt: customCharacter.system_prompt || customCharacter.background,
          is_custom: true,
          is_public: customCharacter.is_public || false,
          author: customCharacter.author || userStore.currentUser?.username || 'Custom',
          created_by: userStore.currentUser?.id || null
        }
        
        // 调用API创建角色
        await characterStore.addCustomCharacter(characterData)
        
        ElMessage.success('角色创建成功！')
        emit('create', characterData)
        resetForm()
      } catch (error) {
        console.error('创建角色失败:', error)
        ElMessage.error('创建角色失败，请重试')
      }
    }
  })
}

const resetForm = () => {
  formRef.value?.resetFields()
  customCharacter.name = ''
  customCharacter.description = ''
  customCharacter.avatar_url = ''
  customCharacter.personality = ''
  customCharacter.background = ''
  customCharacter.voice_type = ''
  customCharacter.theme = ''
  customCharacter.skills = ''
  customCharacter.emotional_tendency = ''
  customCharacter.system_prompt = ''
  customCharacter.is_public = false
  customCharacter.author = ''
}
</script>

<style scoped>
.character-customizer {
  max-width: 600px;
}

.personality-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.trait-input {
  width: 120px;
  margin-right: 8px;
}

.skill-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.skill-name {
  width: 120px;
}

.skill-desc {
  flex: 1;
}
</style>