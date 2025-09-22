<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 根据当前路由设置活动标签
const activeTab = ref(route.path.includes('register') ? 'register' : 'login')

// 监听标签变化并更新路由
watch(activeTab, (newTab) => {
  router.push({ path: `/${newTab}` })
})
</script>

<template>
  <div class="home-container">
    
  
    <div class="login-register-card">
      <div class="card-header">
        <h1 class="title">AI角色扮演对话</h1>
        <div class="tabs">
          <div 
            class="tab" 
            :class="{ active: activeTab === 'login' }" 
            @click="activeTab = 'login'"
          >
            登录
          </div>
          <div 
            class="tab" 
            :class="{ active: activeTab === 'register' }" 
            @click="activeTab = 'register'"
          >
            注册
          </div>
        </div>
      </div>
      <div class="card-content">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            
              <component :is="Component" />
            
          </Transition>
        </RouterView>
      </div>
    </div>

    <router-link to="/hall">
      <ElButton type="success" >测试版入口</ElButton>
    </router-link>

  </div>
</template>

<style scoped>
.home-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-register-card {
  width: 420px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.card-header {
  padding: 20px 30px;
}

.title {
  margin: 0 0 20px;
  color: #2c3e50;
  font-size: 24px;
  text-align: center;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 10px;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 16px;
  cursor: pointer;
  color: #606266;
  transition: all 0.3s;
  position: relative;
}

.tab:hover {
  color: #409eff;
}

.tab.active {
  color: #409eff;
  font-weight: 500;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #409eff;
}

.card-content {
  padding: 20px 30px 30px;
}

@media screen and (max-width: 768px) {
  .login-register-card {
    width: 90%;
    max-width: 420px;
  }
}
</style>