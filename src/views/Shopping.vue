<!-- CharacterStore.vue -->
<template>
  <div class="character-store">
    <!-- 搜索区域 -->
    <div class="search-section">
      <SearchBar @search="handleSearch" />
      
    </div>

    <!-- 卡片展示区域 -->
    <div class="cards-container" ref="containerRef">
      <!-- 桌面端：网格布局 + 虚拟滚动 -->
      <div v-if="!isMobile" class="desktop-grid">
        <RecycleScroller
          class="scroller"
          :items="filteredCharacters"
          :item-size="320"
          key-field="id"
          v-slot="{ item }"
        >
          <CharacterCard
            :character="item"
            @chat="handleChat"
          />
        </RecycleScroller>
      </div>

      <!-- 移动端：横向滚动 -->
      <div v-else class="mobile-scroll">
        <DynamicScroller
          :items="filteredCharacters"
          :min-item-size="280"
          key-field="id"
          direction="horizontal"
          class="horizontal-scroller"
          v-slot="{ item, index, active }"
        >
          <DynamicScrollerItem
            :item="item"
            :index="index"
            :active="active"
            :size-dependencies="[item.name, item.description]"
          >
            <CharacterCard
              :character="item"
              @chat="handleChat"
              class="mobile-card"
            />
          </DynamicScrollerItem>
        </DynamicScroller>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RecycleScroller, DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import CharacterCard from '../components/shopping/CharacterCard.vue'
import SearchBar from '../components/shopping/SearchBar.vue'
import type { Character } from '../types/character'

// 响应式数据
const searchQuery = ref('')
const isMobile = ref(false)
const containerRef = ref<HTMLElement>()

// 模拟角色数据
const characters = ref<Character[]>([
  {
    id: 1,
    name: '哈利·波特',
    category: '魔法师',
    description: '霍格沃茨的年轻巫师，以其勇气和忠诚而闻名。拥有强大的魔法天赋，是对抗黑魔法的英雄。',
    avatar: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop',
    stats: {
      magic: 95,
      courage: 98,
      wisdom: 85,
      friendship: 99
    },
    tags: ['魔法', '勇气', '友谊'],
    isOnline: true
  },
  {
    id: 2,
    name: '赫敏·格兰杰',
    category: '学者',
    description: '聪明绝顶的女巫，以其渊博的知识和理性思考著称。是哈利最可靠的朋友和顾问。',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616c9c16c64?w=300&h=400&fit=crop',
    stats: {
      magic: 92,
      courage: 88,
      wisdom: 99,
      friendship: 96
    },
    tags: ['智慧', '学习', '理性'],
    isOnline: true
  },
  {
    id: 3,
    name: '罗恩·韦斯莱',
    category: '伙伴',
    description: '忠诚的朋友，来自纯血统巫师家庭。虽然有时缺乏自信，但在关键时刻总是挺身而出。',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
    stats: {
      magic: 78,
      courage: 90,
      wisdom: 75,
      friendship: 98
    },
    tags: ['忠诚', '幽默', '勇敢'],
    isOnline: false
  },
  {
    id: 4,
    name: '邓布利多',
    category: '导师',
    description: '霍格沃茨的校长，被认为是最伟大的巫师之一。智慧深邃，总是以慈祥的方式指导学生。',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop',
    stats: {
      magic: 99,
      courage: 95,
      wisdom: 99,
      friendship: 92
    },
    tags: ['智慧', '领导', '慈祥'],
    isOnline: true
  },
  {
    id: 5,
    name: '卢娜·洛夫古德',
    category: '梦想家',
    description: '拥有独特世界观的女巫，常常能看到别人看不到的东西。纯真善良，是忠实的朋友。',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop',
    stats: {
      magic: 85,
      courage: 92,
      wisdom: 88,
      friendship: 94
    },
    tags: ['梦想', '纯真', '独特'],
    isOnline: true
  }
])

// 计算属性
const filteredCharacters = computed(() => {
  if (!searchQuery.value) return characters.value
  return characters.value.filter(char =>
    char.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    char.category.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    char.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
})

// 方法
const handleSearch = (query: string) => {
  searchQuery.value = query
}

const handleChat = (character: Character) => {
  console.log('开始与角色聊天:', character.name)
  // 这里实现跳转到聊天页面的逻辑
}

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 生命周期
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.character-store {
  width: 100%;
  height: 100vh;
  
  overflow: hidden;
}

.search-section {
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.cards-container {
  height: calc(100vh - 100px);
  padding: 20px;
}

.desktop-grid {
  height: 100%;
}

.scroller {
  height: 100%;
}

.mobile-scroll {
  height: 100%;
}

.horizontal-scroller {
  height: 100%;
}

.mobile-card {
  margin-right: 20px;
}

@media (max-width: 768px) {
  .search-section {
    padding: 15px;
  }
  
  .cards-container {
    padding: 15px;
    height: calc(100vh - 90px);
  }
}
</style>