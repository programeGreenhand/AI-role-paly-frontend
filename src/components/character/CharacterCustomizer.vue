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
          placeholder="描述角色的基本信息"
          :rows="3"
        />
      </el-form-item>
      
      <el-form-item label="角色背景" prop="background">
        <el-input
          v-model="customCharacter.background"
          type="textarea"
          placeholder="角色的详细背景故事"
          :rows="4"
        />
      </el-form-item>
      
      <el-form-item label="性格特征" prop="personality">
        <el-tag
          v-for="trait in customCharacter.personality"
          :key="trait"
          closable
          @close="removeTrait(trait)"
          class="trait-tag"
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
        />
        <el-button v-else size="small" @click="showAddTrait">+ 添加特征</el-button>
      </el-form-item>
      
      <el-form-item label="语音风格">
        <el-select v-model="customCharacter.voice" placeholder="选择语音风格">
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
        <div v-for="(skill, index) in customCharacter.skills" :key="index" class="skill-item">
          <el-input
            v-model="skill.name"
            placeholder="技能名称"
            size="small"
            class="skill-name"
          />
          <el-input
            v-model="skill.description"
            placeholder="技能描述"
            size="small"
            class="skill-desc"
          />
          <el-button size="small" type="danger" @click="removeSkill(index)">删除</el-button>
        </div>
        <el-button size="small" @click="addSkill">添加技能</el-button>
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
import type { CustomCharacter } from '../../types/character'

const emit = defineEmits<{
  create: [character: CustomCharacter]
}>()

const formRef = ref()
const traitInputRef = ref()
const showTraitInput = ref(false)
const newTrait = ref('')

const customCharacter = reactive<CustomCharacter>({
  isCustom: true,
  name: '',
  description: '',
  background: '',
  personality: [],
  voice: '',
  theme: '',
  skills: [],
  emotionalTendency: {
    default: 'neutral',
    happy: 0.3,
    sad: 0.2,
    angry: 0.1,
    excited: 0.3,
    calm: 0.4
  }
})

const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入角色描述', trigger: 'blur' }],
  background: [{ required: true, message: '请输入角色背景', trigger: 'blur' }],
  personality: [{ required: true, message: '请至少添加一个性格特征', trigger: 'change' }]
}

const showAddTrait = () => {
  showTraitInput.value = true
  nextTick(() => {
    traitInputRef.value?.focus()
  })
}

const addTrait = () => {
  if (newTrait.value && !customCharacter.personality?.includes(newTrait.value)) {
    customCharacter.personality?.push(newTrait.value)
  }
  newTrait.value = ''
  showTraitInput.value = false
}

const removeTrait = (trait: string) => {
  const index = customCharacter.personality?.indexOf(trait)
  if (index > -1) {
    customCharacter.personality?.splice(index, 1)
  }
}

const addSkill = () => {
  customCharacter.skills?.push({
    name: '',
    description: '',
    trigger: []
  })
}

const removeSkill = (index: number) => {
  customCharacter.skills?.splice(index, 1)
}

const createCharacter = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      emit('create', { ...customCharacter })
      resetForm()
    }
  })
}

const resetForm = () => {
  formRef.value?.resetFields()
  customCharacter.name = ''
  customCharacter.description = ''
  customCharacter.background = ''
  customCharacter.personality = []
  customCharacter.skills = []
  customCharacter.voice = ''
  customCharacter.theme = ''
}
</script>

<style scoped>
.character-customizer {
  max-width: 600px;
}

.trait-tag {
  margin-right: 8px;
  margin-bottom: 8px;
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