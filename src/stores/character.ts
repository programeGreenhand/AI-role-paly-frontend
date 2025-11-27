import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import type { Character, CustomCharacter } from '../types/character'
import { getPublicCharacterList } from '../api/character'

export const useCharacterStore = defineStore('character', () => {
  const characters = ref<Character[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const customCharacters = ref<CustomCharacter[]>([])
  const currentCharacter = ref<Character | null>(null)

  const allCharacters = computed(() => [
    ...characters.value,
    ...customCharacters.value.filter(c => c.name && c.personality)
  ])

  // 从数据库加载公共角色数据
  const loadCharactersFromDatabase = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      // 使用公共角色接口，不需要用户登录
      const response = await getPublicCharacterList()
      if (response && Array.isArray(response)) {
        characters.value = response
      } else {
        // 如果后端返回的数据结构不同，可能需要调整
        characters.value = response.data || response.characters || []
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载角色数据失败'
      console.error('加载角色数据失败:', err)
      // 如果加载失败，可以保持空数组，避免硬编码角色
      characters.value = []
    } finally {
      isLoading.value = false
    }
  }

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
  const addCustomCharacter = (character: CustomCharacter) => {
    customCharacters.value.push({
      ...character,
      id: `custom-${Date.now()}`,
      isCustom: true
    })
  }

  const getCharacterById = (id: string) => {
    return allCharacters.value.find(c => c.id === id)
  }

  return {
    characters,
    customCharacters,
    currentCharacter,
    allCharacters,
    isLoading,
    error,
    setCurrentCharacter,
    addCustomCharacter,
    getCharacterById,
    loadCharacterList,
    loadCharactersFromDatabase
  }
})