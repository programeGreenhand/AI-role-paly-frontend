<!-- Home.vue 中修改 Dropdown 部分 -->
<template>
  <!-- 优化后的悬浮操作按钮 -->
  <div class="floating-control-panel">
    <el-button 
      class="control-trigger" 
      type="primary" 
      :icon="drawer ? 'Close' : 'Menu'"
      circle
      @click="drawer = !drawer"
    />
  </div>


  <el-drawer  
    v-model="drawer"   
    :append-to-body="true" 
    :with-header="false" 
    direction="ltr" 
    :size="drawerSize"
    class="control-drawer"
  > 
    <div class="drawer-content">
      <!-- 头部区域 -->
      <div class="drawer-header">
        <h3>操作台</h3>
        <el-button text @click="drawer = false" icon="Close" />
      </div>

      <!-- 搜索区域 -->
      <div class="search-section">
        <el-input 
          v-model="searchQuery" 
          placeholder="搜索历史记录..." 
          prefix-icon="Search"
          clearable
        />
      </div>

      <!-- 内容列表 -->
      <div class="content-list" >
        <div v-for="item in filteredSessions" :key="item.id" class="list-item" @click="gotoRoleChat(item)">
          <el-avatar 
            :size="40"
            :src="getroleImage(item.id)"
            
          />
          <div class="item-info">
            <span class="item-name">{{ item.title}}</span>
            <span class="item-time">{{ diffTime(item.last_message_at) }}小时前</span>
          </div>

          <el-dropdown placement="bottom-start">
            <el-button text icon="MoreFilled" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="deletRole">删除</el-dropdown-item>
                <el-dropdown-item @click="modifyRole">编辑</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 底部用户信息 -->
      <div class="drawer-footer">
        <!-- 修改这里：添加 @click.stop 防止事件冒泡，并添加自定义处理 -->
        <div class="custom-dropdown" ref="dropdownRef">
    <!-- 用户信息按钮 -->
    <div
      class="user-info"
      @click="handleToggle"
    >
      <el-avatar icon="User" />
      <span>三块给买麻薯</span>
      <el-icon class="chevron-icon" :class="{ 'is-open': isOpen }">
        <ArrowUp />
      </el-icon>
    </div>

    <!-- 下拉菜单 -->
    <div v-show="isOpen" class="dropdown-menu">
      
      <div class="dropdown-item" @click="handleMenuItemClick('settings')">
        <el-icon><Setting /></el-icon>
        <span>设置</span>
      </div>
      <div class="dropdown-item" @click="handleMenuItemClick('profile')">
        <el-icon><User /></el-icon>
        <span>个人中心</span>
      </div>
      <div class="dropdown-item" @click="handleMenuItemClick('shopping')">
        <el-icon><ShoppingTrolley /></el-icon>
        <span>智能体宇宙</span>
      </div>
      
    </div>
  </div>
        
      </div>
    </div>
  </el-drawer>
  <TourTrigger :show-always="true" />
  <RouterView />
</template>

<script setup lang="ts">
import { ref, computed, onMounted,onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '../stores/character'
import axios from 'axios'
import server from '../api/session'
import type { Character } from '../types/character'
import { useChatStore } from '../stores/chat'
import TourTrigger from '../components/common/TourTrigger.vue'
import { useTourStore } from '../stores/tour'

const isOpen = ref(false)


// 切换菜单状态
const handleToggle = (e: MouseEvent) => {
  e.stopPropagation()
  isOpen.value = !isOpen.value
}

// 处理菜单项点击
const handleMenuItemClick = (action: string) => {
  switch(action) {
    case 'settings':
      router.push('/hall/settings')
      break
    case 'profile':
      router.push('/hall/user/profile')
      break
    case 'shopping':
      router.push('/hall/shopping')
      break
  }
  isOpen.value = false
}

// 点击菜单区域外部不关闭菜单（只能通过第二次点击用户信息区域关闭）
const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    // 不自动关闭菜单，除非用户点击用户信息区域
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const character = useCharacterStore()
const tourStore = useTourStore() // 添加这行
const current_character = ref<Character>()
const session = ref(null);

const dropdownRef = ref()

const handleCommand = (command) => {
  console.log('选择了:', command)
  // 菜单会保持打开状态
}

const router = useRouter()
const searchQuery = ref('')
const drawer = ref(false)

const getroleImage = (id:string) => {
  return new URL(`../assets/charactor/${id}/role/avatar.jpg`, import.meta.url).href;
};

const gotoRoleChat = async function(item){
  console.log(`角色信息: ${item.character_id}`)
  console.log(`信息: ${item.title}`)
  const response = await server.get(`/characters/${item.character_id}`);
  console.log("这个是响应结果 角色：",response.data)
  current_character.value = response.data
  console.log(current_character.value.name)
  character.setCurrentCharacter(current_character.value)
  const chatStore = useChatStore();
  chatStore.currentSession = item.id
  router.push(`/chat`)
}

const diffTime = function(lastModify){
  const now = new Date().getTime()
  let last = new  Date(lastModify).getTime()
  return Math.ceil((now - last)/(1000*60*60))
}

const deletRole = ()=>{
  console.log('delete')
}

const modifyRole = ()=>{
  console.log('modify')
}

// 响应式抽屉宽度
const drawerSize = computed(() => {
  if (window.innerWidth < 768) return '80%'
  if (window.innerWidth < 1024) return '40%'
  return '320px'
})

// 会话搜索过滤
const filteredSessions = computed(() => {
  if (!session.value) return []
  if (!searchQuery.value) return session.value
  
  const query = searchQuery.value.toLowerCase()
  return session.value.filter(session => 
    session.title?.toLowerCase().includes(query) ||
    session.character_name?.toLowerCase().includes(query)
  )
})

const goToSettings = () => {
  router.push('/hall/settings')
  drawer.value = false
}

const goToUserProfile = () => {
  router.push('/hall/user/profile')
  drawer.value = false
}

const goShoppingTrolley = () => {
  router.push('/hall/shopping')
  drawer.value = false
}

// 添加这个新函数：处理用户信息点击
const handleUserInfoClick = (e: MouseEvent) => {
  // 在引导中时，阻止事件传播
  if (tourStore.isInTour) {
    e.stopPropagation()
  }
}

// 添加这个新函数：处理下拉菜单可见性变化
const handleDropdownVisibleChange = (visible: boolean) => {
  // 如果在引导中且需要保持下拉菜单打开，就不让它关闭
  if (tourStore.isInTour && tourStore.shouldKeepDropdownOpen) {
    if (!visible) {
      // 重新打开下拉菜单
      const userInfo = document.querySelector('.drawer-footer .user-info') as HTMLElement
      if (userInfo) {
        setTimeout(() => {
          userInfo.click()
        }, 0)
      }
    }
  }
}

onMounted(async ()=>{
  const userId = localStorage.getItem('userId');
  const response = await server.get(`/user/${userId}/sessions`);
  session.value = response.data
})

</script>

<style scoped>
.custom-dropdown {
  position: relative;
  display: inline-block;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.chevron-icon {
  transition: transform 0.2s ease;
}

.chevron-icon.is-open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: 8px;
  background-color: white;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #333;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-item:not(:last-child) {
  border-bottom: 1px solid #f5f5f5;
}

.floating-control-panel {
  position: fixed;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  z-index: 1000;
}

.control-trigger {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.control-trigger:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 16px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.drawer-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.search-section {
  padding: 16px;
}

.content-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  transition: background-color 0.2s;
  cursor: pointer;
}

.list-item:hover {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding-left: 8px;
  padding-right: 8px;
}

.item-info {
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-weight: 500;
  color: #333;
}

.item-time {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.drawer-footer {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: #f5f5f5;
}

/* 保护下拉菜单在引导中不关闭 */
:deep(.el-dropdown-menu.tour-protected) {
  z-index: 10000;
  pointer-events: auto;
}
</style>