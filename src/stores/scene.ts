import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Scene {
  id: string
  name: string
  background: string
  music?: string
  theme: string
  characterIds: string[]
}

export const useSceneStore = defineStore('scene', () => {
  const scenes = ref<Scene[]>([
    {
      id: 'hogwarts',
      name: '霍格沃茨城堡',
      background: '/backgrounds/hogwarts.jpg',
      music: '/music/harry-potter-theme.mp3',
      theme: 'magic',
      characterIds: ['harry-potter']
    },
    {
      id: 'ancient-athens',
      name: '古雅典',
      background: '/backgrounds/athens.jpg',
      music: '/music/ancient-greece.mp3',
      theme: 'philosophy',
      characterIds: ['socrates']
    },
    {
      id: 'library',
      name: '图书馆',
      background: '/backgrounds/library.jpg',
      theme: 'study',
      characterIds: ['socrates']
    }
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