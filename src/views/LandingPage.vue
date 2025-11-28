<template>
  <div class="landing-container">
    <!-- 背景网格图片 -->
    <div class="background-grid">
      <div class="grid-item" v-for="(img, index) in backgroundImages" :key="index" :style="{ backgroundImage: `url(${img})` }"></div>
    </div>

    <!-- 暗色遮罩 -->
    <div class="overlay"></div>

    <!-- 中心内容 -->
    <div class="center-content">
      <!-- 品牌标识 -->
      <div class="brand-section">
        <div class="brand-logo">
          <span class="logo-text">Soul<br/>Companion</span>
          <div class="logo-circle"></div>
        </div>
        <p class="brand-tagline">遇见理想的对话伴侣</p>
      </div>

      <!-- 登录按钮 -->
      <div class="action-section">
        <el-button 
          type="primary" 
          size="large" 
          class="login-btn glassmorphism"
          @click="goToLogin"
        >
          立即对话
        </el-button>
        <p class="subtitle">探索多角色沉浸式对话体验</p>
      </div>
    </div>

    <!-- 导航栏 -->
    <div class="navbar">
      <div class="nav-left">
        <span class="nav-logo">SoulCompanion</span>
      </div>
      <div class="nav-menu">
        <!-- <a href="javascript:void(0)" class="nav-item">首页</a>
        <a href="javascript:void(0)" class="nav-item">角色广场</a>
        <a href="javascript:void(0)" class="nav-item">我的对话</a>
        <a href="javascript:void(0)" class="nav-item">关于我们</a> -->
      </div>
      <div class="nav-right">
        <el-button text @click="goToLogin" class="login-link glassmorphism-text">登录</el-button>
        <div class="theme-toggle" @click="toggleTheme">
          <el-icon class="theme-icon" :class="{ hidden: themeStore.isDark }"><Moon /></el-icon>
          <span class="theme-text" :class="{ active: themeStore.isDark }">☀️</span>
        </div>
      </div>
    </div>

    <!-- 功能特色卡片 -->
    <div class="features-section">
      <div class="feature-card glassmorphism-card">
        <el-icon class="feature-icon"><ChatRound /></el-icon>
        <h3>智能角色</h3>
        <p>与多样化角色进行自然对话</p>
      </div>
      <div class="feature-card glassmorphism-card">
        <el-icon class="feature-icon"><Microphone /></el-icon>
        <h3>语音交互</h3>
        <p>沉浸式的实时语音体验</p>
      </div>
      <div class="feature-card glassmorphism-card">
        <el-icon class="feature-icon"><Star /></el-icon>
        <h3>个性定制</h3>
        <p>创建你的理想AI伴侣</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChatRound, Microphone, Star, Moon } from '@element-plus/icons-vue'
import { useThemeStore } from '../stores/theme'

const router = useRouter()
const themeStore = useThemeStore()

// 使用天蓝色系的渐变背景
const backgroundImages = ref([
  'linear-gradient(135deg, #87CEEB 0%, #4A90E2 100%)',
  'linear-gradient(135deg, #87CEEB 0%, #5B9FD8 100%)',
  'linear-gradient(135deg, #5B9FD8 0%, #3A7CA5 100%)',
  'linear-gradient(135deg, #4A90E2 0%, #2E5C8A 100%)',
  'linear-gradient(135deg, #6BB6D6 0%, #4A90E2 100%)',
  'linear-gradient(135deg, #87CEEB 0%, #6BB6D6 100%)',
  'linear-gradient(135deg, #5B9FD8 0%, #87CEEB 100%)',
  'linear-gradient(135deg, #3A7CA5 0%, #5B9FD8 100%)',
  'linear-gradient(135deg, #4A90E2 0%, #6BB6D6 100%)',
  'linear-gradient(135deg, #87CEEB 0%, #3A7CA5 100%)',
  'linear-gradient(135deg, #6BB6D6 0%, #87CEEB 100%)',
  'linear-gradient(135deg, #5B9FD8 0%, #4A90E2 100%)',
])

const goToLogin = () => {
  router.push('/presentation/login')
}

const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script>

<style scoped>
.landing-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 背景网格 */
.background-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0;
  z-index: 1;
  overflow: hidden;
}

.grid-item {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform 0.6s ease;
  animation: floatIn 1s ease-out both;
}

.grid-item:nth-child(1) { animation-delay: 0.1s; }
.grid-item:nth-child(2) { animation-delay: 0.2s; }
.grid-item:nth-child(3) { animation-delay: 0.3s; }
.grid-item:nth-child(4) { animation-delay: 0.4s; }
.grid-item:nth-child(5) { animation-delay: 0.5s; }
.grid-item:nth-child(6) { animation-delay: 0.6s; }
.grid-item:nth-child(7) { animation-delay: 0.1s; }
.grid-item:nth-child(8) { animation-delay: 0.2s; }
.grid-item:nth-child(9) { animation-delay: 0.3s; }
.grid-item:nth-child(10) { animation-delay: 0.4s; }
.grid-item:nth-child(11) { animation-delay: 0.5s; }
.grid-item:nth-child(12) { animation-delay: 0.6s; }

.grid-item:hover {
  transform: scale(1.05);
}

@keyframes floatIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 遮罩层 */
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.1) 0%, rgba(58, 124, 165, 0.4) 100%);
  z-index: 2;
}

/* 毛玻璃效果通用类 */
.glassmorphism {
  background: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  backdrop-filter: blur(10px) !important;
  color: white !important;
  transition: all 0.3s ease !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
}

.glassmorphism:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
  box-shadow: 0 8px 32px rgba(74, 144, 226, 0.2) !important;
}

.glassmorphism-text {
  color: rgba(255, 255, 255, 0.9) !important;
}

.glassmorphism-card {
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(8px) !important;
}

/* 导航栏 */
.navbar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), transparent);
  z-index: 10;
  backdrop-filter: blur(10px);
}

.nav-left {
  font-size: 24px;
  font-weight: 700;
  color: white;
  letter-spacing: 2px;
}

.nav-logo {
  background: linear-gradient(90deg, #87CEEB, #4A90E2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-menu {
  display: flex;
  gap: 40px;
  flex: 1;
  justify-content: center;
}

.nav-item {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
  cursor: pointer;
}

.nav-item:hover {
  color: #87CEEB;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.login-link {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.theme-icon {
  color: rgba(255, 255, 255, 0.8);
  font-size: 20px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.theme-icon:hover {
  color: #87CEEB;
}

/* 中心内容 */
.center-content {
  position: relative;
  z-index: 5;
  text-align: center;
  color: white;
  animation: scaleInUp 0.8s ease-out;
}

@keyframes scaleInUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 品牌区域 */
.brand-section {
  margin-bottom: 60px;
}

.brand-logo {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.logo-text {
  font-size: 72px;
  font-weight: 800;
  background: linear-gradient(90deg, #E0F7FA, #87CEEB, #4A90E2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  z-index: 1;
  letter-spacing: 4px;
  line-height: 1.2;
}

.logo-circle {
  position: absolute;
  width: 80px;
  height: 80px;
  border: 3px solid #87CEEB;
  border-radius: 50%;
  opacity: 0.6;
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.brand-tagline {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 300;
  letter-spacing: 1px;
  margin: 0;
}

/* 操作区域 */
.action-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.login-btn {
  padding: 14px 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 30px;
  box-shadow: 0 8px 25px rgba(74, 144, 226, 0.3);
  transition: all 0.3s ease;
  background: rgba(74, 144, 226, 0.3) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
}

.login-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(74, 144, 226, 0.5);
  background: rgba(74, 144, 226, 0.4) !important;
}

.subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

/* 功能特色区域 */
.features-section {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  padding: 60px 40px 40px;
  z-index: 3;
}

.feature-card {
  text-align: center;
  color: white;
  animation: slideUp 0.6s ease-out;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.12) !important;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card:nth-child(1) { animation-delay: 0.1s; }
.feature-card:nth-child(2) { animation-delay: 0.2s; }
.feature-card:nth-child(3) { animation-delay: 0.3s; }

.feature-icon {
  font-size: 40px;
  color: #87CEEB;
  margin-bottom: 15px;
}

.feature-card h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 10px;
}

.feature-card p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .navbar {
    padding: 0 30px;
  }

  .logo-text {
    font-size: 64px;
  }

  .login-btn {
    padding: 12px 40px;
    font-size: 15px;
  }

  .features-section {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 30px;
    padding: 50px 30px 30px;
  }
}

@media (max-width: 992px) {
  .navbar {
    padding: 0 25px;
    height: 55px;
  }

  .nav-left {
    font-size: 20px;
  }

  .nav-menu {
    gap: 25px;
  }

  .nav-item {
    font-size: 13px;
  }

  .logo-text {
    font-size: 56px;
  }

  .brand-tagline {
    font-size: 16px;
  }

  .brand-section {
    margin-bottom: 50px;
  }

  .features-section {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 25px;
    padding: 40px 25px 25px;
  }

  .feature-card {
    padding: 15px;
  }

  .feature-icon {
    font-size: 35px;
  }

  .feature-card h3 {
    font-size: 16px;
  }

  .feature-card p {
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 0 15px;
    height: 50px;
  }

  .nav-left {
    font-size: 18px;
  }

  .nav-menu {
    display: none;
  }

  .nav-right {
    gap: 15px;
  }

  .login-link {
    font-size: 12px;
  }

  .theme-icon {
    font-size: 18px;
  }

  .logo-text {
    font-size: 48px;
  }

  .logo-circle {
    width: 65px;
    height: 65px;
    border-width: 2px;
  }

  .brand-tagline {
    font-size: 14px;
  }

  .brand-section {
    margin-bottom: 35px;
  }

  .action-section {
    gap: 12px;
  }

  .login-btn {
    padding: 11px 35px;
    font-size: 14px;
  }

  .subtitle {
    font-size: 13px;
  }

  .background-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .features-section {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    padding: 35px 15px 15px;
  }

  .feature-card {
    padding: 12px;
    border-radius: 10px;
  }

  .feature-icon {
    font-size: 32px;
    margin-bottom: 12px;
  }

  .feature-card h3 {
    font-size: 15px;
    margin: 0 0 8px;
  }

  .feature-card p {
    font-size: 12px;
  }
}

@media (max-width: 600px) {
  .navbar {
    padding: 0 12px;
    height: 45px;
    justify-content: space-between;
  }

  .nav-left {
    font-size: 16px;
    letter-spacing: 1px;
  }

  .nav-right {
    gap: 10px;
  }

  .login-link {
    font-size: 11px;
  }

  .theme-icon {
    font-size: 16px;
  }

  .center-content {
    padding: 0 15px;
  }

  .logo-text {
    font-size: 40px;
    letter-spacing: 2px;
  }

  .logo-circle {
    width: 55px;
    height: 55px;
    border-width: 2px;
  }

  .brand-tagline {
    font-size: 13px;
  }

  .brand-section {
    margin-bottom: 30px;
  }

  .login-btn {
    padding: 10px 30px;
    font-size: 13px;
    border-radius: 25px;
  }

  .subtitle {
    font-size: 12px;
  }

  .background-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .features-section {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 30px 12px 12px;
  }

  .feature-card {
    padding: 10px;
    border-radius: 8px;
  }

  .feature-icon {
    font-size: 28px;
    margin-bottom: 8px;
  }

  .feature-card h3 {
    font-size: 14px;
    margin: 0 0 6px;
  }

  .feature-card p {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0 10px;
  }

  .nav-left {
    font-size: 14px;
  }

  .logo-text {
    font-size: 36px;
  }

  .logo-circle {
    width: 50px;
    height: 50px;
  }

  .brand-section {
    margin-bottom: 25px;
  }

  .login-btn {
    padding: 9px 28px;
    font-size: 12px;
  }

  .subtitle {
    font-size: 11px;
  }

  .background-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .features-section {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 25px 10px 10px;
  }

  .feature-card {
    padding: 8px;
  }

  .feature-icon {
    font-size: 26px;
    margin-bottom: 6px;
  }

  .feature-card h3 {
    font-size: 13px;
  }

  .feature-card p {
    font-size: 10px;
  }
}

@media (max-width: 360px) {
  .navbar {
    padding: 0 8px;
  }

  .nav-left {
    font-size: 12px;
    letter-spacing: 0;
  }

  .logo-text {
    font-size: 32px;
  }

  .brand-tagline {
    font-size: 12px;
  }

  .login-btn {
    padding: 8px 24px;
    font-size: 11px;
  }

  .subtitle {
    font-size: 10px;
  }

  .features-section {
    padding: 20px 8px 8px;
  }

  .feature-card h3 {
    font-size: 12px;
  }

  .feature-card p {
    font-size: 9px;
  }
}

/* 主题切换 */
.theme-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  width: 30px;
  height: 30px;
}

.theme-icon {
  transition: opacity 0.3s ease, transform 0.3s ease;
  position: absolute;
  left: 0;
  top: 0;
}

.theme-icon.hidden {
  opacity: 0;
  transform: scale(0.8) rotate(-180deg);
  pointer-events: none;
}

.theme-text {
  font-size: 20px;
  transition: opacity 0.3s ease, transform 0.3s ease;
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  transform: scale(0.8) rotate(180deg);
  pointer-events: none;
}

.theme-text.active {
  opacity: 1;
  transform: scale(1) rotate(0deg);
  pointer-events: auto;
}

.theme-toggle:hover {
  transform: scale(1.1);
}
</style>
