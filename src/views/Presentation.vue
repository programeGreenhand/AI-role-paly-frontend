<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

// 根据当前路由设置活动标签
const activeTab = ref(route.path.includes('register') ? 'register' : 'login')

// 监听标签变化并更新路由
watch(activeTab, (newTab) => {
  router.push({ path: `/${newTab}` })
})

// 检测是否为HTTPS访问
const showHttpsWarning = ref(false)

onMounted(() => {
  // 检查当前协议是否为HTTPS
  if (window.location.protocol !== 'https:') {
    showHttpsWarning.value = true
    
    // 延迟显示弹窗，确保页面加载完成
    setTimeout(() => {
      ElMessageBox.alert(
        '✨ 欢迎来到AI角色对话系统！ ✨\n\n' +
        '🔒 **安全提示**：为了确保语音功能正常运行，请使用HTTPS协议访问本系统。\n\n' +
        '🚀 **立即体验**：\n' +
        '• 建议访问地址：https://129.204.241.238/login\n' +
        '• 登录方式：可选择自建账号，或使用测试账号\n' +
        '• 测试账号：用户名：aaa，密码：aaa123\n\n' +
        '🎯 **温馨提示**：\n' +
        '• 请确保使用Chrome浏览器以获得最佳体验\n' +
        '• 语音功能需要麦克风权限\n' +
        '• 祝您体验愉快！ 🌟',
        '🎈 欢迎使用AI角色对话系统',
        {
          confirmButtonText: '好的，开始体验！ 🎉',
          type: 'info',
          customClass: 'https-warning-dialog',
          showClose: false
        }
      ).then(() => {
        showHttpsWarning.value = false
      })
    }, 1000)
  }
})
</script>

<template>
  <div class="home-container">
    
  
    <div class="login-register-card">
      <div class="card-header">
        <h1 class="title">AI角色对话</h1>
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

    <!-- <router-link to="/hall">
      <ElButton type="success" >测试版入口</ElButton>
    </router-link> -->

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
  background-image: url('/login.jpg') ;
  background-size: cover; 
  background-repeat: no-repeat;
  
}

.login-register-card {
  width: 420px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  opacity: 0.9;
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

/* 淡蓝色可爱风格欢迎弹窗样式 */
:global(.https-warning-dialog) {
  max-width: 520px !important;
  border-radius: 16px !important;
  box-shadow: 0 10px 30px rgba(100, 181, 246, 0.3) !important;
  border: 2px solid #b3e5fc !important;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%) !important;
}

:global(.https-warning-dialog .el-message-box__header) {
  background: linear-gradient(90deg, #64b5f6 0%, #4fc3f7 100%) !important;
  border-bottom: 2px solid #b3e5fc !important;
  border-radius: 14px 14px 0 0 !important;
  padding: 15px 20px !important;
}

:global(.https-warning-dialog .el-message-box__title) {
  color: white !important;
  font-weight: 700 !important;
  font-size: 18px !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
}

:global(.https-warning-dialog .el-message-box__content) {
  padding: 25px !important;
  line-height: 1.8 !important;
  color: #455a64 !important;
  font-size: 15px !important;
  background: white !important;
}

:global(.https-warning-dialog .el-message-box__message) {
  white-space: pre-line !important;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
}

:global(.https-warning-dialog .el-message-box__btns) {
  padding: 15px 25px 25px !important;
  text-align: center !important;
}

:global(.https-warning-dialog .el-button--primary) {
  background: linear-gradient(135deg, #64b5f6 0%, #4fc3f7 100%) !important;
  border: none !important;
  border-radius: 25px !important;
  padding: 12px 30px !important;
  font-weight: 600 !important;
  font-size: 16px !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(100, 181, 246, 0.4) !important;
  transition: all 0.3s ease !important;
}

:global(.https-warning-dialog .el-button--primary:hover) {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(100, 181, 246, 0.6) !important;
  background: linear-gradient(135deg, #42a5f5 0%, #29b6f6 100%) !important;
}

:global(.https-warning-dialog .el-message-box__message strong) {
  color: #64b5f6 !important;
  font-weight: 700 !important;
}

:global(.https-warning-dialog .el-message-box__message li) {
  margin: 8px 0 !important;
  padding-left: 5px !important;
}
</style>