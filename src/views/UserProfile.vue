<template>
  <div class="user-profile-container">
    <!-- 头部区域 -->
    <div class="header-section">
      <div class="title-area">
        <h1 class="page-title">个人空间</h1>
      </div>
    </div>

    <!-- 工具栏区域 -->
    <div class="toolbar-section">
      <div class="tabs-container">
        <el-tabs v-model="activeTab" class="custom-tabs">
          <el-tab-pane label="智能体收藏" name="favorites">
            <template #label>
              <span class="tab-label">
                <i class="el-icon-folder"></i>
                智能体收藏
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="自建智能体" name="custom">
            <template #label>
              <span class="tab-label">
                <i class="el-icon-edit"></i>
                自建智能体
              </span>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <div class="search-container">
        <el-input
          v-model="searchQuery"
          placeholder="搜索智能体..."
          class="search-input"
          clearable
        >
          <template #prefix>
            <i class="el-icon-search"></i>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-section">
      <!-- 桌面端布局 -->
      <div class="cards-grid desktop-view" v-if="!isMobile">
        <el-card 
          v-for="agent in filteredAgents" 
          :key="agent.id"
          class="user-card"
          shadow="always"
          @click="gotoRoleChat(agent)"
        >
          <div class="card-content">
            <el-image :src="getroleImage(agent.id)" />
            <div class="info-item" >
              <i class="el-icon-location"></i>
              <span class="info-value">
                <h3>
                  <strong>{{ agent.name }}</strong>
                </h3>
              </span>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 移动端布局 - 水平滚动 -->
      <div class="mobile-view" v-if="isMobile">
        <div class="mobile-scroll-container">
          <div class="cards-scroll-wrapper" ref="scrollContainer" @scroll="handleScroll">
            <div class="cards-scroll-track">
              <el-card 
                v-for="agent in filteredAgents" 
                :key="agent.id"
                class="user-card mobile-card"
                shadow="always"
                @click="gotoRoleChat(agent)"
              >
                <div class="card-content">
                  <el-image :src="getroleImage(agent.id)" />
                  <div class="info-item" >
                    <i class="el-icon-location"></i>
                    <span class="info-value">
                      <h3>
                        <strong>{{ agent.name }}</strong>
                      </h3>
                    </span>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
          
          <!-- 滚动指示器 -->
          <div class="scroll-indicator" v-if="filteredAgents.length > 0">
            <div 
              v-for="(_, index) in Math.ceil(filteredAgents.length / cardsPerView)" 
              :key="index"
              class="indicator-dot"
              :class="{ active: Math.floor(currentSlide / cardsPerView) === index }"
              @click="scrollToSlide(index * cardsPerView)"
            ></div>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="filteredAgents.length === 0" class="empty-state">
        <i class="el-icon-search"></i>
        <h3>没有找到匹配的智能体</h3>
        <p>尝试调整搜索条件</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useCharacterStore } from '../stores/character'
import { useRouter } from 'vue-router';
import type { Character } from '../types/character';
import server from '../api/session';

const characterLists = ref<Character[]>([])
const searchQuery = ref('');
const activeTab = ref('favorites');
const currentSlide = ref(0);
const character = useCharacterStore()
const router = useRouter()
const isMobile = ref(false);
const cardsPerView = ref(1);
const scrollContainer = ref<HTMLElement | null>(null);

// 检测是否为移动设备
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
  // 根据屏幕宽度计算每个视图中可以显示的卡片数量
  if (window.innerWidth <= 480) {
    cardsPerView.value = 1;
  } else if (window.innerWidth <= 768) {
    cardsPerView.value = 2;
  } else {
    cardsPerView.value = 3;
  }
};

const getroleImage = (id:string) => {
  return new URL(`../assets/charactor/${id}/role/index.jpg`, import.meta.url).href;
};

watch(activeTab, async (newTab) => {
  try {
    const userId = localStorage.getItem('userId'); 
    if (newTab === 'favorites') {
      const response = await server.get(`/api/user/${userId}/favorites`)
      characterLists.value = response.data
      console.log('收藏智能体数据:', response.data)
    } else if (newTab === 'custom') {
      const response = await server.get(`/api/user/${userId}/characters`)
      characterLists.value = response.data
      console.log('自建智能体数据:', response.data)
    }
  } catch (error) {
    console.error(`获取${newTab === 'favorites' ? '收藏' : '自建'}数据失败:`, error)
  }
}, { immediate: true })

// 筛选智能体
const filteredAgents = computed(() => {
  if (!searchQuery.value) {
    return characterLists.value || [];
  }
  return (characterLists.value || []).filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 处理移动端滚动
const handleScroll = (event: Event) => {
  const container = event.target as HTMLElement;
  const scrollLeft = container.scrollLeft;
  const cardWidth = container.querySelector('.mobile-card')?.clientWidth || 300;
  const cardMargin = 16; // 卡片间距
  const newSlide = Math.round(scrollLeft / (cardWidth + cardMargin));
  
  if (newSlide !== currentSlide.value) {
    currentSlide.value = newSlide;
  }
};

// 滚动到指定卡片
const scrollToSlide = (slideIndex: number) => {
  if (!scrollContainer.value) return;
  
  const cardWidth = scrollContainer.value.querySelector('.mobile-card')?.clientWidth || 300;
  const cardMargin = 16; // 卡片间距
  const scrollPosition = slideIndex * (cardWidth + cardMargin);
  
  scrollContainer.value.scrollTo({
    left: scrollPosition,
    behavior: 'smooth'
  });
};

const gotoRoleChat = (Role) => {
  console.log("进入该角色聊天:",Role)
  character.setCurrentCharacter(Role)
  router.push(`/chat`)
};

// 初始化
onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  
  const container = document.querySelector('.cards-scroll-wrapper');
  if (container) {
    scrollContainer.value = container as HTMLElement;
    container.addEventListener('scroll', handleScroll);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  
  const container = document.querySelector('.cards-scroll-wrapper');
  if (container) {
    container.removeEventListener('scroll', handleScroll);
  }
});
</script>

<style scoped>
.user-profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
  box-sizing: border-box;
}

/* 头部区域 */
.header-section {
  margin-bottom: 2rem;
}

.title-area {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

/* 工具栏区域 */
.toolbar-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.tabs-container {
  flex: 1;
  min-width: 300px;
}

.custom-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.search-container {
  flex-shrink: 0;
}

.search-input {
  width: 300px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 内容区域 */
.content-section {
  min-height: 400px;
}

/* 桌面端布局 */
.desktop-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* 移动端布局 */
.mobile-view {
  display: none;
}

.mobile-scroll-container {
  margin-bottom: 2rem;
}

.cards-scroll-wrapper {
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  -webkit-overflow-scrolling: touch; /* 增加iOS滚动体验 */
}

.cards-scroll-wrapper::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.cards-scroll-track {
  display: inline-flex;
  gap: 1rem;
  padding: 0 1rem;
}

.mobile-card {
  min-width: 300px;
  width: 300px;
  flex-shrink: 0;
}

/* 滚动指示器 */
.scroll-indicator {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 0;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dcdfe6;
  transition: all 0.3s ease;
  cursor: pointer;
}

.indicator-dot.active {
  background: #409eff;
  transform: scale(1.2);
}

/* 卡片通用样式 */
.user-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.user-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.card-content {
  padding: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
  padding: 0.5rem;
  border-radius: 6px;
  background: #f8f9fa;
}

.info-value {
  color: #34495e;
  flex: 1;
}

.info-value h3 {
  margin: 0;
  font-size: 1.1rem;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #7f8c8d;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #bdc3c7;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .user-profile-container {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .user-profile-container {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .toolbar-section {
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
  }
  
  .search-input {
    width: 100%;
  }
  
  /* 切换布局 */
  .desktop-view {
    display: none;
  }
  
  .mobile-view {
    display: block;
  }
}

@media (max-width: 480px) {
  .user-profile-container {
    padding: 0.5rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .toolbar-section {
    padding: 0.75rem;
  }
  
  .mobile-card {
    min-width: 260px;
    width: 260px;
  }
  
  .tabs-container {
    min-width: auto;
  }
}
</style>