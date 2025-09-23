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
      <div class="content-list" @click="handleListClick">
        <div v-for="item in filteredList" :key="item" class="list-item">
          <el-avatar 
            :size="40"
            src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
          />
          <div class="item-info">
            <span class="item-name">哈利波特{{ item }}</span>
            <span class="item-time">2小时前</span>
          </div>
          <el-button text icon="MoreFilled" />
        </div>
      </div>

      <!-- 底部用户信息 -->
      <div class="drawer-footer">
        <el-dropdown placement="top" trigger="click">
          <div class="user-info">
            <el-avatar icon="User" />
            <span>航海王开发组</span>
            <el-icon><ArrowUp /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="goToSettings" icon="Setting">设置</el-dropdown-item>
              <el-dropdown-item @click="goToUserProfile" icon="User">个人中心</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </el-drawer>

  <RouterView />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')
const drawer = ref(false)

// 响应式抽屉宽度
const drawerSize = computed(() => {
  if (window.innerWidth < 768) return '80%'
  if (window.innerWidth < 1024) return '40%'
  return '320px'
})

// 模拟数据和过滤
const mockData = Array.from({length: 15}, (_, i) => i + 1)
const filteredList = computed(() => {
  if (!searchQuery.value) return mockData
  return mockData.filter(item => 
    `哈利波特${item}`.includes(searchQuery.value)
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

const handleListClick = (event) => {
  //我要获取点击的信息呀，比如item-info里的文本内容
  const targetLi = event.target.closest('.list-item')
  if (targetLi) {
    const itemName = targetLi.querySelector('.item-name').textContent
    const itemTime = targetLi.querySelector('.item-time').textContent
    console.log('点击了列表项:', itemName, itemTime)
  }
}
</script>

<style scoped>
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
</style>