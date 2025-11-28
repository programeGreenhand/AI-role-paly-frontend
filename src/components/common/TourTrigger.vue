<!-- components/common/TourTrigger.vue -->
<template>
  <div v-if="showAlways" class="tour-trigger-container">
    <el-button 
      
      type="primary" 
      class="tour-start-btn"
      @click="startTour"
      circle
      icon="QuestionFilled"
    >
    
    </el-button>

    <!-- <el-popover
      v-if="!tourStore.isActive"
      placement="left"
      :width="250"
      trigger="hover"
    >
      <template #reference>
        <div class="tour-help-icon">
          <el-icon><Question /></el-icon>
        </div>
      </template>
      <div class="tour-help-content">
        <p>🎯 <strong>点击左下角按钮开始新手引导教程</strong></p>
        
        <el-button 
          v-if="tourStore.isTourCompleted()"
          size="small" 
          link 
          @click="resetTour"
        >
          重新开始引导
        </el-button>
      </div>
    </el-popover> -->
  </div>
</template>

<script setup lang="ts">
import { useTourStore } from '../../stores/tour'
import { useRouter } from 'vue-router'

interface Props {
  showAlways?: boolean
}

withDefaults(defineProps<Props>(), {
  showAlways: false
})

const tourStore = useTourStore()
const router = useRouter()

const startTour = async () => {
  // 重置到第一步
  tourStore.currentStepIndex = 0
  localStorage.removeItem('tourCompleted')
  
  // 确保在首页开始
  if (router.currentRoute.value.path !== '/hall') {
    await router.push('/hall')
  }
  
  // 启动引导
  await tourStore.startTour()
}

const resetTour = () => {
  tourStore.resetTour()
  startTour()
}
</script>

<style scoped>
.tour-trigger-container {
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.tour-start-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  box-shadow: 
    0 8px 32px rgba(64, 158, 255, 0.3),
    0 2px 8px rgba(64, 158, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border: none;
  position: relative;
  overflow: hidden;
}

.tour-start-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.6s ease;
}

.tour-start-btn:hover {
  transform: scale(1.15) rotate(5deg);
  box-shadow: 
    0 12px 40px rgba(64, 158, 255, 0.4),
    0 4px 16px rgba(64, 158, 255, 0.3);
}

.tour-start-btn:hover::before {
  left: 100%;
}

.tour-start-btn:active {
  transform: scale(1.05) rotate(0deg);
}

.tour-help-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
  border: 2px solid #409eff;
  cursor: help;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 22px;
  color: #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.15);
}

.tour-help-icon:hover {
  background: linear-gradient(135deg, #e6f7ff 0%, #d9f2ff 100%);
  transform: scale(1.15) rotate(5deg);
  box-shadow: 0 6px 24px rgba(64, 158, 255, 0.25);
  border-color: #66b1ff;
}

.tour-help-content {
  padding: 12px 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.tour-help-content p {
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.6;
}

.tour-help-content p:first-child {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.completed-text {
  color: #10b981;
  font-weight: 500;
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.guide-text {
  color: #64748b;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tour-trigger-container {
    bottom: 20px;
    right: 20px;
    gap: 16px;
  }
  
  .tour-start-btn {
    width: 52px;
    height: 52px;
  }
  
  .tour-help-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}

/* 动画效果 */
@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 8px 32px rgba(64, 158, 255, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 12px 40px rgba(64, 158, 255, 0.4);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 8px 32px rgba(64, 158, 255, 0.3);
  }
}

.tour-start-btn:not(:hover) {
  animation: pulse 3s ease-in-out infinite;
}
</style>