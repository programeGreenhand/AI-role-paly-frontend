import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Scene {
  id: string
  name: string
  background: string | (() => Promise<string>)
  music?: string
  theme: string
  characterIds: string[]
}

export const useSceneStore = defineStore('scene', () => {
  const scenes = ref<Scene[]>([
    {
      id: 'hogwarts',
      name: '霍格沃茨城堡',
      background: '001',
      music: '/music/harry-potter-theme.mp3',
      theme: 'magic',
      characterIds: ['harry-potter']
    },
    {
      id: 'ancient-athens',
      name: '古雅典',
      background: '001',
      music: '/music/ancient-greece.mp3',
      theme: 'philosophy',
      characterIds: ['socrates']
    },
    {
      id: 'school',
      name: '教室',
      background: '001',
      theme: 'study',
      characterIds: ['konan']
    },
    {
      id: 'yuanlaohui',
      name: '元老会',
      background: '002',
      theme: 'study',
      characterIds: ['socrates']
    },
    {
      id: 'shiwusuo',
      name: '事务所',
      background: '002',
      theme: 'study',
      characterIds: ['konan']
    },
    {
      id: 'jiaotang',
      name: '教堂',
      background: '002',
      theme: 'study',
      characterIds: ['harry-potter']
    },
  ])

  const currentScene = ref<Scene | null>(null)

  const setScene = (scene: Scene) => {
    currentScene.value = scene
  }

  const getSceneById = (id: string) => {
    return scenes.value.find(s => s.id === id)
  }

  const getScenesForCharacter = (characterId: string) => {
    return scenes.value.filter(s => s.characterIds.includes(characterId))
  }

  return {
    scenes,
    currentScene,
    setScene,
    getSceneById,
    getScenesForCharacter
  }
})