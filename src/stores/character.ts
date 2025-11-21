import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Character, CustomCharacter } from '../types/character'
import { createCharacter } from '../api/character'

export const useCharacterStore = defineStore('character', () => {
  const characters = ref<Character[]>([
    {
      id: 'harry-potter',
      name: '哈利·波特',
      avatar: '/avatars/harry.jpg',
      description: '霍格沃茨的年轻巫师，勇敢而忠诚',
      personality: ['勇敢', '忠诚', '善良', '冲动'],
      background: '在霍格沃茨魔法学校学习的年轻巫师，拥有与伏地魔对抗的传奇经历',
      voice: 'harry-voice',
      theme: 'magic',
      skills: [
        {
          name: '魔法知识',
          description: '了解各种魔法咒语和魔法世界的知识',
          trigger: ['魔法', '咒语', '霍格沃茨', '魁地奇']
        },
        {
          name: '冒险经历',
          description: '分享在霍格沃茨的冒险故事',
          trigger: ['冒险', '伏地魔', '邓布利多', '赫敏']
        },
        {
          name: '友谊建议',
          description: '基于与朋友的经历给出建议',
          trigger: ['朋友', '友谊', '帮助', '困难']
        }
      ],
      emotionalTendency: {
        default: 'determined',
        happy: 0.3,
        sad: 0.1,
        angry: 0.2,
        excited: 0.4,
        calm: 0.3
      }
    },
    {
      id: 'socrates',
      name: '苏格拉底',
      avatar: '/avatars/socrates.jpg',
      description: '古希腊哲学家，智慧的化身',
      personality: ['智慧', '好奇', '谦逊', '理性'],
      background: '古希腊著名哲学家，以苏格拉底式对话法闻名',
      voice: 'socrates-voice',
      theme: 'philosophy',
      skills: [
        {
          name: '哲学思辨',
          description: '通过提问引导思考深层问题',
          trigger: ['为什么', '如何', '什么是', '思考']
        },
        {
          name: '智慧启发',
          description: '用古希腊智慧启发现代问题',
          trigger: ['智慧', '知识', '真理', '美德']
        },
        {
          name: '逻辑分析',
          description: '帮助理清思路和逻辑',
          trigger: ['逻辑', '推理', '分析', '证明']
        }
      ],
      emotionalTendency: {
        default: 'wise',
        happy: 0.4,
        sad: 0.1,
        angry: 0.1,
        excited: 0.2,
        calm: 0.6
      }
    }
  ])

  const customCharacters = ref<CustomCharacter[]>([])
  const currentCharacter = ref<Character | null>(null)

  const allCharacters = computed(() => [
    ...characters.value,
    ...customCharacters.value.filter(c => c.name && c.personality)
  ])

  const setCurrentCharacter = (character: Character) => {

    currentCharacter.value = character
  }

  const loadCharacterList = (characters:Character[])=>{
    characters.forEach(char=>{
      if(!allCharacters.value.find(c=>c.id === char.id)){
        allCharacters.value.push(char);
      }
    });
  };

  //这里添加新角色！！！！！
  const addCustomCharacter = async (character: CustomCharacter) => {
    try {
      // 获取当前用户ID
      const userId = character.created_by || localStorage.getItem('userId')
      if (!userId) {
        throw new Error('用户未登录，无法创建角色')
      }
      
      // 调用后端API创建角色
      const response = await createCharacter(character, userId)
      
      // 如果后端返回成功，将角色添加到本地列表
      if (response && response.success) {
        const newCharacter = {
          ...character,
          id: response.data?.characterId || `custom-${Date.now()}`,
          isCustom: true
        }
        customCharacters.value.push(newCharacter)
        return newCharacter
      } else {
        throw new Error(response?.message || '创建角色失败')
      }
    } catch (error) {
      console.error('创建角色失败:', error)
      throw error
    }
  }

  const getCharacterById = (id: string) => {
    return allCharacters.value.find(c => c.id === id)
  }

  return {
    characters,
    customCharacters,
    currentCharacter,
    allCharacters,
    setCurrentCharacter,
    addCustomCharacter,
    getCharacterById,
    loadCharacterList
  }
})