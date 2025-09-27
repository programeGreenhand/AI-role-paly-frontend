export interface Character {
  id: string
  name: string
  avatar_url: string          // 修正字段名
  description: string
  personality: string         // 修正为字符串类型（后端存储为TEXT）
  background: string
  voice_type: string          // 修正字段名
  theme: string
  skills: string[] | CharacterSkill[]  // 适配后端JSON存储
  emotional_tendency: EmotionalTendency // 修正字段名
  system_prompt: string       // 新增：系统提示词
  is_custom: boolean          // 新增：是否自定义
  is_public: boolean          // 新增：是否公开
  author: string              // 新增：作者
  created_by: string          // 新增：创建者ID
  usage_count: number         // 新增：使用次数
  rating: number              // 新增：评分
  created_at: string          // 新增：创建时间
  updated_at: string          // 新增：更新时间
}

// 保持兼容性的类型别名
export interface CharacterLegacy {
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

export interface ShoppingItem extends CustomCharacter{
  authr: string
}
