export interface Character {
  id: string
  name: string
  avatar: string
  description: string
  personality: string[]
  background: string
  voice: string
  theme: string
  skills: CharacterSkill[]
  emotionalTendency: EmotionalTendency
}

export interface CharacterSkill {
  name: string
  description: string
  trigger: string[]
}

export interface EmotionalTendency {
  default: string
  happy: number
  sad: number
  angry: number
  excited: number
  calm: number
}

export interface CustomCharacter extends Partial<Character> {
  isCustom: true
}